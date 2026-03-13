use lazy_static::lazy_static;
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use tauri::{AppHandle, Emitter};

lazy_static! {
    static ref CLAW_PROCESS: Mutex<Option<Child>> = Mutex::new(None);
}

pub fn get_workspace_dir() -> PathBuf {
    let mut path = dirs::document_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("OpenClaw-Workspace");
    path
}

pub fn init_workspace() -> Result<(), String> {
    let workspace = get_workspace_dir();

    if !workspace.exists() {
        fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;
    }

    let skills_dir = workspace.join("skills");
    if !skills_dir.exists() {
        fs::create_dir_all(&skills_dir).map_err(|e| e.to_string())?;
    }

    let config_dir = workspace.join("config");
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    }

    Ok(())
}

async fn ensure_env(
    app_handle: &AppHandle,
    workspace: &PathBuf,
) -> Result<(String, String), String> {
    // 1. Check Global Environment
    let npx_cmd = if cfg!(target_os = "windows") {
        "npx.cmd"
    } else {
        "npx"
    };
    if Command::new(npx_cmd).arg("--version").output().is_ok() {
        return Ok((npx_cmd.to_string(), "".to_string()));
    }

    // 2. Prepare Local Runtime Directory
    let runtime_dir = workspace.join(".runtime");
    if !runtime_dir.exists() {
        fs::create_dir_all(&runtime_dir).map_err(|e| e.to_string())?;
    }

    let os_arch = if cfg!(target_os = "windows") {
        "win-x64"
    } else if cfg!(target_os = "macos") && cfg!(target_arch = "aarch64") {
        "darwin-arm64"
    } else if cfg!(target_os = "macos") {
        "darwin-x64"
    } else {
        "linux-x64"
    };

    let ext = if cfg!(target_os = "windows") {
        "zip"
    } else {
        "tar.gz"
    };
    let folder_name = format!("node-v20.12.2-{}", os_arch);
    let download_url = format!("https://nodejs.org/dist/v20.12.2/{}.{}", folder_name, ext);
    let archive_path = runtime_dir.join(format!("{}.{}", folder_name, ext));
    let extracted_dir = runtime_dir.join(&folder_name);

    let npx_path = if cfg!(target_os = "windows") {
        extracted_dir.join("npx.cmd")
    } else {
        extracted_dir.join("bin").join("npx")
    };
    let node_bin_dir = if cfg!(target_os = "windows") {
        extracted_dir.clone()
    } else {
        extracted_dir.join("bin")
    };

    if !npx_path.exists() {
        let _ = app_handle.emit(
            "process-log",
            "[Info] 初次启动：未检测到全局 Node.js 环境。",
        );
        let _ = app_handle.emit(
            "process-log",
            "[Info] ⚡ 正在为您自动下载绿色版基础环境 (约 30MB)，请耐心稍候...",
        );

        // Download
        let response = reqwest::get(&download_url)
            .await
            .map_err(|e| format!("下载 Node.js 失败: {}", e))?;
        let bytes = response
            .bytes()
            .await
            .map_err(|e| format!("读取下载数据失败: {}", e))?;
        fs::write(&archive_path, &bytes).map_err(|e| format!("保存压缩包失败: {}", e))?;

        let _ = app_handle.emit("process-log", "[Info] ⚡ 下载完成，正在解压部署...");

        // Extract
        if cfg!(target_os = "windows") {
            let output = Command::new("powershell")
                .arg("-Command")
                .arg(format!(
                    "Expand-Archive -Force -Path '{}' -DestinationPath '{}'",
                    archive_path.display(),
                    runtime_dir.display()
                ))
                .output()
                .map_err(|e| format!("PowerShell 执行失败: {}", e))?;
            if !output.status.success() {
                return Err(
                    "解压 zip 失败，请确保你的系统支持 PowerShell Expand-Archive 命令。"
                        .to_string(),
                );
            }
        } else {
            let output = Command::new("tar")
                .arg("-xzf")
                .arg(&archive_path)
                .arg("-C")
                .arg(&runtime_dir)
                .output()
                .map_err(|e| e.to_string())?;
            if !output.status.success() {
                return Err("解压 tar.gz 失败".to_string());
            }
        }
        let _ = app_handle.emit("process-log", "[Info] ✅ 绿色版环境部署完毕！");
        let _ = fs::remove_file(&archive_path); // clean up zip
    }

    Ok((
        npx_path.to_string_lossy().to_string(),
        node_bin_dir.to_string_lossy().to_string(),
    ))
}

pub async fn start(app_handle: AppHandle) -> Result<String, String> {
    {
        let process_guard = CLAW_PROCESS.lock().unwrap();
        if process_guard.is_some() {
            return Ok("Already running".to_string());
        }
    }

    // Initialize workspace
    init_workspace()?;
    let workspace = get_workspace_dir();

    // Auto downloader
    let (npx_cmd, node_path_to_add) = ensure_env(&app_handle, &workspace).await?;

    // Attempt to start the daemon process
    // Directory Jail: restrict cwd to workspace
    let mut cmd = Command::new(npx_cmd);
    cmd.arg("-y")
        .arg("openclaw@latest")
        .current_dir(&workspace) // directory jail
        .env_clear(); // clear all env vars

    // Construct new PATH injecting portable Node.js if needed
    let mut path_var = std::env::var("PATH").unwrap_or_default();
    if !node_path_to_add.is_empty() {
        let sep = if cfg!(target_os = "windows") {
            ";"
        } else {
            ":"
        };
        path_var = format!("{}{}{}", node_path_to_add, sep, path_var);
    }
    cmd.env("PATH", path_var);

    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => return Err(format!("OpenClaw 启动失败: {}", e)),
    };

    let stdout = child.stdout.take().expect("Failed to open stdout");
    let stderr = child.stderr.take().expect("Failed to open stderr");

    let app_handle_out = app_handle.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = app_handle_out.emit("process-log", format!("[Info] {}", l));
            }
        }
    });

    let app_handle_err = app_handle;
    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = app_handle_err.emit("process-log", format!("[Error] {}", l));
            }
        }
    });

    {
        let mut process_guard = CLAW_PROCESS.lock().unwrap();
        *process_guard = Some(child);
    }

    Ok("Started successfully".to_string())
}

pub fn stop() -> Result<String, String> {
    let mut process_guard = CLAW_PROCESS.lock().unwrap();

    if let Some(mut child) = process_guard.take() {
        let _ = child.kill();
        let _ = child.wait();
        return Ok("Stopped".to_string());
    }

    Ok("Not running".to_string())
}
