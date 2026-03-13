import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

const MOCK_SKILLS = [
  {
    id: "web-search",
    name: "Web Researcher",
    description:
      "Enables the agent to search the internet using DuckDuckGo to answer real-time questions.",
    author: "official",
    url: "https://raw.githubusercontent.com/openclaw/skills/main/web-search.yaml",
  },
  {
    id: "system-cleanup",
    name: "System Optimizer",
    description:
      "Allows the agent to safely clear temp files and free up disk space on Windows/macOS.",
    author: "community",
    url: "https://raw.githubusercontent.com/openclaw/skills/main/system-cleanup.yaml",
  },
  {
    id: "email-assistant",
    name: "Email Drafter",
    description:
      "Drafts and reads emails locally using your default mail app protocol.",
    author: "official",
    url: "https://raw.githubusercontent.com/openclaw/skills/main/email-assistant.yaml",
  },
];

export function SkillsMarket() {
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [installed, setInstalled] = React.useState<Set<string>>(new Set());

  const handleDownload = async (skillId: string, url: string) => {
    setDownloading(skillId);
    try {
      await api.downloadSkill(url);
      setInstalled((prev) => new Set(prev).add(skillId));
    } catch (e) {
      console.error("Failed to download skill:", e);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skills Market</h2>
        <p className="text-muted-foreground">
          Download and inject new capabilities into your agent dynamically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_SKILLS.map((skill) => {
          const isInstalled = installed.has(skill.id);
          const isDownloading = downloading === skill.id;

          return (
            <Card key={skill.id} className="flex flex-col bg-card/50">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  <Badge
                    variant={
                      skill.author === "official" ? "default" : "secondary"
                    }
                  >
                    {skill.author}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {skill.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Button
                  className="w-full gap-2"
                  variant={isInstalled ? "outline" : "default"}
                  disabled={isInstalled || isDownloading}
                  onClick={() => handleDownload(skill.id, skill.url)}
                >
                  {isInstalled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Installed
                    </>
                  ) : isDownloading ? (
                    "Downloading..."
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Install
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
