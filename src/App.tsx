import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { ModelsConfig } from "@/pages/ModelsConfig";
import { SkillsMarket } from "@/pages/SkillsMarket";

export default function App() {
  const [activeTab, setActiveTab] = React.useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "models":
        return <ModelsConfig />;
      case "skills":
        return <SkillsMarket />;
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
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/20">
        <div className="mx-auto max-w-5xl h-full flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
