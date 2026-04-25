import { User, Activity, Settings, Save, Shield, ShieldCheck, Database, FileKey, CheckCircle, AlertTriangle, Pill, Target, UploadCloud, X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { ClientDatabase } from "../services/db";

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

  const [aggregatorDevices, setAggregatorDevices] = useState<{id: string, name: string, connected: boolean}[]>([]);
  const [showAggregatorModal, setShowAggregatorModal] = useState(false);
  const [isAggregatorSyncing, setIsAggregatorSyncing] = useState(false);

  useEffect(() => {
    ClientDatabase.get("integrations", "aggregator").then((data) => {
      if (data && data.devices) {
        setAggregatorDevices(data.devices);
      } else {
        setAggregatorDevices([
          { id: "apple_health", name: "Apple Health", connected: false },
          { id: "oura", name: "Oura", connected: false },
          { id: "fitbit", name: "Fitbit", connected: false },
          { id: "garmin", name: "Garmin", connected: false },
        ]);
      }
    });
  }, []);

  const handleConnectProvider = async (deviceId: string) => {
    setIsAggregatorSyncing(true);
    setTimeout(async () => {
      const updated = aggregatorDevices.map(d => d.id === deviceId ? { ...d, connected: true } : d);
      setAggregatorDevices(updated);
      
      await ClientDatabase.save("integrations", "aggregator", { devices: updated });

      // Simulate webhook populating data into our local DB
      await ClientDatabase.save("telemetry", "latest", {
        hrv: 68,
        sleepHours: 7.5,
        readiness: 92,
        glucose: 105,
        lastSync: new Date().toISOString()
      });

      // Provide historical data as well for charts
      await ClientDatabase.save("telemetry", "history", {
        hrv: [
          { day: "Mon", value: 65 },
          { day: "Tue", value: 62 },
          { day: "Wed", value: 58 },
          { day: "Thu", value: 55 },
          { day: "Fri", value: 68 },
        ]
      });

      setIsAggregatorSyncing(false);
    }, 2000);
  };

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
              <Activity className="w-5 h-5 text-oxygen" /> Device Integrations (Aggregator)
            </h3>
            <p className="text-sm text-white/60 mb-6">
              Connect your wearables using a unified aggregator (like Terra API or Vital). This allows seamless syncing with Apple Health, Oura, Whoop, and more via a single integration.
            </p>
            
            <div className="space-y-4">
               {/* Aggregator Widget Simulation */}
               <div className="p-5 bg-gradient-to-r from-oxygen/10 to-transparent border border-oxygen/20 rounded-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Activity className="w-24 h-24" />
                 </div>
                 <h4 className="font-semibold text-oxygen mb-2 relative z-10">Connect Health Aggregator</h4>
                 <p className="text-sm text-white/70 mb-4 max-w-[80%] relative z-10">
                   Launch the unified portal to securely authenticate with Apple Health, Garmin, Oura, Fitbit, and 50+ other providers. 
                 </p>
                 <button 
                  onClick={() => setShowAggregatorModal(true)}
                  className="px-6 py-2.5 bg-oxygen text-white rounded-xl text-sm font-semibold hover:bg-oxygen/80 transition-colors shadow-[0_0_15px_rgba(0,122,255,0.3)] relative z-10"
                 >
                   Launch Integration Portal
                 </button>
               </div>

               {/* Apple Health Manual Export Fallback */}
               <div className="mt-8 pt-6 border-t border-panel-border">
                  <h4 className="font-medium text-sm text-white mb-2">Apple Health Manual Sync (Fallback)</h4>
                  <p className="text-xs text-white/50 mb-4">
                    For complete privacy or if you prefer not to use an aggregator API, you can export your Apple Health data as a ZIP/XML file directly from your iPhone and upload it here.
                  </p>
                  <label className="flex items-center justify-center w-full p-4 border border-dashed border-panel-border rounded-xl cursor-pointer hover:bg-white/5 hover:border-white/20 transition-colors">
                     <span className="text-sm text-white/60 font-semibold flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Upload export.zip
                     </span>
                     <input 
                       type="file" 
                       className="hidden" 
                       accept=".zip,.xml"
                       onChange={(e) => {
                         if (e.target.files?.length) {
                           alert(`Simulating parsing of ${e.target.files[0].name}... We would extract step counts, HR, and sleep data locally.`);
                         }
                       }} 
                     />
                  </label>
               </div>
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

      {/* Aggregator Modal (Simulating Terra/Vital SDK) */}
      <AnimatePresence>
        {showAggregatorModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-space/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-sm rounded-[24px] flex flex-col overflow-hidden border-white/10 shadow-2xl bg-[#09090b]"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-oxygen" />
                  <h3 className="font-semibold text-white">Aggregator Portal</h3>
                </div>
                <button 
                  onClick={() => setShowAggregatorModal(false)}
                  disabled={isAggregatorSyncing}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-white/60 mb-6 text-center">
                  Select a provider to authenticate. We use secure OAuth to pull your health telemetry.
                </p>

                <div className="space-y-3">
                  {aggregatorDevices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => !device.connected && handleConnectProvider(device.id)}
                      disabled={device.connected || isAggregatorSyncing}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                        device.connected 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default" 
                          : "bg-white/5 border-white/10 hover:border-oxygen/50 hover:bg-white/10 text-white"
                      )}
                    >
                      <span className="font-medium text-sm">{device.name}</span>
                      {device.connected ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isAggregatorSyncing ? (
                        <RefreshCw className="w-4 h-4 animate-spin opacity-50" />
                      ) : (
                        <span className="text-xs uppercase tracking-wider opacity-60">Connect</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
