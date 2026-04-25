import { Sidebar, Tab } from "./components/Sidebar";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { Vault } from "./components/Vault";
import { Guardian } from "./components/Guardian";
import { Profile } from "./components/Profile";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="flex h-screen w-full bg-deep-space text-white overflow-hidden selection:bg-oxygen/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 relative h-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-oxygen/10 via-deep-space to-deep-space" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full w-full relative z-10 p-8 overflow-y-auto"
          >
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "chat" && <Chat />}
            {activeTab === "vault" && <Vault />}
            {activeTab === "guardian" && <Guardian />}
            {activeTab === "profile" && <Profile />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
