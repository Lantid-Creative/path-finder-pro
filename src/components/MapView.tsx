import { MapPin, Navigation, Wifi, WifiOff } from "lucide-react";

const MapView = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-surface rounded-xl overflow-hidden border border-border">
      {/* Simulated map grid */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-foreground/20"
            style={{ top: `${i * 5}%` }}
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full border-l border-foreground/20"
            style={{ left: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* Simulated roads */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-[30%] left-0 right-0 h-1 bg-foreground" />
        <div className="absolute top-[60%] left-0 right-0 h-0.5 bg-foreground" />
        <div className="absolute left-[25%] top-0 bottom-0 w-1 bg-foreground" />
        <div className="absolute left-[55%] top-0 bottom-0 w-0.5 bg-foreground" />
        <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-foreground" />
        <div className="absolute top-[45%] left-[10%] right-[20%] h-0.5 bg-foreground rotate-12 origin-left" />
      </div>

      {/* Radar sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
        <div className="absolute inset-0 rounded-full border border-primary/10" />
        <div className="absolute inset-8 rounded-full border border-primary/15" />
        <div className="absolute inset-16 rounded-full border border-primary/20" />
        <div
          className="absolute inset-0 rounded-full animate-[radar-sweep_4s_linear_infinite] origin-center"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, hsl(170 60% 45% / 0.15) 30deg, transparent 60deg)",
          }}
        />
      </div>

      {/* User location marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-primary glow-safe" />
          <div className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" />
        </div>
      </div>

      {/* Nearby community markers */}
      <div className="absolute top-[35%] left-[30%] w-2.5 h-2.5 rounded-full bg-safe/60" />
      <div className="absolute top-[40%] left-[65%] w-2.5 h-2.5 rounded-full bg-safe/60" />
      <div className="absolute top-[55%] left-[40%] w-2.5 h-2.5 rounded-full bg-safe/60" />
      <div className="absolute top-[25%] left-[70%] w-2 h-2 rounded-full bg-warning/60" />
      <div className="absolute top-[65%] left-[20%] w-2.5 h-2.5 rounded-full bg-safe/60" />

      {/* Alert marker */}
      <div className="absolute top-[28%] left-[45%]">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-alert/80 animate-pulse" />
          <div className="absolute -inset-1.5 rounded-full border border-alert/40" />
        </div>
      </div>

      {/* Top status bar overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/50">
          <Navigation size={12} className="text-primary" />
          <span className="text-xs font-medium text-foreground">Live Tracking</span>
        </div>

        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/50">
          <Wifi size={12} className="text-safe" />
          <span className="text-xs text-muted-foreground">Connected</span>
        </div>
      </div>

      {/* Location label */}
      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <div>
            <p className="text-xs font-medium text-foreground">Current Location</p>
            <p className="text-[10px] text-muted-foreground">Downtown • Updated 3s ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
