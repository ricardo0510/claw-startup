import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function ModelsConfig() {
  const [provider, setProvider] = React.useState("deepseek");
  const [apiKey, setApiKey] = React.useState("");
  const [model, setModel] = React.useState("deepseek-chat");
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const configObj = {
        LLM_PROVIDER: provider,
        LLM_API_KEY: apiKey,
        LLM_MODEL: model,
      };
      await api.saveConfig(configObj);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save config:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Models Configuration
        </h2>
        <p className="text-muted-foreground">
          Configure the LLM settings for your OpenClaw Agent.
        </p>
      </div>

      <Card className="bg-card/50">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Provider Settings</CardTitle>
            <CardDescription>
              Changes here will automatically restart the OpenClaw daemon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">LLM Provider</Label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="deepseek" className="bg-card">
                  DeepSeek
                </option>
                <option value="openai" className="bg-card">
                  OpenAI
                </option>
                <option value="anthropic" className="bg-card">
                  Anthropic
                </option>
                <option value="ollama" className="bg-card">
                  Ollama (Local)
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model Name</Label>
              <Input
                id="model"
                placeholder="e.g. deepseek-chat or gpt-4o"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional for Local)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {saved ? (
              <p className="text-sm text-emerald-500 font-medium">
                Config saved and daemon restarting...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Saved to ~/OpenClaw-Workspace/config/env.json
              </p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save & Restart"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
