# OpenClaw Desktop

OpenClaw Desktop is a user-friendly, zero-dependency visual client for the OpenClaw AI Agent framework. It allows you to run, configure, and manage autonomous AI agents locally without needing to touch the command line.

Built securely with **Tauri v2 (Rust)**, **React**, **Vite**, and **TailwindCSS v4**, OpenClaw Desktop runs the underlying Node.js AI agent process entirely inside an isolated local sandbox directory (`~/OpenClaw-Workspace`).

## 📥 Installation & Setup

1. **Clone the repository and install dependencies:**

   ```bash
   git clone https://github.com/ricardo0510/claw-startup.git
   cd claw-startup
   npm install
   ```

2. **Run the Development Application:**

   ```bash
   npm run tauri dev
   ```

   _Note: On first run, Rust will download and compile native dependencies. This may take a few minutes._

3. **Build the Production Executable:**
   ```bash
   npm run tauri build
   ```
   This will create a standalone executable for your operating system in `src-tauri/target/release/`.

## 🚀 How to Use OpenClaw Desktop

The application organizes agent management into four main sections, accessible via the left sidebar:

### 1. Dashboard (控制台)

This is your main command center.

- **Start Agent / Stop Agent:** Use these buttons to securely launch or forcibly terminate the background OpenClaw Node.js daemon.
- **Status Indicator:** Shows whether the daemon is `Stopped`, `Running`, or `Error`.
- **Terminal Window:** The dark panel at the bottom provides a real-time, scrolling view of the daemon's internal `stdout` and `stderr` logs, allowing you to monitor exactly what the AI agent is thinking and doing.

### 2. Models Configuration (模型配置)

Before the agent can think, it needs an LLM.

- **Provider Settings:** Choose your preferred AI provider (DeepSeek, OpenAI, Anthropic, or local Ollama).
- **API Key & Model Name:** Enter the API key and specific model string (e.g., `deepseek-chat`).
- **Save & Restart:** Clicking save writes your configuration directly to the isolated environment file (`~/OpenClaw-Workspace/config/env.json`) and gracefully restarts the daemon to apply the new brain immediately.

### 3. Skills Market (技能市场)

Agents are only as good as the tools they have. The Skills Market allows you to dynamically expand your agent's capabilities.

- **Browse:** View available official and community-made skills.
- **Install:** Click the download icon to fetch the skill's YAML/Markdown definition file from the internet directly into your local `~/OpenClaw-Workspace/skills/` directory.

### 4. Settings (设置)

_(Upcoming feature)_ Advanced application settings, log management, and workspace customization.

## 🛡️ Security & Sandboxing Architecture

OpenClaw Desktop restricts the Node.js daemon using Rust system-level permissions:

- **Directory Jail:** The underlying agent process is locked (`current_dir`) to `~/OpenClaw-Workspace/` in your Documents folder. It cannot inherently access files outside of this workspace unless explicitly granted by a skill.
- **Environment Scrubbing:** All parent shell environment variables (except `PATH`) are cleared before the daemon starts to prevent accidental credential leakage. Configs are passed safely via the isolated JSON file.
