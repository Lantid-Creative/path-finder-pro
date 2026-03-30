import { AlertTriangle, Shield, Users, Clock } from "lucide-react";

interface AlertItem {
  id: string;
  type: "danger" | "warning" | "safe";
  message: string;
  location: string;
  time: string;
  distance: string;
}

const alerts: AlertItem[] = [
  {
    id: "1",
    type: "danger",
    message: "Emergency alert triggered",
    location: "Downtown, 5th & Main",
    time: "2 min ago",
    distance: "0.3 mi",
  },
  {
    id: "2",
    type: "warning",
    message: "Suspicious activity reported",
    location: "Park Ave & 12th St",
    time: "15 min ago",
    distance: "0.8 mi",
  },
  {
    id: "3",
    type: "safe",
    message: "Area cleared by community",
    location: "Central Park East",
    time: "1 hr ago",
    distance: "1.2 mi",
  },
];

const iconMap = {
  danger: AlertTriangle,
  warning: Shield,
  safe: Users,
};

const colorMap = {
  danger: "text-alert bg-alert/10 border-alert/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  safe: "text-safe bg-safe/10 border-safe/20",
};

const CommunityAlerts = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-foreground">Community Alerts</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={12} />
          <span>128 nearby</span>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${colorMap[alert.type]} transition-colors`}
            >
              <div className="mt-0.5">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs opacity-70 mt-0.5">{alert.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs opacity-60">
                    <Clock size={10} />
                    {alert.time}
                  </span>
                  <span className="text-xs opacity-60">• {alert.distance}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
        View All Alerts
      </button>
    </div>
  );
};

export default CommunityAlerts;
