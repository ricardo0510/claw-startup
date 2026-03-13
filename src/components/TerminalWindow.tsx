import * as React from "react";
import { Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TerminalWindow() {
  const [logs, setLogs] = React.useState<string[]>([
    "[System] Waiting for daemon to start...",
  ]);
  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  React.useEffect(() => {
    const unlisten = listen<string>("process-log", (event) => {
      setLogs((prev) => [...prev.slice(-199), event.payload]);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <Card className="flex flex-col h-full bg-black/90 border-[#333]">
      <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1a1b26] flex flex-row items-center gap-2 rounded-t-xl">
        <Terminal className="h-4 w-4 text-emerald-400" />
        <CardTitle className="text-xs font-mono text-gray-300">
          Terminal (stdout / stderr)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-4 font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i} className="mb-1 leading-relaxed">
              <span className="text-gray-500 mr-2">{">"}</span>
              <span
                className={
                  log.includes("[Error]") ? "text-red-400" : "text-emerald-400"
                }
              >
                {log}
              </span>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      </CardContent>
    </Card>
  );
}
