import { Shield, Zap, MapPin, Users, Mic, Wifi } from "lucide-react";

const features = [
  { icon: Zap, label: "Instant Alert", desc: "One-tap SOS" },
  { icon: MapPin, label: "Live Location", desc: "Real-time tracking" },
  { icon: Users, label: "Community", desc: "Nearby responders" },
  { icon: Mic, label: "Evidence", desc: "Audio & video" },
  { icon: Wifi, label: "Offline Mode", desc: "SMS fallback" },
  { icon: Shield, label: "Safe Zones", desc: "Trusted areas" },
];

const QuickFeatures = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <h3 className="font-display font-semibold text-sm text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {features.map((f) => (
          <button
            key={f.label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all group"
          >
            <f.icon size={18} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-foreground">{f.label}</span>
            <span className="text-[10px] text-muted-foreground">{f.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickFeatures;
