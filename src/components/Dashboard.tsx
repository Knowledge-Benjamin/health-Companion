import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { Activity, Heart, Droplet, Zap, TrendingUp } from "lucide-react";

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

const StatCard = ({ title, value, icon: Icon, trend, alert = false }: any) => (
  <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group ${alert ? "border-rose-500/50" : ""}`}>
    {alert && <div className="absolute inset-0 bg-rose-500/5 animate-pulse" />}
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl ${alert ? "bg-rose-500/20 text-rose-400" : "bg-panel text-oxygen"}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend.startsWith('+') || trend === 'Nominal' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </div>
  </div>
);

export function Dashboard() {
  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Predictive Horizon</h2>
          <p className="text-white/60 text-sm">Forecasting health trajectory based on active telemetry and historical data.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            1 Predictive Alert
          </div>
          <div className="px-3 py-1.5 rounded-full bg-oxygen/20 text-oxygen text-xs font-semibold border border-oxygen/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-oxygen" />
            Model Confidence: 94%
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Resting Heart Rate" value="62 bpm" icon={Heart} trend="Nominal" />
        <StatCard title="Heart Rate Variability" value="50 ms" icon={Activity} trend="-15% (Dropping)" alert />
        <StatCard title="Blood Glucose Est." value="110 mg/dL" icon={Droplet} trend="+12%" />
        <StatCard title="Recovery Index" value="78 / 100" icon={Zap} trend="+2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* HRV Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-400" />
              HRV Trajectory Warning
            </h3>
            <span className="text-xs text-white/40 font-mono">NEXT 48H FORECAST</span>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrvData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                {/* Simulated forecast range - using multiple lines for fake area if AreaChart isn't used, but let's just stick to Line for simplicity */}
                <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={3} dot={{ r: 4, fill: "#fff" }} />
                <Line type="monotone" dataKey="predicted" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-sm text-rose-200">
              <strong className="text-rose-400">Analysis:</strong> HRV is trending downward significantly. Combined with historical lab data (Elevated Cortisol, 10/12/25), this indicates extreme systemic stress or impending illness. <strong>Recommendation:</strong> Prioritize 9 hours of sleep; avoid HIIT today.
            </p>
          </div>
        </div>

        {/* Glucose Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-oxygen" />
              Glucose Trend
            </h3>
            <span className="text-xs text-white/40 font-mono">LAST 24H</span>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={glucoseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-oxygen)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-oxygen)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-oxygen)" fillOpacity={1} fill="url(#colorGlucose)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
           <div className="mt-4 p-4 rounded-xl bg-panel border border-panel-border">
            <p className="text-sm text-white/70">
              <strong className="text-white">Analysis:</strong> Glucose curve remains within target parameters post-prandial. Slight elevation at 04:00 aligns with anticipated dawn phenomenon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
