import React, { useState, useRef, useEffect } from "react";
import { Send, FileText, ChevronRight, Sparkles, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { cn } from "../lib/utils";

type Message = {
  id: string;
  role: "user" | "oracle";
  text: string;
  sources?: string[];
  toolCall?: {
    name: string;
    args: any;
    result: any;
  };
};

const SUGGESTIONS = [
  "What do my latest cholesterol results mean?",
  "How is my sleep affecting my heart rate?",
  "Book an appointment with Dr. Silberman",
  "Message my emergency contact",
];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AGENT_TOOLS = [{
  functionDeclarations: [
    {
      name: "bookAppointment",
      description: "Books a medical appointment with a specified doctor or specialist.",
      parameters: {
        type: "object",
        properties: {
          specialistType: { type: "string" },
          date: { type: "string", description: "YYYY-MM-DD format" },
          time: { type: "string", description: "HH:MM format" }
        },
        required: ["specialistType", "date", "time"]
      }
    },
    {
      name: "sendWhatsAppMessage",
      description: "Prepares a WhatsApp message to be sent to a specific phone number. This generates a wa.me link.",
      parameters: {
        type: "object",
        properties: {
          phoneNumber: { type: "string", description: "The full phone number including country code without any special characters or leading plus (e.g. 14155552671)." },
          message: { type: "string", description: "The content of the WhatsApp message." }
        },
        required: ["phoneNumber", "message"]
      }
    },
    {
      name: "messageEmergencyContact",
      description: "Sends an urgent SMS message to the user's registered emergency contact.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string" },
          urgencyLevel: { type: "string", enum: ["low", "medium", "high", "critical"] }
        },
        required: ["message", "urgencyLevel"]
      }
    },
    {
      name: "makePhoneCall",
      description: "Initiates an automated voice phone call to a service or contact on behalf of the user.",
      parameters: {
        type: "object",
        properties: {
          recipient: { type: "string", description: "Name or role of who to call (e.g., 'primary care physician', 'pharmacy', 'ambulance')" },
          context: { type: "string", description: "What the AI should say on the call" }
        },
        required: ["recipient", "context"]
      }
    },
    {
       name: "refillPrescription",
       description: "Requests a prescription refill from the registered pharmacy.",
       parameters: {
         type: "object",
         properties: {
            medicationName: { type: "string" },
            pharmacyName: { type: "string" }
         },
         required: ["medicationName"]
       }
    },
    {
       name: "logHealthMetric",
       description: "Logs a health metric into the local database.",
       parameters: {
         type: "object",
         properties: {
            metricName: { type: "string" },
            value: { type: "number" },
            unit: { type: "string" }
         },
         required: ["metricName", "value"]
       }
    }
  ]
}];

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
      // Create a clean conversation format for Gemini
      const contents: any[] = newMessages.map(msg => ({
        role: msg.role === "oracle" ? "model" : "user",
        parts: [{ text: msg.text + (msg.toolCall ? `\n[System Log: Action taken - ${msg.toolCall.name} with result: ${JSON.stringify(msg.toolCall.result)}]` : "") }]
      }));

      const config = {
          systemInstruction: "You are Sentinel, a highly intelligent personal health partner with agentic capabilities. You bridge the gap between complex medical data and the user's everyday life. You have the ability to make phone calls, book appointments, log health metrics, refill prescriptions, and send WhatsApp messages. When an emergency SOS is triggered, you MUST simultaneously dispatch a phone call (using `makePhoneCall`) and prepare a WhatsApp message (using `sendWhatsAppMessage` with a placeholder number like 14155552671) containing critical medical context and location data. If a user asks you to take an action, use the appropriate tool. Always explain what you did clearly, but remain human and empathetic.",
      };

      let response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        tools: AGENT_TOOLS,
        config
      });

      let numLoops = 0;
      let intermediateMessages: Message[] = [];

      while (response.functionCalls && response.functionCalls.length > 0 && numLoops < 5) {
         const call = response.functionCalls[0];
         
         const argsStr = JSON.stringify(call.args);
         console.log(`Executing tool: ${call.name} with args ${argsStr}`);

         // We simulate action execution locally
         let resultObj: any = { success: true, timestamp: new Date().toISOString(), message: "Action completed successfully" };
         
         if (call.name === "makePhoneCall") {
             resultObj.message = `Automated call dispatched to ${call.args.recipient}`;
             resultObj.transcript = "The AI successfully conveyed the message on the line.";
         } else if (call.name === "bookAppointment") {
             resultObj.message = `Appointment confirmed on ${call.args.date} at ${call.args.time}.`;
             resultObj.referenceId = "APT-" + Math.floor(Math.random() * 10000);
         } else if (call.name === "sendWhatsAppMessage") {
             const url = `https://wa.me/${call.args.phoneNumber}?text=${encodeURIComponent(call.args.message)}`;
             resultObj.message = "WhatsApp integration generated the link.";
             resultObj.link = url;
         }

         const intermediateMsg: Message = {
            id: (Date.now() + Math.random()).toString(),
            role: "oracle",
            text: `Initiated action: ${call.name}...`,
            toolCall: { name: call.name, args: call.args, result: resultObj }
         };
         intermediateMessages.push(intermediateMsg);

         // Add the model's tool call back to history
         // In SDK, we must append the `functionResponse` properly if we used structured history.
         // However, we are manually looping and it is often easier to provide the `functionResponse` part natively.
         const mContent = response.candidates && response.candidates[0] && response.candidates[0].content;
         if (mContent) contents.push(mContent);
         
         contents.push({
            role: "user",
            parts: [{
               functionResponse: {
                  name: call.name,
                  response: resultObj
               }
            }]
         });

         response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents,
            tools: AGENT_TOOLS,
            config
         });
         
         numLoops++;
      }

      const responseText = response.text || "I've processed your request.";
      
      const finalOracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        text: responseText,
      };
      
      setMessages(prev => [...prev, ...intermediateMessages, finalOracleMessage]);
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
                      
                      {msg.toolCall && (
                        <div className="mt-3 p-3 bg-oxygen/10 border border-oxygen/20 rounded-xl flex items-start gap-3">
                          <div className="p-1.5 bg-oxygen/20 rounded-md">
                            <Zap className="w-4 h-4 text-oxygen" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-oxygen font-mono uppercase tracking-wider block mb-1">
                              Action Executed: {msg.toolCall.name}
                            </span>
                            <div className="text-[11px] text-white/70 font-mono bg-black/40 p-2 rounded-md">
                               <span className="text-white/50 block mb-1">// Parameters</span>
                               {JSON.stringify(msg.toolCall.args, null, 2)}
                            </div>
                            <div className="text-[11px] text-emerald-400 font-mono mt-1">
                               <span className="text-white/50">// Result</span> {msg.toolCall.result?.message || "Success"}
                            </div>
                            {msg.toolCall.result?.link && (
                               <a href={msg.toolCall.result.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block px-4 py-2 bg-[#25D366] text-white font-semibold text-xs rounded-lg shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:bg-[#20BE5A] transition-colors">
                                 Open WhatsApp
                               </a>
                            )}
                          </div>
                        </div>
                      )}
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
