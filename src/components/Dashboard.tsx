import { useState, useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { Activity, Heart, Droplet, Zap, TrendingUp, RefreshCw, X, ChevronRight, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { ClientDatabase } from "../services/db";

// Mock data to simulate predictive modeling
const hrvData = [
  { day: "Mon", value: 65, predicted: 65, range: [60, 70] },
  { day: "Tue", value: 62, predicted: 64, range: [58, 68] },
  { day: "Wed", value: 58, predicted: 60, range: [55, 65] },
  { day: "Thu", value: 55, predicted: 56, range: [50, 60] },
  { day: "Fri", value: 50, predicted: 52, range: [45, 58] },
  { day: "Sat", predicted: 48, range: [40, 55] }, // Future
  { day: "Sun", predicted: 45, range: [35, 52] }, // Future
];

const glucoseData = [
  { time: "08:00", value: 95 },
  { time: "12:00", value: 105 },
  { time: "16:00", value: 110 },
  { time: "20:00", value: 125 },
  { time: "00:00", value: 135 },
  { time: "04:00", value: 140 }, // Elevated predictive flag
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  alert?: boolean;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, trend, alert = false, onClick }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 cursor-pointer shadow-lg",
      alert ? "border-rose-500/50 hover:border-rose-500/80 shadow-rose-500/10" : "hover:border-white/20 hover:shadow-oxygen/10"
    )}
  >
    {alert && <div className="absolute inset-0 bg-rose-500/5 animate-[pulse_2s_ease-in-out_infinite]" />}
    <div className="absolute -inset-24 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={cn(
        "p-3 rounded-xl transition-colors",
        alert ? "bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30" : "bg-panel text-oxygen group-hover:bg-oxygen/20 group-hover:text-oxygen-light"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col items-end gap-2">
        {trend && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            trend.startsWith('+') || trend === 'Nominal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          )}>
            {trend}
          </span>
        )}
        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
           <ChevronRight className="w-3 h-3 text-white/50" />
        </div>
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold font-mono tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStat, setSelectedStat] = useState<any>(null);

  const [metrics, setMetrics] = useState({
    hrv: 50,
    rhr: 62,
    glucose: 110,
    recovery: 78
  });

  const loadData = async () => {
    setIsSyncing(true);
    const latest = await ClientDatabase.get("telemetry", "latest");
    if (latest) {
      setMetrics({
        hrv: latest.hrv || 50,
        rhr: latest.rhr || 62,
        glucose: latest.glucose || 110,
        recovery: latest.readiness || 78
      });
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Daily Protocol State
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [directives, setDirectives] = useState([
    { id: 1, type: "med", title: "Lisinopril 10mg", time: "08:00 AM", done: true, strict: true },
    { id: 2, type: "supp", title: "Vitamin D3 + K2", time: "08:00 AM", done: true, strict: false },
    { id: 3, type: "supp", title: "Omega-3 EPA/DHA", time: "12:00 PM", done: false, strict: false },
    { id: 4, type: "action", title: "Zone 2 Cardio (45m)", time: "Evening", done: false, strict: false, aiSuggested: true }
  ]);

  const toggleDirective = (id: number) => {
    setDirectives(prev => prev.map(d => d.id === id ? { ...d, done: !d.done } : d));
  };

  const handleSync = () => {
    loadData();
  };

  const handleStatClick = (statData: any) => {
    setSelectedStat(statData);
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Predictive Horizon</h2>
          <p className="text-white/60 text-sm">Forecasting health trajectory based on active telemetry and historical data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-full bg-panel text-white/70 text-xs font-semibold border border-panel-border flex items-center gap-2 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-oxygen")} />
            {isSyncing ? "Syncing Telemetry..." : "Data Fresh"}
          </button>
          <div className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
            1 Predictive Alert
          </div>
          <div className="px-3 py-1.5 rounded-full bg-oxygen/20 text-oxygen text-xs font-semibold border border-oxygen/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-oxygen" />
            Model Confidence: 94%
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Resting Heart Rate" value={`${metrics.rhr} bpm`} icon={Heart} trend="Nominal" onClick={() => handleStatClick({ title: "Resting Heart Rate", value: `${metrics.rhr} bpm`, desc: "Your resting heart rate is perfectly aligned with your baseline average.", history: "Nominal" })} />
        <StatCard title="Heart Rate Variability" value={`${metrics.hrv} ms`} icon={Activity} trend={metrics.hrv < 55 ? "-15% (Dropping)" : "Nominal"} alert={metrics.hrv < 55} onClick={() => handleStatClick({ title: "HRV Alert", value: `${metrics.hrv} ms`, alert: metrics.hrv < 55, desc: metrics.hrv < 55 ? "Significant drop detected. Your baseline is 65ms. A reduction correlates heavily with accumulating systemic stress or sleep deprivation." : "Your HRV is looking good relative to your baseline.", history: metrics.hrv < 55 ? "Critical Drop" : "Nominal" })} />
        <StatCard title="Blood Glucose Est." value={`${metrics.glucose} mg/dL`} icon={Droplet} trend="+12%" onClick={() => handleStatClick({ title: "Blood Glucose Est.", value: `${metrics.glucose} mg/dL`, desc: "Slight post-prandial elevation within expected margins. Historical tracking shows excellent insulin sensitivity.", history: "Slight Rise" })} />
        <StatCard title="Recovery Index" value={`${metrics.recovery} / 100`} icon={Zap} trend="+2%" onClick={() => handleStatClick({ title: "Recovery Index", value: `${metrics.recovery} / 100`, desc: "Overall recovery is stable. Sleep structure remains somewhat compromised, but parasympathetic activity is compensating.", history: "Stable" })} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[500px] mb-8">
        
        {/* Left Column: Diagnostics & Daily Directives */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Active Directives */}
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col hover:border-white/20 transition-all shadow-lg flex-shrink-0 min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-oxygen" />
                Daily Protocol
              </h3>
              <span className="text-xs bg-oxygen/10 text-oxygen px-2 py-1 rounded-full font-mono border border-oxygen/20">
                {directives.filter(d => d.done).length}/{directives.length} DONE
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {directives.map(dir => (
                <motion.div 
                  key={dir.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDirective(dir.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden",
                    dir.done ? "bg-[#141416]/50 border-panel-border" : "bg-[#141416] border-white/10 hover:border-oxygen/50",
                    dir.aiSuggested && !dir.done && "border-oxygen/30 shadow-[inset_0_0_20px_rgba(0,122,255,0.05)]"
                  )}
                >
                  {dir.aiSuggested && !dir.done && <div className="absolute left-0 top-0 bottom-0 w-1 bg-oxygen" />}
                  
                  <div className="shrink-0 relative">
                    {dir.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className={cn("w-5 h-5", dir.strict ? "text-rose-400" : "text-white/40")} />
                    )}
                  </div>
                  
                  <div className={cn("flex-1 transition-all", dir.done && "opacity-40")}>
                    <div className={cn("text-sm font-semibold flex items-center gap-1.5", dir.done && "line-through")}>
                      {dir.title}
                      {dir.aiSuggested && <span className="text-[10px] bg-oxygen/20 text-oxygen px-1.5 py-0.5 rounded uppercase tracking-wider font-mono not-line-through">AI Mod</span>}
                    </div>
                    <div className="text-xs text-white/50">{dir.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Hydration Tracker */}
            <div className="mt-4 pt-4 border-t border-panel-border">
               <div className="flex items-center justify-between mb-3 text-sm">
                 <span className="text-white/70 font-medium">Hydration (3.0L)</span>
                 <span className="font-mono text-oxygen">{waterGlasses * 250}mL</span>
               </div>
               <div className="flex gap-2">
                 {Array.from({ length: 8 }).map((_, i) => (
                   <motion.div 
                     key={i}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setWaterGlasses(i + 1)}
                     className={cn(
                       "h-8 flex-1 rounded-md cursor-pointer transition-colors border",
                       i < waterGlasses ? "bg-oxygen/80 border-oxygen shadow-[0_0_10px_rgba(0,122,255,0.3)]" : "bg-[#141416] border-panel-border hover:border-white/20"
                     )}
                   />
                 ))}
               </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 glass-panel"
          >
             <div className="flex items-center gap-2 mb-3">
               <AlertCircle className="w-5 h-5 text-rose-400" />
               <span className="font-semibold text-rose-400">System Warning</span>
             </div>
            <p className="text-sm text-rose-100/80 leading-relaxed">
              HRV is trending downward significantly. Combined with historical lab data (Elevated Cortisol), this indicates systemic stress. 
              <br/><br/>
              <strong className="text-white font-semibold text-xs uppercase tracking-wider">Directive</strong>
              <span className="block mt-1 text-white/90">Prioritize 9 hours of sleep; avoid HIIT today; Hydrate.</span>
            </p>
          </motion.div>
        </div>

        {/* Right Column: Predictive Charts */}
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          {/* HRV Chart */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col hover:border-white/20 transition-colors h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-400" />
              HRV Trajectory Modeling
            </h3>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-white/60 font-mono border border-white/10">NEXT 48H FORECAST</span>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrvData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="value" name="Actual" stroke="#fff" strokeWidth={3} dot={{ r: 4, fill: "#141416", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#fff" }} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={{ r: 4, fill: "#141416", stroke: "#f43f5e", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Glucose Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-oxygen" />
              Glucose Trend
            </h3>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-white/60 font-mono border border-white/10">LAST 24H</span>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={glucoseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-oxygen)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-oxygen)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="value" name="mg/dL" stroke="var(--color-oxygen)" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" activeDot={{ r: 6, fill: "#fff", stroke: "var(--color-oxygen)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#141416] to-[#1a1a1d] border border-panel-border"
           >
            <p className="text-sm text-white/70 leading-relaxed">
              <strong className="text-white font-semibold mr-1">Analysis:</strong> 
              Glucose curve remains within target parameters post-prandial. Slight elevation at 04:00 aligns with anticipated dawn phenomenon.
            </p>
          </motion.div>
        </div>
      </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
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
              className={cn(
                "glass-panel p-8 rounded-3xl w-full max-w-md relative shadow-2xl overflow-hidden",
                selectedStat.alert ? "border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.1)]" : "border border-panel-border"
              )}
            >
              {selectedStat.alert && <div className="absolute inset-0 bg-rose-500/5" />}
              <button 
                onClick={() => setSelectedStat(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  {selectedStat.alert && <Activity className="w-5 h-5 text-rose-500" />}
                  {selectedStat.title}
                </h3>
                <div className="text-4xl font-black font-mono tracking-tighter my-4">
                  {selectedStat.value}
                </div>
                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-white/60 mb-6">
                  STATUS: {selectedStat.history}
                </div>
                <p className="text-sm leading-relaxed text-white/60 border-t border-panel-border pt-4">
                  {selectedStat.desc}
                </p>
                <button 
                  onClick={() => setSelectedStat(null)}
                  className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
