import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, X, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ThreatDetectorProps {
  location: { lat: number; lng: number } | null;
}

interface ThreatAlert {
  id: string;
  message: string;
  type: string;
  distance: number;
  location_name: string | null;
}

const ThreatDetector = ({ location }: ThreatDetectorProps) => {
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const checkThreats = useCallback(async () => {
    if (!location) return;

    const { data } = await supabase
      .from("community_alerts")
      .select("id, type, message, latitude, longitude, location_name, created_at")
      .eq("is_active", true)
      .in("type", ["danger", "warning"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data) return;

    const now = Date.now();
    const nearby = data
      .filter((a) => {
        const age = now - new Date(a.created_at).getTime();
        if (age > 6 * 60 * 60 * 1000) return false; // 6h max
        const dist = Math.sqrt(
          Math.pow((a.latitude - location.lat) * 111, 2) +
          Math.pow((a.longitude - location.lng) * 111 * Math.cos(location.lat * Math.PI / 180), 2)
        );
        return dist < 0.5; // Within 500m
      })
      .map((a) => ({
        id: a.id,
        message: a.message,
        type: a.type,
        distance: Math.sqrt(
          Math.pow((a.latitude - location.lat) * 111, 2) +
          Math.pow((a.longitude - location.lng) * 111 * Math.cos(location.lat * Math.PI / 180), 2)
        ),
        location_name: a.location_name,
      }))
      .filter((a) => !dismissed.has(a.id));

    setThreats(nearby);
  }, [location, dismissed]);

  useEffect(() => {
    checkThreats();
    const interval = setInterval(checkThreats, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [checkThreats]);

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    setThreats((prev) => prev.filter((t) => t.id !== id));
  };

  if (threats.length === 0) return null;

  return (
    <div className="absolute top-16 left-3 right-14 z-20 space-y-2">
      {threats.slice(0, 2).map((threat) => (
        <div
          key={threat.id}
          className={`backdrop-blur-md rounded-xl shadow-lg border px-4 py-3 flex items-start gap-3 ${
            threat.type === "danger"
              ? "bg-alert/90 border-alert/50"
              : "bg-warning/90 border-warning/50"
          }`}
        >
          <AlertTriangle size={16} className="text-white shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">{threat.message}</p>
            <p className="text-[10px] text-white/70 mt-0.5">
              {(threat.distance * 1000).toFixed(0)}m away
              {threat.location_name ? ` • ${threat.location_name}` : ""}
            </p>
            <button
              onClick={() => navigate("/ai-assistant")}
              className="mt-1.5 flex items-center gap-1 text-[10px] text-white/90 font-semibold bg-white/20 rounded-full px-2 py-0.5"
            >
              <Shield size={10} /> Ask AI for help
            </button>
          </div>
          <button onClick={() => dismiss(threat.id)} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ThreatDetector;
