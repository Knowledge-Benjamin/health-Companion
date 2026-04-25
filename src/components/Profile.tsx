import { User, Activity, Settings, Save, Shield, ShieldCheck, Database, FileKey, CheckCircle, AlertTriangle, Pill, Target } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Julian Reis",
    dob: "1987-04-12",
    gender: "Male",
    height: "185",
    weight: "82",
    bloodType: "O-Negative",
    allergies: "Penicillin, Peanuts",
  });

  const [preferences, setPreferences] = useState({
    dataSharing: false,
    aiStrictness: 80,
  });

  const [keyState, setKeyState] = useState<"idle" | "generating" | "done">("idle");
  const [purgeState, setPurgeState] = useState<"idle" | "confirm" | "purging" | "done">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleRegenerateKey = () => {
    setKeyState("generating");
    setTimeout(() => {
      setKeyState("done");
      setTimeout(() => setKeyState("idle"), 3000);
    }, 2000);
  };

  const handlePurge = () => {
    if (purgeState === "idle") {
      setPurgeState("confirm");
      return;
    }
    if (purgeState === "confirm") {
      setPurgeState("purging");
      setTimeout(() => {
        setPurgeState("done");
        setTimeout(() => setPurgeState("idle"), 3000);
      }, 2500);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full pb-20">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Subject Profile</h2>
          <p className="text-white/60 text-sm">Manage baseline biometrics and AI personalization constraints.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
            isEditing 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" 
              : "bg-panel border border-panel-border text-white/70 hover:text-white hover:bg-white/5"
          )}
        >
          {isEditing ? (
            <><Save className="w-4 h-4" /> Save Baseline</>
          ) : (
            <><Settings className="w-4 h-4" /> Edit Baseline</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-oxygen/20 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col items-center pt-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-oxygen to-oxygen-dark flex items-center justify-center text-3xl font-bold mb-4 shadow-[0_0_30px_rgba(0,122,255,0.3)] ring-4 ring-deep-space">
                {profile.name.charAt(0)}
              </div>
              
              {isEditing ? (
                <input 
                  type="text" 
                  name="name"
                  value={profile.name} 
                  onChange={handleChange}
                  className="bg-[#141416] border border-oxygen/50 rounded-lg px-3 py-1 text-center font-bold text-xl w-full focus:outline-none focus:ring-1 focus:ring-oxygen mb-1" 
                />
              ) : (
                <h3 className="text-xl font-bold">{profile.name}</h3>
              )}
              
              <div className="text-oxygen-light text-sm font-mono mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
              </div>

              <div className="w-full mt-6 space-y-3 pt-6 border-t border-panel-border">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Date of Birth</span>
                  {isEditing ? (
                    <input type="date" name="dob" value={profile.dob} onChange={handleChange} className="bg-[#141416] border border-panel-border rounded px-2 py-0.5 text-right w-32 focus:outline-none focus:border-oxygen text-white" />
                  ) : (
                    <span className="font-medium">{profile.dob}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Biological Sex</span>
                  {isEditing ? (
                    <select name="gender" value={profile.gender} onChange={handleChange} className="bg-[#141416] border border-panel-border rounded px-2 py-0.5 text-right w-32 focus:outline-none focus:border-oxygen text-white">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <span className="font-medium">{profile.gender}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm text-white/50 uppercase tracking-wider">
              <Database className="w-4 h-4" /> System Preferences
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Research Data Sharing</span>
                  <button 
                    onClick={() => setPreferences(prev => ({...prev, dataSharing: !prev.dataSharing}))}
                    className={cn("w-10 h-5 rounded-full transition-colors relative", preferences.dataSharing ? "bg-oxygen" : "bg-[#141416] border border-panel-border")}
                  >
                    <motion.div 
                      className="w-3 h-3 bg-white rounded-full absolute top-[3px]"
                      animate={{ left: preferences.dataSharing ? 24 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Contribute anonymized telemetry to the Sentinel decentralized medical model.</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium">Oracle Conservatism</span>
                  <span className="text-xs font-mono text-oxygen">{preferences.aiStrictness}% strictly clinical</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={preferences.aiStrictness}
                  onChange={(e) => setPreferences(prev => ({...prev, aiStrictness: parseInt(e.target.value)}))}
                  className="w-full accent-oxygen"
                />
                <p className="text-xs text-white/40 mt-2 leading-relaxed">Adjust how strictly the AI adheres to standard-of-care guidelines vs exploring experimental wellness correlation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Biometrics & Security */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-oxygen" /> Baseline Biometrics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Height (cm)", name: "height", value: profile.height, type: "number" },
                { label: "Weight (kg)", name: "weight", value: profile.weight, type: "number" },
                { label: "Blood Type", name: "bloodType", value: profile.bloodType, type: "text" },
                { label: "Known Allergies", name: "allergies", value: profile.allergies, type: "text" },
              ].map((field) => (
                <div key={field.name} className="bg-[#141416] border border-panel-border rounded-xl p-4 transition-colors group hover:border-white/10">
                  <span className="text-xs text-white/50 block mb-1 uppercase tracking-wider">{field.label}</span>
                  {isEditing ? (
                    <input 
                      type={field.type} 
                      name={field.name}
                      value={field.value} 
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-oxygen/50 focus:border-oxygen focus:outline-none text-lg font-mono py-1 text-white" 
                    />
                  ) : (
                    <span className="text-lg font-mono font-medium">{field.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-oxygen/5 border border-oxygen/10 rounded-xl">
              <p className="text-xs text-oxygen-light leading-relaxed">
                <strong>Oracle Imprint Update:</strong> Baseline changes critically shift Sentinel's predictive modeling parameters. 
                Keep these metrics highly accurate.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-oxygen" /> Daily Regimen Configuration
            </h3>
            <p className="text-sm text-white/60 mb-6">Define your strict daily routine for AI tracking on the Predictive Horizon dashboard.</p>
            <div className="space-y-4">
              {[
                { label: "Medication", value: "Lisinopril 10mg", time: "08:00 AM" },
                { label: "Supplement", value: "Vitamin D3 + K2", time: "08:00 AM" },
                { label: "Supplement", value: "Omega-3 EPA/DHA", time: "12:00 PM" },
                { label: "Habit", value: "Zone 2 Cardio (45m)", time: "Evening" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-[#141416] border border-panel-border rounded-xl p-3">
                   <div className="bg-white/5 p-2 rounded-lg text-white/50">
                     <Pill className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                     <div className="text-xs text-white/40 uppercase tracking-wide">{item.label}</div>
                     <input 
                       defaultValue={item.value} 
                       disabled={!isEditing}
                       className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-semibold text-white w-full h-6 disabled:opacity-80"
                     />
                   </div>
                   <div className="w-24">
                     <input 
                       defaultValue={item.time} 
                       disabled={!isEditing}
                       className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-right text-white/60 font-mono w-full h-6 disabled:opacity-80"
                     />
                   </div>
                </div>
              ))}
              {isEditing && (
                <button className="w-full py-3 rounded-xl border border-dashed border-panel-border text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                  + Add Regimen Protocol
                </button>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-oxygen" /> Device Integrations
            </h3>
            <p className="text-sm text-white/60 mb-6">Connect smart health devices and wearables for continuous real-time telemetry syncing.</p>
            
            <div className="space-y-4">
              {[
                { id: "apple", name: "Apple HealthKit / Watch", status: "Connect", icon: "Watch", active: false, type: "native" },
                { id: "oura", name: "Oura Ring API", status: "Connect", icon: "Ring", active: false, type: "oauth" },
                { id: "whoop", name: "Whoop Strap", status: "Connect", icon: "Activity", active: false, type: "oauth" },
                { id: "dexcom", name: "Dexcom G7 CGM", status: "Connect", icon: "HeartPulse", active: false, type: "oauth" },
              ].map((device, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#141416] border border-panel-border rounded-xl gap-4 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Activity className={cn("w-5 h-5", device.active ? "text-oxygen" : "text-white/40")} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{device.name}</h4>
                      {device.active ? (
                        <p className="text-xs text-oxygen flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3" /> Last sync: {device.lastSync}</p>
                      ) : (
                         <p className="text-xs text-white/40 mt-0.5">Not connected</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (device.type === 'native') {
                        alert("Note: Direct Apple HealthKit integration requires a native iOS companion app, as web browsers cannot natively access HealthKit databases. To implement this in production, we would use an aggregator API like Terra API/Vital, or build an iOS app that syncs to your backend. We can build an XML export updater here if you'd like!");
                      } else {
                        alert(`Initiating OAuth connection flow for ${device.name}...`);
                      }
                    }}
                    className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold w-full sm:w-auto transition-colors",
                    device.active 
                      ? "bg-white/5 text-white/70 hover:bg-white/10 border border-transparent" 
                      : "bg-[#141416] text-white hover:text-oxygen border border-panel-border hover:border-oxygen/50"
                  )}>
                    {device.status}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Account Security
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#141416] rounded-xl border border-panel-border mb-4 gap-4 transition-colors focus-within:border-white/20 hover:border-white/10">
               <div>
                 <div className="font-medium text-sm text-white flex items-center gap-2">
                    <FileKey className="w-4 h-4 text-white/50" /> Master Encryption Key
                 </div>
                 <div className="text-xs text-white/40 mt-1">Regenerate your AES-256 local vault key.</div>
               </div>
               <button 
                  onClick={handleRegenerateKey}
                  disabled={keyState !== "idle"}
                  className={cn(
                    "px-4 py-2 border rounded-lg text-xs font-medium transition-all w-full sm:w-auto min-w-[120px] flex justify-center items-center",
                    keyState === "generating" ? "bg-white/5 border-white/20 text-white/50 cursor-wait" :
                    keyState === "done" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                    "border-panel-border hover:bg-white/5 text-white/70 hover:text-white"
                  )}
               >
                 {keyState === "generating" ? "Generating..." :
                  keyState === "done" ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Generated</span> : 
                  "Regenerate"}
               </button>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#141416] rounded-xl border gap-4 transition-colors focus-within:border-rose-500/50 hover:border-rose-500/30" style={{ borderColor: purgeState !== "idle" ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.08)" }}>
               <div>
                 <div className="font-medium text-sm text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Purge Vault Data
                 </div>
                 <div className="text-xs text-white/40 mt-1">Permanently delete all indexed health records and OCR extractions.</div>
               </div>
               <button 
                 onClick={handlePurge}
                 disabled={purgeState === "purging" || purgeState === "done"}
                 className={cn(
                   "px-4 py-2 border rounded-lg text-xs font-medium transition-all w-full sm:w-auto min-w-[120px] flex justify-center items-center",
                   purgeState === "confirm" ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600" :
                   purgeState === "purging" ? "bg-rose-500/20 text-rose-400/50 border-rose-500/20 cursor-wait" :
                   purgeState === "done" ? "bg-[#141416] border-panel-border text-white/30" :
                   "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                 )}
               >
                 {purgeState === "confirm" ? "Are you sure?" :
                  purgeState === "purging" ? "Purging..." :
                  purgeState === "done" ? "Vault Empty" :
                  "Purge"}
               </button>
               {purgeState === "confirm" && (
                 <button 
                   onClick={() => setPurgeState("idle")}
                   className="px-4 py-2 border border-panel-border rounded-lg text-xs font-medium hover:bg-white/5 text-white/70 sm:hidden"
                 >
                   Cancel
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
