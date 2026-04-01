import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";

const NotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    setDismissed(localStorage.getItem("notif-prompt-dismissed") === "true");
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "default") setDismissed(true);
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("notif-prompt-dismissed", "true");
  };

  if (dismissed || permission === "granted" || !("Notification" in window)) return null;

  return (
    <div className="absolute top-4 left-3 right-14 z-30 backdrop-blur-md bg-primary/90 border border-primary/50 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
      <Bell size={18} className="text-primary-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-primary-foreground">Enable Safety Notifications</p>
        <p className="text-[10px] text-primary-foreground/70">Get alerted when you enter unsafe zones, even in the background.</p>
      </div>
      <button
        onClick={requestPermission}
        className="text-[10px] font-semibold bg-primary-foreground/20 text-primary-foreground rounded-full px-3 py-1 shrink-0"
      >
        Enable
      </button>
      <button onClick={dismiss} className="text-primary-foreground/60 hover:text-primary-foreground shrink-0">
        <X size={14} />
      </button>
    </div>
  );
};

export default NotificationPermission;
