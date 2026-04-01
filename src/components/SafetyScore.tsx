import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SafetyScoreProps {
  location: { lat: number; lng: number } | null;
}

type SafetyLevel = "safe" | "moderate" | "caution" | "danger";

interface SafetyData {
  score: number;
  level: SafetyLevel;
  label: string;
  alertCount: number;
  dangerCount: number;
}

const levelConfig: Record<SafetyLevel, { color: string; bg: string; border: string }> = {
  safe: { color: "text-safe", bg: "bg-safe/15", border: "border-safe/30" },
  moderate: { color: "text-primary", bg: "bg-primary/15", border: "border-primary/30" },
  caution: { color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
  danger: { color: "text-alert", bg: "bg-alert/15", border: "border-alert/30" },
};

function computeSafety(alerts: any[], location: { lat: number; lng: number }): SafetyData {
  // Filter alerts from last 24h within ~2km radius
  const now = Date.now();
  const recent = alerts.filter((a) => {
    const age = now - new Date(a.created_at).getTime();
    if (age > 24 * 60 * 60 * 1000) return false;
    const dist = Math.sqrt(
      Math.pow((a.latitude - location.lat) * 111, 2) +
      Math.pow((a.longitude - location.lng) * 111 * Math.cos(location.lat * Math.PI / 180), 2)
    );
    return dist < 2;
  });

  const dangerCount = recent.filter((a) => a.type === "danger").length;
  const warningCount = recent.filter((a) => a.type === "warning").length;

  // Score: 100 = safest, 0 = most dangerous
  let score = 100 - dangerCount * 25 - warningCount * 10;
  score = Math.max(0, Math.min(100, score));

  let level: SafetyLevel = "safe";
  let label = "Area looks safe";
  if (score < 30) { level = "danger"; label = "High risk area"; }
  else if (score < 55) { level = "caution"; label = "Exercise caution"; }
  else if (score < 80) { level = "moderate"; label = "Moderate safety"; }

  return { score, level, label, alertCount: recent.length, dangerCount };
}

const SafetyScore = ({ location }: SafetyScoreProps) => {
  const [safety, setSafety] = useState<SafetyData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!location) return;

    const fetchAndCompute = async () => {
      const { data } = await supabase
        .from("community_alerts")
        .select("type, latitude, longitude, created_at")
        .eq("is_active", true)
        .limit(100);

      if (data) setSafety(computeSafety(data, location));
    };

    fetchAndCompute();
    const interval = setInterval(fetchAndCompute, 30000);
    return () => clearInterval(interval);
  }, [location]);

  if (!safety) return null;

  const config = levelConfig[safety.level];

  return (
    <button
      onClick={() => navigate("/ai-assistant")}
      className={`flex items-center gap-2 ${config.bg} ${config.border} border rounded-xl px-3 py-2 shadow-lg backdrop-blur-md transition-colors hover:opacity-90`}
    >
      <div className={`${config.color}`}>
        {safety.level === "safe" || safety.level === "moderate" ? (
          <Shield size={16} />
        ) : (
          <AlertTriangle size={16} />
        )}
      </div>
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${config.color}`}>{safety.score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
        <p className={`text-[10px] ${config.color} font-medium`}>{safety.label}</p>
      </div>
      <ChevronRight size={12} className="text-muted-foreground ml-1" />
    </button>
  );
};

export default SafetyScore;
