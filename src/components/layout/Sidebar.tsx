import * as React from "react";
import {
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
    <div
      className={cn(
        "w-full md:w-64 border-b md:border-r bg-card/50 flex flex-col md:pb-12 shrink-0 overflow-x-auto",
        className,
      )}
    >
      <div className="md:space-y-4 py-2 md:py-4 flex md:block items-center">
        <div className="px-4 py-2 md:px-3">
          <h2 className="md:mb-2 text-lg font-semibold tracking-tight whitespace-nowrap">
            OpenClaw
          </h2>
          <div className="flex md:block space-x-2 md:space-x-0 md:space-y-1 mt-0 md:mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center justify-center md:justify-start gap-2 md:gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap",
                    activeTab === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">
                    {item.label.split("(")[0].trim()}
                  </span>
                  {activeTab === item.id && (
                    <ChevronRight className="hidden md:block h-4 w-4 ml-auto opacity-50" />
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
