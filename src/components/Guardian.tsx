import { Bell, Phone, ShieldCheck, HeartPulse, ShieldAlert, Fingerprint, X, UserPlus, Lock, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ContactProps {
  id: string;
  name: string;
  role: string;
  verified: boolean;
  phone: string;
  onManage: (id: string) => void;
}

const EmergencyContact = ({ id, name, role, verified, phone, onManage }: ContactProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-panel border gap-4 border-panel-border hover:border-white/10 transition-colors group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-oxygen/20 group-hover:text-oxygen transition-colors shrink-0">
        <Phone className="w-4 h-4 text-white/70 group-hover:text-oxygen" />
      </div>
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
          {role} {verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />}
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => onManage(id)}
        className="px-4 py-2 border border-panel-border rounded-lg text-xs font-medium hover:bg-white/5 transition-colors w-full sm:w-auto text-white/70 hover:text-white"
      >
        Manage
      </button>
    </div>
  </div>
);

export function Guardian() {
  const [medicalIdEnabled, setMedicalIdEnabled] = useState(true);
  const [panicState, setPanicState] = useState<"idle" | "arming" | "triggered">("idle");
  const [armProgress, setArmProgress] = useState(0);
  
  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [pin, setPin] = useState("");
  const pinInputRef = useRef<HTMLInputElement>(null);

  const [contacts, setContacts] = useState([
    { id: "1", name: "Sarah Connor", role: "Primary / Spouse", verified: true, phone: "+1 (555) 019-2831" },
    { id: "2", name: "Dr. Peter Silberman", role: "Primary Care", verified: true, phone: "+1 (555) 018-9992" },
  ]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Focus PIN input when opened
  useEffect(() => {
    if (isPinModalOpen && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [isPinModalOpen]);

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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") { // Mock PIN
      setIsPinModalOpen(false);
      setPanicState("idle");
      setArmProgress(0);
      setPin("");
    } else {
      // Visual shake for wrong pin
      if (pinInputRef.current) {
        pinInputRef.current.classList.add("animate-[shake_0.5s_ease-in-out]");
        setTimeout(() => pinInputRef.current?.classList.remove("animate-[shake_0.5s_ease-in-out]"), 500);
      }
      setPin("");
    }
  };

  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setEditingContactId(null);
  };

  const activeContactToEdit = contacts.find(c => c.id === editingContactId);

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full relative">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Guardian Protocol</h2>
        <p className="text-white/60 text-sm">Emergency dispatch settings and automated first-responder logic.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-white/20">
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
                    "w-12 h-6 rounded-full transition-colors relative shrink-0",
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
             
             <AnimatePresence>
               {medicalIdEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-[#141416]/50 rounded-xl border border-rose-500/10 space-y-3 mt-2">
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
                    </div>
                  </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-white/20 transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-oxygen" />
                Verified Contacts
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">Level 1 Dispatch</span>
            </div>

            <div className="space-y-3">
              {contacts.map(contact => (
                <EmergencyContact 
                  key={contact.id} 
                  {...contact} 
                  onManage={setEditingContactId} 
                />
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-6 border border-dashed border-panel-border rounded-xl text-white/40 text-sm">
                  No emergency contacts configured.
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsAddContactOpen(true)}
              className="w-full mt-4 py-3 rounded-xl border border-dashed border-panel-border text-sm text-white/50 font-medium hover:text-white hover:border-oxygen/50 hover:bg-oxygen/5 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add Emergency Contact
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
                  <p className="text-rose-400 font-semibold mb-8 uppercase tracking-widest text-sm flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
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
                      <Fingerprint className={cn("w-12 h-12 mb-2 transition-opacity", panicState === "arming" ? "opacity-100" : "opacity-80")} />
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
                  className="glass-panel border-rose-500/50 p-8 rounded-3xl text-center relative overflow-hidden w-full max-w-sm shadow-[0_0_100px_rgba(244,63,94,0.2)]"
                >
                  <div className="absolute inset-0 bg-rose-500/10 animate-[pulse_1s_ease-in-out_infinite] pointer-events-none" />
                  <div className="w-20 h-20 bg-rose-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.6)]">
                    <ShieldAlert className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-400 mb-2">SOS Deployed</h3>
                  <p className="text-sm text-white/70 mb-6">
                    First Responders and your Verified Contacts have been notified with your current location and Medical Snapshot.
                  </p>
                  
                  <div className="bg-[#141416] rounded-xl p-4 mb-6 border border-rose-500/20 text-left space-y-2 relative z-10">
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
                    onClick={() => setIsPinModalOpen(true)}
                    className="w-full py-3 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors relative z-10"
                  >
                    Cancel Override
                  </button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* PIN Cancellation Modal */}
      <AnimatePresence>
        {isPinModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-space/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl w-full max-w-sm text-center relative border border-panel-border/50 shadow-2xl"
            >
              <button 
                onClick={() => setIsPinModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
              
              <Lock className="w-12 h-12 text-white/70 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Cancel Override</h3>
              <p className="text-sm text-white/50 mb-6">Enter your 4-digit security PIN to disarm the emergency broadcast. (Try '1234')</p>
              
              <form onSubmit={handlePinSubmit}>
                <input 
                  ref={pinInputRef}
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#141416] border border-panel-border rounded-xl p-4 text-center text-3xl tracking-[1em] focus:outline-none focus:border-oxygen focus:ring-1 focus:ring-oxygen text-white mb-6"
                  placeholder="••••"
                  autoComplete="off"
                />
                <button 
                  type="submit"
                  disabled={pin.length < 4}
                  className="w-full py-3 rounded-xl bg-oxygen text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-oxygen-light transition-colors"
                >
                  Verify & Disarm
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {isAddContactOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-space/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl w-full max-w-md relative border border-panel-border/50 shadow-2xl"
            >
              <button 
                onClick={() => setIsAddContactOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><UserPlus className="w-5 h-5 text-oxygen"/> Add Dispatch Contact</h3>
              <p className="text-sm text-white/50 mb-6">Register a new contact for priority broadcast.</p>
              
              <form className="space-y-4" onSubmit={(e) => { 
                e.preventDefault(); 
                setContacts(prev => [...prev, { id: Date.now().toString(), name: "New Contact", role: "Custom", phone: "+1 (555) 000-0000", verified: false }]);
                setIsAddContactOpen(false); 
              }}>
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block text-left">Full Name</label>
                  <input type="text" required className="w-full bg-[#141416] border border-panel-border rounded-xl p-3 focus:outline-none focus:border-oxygen text-sm text-white" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block text-left">Relationship / Role</label>
                  <input type="text" required className="w-full bg-[#141416] border border-panel-border rounded-xl p-3 focus:outline-none focus:border-oxygen text-sm text-white" placeholder="Family Member" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block text-left">Phone Number</label>
                  <input type="tel" required className="w-full bg-[#141416] border border-panel-border rounded-xl p-3 focus:outline-none focus:border-oxygen text-sm text-white" placeholder="+1 (555) 000-0000" />
                </div>
                <button type="submit" className="w-full py-3 mt-4 rounded-xl bg-white text-deep-space font-bold hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Register Contact
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Contact Modal */}
      <AnimatePresence>
        {editingContactId && activeContactToEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-space/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl w-full max-w-md relative border border-panel-border/50 shadow-2xl"
            >
              <button 
                onClick={() => setEditingContactId(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Edit2 className="w-5 h-5 text-oxygen"/> Manage Contact</h3>
              <p className="text-sm text-white/50 mb-6">Modify details or remove from dispatch.</p>
              
              <form className="space-y-4" onSubmit={(e) => { 
                e.preventDefault(); 
                setEditingContactId(null); 
              }}>
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block text-left">Full Name</label>
                  <input type="text" defaultValue={activeContactToEdit.name} required className="w-full bg-[#141416] border border-panel-border rounded-xl p-3 focus:outline-none focus:border-oxygen text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block text-left">Relationship / Role</label>
                  <input type="text" defaultValue={activeContactToEdit.role} required className="w-full bg-[#141416] border border-panel-border rounded-xl p-3 focus:outline-none focus:border-oxygen text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block text-left">Phone Number</label>
                  <input type="tel" defaultValue={activeContactToEdit.phone} required className="w-full bg-[#141416] border border-panel-border rounded-xl p-3 focus:outline-none focus:border-oxygen text-sm text-white" />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-white text-deep-space font-bold hover:bg-white/90 transition-colors">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveContact(activeContactToEdit.id)}
                    className="px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 font-bold hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
