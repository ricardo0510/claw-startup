import * as React from "react";
import { Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TerminalWindow } from "@/components/TerminalWindow";
import { api } from "@/lib/api";

export function Dashboard() {
  const [status, setStatus] = React.useState<
    "Stopped" | "Installing" | "Running" | "Error"
  >("Stopped");
  const [loading, setLoading] = React.useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { emit } = await import("@tauri-apps/api/event");
      await emit("process-log", "[Info] 正在启动 OpenClaw Agent...");

      await api.startOpenClaw();
      setStatus("Running");
    } catch (e) {
      console.error(e);
      setStatus("Error");
      const { emit } = await import("@tauri-apps/api/event");
      await emit("process-log", `[Error] 启动失败: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopOpenClaw();
      setStatus("Stopped");
    } catch (e) {
      console.error(e);
      const { emit } = await import("@tauri-apps/api/event");
      await emit("process-log", `[Error] 停止失败: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "Running":
        return (
          <Badge variant="success" className="animate-pulse">
            Running
          </Badge>
        );
      case "Stopped":
        return <Badge variant="secondary">Stopped</Badge>;
      case "Error":
        return <Badge variant="destructive">Error</Badge>;
      case "Installing":
        return (
          <Badge variant="warning" className="animate-pulse">
            Installing...
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your local OpenClaw daemon and environment.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col justify-center bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Daemon Status
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              Start or stop the background agent process
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleStart}
              disabled={status === "Running" || loading}
            >
              <Play className="h-5 w-5" fill="currentColor" />
              Start Agent
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="w-full gap-2"
              onClick={handleStop}
              disabled={status === "Stopped" || loading}
            >
              <Square className="h-5 w-5" fill="currentColor" />
              Stop Agent
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>System Info</CardTitle>
            <CardDescription>Local environment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Node.js</span>
              <span className="font-mono text-emerald-500">Auto-Managed</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">OpenClaw Version</span>
              <span className="font-mono">Latest</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Workspace</span>
              <span className="font-mono">~/OpenClaw-Workspace</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-accent/50 border border-accent rounded-lg p-4 text-sm text-accent-foreground">
        <h3 className="font-semibold mb-1">💡 如何使用 OpenClaw?</h3>
        <p className="opacity-90 leading-relaxed">
          OpenClaw 是一个<strong>纯粹的后台系统代理 (System Agent)</strong>
          。它没有自己的聊天聊天框。
          <br />
          当你在上方点击 <strong>Start Agent</strong>{" "}
          并看到下方控制台提示「Agent is listening...」后，OpenClaw
          就会静默潜伏在你的电脑后台。
          <br />
          你可以随时在任何软件（如微信、记事本、浏览器）中按下{" "}
          <kbd className="bg-background border px-1.5 py-0.5 rounded text-xs mx-1">
            Ctrl + Space
          </kbd>{" "}
          或其他你在 OpenClaw
          中配置的快捷键，即可唤醒它的悬浮指令框与它对话，它会自动操作你的电脑！
        </p>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border shadow-sm min-h-[300px]">
        <TerminalWindow />
      </div>
    </div>
  );
}
