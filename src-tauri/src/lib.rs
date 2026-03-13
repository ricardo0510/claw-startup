mod daemon;
use std::fs;
use std::io::Write;

#[tauri::command]
async fn start_openclaw(app: tauri::AppHandle) -> Result<String, String> {
    daemon::start(app).await
}

#[tauri::command]
fn stop_openclaw() -> Result<String, String> {
    daemon::stop()
}

#[tauri::command]
fn save_config(config: String) -> Result<String, String> {
    let workspace = daemon::get_workspace_dir();
    let config_file = workspace.join("config").join("env.json");

    let mut file = fs::File::create(&config_file).map_err(|e| e.to_string())?;
    file.write_all(config.as_bytes())
        .map_err(|e| e.to_string())?;

    // Restart daemon after config change
    let _ = daemon::stop();
    Ok("Config saved".to_string())
}

#[tauri::command]
async fn download_skill(url: String) -> Result<String, String> {
    let workspace = daemon::get_workspace_dir();
    let skills_dir = workspace.join("skills");

    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;

    let text = response.text().await.map_err(|e| e.to_string())?;

    // Extracted file name from URL or use a default hash-like approach
    let filename = url.split('/').last().unwrap_or("unknown_skill.yaml");
    let file_path = skills_dir.join(filename);

    let mut file = fs::File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(text.as_bytes()).map_err(|e| e.to_string())?;

    Ok(format!("Skill downloaded to {:?}", file_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_openclaw,
            stop_openclaw,
            save_config,
            download_skill
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
