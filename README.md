# OpenClaw Desktop

OpenClaw Desktop 是一款专为 OpenClaw AI Agent 框架打造的、开箱即用、零外部依赖的可视化桌面客户端。它能让你在本地完全无需借助命令行，即可安全地配置、运行并管理你的自主 AI Agent。

基于强大的 **Tauri v2 (Rust)**、**React**、**Vite** 以及 **TailwindCSS v4** 构建，OpenClaw Desktop 会将底层的 Node.js AI 代理进程完全锁死并运行在一个隔离的本地安全沙箱目录（`~/OpenClaw-Workspace`）中。

## 📥 安装与运行

1. **克隆仓库并安装依赖:**

   ```bash
   git clone https://github.com/ricardo0510/claw-startup.git
   cd claw-startup
   npm install
   ```

2. **运行开发版应用 (带热更新):**

   ```bash
   npm run tauri dev
   ```

   _注意：首次运行此命令时，Rust 需要下载并编译本地依赖模块，可能需要等待几分钟。_

3. **打包生产级别的可执行文件:**
   ```bash
   npm run tauri build
   ```
   该命令会针对你的操作系统在 `src-tauri/target/release/` 目录下生成一个独立的 `.exe` / `.app` 可执行文件。

## 🚀 如何使用 OpenClaw Desktop

本应用通过左侧导航栏，将日常的 Agent 管理拆分为了 4 个主要模块：

### 1. 控制台 (Dashboard)

这是你的主控中心。

- **启动/停止 Agent (Start / Stop Agent):** 通过这两个按钮来安全启动或强制切断后台的 OpenClaw Node.js 守护进程。
- **状态指示灯:** 实时展示进程是在 `Stopped` (已停止)、`Running` (运行中) 还是 `Error` (发生错误)。
- **日志终端 (Terminal Window):** 下方深色的面板用于实时监控后端程序输出的 `stdout` 以及 `stderr` 日志。你可以清晰地看到 AI 大脑此刻正在“想”什么、“做”什么。

### 2. 模型配置 (Models Config)

给 AI 安装大脑配置的地方。

- **服务商 (Provider Settings):** 提供商选择（支持 DeepSeek、OpenAI、Anthropic 或调用本地的 Ollama）。
- **API Key 与模型:** 填入你的对应密钥及想要驱动的模型版本（例如 `deepseek-chat`）。
- **保存并重启 (Save & Restart):** 点击保存后，配置会热更保存至沙箱隔离文件（`~/OpenClaw-Workspace/config/env.json`）内，系统将自动平滑重启后台 Daemon 让新模型立即生效。

### 3. 技能市场 (Skills Market)

Agent 的能力取决于它携带的工具。你可以在这个市场为你的 Agent 动态扩展系统能力。

- **浏览功能:** 查看官方及社区提供的各项高阶技能合集。
- **下载与安装:** 点击对应卡片的 Install 图标，客户端会极速将公网的 YAML/Markdown 技能描述文件摘回本地系统的 `~/OpenClaw-Workspace/skills/` 目录下供 Agent 读取。

### 4. 设置 (Settings)

_(即将推出)_ 未来将会提供高级应用设置、沙箱日志管理以及工作区路径自定义等功能。

## 🛡️ 安全沙箱架构说明

OpenClaw Desktop 利用 Rust 的系统级权限，严格限制了内部 Node.js 守护程序的运作范围：

- **目录牢笼 (Directory Jail):** 无论用户在哪打开该软件，底层的 agent 进程启动时其执行工作区（`current_dir`）一直被强制锁闭在你的「文档」目录下的 `OpenClaw-Workspace/` 内。除了插件另外显式赋予能力，它本质上无法读取工作区以外的私密上层文件。
- **环境变量清洗 (Environment Scrubbing):** 在 daemon 拉起前，所有继承的父级 Shell 环境变量（除 `PATH` 以外）将被全部擦除，防止发生凭证或鉴权 Key 意外泄漏。Agent 仅能通过安全的 JSON 文件隔离带获取其必要配置。
