#[tauri::command]
fn start_openclaw() -> Result<String, String> {
    println!("Mock: start_openclaw called");
    Ok("Started".to_string())
}

#[tauri::command]
fn stop_openclaw() -> Result<String, String> {
    println!("Mock: stop_openclaw called");
    Ok("Stopped".to_string())
}

#[tauri::command]
fn save_config(config: String) -> Result<String, String> {
    println!("Mock: save_config called with: {}", config);
    Ok("Config saved".to_string())
}

#[tauri::command]
fn download_skill(url: String) -> Result<String, String> {
    println!("Mock: download_skill called with URL: {}", url);
    Ok("Skill downloaded".to_string())
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
