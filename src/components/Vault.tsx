import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function Vault() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setScanState("scanning");
    
    // Simulate OCR and NLP extraction
    setTimeout(() => {
      setScanState("complete");
    }, 4000);
  };

  const ExtractedMetrics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
      className="mt-8 space-y-4"
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle className="text-emerald-400 w-5 h-5" />
        Extraction Complete
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Vitamin D (25-OH)", value: "28 ng/mL", status: "Low", desc: "Reference: 30-100 ng/mL" },
          { label: "Blood Pressure", value: "118/74", status: "Optimal", desc: "Systolic & Diastolic within limits" },
          { label: "HbA1c", value: "5.4%", status: "Optimal", desc: "Reference: < 5.7%" }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className="glass-panel p-5 rounded-2xl relative overflow-hidden"
          >
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              item.status === "Low" ? "bg-rose-500" : "bg-emerald-500"
            )} />
            <div className="text-sm text-white/50 mb-1">{item.label}</div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">{item.value}</div>
            <div className="flex items-center justify-between mt-3">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                item.status === "Low" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
              )}>
                {item.status}
              </span>
              <span className="text-[10px] text-white/40">{item.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => {
          setFile(null);
          setScanState("idle");
        }}
        className="mt-6 px-6 py-3 rounded-xl bg-panel border border-panel-border text-sm font-semibold hover:bg-white/5 transition-colors flex items-center gap-2"
      >
        Ingest Another Document <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
       <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Smart Vault</h2>
        <p className="text-white/60 text-sm">Secure biometric and clinical record ingestion via OCR & NLP framework.</p>
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {scanState === "idle" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group cursor-pointer",
                isDragging 
                  ? "border-oxygen bg-oxygen/5" 
                  : "border-panel-border bg-panel/50 hover:bg-panel hover:border-white/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="application/pdf,image/*"
              />
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-oxygen" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Drag & Drop Medical Records</h3>
              <p className="text-sm text-white/40">Support for PDF, JPG, PNG (FHIR parsing enabled)</p>
            </motion.div>
          )}

          {scanState === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Scanline Animation */}
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-oxygen/0 via-oxygen/20 to-oxygen/0 pointer-events-none z-10 border-b border-oxygen/50"
              />
              
              <div className="flex items-center gap-6 relative z-20">
                <div className="w-16 h-16 rounded-2xl bg-[#141416] border border-panel-border flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,122,255,0.2)]">
                  <FileText className="w-8 h-8 text-oxygen" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{file?.name || "Processing Document..."}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/50 font-mono">
                      <span>OCR Extraction & NLP Structuring</span>
                      <span className="animate-pulse">Processing...</span>
                    </div>
                    <div className="h-1 w-full bg-[#141416] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "easeOut" }}
                        className="h-full bg-oxygen"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {scanState === "complete" && <ExtractedMetrics key="complete" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
