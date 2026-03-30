import { Shield, Video, Mic, Bell, Settings, User, Menu } from "lucide-react";

interface StatusBarProps {
  isAlertActive: boolean;
}

const StatusBar = ({ isAlertActive }: StatusBarProps) => {
  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-safe flex items-center justify-center">
              <Shield size={16} className="text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">PATHLY</span>
          </div>
        </div>

        {/* Center - Status */}
        <div className="hidden sm:flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isAlertActive
              ? "bg-alert/15 text-alert border border-alert/30"
              : "bg-safe/15 text-safe border border-safe/30"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAlertActive ? "bg-alert animate-pulse" : "bg-safe"}`} />
            {isAlertActive ? "ALERT ACTIVE" : "YOU'RE SAFE"}
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Record">
            <Video size={18} />
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Audio">
            <Mic size={18} />
          </button>
          <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert rounded-full" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <User size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
