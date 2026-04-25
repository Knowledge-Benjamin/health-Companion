import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, ChevronRight, AlertCircle, Terminal, Download, Trash2, Database, ShieldCheck, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function Vault() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showRawFhir, setShowRawFhir] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState([
    { id: "1", name: "Lipid_Panel_Nov2025.pdf", date: "Nov 12, 2025", size: "1.2 MB", status: "verified" },
    { id: "2", name: "Dr_Silberman_Consult.pdf", date: "Oct 28, 2025", size: "845 KB", status: "verified" },
  ]);

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleDownload = (name: string) => {
    // In a real app, this would trigger a file download using a blob or URL
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8,Mock%20File%20Content";
    a.download = name;
    a.click();
  };

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
    // Basic validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFile(file);
      setErrorMessage("Invalid format. Only PDF, JPG, or PNG are supported for FHIR extraction.");
      setScanState("error");
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      setFile(file);
      setErrorMessage("File exceeds 15MB maximum. Please compress and try again.");
      setScanState("error");
      return;
    }

    setFile(file);
    setScanState("scanning");
    setShowRawFhir(false);
    
    // Simulate OCR and NLP extraction
    setTimeout(() => {
      setScanState("complete");
      setDocuments(prev => [{
        id: Date.now().toString(),
        name: file.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
        status: "verified"
      }, ...prev]);
    }, 4000);
  };

  const rawJson = `{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "14631-6",
        "display": "25-hydroxyvitamin D [Mass/volume] in Serum or Plasma"
      }
    ]
  },
  "valueQuantity": {
    "value": 28,
    "unit": "ng/mL",
    "system": "http://unitsofmeasure.org",
    "code": "ng/mL"
  },
  "referenceRange": [
    {
      "low": { "value": 30, "unit": "ng/mL" },
      "high": { "value": 100, "unit": "ng/mL" }
    }
  ]
}`;

  const ExtractedMetrics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
      className="mt-8 space-y-4 pb-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="text-emerald-400 w-5 h-5" />
          Extraction Complete
        </h3>
        <button 
          onClick={() => setShowRawFhir(!showRawFhir)}
          className="px-3 py-1.5 rounded-lg border border-panel-border bg-panel text-xs text-white/70 hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Terminal className="w-3.5 h-3.5" />
          {showRawFhir ? "Hide Raw Data" : "View FHIR Data"}
        </button>
      </div>

      <AnimatePresence>
        {showRawFhir && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0A0A0B] border border-panel-border rounded-xl p-4 mt-2 mb-6">
              <pre className="text-[10px] sm:text-xs text-white/70 font-mono overflow-x-auto">
                <code>{rawJson}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
            className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors"
          >
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full transition-all duration-300",
              item.status === "Low" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-emerald-500"
            )} />
            <div className="text-sm text-white/50 mb-1 font-medium">{item.label}</div>
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
        className="mt-8 px-6 py-3 rounded-xl bg-panel border border-panel-border text-sm font-semibold hover:bg-white/5 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
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
                accept="application/pdf,image/jpeg,image/png"
              />
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-oxygen" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Drag & Drop Medical Records</h3>
              <p className="text-sm text-white/40">Support for PDF, JPG, PNG (FHIR parsing enabled)</p>
            </motion.div>
          )}

          {scanState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel border-rose-500/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-64 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-rose-500/5" />
               <AlertCircle className="w-12 h-12 text-rose-500 mb-4 relative z-10" />
               <h3 className="text-lg font-bold mb-2 relative z-10">Ingestion Failed</h3>
               <p className="text-sm text-white/70 mb-6 max-w-sm relative z-10">{errorMessage}</p>
               <button 
                  onClick={() => { setFile(null); setScanState("idle"); }}
                  className="px-6 py-2 bg-rose-500/20 text-rose-300 rounded-lg text-sm font-semibold hover:bg-rose-500/30 transition-colors relative z-10"
               >
                 Try Again
               </button>
            </motion.div>
          )}

          {scanState === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel border-oxygen/30 rounded-3xl p-8 relative overflow-hidden"
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
                      <span className="animate-[pulse_1s_ease-in-out_infinite]">Processing...</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#141416] rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-oxygen to-oxygen-light shadow-[0_0_10px_rgba(0,122,255,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {scanState === "complete" && <ExtractedMetrics key="complete" />}
        </AnimatePresence>

        {/* Clinical Archive */}
        <div className="mt-12 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-oxygen" /> Clinical Archive
            </h3>
            <span className="text-xs text-white/50 bg-[#141416] px-3 py-1.5 rounded-full border border-panel-border">
              {documents.length} Indexed Records
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {documents.length === 0 ? (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="text-center py-12 border border-dashed border-panel-border rounded-2xl text-white/40 text-sm"
                 >
                   No documents found in archive.
                 </motion.div>
              ) : (
                documents.map(doc => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-panel rounded-xl hover:border-white/20 transition-colors group gap-4"
                  >
                    <div className="flex items-center gap-4 filter min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#141416] border border-panel-border flex items-center justify-center shrink-0 group-hover:bg-oxygen/10 group-hover:border-oxygen/30 transition-colors">
                        <FileText className="w-5 h-5 text-white/70 group-hover:text-oxygen" />
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <h4 className="font-semibold text-sm truncate">{doc.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                          <span>{doc.date}</span>
                          <span>&bull;</span>
                          <span>{doc.size}</span>
                          {doc.status === "verified" && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 text-emerald-400">
                                <ShieldCheck className="w-3 h-3" /> Indexed
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => setViewingDoc(doc)}
                        className="p-2 rounded-lg border border-panel-border hover:bg-oxygen/10 hover:text-oxygen hover:border-oxygen/30 text-white/60 transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(doc.name)}
                        className="p-2 rounded-lg border border-panel-border hover:bg-white/5 hover:text-white text-white/60 transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg border border-panel-border hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-white/60 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-space/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden border-panel-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-panel-border bg-[#0A0A0B] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-oxygen/10 rounded-lg">
                    <FileText className="w-5 h-5 text-oxygen" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{viewingDoc.name}</h3>
                    <p className="text-xs text-white/50">{viewingDoc.date} • {viewingDoc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDownload(viewingDoc.name)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/70 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewingDoc(null)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-white/70 hover:text-rose-400 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewer Content (Simulated PDF) */}
              <div className="flex-1 bg-white/5 p-4 sm:p-8 overflow-y-auto custom-scrollbar flex justify-center">
                <div className="bg-white text-black p-8 sm:p-12 w-full max-w-3xl min-h-full rounded shadow-xl flex flex-col">
                  {/* Mock Clinical Document Content */}
                  <div className="border-b-2 border-black/10 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-serif text-black uppercase tracking-wider mb-2">Clinical Report</h1>
                        <p className="text-black/60 font-mono text-sm">Document ID: {viewingDoc.id}-XJ98L</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-black">Sentinel Health Partners</p>
                        <p className="text-black/60">1-800-SENTINEL</p>
                        <p className="text-black/60">Generated: {viewingDoc.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-black/50 mb-1 font-semibold">Patient Information</h4>
                      <p className="font-semibold text-black">John Doe</p>
                      <p className="text-sm text-black/70">DOB: 05/14/1982</p>
                      <p className="text-sm text-black/70">ID: PT-847291</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-black/50 mb-1 font-semibold">Attending Physician</h4>
                      <p className="font-semibold text-black">Dr. P. Silberman, MD</p>
                      <p className="text-sm text-black/70">Department of Endocrinology</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold border-b border-black/10 pb-2 mb-4">Laboratory Results & Analysis</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">Lipid Panel</h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-black/20 text-left">
                              <th className="py-2 font-semibold">Test Name</th>
                              <th className="py-2 font-semibold">Result</th>
                              <th className="py-2 font-semibold">Reference Range</th>
                              <th className="py-2 font-semibold text-center">Flag</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-black/5">
                              <td className="py-2">Total Cholesterol</td>
                              <td className="py-2">185 mg/dL</td>
                              <td className="py-2">&lt; 200 mg/dL</td>
                              <td className="py-2 text-center">-</td>
                            </tr>
                            <tr className="border-b border-black/5 bg-rose-50/50">
                              <td className="py-2">LDL Cholesterol</td>
                              <td className="py-2 font-bold text-rose-600">112 mg/dL</td>
                              <td className="py-2">&lt; 100 mg/dL</td>
                              <td className="py-2 text-center text-rose-600 font-bold">H</td>
                            </tr>
                            <tr className="border-b border-black/5">
                              <td className="py-2">HDL Cholesterol</td>
                              <td className="py-2">60 mg/dL</td>
                              <td className="py-2">&gt; 40 mg/dL</td>
                              <td className="py-2 text-center">-</td>
                            </tr>
                            <tr className="border-b border-black/5">
                              <td className="py-2">Triglycerides</td>
                              <td className="py-2">120 mg/dL</td>
                              <td className="py-2">&lt; 150 mg/dL</td>
                              <td className="py-2 text-center">-</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Clinical Notes</h4>
                        <p className="text-sm leading-relaxed text-black/80 font-serif">
                          Patient presents with generally stable metabolic markers. The slight elevation in LDL is noted, but given the strong HDL and normal triglyceride levels, no immediate pharmacological intervention is recommended. Suggest continuing current cardiovascular routine (Zone 2 training) and maintaining adherence to the established dietary protocol focusing on Omega-3 polyunsaturated fats. Will re-evaluate in 6 months during the next scheduled panel.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-6 border-t border-black/10 text-center">
                    <p className="text-xs text-black/40 font-mono">End of Document • Electronically Signed by Dr. P. Silberman • Sentinel Health</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
