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

pub fn start(app_handle: AppHandle) -> Result<String, String> {
    let mut process_guard = CLAW_PROCESS.lock().unwrap();

    if process_guard.is_some() {
        return Ok("Already running".to_string());
    }

    // Initialize workspace
    init_workspace()?;
    let workspace = get_workspace_dir();

    // Check node.js
    let node_check = Command::new("node").arg("-v").output();
    if node_check.is_err() {
        return Err(
            "Node.js is not installed or not in PATH. Please install Node.js 22+.".to_string(),
        );
    }

    // Attempt to start the daemon process
    // For MVP, we run node index.js or npx openclaw inside the workspace
    // Directory Jail: restrict cwd to workspace
    let mut cmd = Command::new("npx");
    cmd.arg("openclaw@latest")
        .current_dir(&workspace) // directory jail
        .env_clear() // clear all env vars
        .env("PATH", std::env::var("PATH").unwrap_or_default()) // only keep PATH
        // .env("OPENCLAW_WORKSPACE", &workspace)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => return Err(format!("Failed to start OpenClaw: {}", e)),
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

    *process_guard = Some(child);

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
