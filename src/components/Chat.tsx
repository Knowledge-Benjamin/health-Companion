import React, { useState, useRef, useEffect } from "react";
import { Send, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

type Message = {
  id: string;
  role: "user" | "oracle";
  text: string;
  sources?: string[];
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "oracle",
      text: "I am the Sentinel Health Oracle. I have successfully indexed your recent lipid panel and cardiology consult notes. How may I assist with your health intelligence today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate Oracle thinking & RAG retrieval
    setTimeout(() => {
      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        text: "Based on the records available, your cholesterol levels have improved by 15% since your last checkup. Continuing your currently prescribed statin dosage is recommended.",
        sources: ["Dr. Silberman Consult - Oct 2025", "Lipid Panel Results - Nov 2025"]
      };
      setMessages(prev => [...prev, oracleMessage]);
      setIsTyping(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full relative">
      <header className="mb-4 shrink-0 flex justify-between items-center bg-panel/40 backdrop-blur-md p-4 rounded-2xl border border-panel-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sentinel Oracle</h2>
          <p className="text-white/60 text-xs flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             Clinical RAG Engine Online
          </p>
        </div>
        <div className="text-xs font-mono text-white/40 bg-[#141416] py-1 px-3 rounded-lg border border-white/5">
          14 Docs Indexed
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}
            >
              <div className={cn(
                "p-4 rounded-2xl leading-relaxed text-sm whitespace-pre-wrap",
                msg.role === "user" 
                  ? "bg-oxygen text-white rounded-br-sm" 
                  : "glass-panel rounded-bl-sm text-white/90"
              )}>
                {msg.text}
              </div>
              
              {/* Context Chips for Oracle */}
              {msg.sources && (
                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                  {msg.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#141416] border border-panel-border text-[10px] text-white/50 cursor-pointer hover:text-white/80 transition-colors">
                      <FileText className="w-3 h-3" />
                      {source}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mr-auto glass-panel p-4 rounded-2xl rounded-bl-sm flex items-center gap-2"
             >
               <div className="flex gap-1">
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-oxygen rounded-full" />
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-oxygen rounded-full" />
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-oxygen rounded-full" />
               </div>
               <span className="text-xs text-white/40 ml-2 font-mono">Synthesizing Clinical Logic...</span>
             </motion.div>
          )}
          <div ref={endRef} className="h-4" />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-0 right-0">
        <form onSubmit={handleSend} className="glass-panel p-2 rounded-2xl flex items-end gap-2 shadow-2xl">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask about your health trajectory, labs, or symptoms..."
            className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 text-sm p-3 text-white placeholder:text-white/30"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-oxygen text-white flex items-center justify-center shrink-0 mb-1 mr-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-oxygen-light transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
