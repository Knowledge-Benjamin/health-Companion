import { Activity, MessageSquare, ShieldAlert, UploadCloud } from "lucide-react";
import { cn } from "../lib/utils";

export type Tab = "dashboard" | "chat" | "vault" | "guardian";

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: "dashboard", label: "Predictive", icon: Activity },
    { id: "vault", label: "Smart Vault", icon: UploadCloud },
    { id: "chat", label: "Oracle", icon: MessageSquare },
    { id: "guardian", label: "Guardian", icon: ShieldAlert },
  ] as const;

  return (
    <aside className="w-64 border-r border-panel-border bg-deep-space flex flex-col h-full z-10 glass-panel">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-oxygen" />
          <span>Sentinel <span className="text-white/60">Health</span></span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                isActive 
                  ? "bg-oxygen text-white shadow-[0_0_20px_rgba(0,122,255,0.3)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-[#141416] border border-panel-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-oxygen to-oxygen-dark flex items-center justify-center font-bold shadow-lg shadow-oxygen/20">
            J
          </div>
          <div>
            <div className="text-sm font-semibold">Julian R.</div>
            <div className="text-xs text-white/50">Status: Nominal</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
