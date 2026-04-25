import { Bell, Phone, ShieldCheck, HeartPulse, ShieldAlert, Fingerprint } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function Guardian() {
  const [medicalIdEnabled, setMedicalIdEnabled] = useState(true);
  const [panicState, setPanicState] = useState<"idle" | "arming" | "triggered">("idle");
  const [armProgress, setArmProgress] = useState(0);

  const handlePanicHold = () => {
    if (panicState !== "idle") return;
    setPanicState("arming");
    
    // Simulate holding the button
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setArmProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setPanicState("triggered");
      }
    }, 100);

    // Stop if they let go too early
    const handleMouseUp = () => {
      clearInterval(interval);
      if (progress < 100) {
        setPanicState("idle");
        setArmProgress(0);
      }
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
  };

  const EmergencyContact = ({ name, role, verified, phone }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-panel border gap-4 border-panel-border hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Phone className="w-4 h-4 text-white/70" />
        </div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-white/50 flex items-center gap-1">
            {role} {verified && <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />}
          </div>
        </div>
      </div>
      <div className="text-right">
        <button className="px-4 py-2 border border-panel-border rounded-lg text-xs font-medium hover:bg-white/5 transition-colors">
          Manage
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Guardian Protocol</h2>
        <p className="text-white/60 text-sm">Emergency dispatch settings and automated first-responder logic.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
             <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-500" />
                    Medical ID Broadcasting
                  </h3>
                  <p className="text-sm text-white/50 mt-1 max-w-[280px]">
                    Make critical allergies, blood type, and conditions available securely from the lock screen.
                  </p>
                </div>
                <button 
                  onClick={() => setMedicalIdEnabled(!medicalIdEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    medicalIdEnabled ? "bg-emerald-500" : "bg-panel-border"
                  )}
                >
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                    animate={{ left: medicalIdEnabled ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
             </div>
             
             {medicalIdEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-[#141416]/50 rounded-xl border border-rose-500/10 space-y-3"
                >
                  <div className="flex justify-between text-sm border-b border-panel-border pb-2">
                    <span className="text-white/50">Blood Type</span>
                    <span className="font-mono text-rose-400 font-bold">O-NEGATIVE</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-panel-border pb-2">
                    <span className="text-white/50">Known Allergies</span>
                    <span className="font-medium text-white text-right">Penicillin<br/>Peanuts (Severe)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Current Meds</span>
                    <span className="font-medium text-white text-right">Lisinopril 10mg<br/>Atorvastatin 20mg</span>
                  </div>
                </motion.div>
             )}
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-oxygen" />
                Verified Contacts
              </h3>
              <span className="text-xs text-white/50">Level 1 Dispatch</span>
            </div>

            <div className="space-y-3">
              <EmergencyContact name="Sarah Connor" role="Primary / Spouse" verified phone="+1 (555) 019-2831" />
              <EmergencyContact name="Dr. Peter Silberman" role="Primary Care" verified phone="+1 (555) 018-9992" />
            </div>

            <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-panel-border text-sm text-white/50 font-medium hover:text-white hover:border-white/20 transition-all">
              + Add Emergency Contact
            </button>
          </div>
        </div>

        {/* Panic Button Area */}
        <div className="flex flex-col items-center justify-center p-8 relative">
           <AnimatePresence mode="wait">
             {panicState !== "triggered" ? (
                <motion.div 
                  key="panic-button"
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center text-center relative"
                >
                  <p className="text-rose-400 font-semibold mb-8 uppercase tracking-widest text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Priority Override
                  </p>
                  
                  <div 
                    className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none"
                    onMouseDown={handlePanicHold}
                    onTouchStart={handlePanicHold}
                  >
                    {/* Ripple outer layers */}
                    <div className="absolute inset-0 rounded-full border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]" />
                    <div className="absolute inset-4 rounded-full border border-rose-500/30" />
                    
                    {/* Progress Circle SVGs */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle 
                        cx="128" cy="128" r="126" 
                        fill="none" 
                        stroke="rgba(244,63,94,0.1)" 
                        strokeWidth="4" 
                      />
                      <circle 
                        cx="128" cy="128" r="126" 
                        fill="none" 
                        stroke="#f43f5e" 
                        strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 126}
                        strokeDashoffset={2 * Math.PI * 126 * (1 - armProgress / 100)}
                        className="transition-all duration-100 ease-linear"
                      />
                    </svg>

                    <motion.div 
                      className={cn(
                        "relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-[0_0_30px_rgba(244,63,94,0.5)] flex flex-col items-center justify-center text-white",
                        panicState === "arming" ? "scale-95" : "hover:scale-105 transition-transform"
                      )}
                    >
                      <Fingerprint className="w-12 h-12 mb-2 opacity-80" />
                      <span className="font-bold text-xl uppercase tracking-wider">Hold to SOS</span>
                    </motion.div>
                  </div>

                  <p className="mt-8 text-white/40 text-xs max-w-xs text-center leading-relaxed">
                    Holding for 3 seconds guarantees an immediate transmission of GPS, vitals, and medical ID to your verified contacts and local dispatch.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="panic-triggered"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel border-rose-500/50 p-8 rounded-3xl text-center relative overflow-hidden w-full max-w-sm"
                >
                  <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
                  <div className="w-20 h-20 bg-rose-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.6)]">
                    <ShieldAlert className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-400 mb-2">SOS Deployed</h3>
                  <p className="text-sm text-white/70 mb-6">
                    First Responders and your Verified Contacts have been notified with your current location and Medical Snapshot.
                  </p>
                  
                  <div className="bg-[#141416] rounded-xl p-4 mb-6 border border-rose-500/20 text-left space-y-2">
                     <div className="flex justify-between text-xs font-mono">
                        <span className="text-white/50">LAT/LNG</span>
                        <span className="text-white">37.7749° N, 122.4194° W</span>
                     </div>
                     <div className="flex justify-between text-xs font-mono">
                        <span className="text-white/50">HEART RATE</span>
                        <span className="text-rose-400 animate-pulse">142 BPM</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => { setPanicState("idle"); setArmProgress(0); }}
                    className="w-full py-3 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    Cancel Override (Pin Required)
                  </button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
