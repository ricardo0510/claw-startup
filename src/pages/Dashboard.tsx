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
              <span className="font-mono">Checking...</span>
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

      <div className="flex-1 mt-4 rounded-xl overflow-hidden border shadow-sm min-h-[300px]">
        <TerminalWindow />
      </div>
    </div>
  );
}
