import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";

export default function App() {
  const [activeTab, setActiveTab] = React.useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "models":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Models configuration coming soon...
          </div>
        );
      case "skills":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Skills market coming soon...
          </div>
        );
      case "settings":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Settings coming soon...
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8 bg-black/20">
        <div className="mx-auto max-w-5xl h-full">{renderContent()}</div>
      </main>
    </div>
  );
}
