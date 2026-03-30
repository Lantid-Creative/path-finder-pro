import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, Shield, Users, MapPin, Clock,
  Plus, Send, X, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: string;
  message: string;
  description: string | null;
  latitude: number;
  longitude: number;
  location_name: string | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string } | null;
}

const alertStyles: Record<string, string> = {
  danger: "border-alert/30 bg-alert/10",
  warning: "border-warning/30 bg-warning/10",
  safe: "border-safe/30 bg-safe/10",
  info: "border-primary/30 bg-primary/10",
};

const alertTextStyles: Record<string, string> = {
  danger: "text-alert",
  warning: "text-warning",
  safe: "text-safe",
  info: "text-primary",
};

const alertIcons: Record<string, typeof AlertTriangle> = {
  danger: AlertTriangle,
  warning: Shield,
  safe: Users,
  info: MapPin,
};

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>("warning");
  const [formMessage, setFormMessage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setFormLat(lat);
      setFormLng(lng);

      // Reverse geocode using Google Maps Geocoding
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });
        if (result.results?.[0]) {
          // Try to find a meaningful name (locality, neighborhood, or formatted address)
          const components = result.results[0].address_components;
          const neighborhood = components?.find(c => c.types.includes("neighborhood"))?.long_name;
          const locality = components?.find(c => c.types.includes("locality"))?.long_name;
          const sublocality = components?.find(c => c.types.includes("sublocality"))?.long_name;
          const route = components?.find(c => c.types.includes("route"))?.long_name;
          const locationName = neighborhood || sublocality || (route ? `${route}, ${locality || ""}`.trim() : locality) || result.results[0].formatted_address;
          setFormLocation(locationName || "");
        }
      } catch {
        // Fallback: use coordinates as location name
        setFormLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      toast.error("Could not detect your location. Please enable location services.");
    }
    setDetectingLocation(false);
  };

  // Auto-detect location when form opens
  useEffect(() => {
    if (showForm && !formLat) {
      detectLocation();
    }
  }, [showForm]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("community-alerts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_alerts" }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("community_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      const userIds = [...new Set(data.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      setAlerts(data.map(a => ({ ...a, profiles: { display_name: profileMap.get(a.user_id) || "Anonymous" } })));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formLocation.trim()) return;
    setSubmitting(true);

    const lat = formLat || 0;
    const lng = formLng || 0;

    const { error } = await supabase.from("community_alerts").insert({
      user_id: user.id,
      type: formType,
      message: formMessage.trim(),
      description: formDescription.trim() || null,
      latitude: lat,
      longitude: lng,
      location_name: formLocation.trim(),
    });

    if (error) {
      toast.error("Failed to post alert");
    } else {
      toast.success("Alert posted!");
      setShowForm(false);
      setFormMessage("");
      setFormDescription("");
      setFormLocation("");
      setFormLat(null);
      setFormLng(null);
    }
    setSubmitting(false);
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="min-h-[100dvh] pb-16 bg-background flex flex-col">
      {/* Header */}
      <div className="safe-area-top bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-foreground">Community</h1>
          <p className="text-xs text-muted-foreground">{alerts.length} alerts nearby</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="p-2 bg-primary/15 text-primary rounded-xl hover:bg-primary/25 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Users size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No alerts yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Be the first to report something</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = alertIcons[alert.type] || MapPin;
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${alertStyles[alert.type] || "border-border bg-card"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${alertTextStyles[alert.type] || "text-foreground"}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${alertTextStyles[alert.type] || "text-foreground"}`}>
                      {alert.message}
                    </p>
                    {alert.description && (
                      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {alert.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {alert.location_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(alert.created_at)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      by {(alert as any).profiles?.display_name || "Anonymous"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New alert modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-card rounded-t-2xl border-t border-border p-5 safe-area-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">Report Alert</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Type selector */}
              <div className="flex gap-2">
                {(["danger", "warning", "safe", "info"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormType(t)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                      formType === t
                        ? `${alertStyles[t]} ${alertTextStyles[t]} border-current`
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                placeholder="What's happening?"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                required
                maxLength={200}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                placeholder="Location name (optional)"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                maxLength={100}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                placeholder="Additional details (optional)"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />

              <button
                type="submit"
                disabled={submitting || !formMessage.trim()}
                className="w-full gradient-safe text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                Post Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
