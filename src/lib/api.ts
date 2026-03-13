import { invoke } from "@tauri-apps/api/core";

export const api = {
  /**
   * 启动 OpenClaw 后台进程
   */
  startOpenClaw: async (): Promise<string> => {
    return await invoke("start_openclaw");
  },

  /**
   * 停止 OpenClaw 后台进程
   */
  stopOpenClaw: async (): Promise<string> => {
    return await invoke("stop_openclaw");
  },

  /**
   * 保存模型配置
   */
  saveConfig: async (config: any): Promise<string> => {
    return await invoke("save_config", { config: JSON.stringify(config) });
  },

  /**
   * 下载并安装技能
   */
  downloadSkill: async (url: string): Promise<string> => {
    return await invoke("download_skill", { url });
  },
};
