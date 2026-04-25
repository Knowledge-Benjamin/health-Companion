import React, { useState, useRef, useEffect } from "react";
import { Send, FileText, ChevronRight, Sparkles, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { cn } from "../lib/utils";

type Message = {
  id: string;
  role: "user" | "oracle";
  text: string;
  sources?: string[];
};

const SUGGESTIONS = [
  "What do my latest cholesterol results mean?",
  "How is my sleep affecting my heart rate?",
  "Is my blood pressure medication working?",
];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("sentinel_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [
      {
        id: "1",
        role: "oracle",
        text: "Hi! I'm Sentinel, your personal health partner. I've safely reviewed your recent records.\n\nEverything is indexed and secure. How can I help you understand your health today?",
      }
    ];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("sentinel_chat_history", JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, preset?: string) => {
    e?.preventDefault();
    const textToSend = preset || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!preset) setInput("");
    setIsTyping(true);

    try {
      // Map existing messages to GenAI contents format
      const contents = newMessages.map(msg => ({
        role: msg.role === "oracle" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          systemInstruction: "You are Sentinel, a highly intelligent but extremely friendly personal health partner. You must be medically accurate, but NEVER robotic or overly clinical. You bridge the gap between complex medical data and the user's everyday life. Explain medical terminologies in simple, empowering, and easy-to-understand ways. Act as a supportive, empathetic companion who helps users understand their own health.",
        }
      });

      const responseText = response.text || "I'm having trouble thinking right now. Could you please try again?";
      
      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        text: responseText,
      };
      
      setMessages(prev => [...prev, oracleMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        text: "I'm encountering a connection issue right now. Let's try that again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full relative">
      <header className="mb-4 shrink-0 flex justify-between items-center bg-panel/40 backdrop-blur-md p-4 rounded-2xl border border-panel-border z-10 w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sentinel Oracle</h2>
          <p className="text-white/60 text-xs flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
             Clinical RAG Engine Online
          </p>
        </div>
        <div className="text-xs font-mono text-white/40 bg-[#141416] py-1 px-3 rounded-lg border border-white/5 flex items-center gap-2 shadow-inner">
          <Activity className="w-3 h-3 text-oxygen" />
          14 Docs Indexed
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-40 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}
            >
              <div className={cn(
                "p-4 rounded-2xl leading-relaxed text-sm",
                msg.role === "user" 
                  ? "bg-oxygen text-white rounded-br-sm shadow-[0_4px_20px_rgba(0,122,255,0.25)]" 
                  : "glass-panel rounded-bl-sm text-white/90 border-white/10"
              )}>
                {msg.role === "oracle" ? (
                   <div className="markdown-body prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0A0A0B] prose-pre:border prose-pre:border-panel-border prose-a:text-oxygen-light prose-strong:text-white">
                      <Markdown>{msg.text}</Markdown>
                   </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
              
              {/* Context Chips for Oracle */}
              {msg.sources && (
                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                  {msg.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#141416] border border-panel-border text-[10px] text-white/50 cursor-pointer hover:text-white/80 hover:border-white/20 transition-all">
                      <FileText className="w-3 h-3 text-oxygen/70" />
                      {source}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
             <motion.div
               key="typing"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="mr-auto glass-panel p-4 rounded-2xl rounded-bl-sm flex items-center gap-3 border-oxygen/30"
             >
               <div className="flex gap-1">
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-oxygen rounded-full" />
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-oxygen rounded-full" />
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-oxygen rounded-full" />
               </div>
               <span className="text-xs text-white/40 font-mono tracking-wider">Reviewing your records...</span>
             </motion.div>
          )}
          <div ref={endRef} className="h-4" />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-0 right-0 p-1 bg-gradient-to-t from-deep-space via-deep-space to-transparent pt-10">
        {messages.length === 1 && !isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-3 px-1"
          >
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(undefined, suggestion)}
                className="px-3 py-1.5 rounded-full border border-panel-border bg-panel/80 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-all flex items-center gap-1.5 backdrop-blur-md"
              >
                <Sparkles className="w-3 h-3 text-oxygen" />
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
        
        <form onSubmit={(e) => handleSend(e)} className="glass-panel p-2 rounded-2xl flex items-end gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-white/10 relative z-20 focus-within:border-oxygen/50 transition-colors">
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
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none max-h-32 text-sm p-3 text-white placeholder:text-white/30"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-oxygen text-white flex items-center justify-center shrink-0 mb-1 mr-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-oxygen-light transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-oxygen/20"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
