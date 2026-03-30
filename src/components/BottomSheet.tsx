import { useState, useRef } from "react";
import { ChevronUp, Phone, MessageCircle, MapPin, AlertTriangle, Shield, Users, Clock, X } from "lucide-react";

interface BottomSheetProps {
  isAlertActive: boolean;
}

const contacts = [
  { id: "1", name: "Sarah M.", initials: "SM", relation: "Sister", status: "online" as const },
  { id: "2", name: "James K.", initials: "JK", relation: "Partner", status: "online" as const },
  { id: "3", name: "Mom", initials: "MO", relation: "Family", status: "offline" as const },
  { id: "4", name: "Alex R.", initials: "AR", relation: "Friend", status: "online" as const },
];

const alerts = [
  { id: "1", type: "danger" as const, message: "Emergency alert triggered", location: "Downtown, 5th & Main", time: "2 min ago", distance: "0.3 mi" },
  { id: "2", type: "warning" as const, message: "Suspicious activity reported", location: "Park Ave & 12th St", time: "15 min ago", distance: "0.8 mi" },
  { id: "3", type: "safe" as const, message: "Area cleared by community", location: "Central Park East", time: "1 hr ago", distance: "1.2 mi" },
];

const alertColorMap = {
  danger: "text-alert bg-alert/10 border-alert/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  safe: "text-safe bg-safe/10 border-safe/20",
};
const alertIconMap = { danger: AlertTriangle, warning: Shield, safe: Users };

type Tab = "contacts" | "alerts";

const BottomSheet = ({ isAlertActive }: BottomSheetProps) => {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<Tab>("contacts");

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-20" onClick={() => setExpanded(false)} />
      )}

      <div
        className={`absolute left-0 right-0 bottom-0 z-30 transition-all duration-300 ease-out ${
          expanded ? "h-[65vh]" : "h-auto"
        }`}
      >
        <div className="bg-card/95 backdrop-blur-xl border-t border-border rounded-t-2xl h-full flex flex-col shadow-[0_-4px_30px_rgba(0,0,0,0.3)]">
          {/* Handle + Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full pt-2 pb-1 flex flex-col items-center"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
            <div className="flex items-center gap-1 text-muted-foreground">
              <ChevronUp size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
              <span className="text-xs">{expanded ? "Close" : "Contacts & Alerts"}</span>
            </div>
          </button>

          {/* Tabs */}
          <div className="flex gap-1 px-3 py-1">
            <button
              onClick={() => setTab("contacts")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                tab === "contacts" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              Contacts ({contacts.filter(c => c.status === "online").length} online)
            </button>
            <button
              onClick={() => setTab("alerts")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors relative ${
                tab === "alerts" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              Community
              {isAlertActive && <span className="absolute top-1 right-2 w-2 h-2 bg-alert rounded-full animate-pulse" />}
            </button>
          </div>

          {/* Peek preview (always visible) */}
          {!expanded && (
            <div className="px-3 pb-3">
              {tab === "contacts" ? (
                <div className="flex gap-3 overflow-x-auto py-1 scrollbar-hide">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex flex-col items-center gap-1 min-w-[56px]">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                          {c.initials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                          c.status === "online" ? "bg-safe" : "bg-muted-foreground/40"
                        }`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{c.name}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-1 min-w-[56px]">
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <span className="text-lg">+</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Add</span>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${alertColorMap.danger}`}>
                  <AlertTriangle size={14} />
                  <span className="flex-1 font-medium">1 active alert nearby</span>
                  <span className="opacity-60">0.3 mi</span>
                </div>
              )}
            </div>
          )}

          {/* Expanded content */}
          {expanded && (
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {tab === "contacts" ? (
                <div className="space-y-1">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                          {c.initials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                          c.status === "online" ? "bg-safe" : "bg-muted-foreground/40"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.relation}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                          <Phone size={14} />
                        </button>
                        <button className="p-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                          <MessageCircle size={14} />
                        </button>
                        <button className="p-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                          <MapPin size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    + Add Trusted Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} />
                      <span>128 people nearby</span>
                    </div>
                  </div>
                  {alerts.map((a) => {
                    const Icon = alertIconMap[a.type];
                    return (
                      <div key={a.id} className={`p-3 rounded-xl border ${alertColorMap[a.type]}`}>
                        <div className="flex items-start gap-2.5">
                          <Icon size={16} className="mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{a.message}</p>
                            <p className="text-xs opacity-70 mt-0.5">{a.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs opacity-60">
                                <Clock size={10} /> {a.time}
                              </span>
                              <span className="text-xs opacity-60">• {a.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
