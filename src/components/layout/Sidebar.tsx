import * as React from "react";
import {
  Play,
  Square,
  Settings,
  LayoutDashboard,
  Cpu,
  Puzzle,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ className, activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "控制台 (Dashboard)", icon: LayoutDashboard },
    { id: "models", label: "模型配置 (Models)", icon: Cpu },
    { id: "skills", label: "技能市场 (Skills)", icon: Puzzle },
    { id: "settings", label: "设置与日志 (Settings)", icon: Settings },
  ];

  return (
    <div className={cn("pb-12 w-64 border-r bg-card/50", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            OpenClaw
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-start gap-3 rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    activeTab === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {activeTab === item.id && (
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
