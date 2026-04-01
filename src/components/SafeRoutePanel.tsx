import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Route, X, Navigation, MapPin, Shield, Loader2 } from "lucide-react";

export interface RouteRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number; name: string };
  avoidZones: { lat: number; lng: number; weight: number }[];
}

interface SafeRoutePanelProps {
  location: { lat: number; lng: number } | null;
  onRouteRequest: (req: RouteRequest | null) => void;
  isRouteActive: boolean;
}

const SafeRoutePanel = ({ location, onRouteRequest, isRouteActive }: SafeRoutePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const div = document.createElement("div");
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, [isOpen]);

  const searchPlaces = (input: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!input.trim() || !autocompleteService.current) {
      setPredictions([]);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      const request: google.maps.places.AutocompletionRequest = {
        input,
        ...(location && {
          locationBias: new google.maps.Circle({
            center: location,
            radius: 10000,
          }),
        }),
      };
      autocompleteService.current!.getPlacePredictions(request, (results) => {
        setPredictions(results || []);
      });
    }, 300);
  };

  const selectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current || !location) return;
    setIsLoading(true);
    setDestination(prediction.structured_formatting.main_text);
    setPredictions([]);

    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ["geometry", "name"] },
      async (place) => {
        if (!place?.geometry?.location) {
          setIsLoading(false);
          return;
        }

        const destLat = place.geometry.location.lat();
        const destLng = place.geometry.location.lng();

        // Fetch nearby community alerts to build avoidance zones
        const { data: alerts } = await supabase
          .from("community_alerts")
          .select("latitude, longitude, type")
          .eq("is_active", true)
          .in("type", ["danger", "warning"]);

        const avoidZones = (alerts || []).map((a) => ({
          lat: a.latitude,
          lng: a.longitude,
          weight: a.type === "danger" ? 1.0 : 0.5,
        }));

        onRouteRequest({
          origin: location,
          destination: { lat: destLat, lng: destLng, name: place.name || prediction.structured_formatting.main_text },
          avoidZones,
        });

        setIsLoading(false);
      }
    );
  };

  const cancelRoute = () => {
    onRouteRequest(null);
    setDestination("");
    setIsOpen(false);
  };

  if (!isOpen && !isRouteActive) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-[14.5rem] right-3 z-20 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2.5 shadow-lg text-xs font-semibold"
      >
        <Route size={16} />
        Safe Route
      </button>
    );
  }

  if (isRouteActive) {
    return (
      <div className="absolute bottom-[14.5rem] left-3 right-3 z-20">
        <div className="bg-card backdrop-blur-xl rounded-xl border border-border shadow-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-safe" />
              <div>
                <p className="text-xs font-bold text-foreground">Safe Route Active</p>
                <p className="text-[10px] text-muted-foreground">Avoiding {destination || "reported areas"}</p>
              </div>
            </div>
            <button
              onClick={cancelRoute}
              className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-[14.5rem] left-3 right-3 z-20">
      <div className="bg-card backdrop-blur-xl rounded-xl border border-border shadow-lg overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Route size={16} className="text-primary" />
              <p className="text-xs font-bold text-foreground">Find Safe Route</p>
            </div>
            <button
              onClick={() => { setIsOpen(false); setDestination(""); setPredictions([]); }}
              className="p-1 rounded-full hover:bg-secondary text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>

          {/* Origin */}
          <div className="flex items-center gap-2 mb-2">
            <Navigation size={12} className="text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground truncate">
              {location ? "Your location" : "Locating..."}
            </p>
          </div>

          {/* Destination input */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <MapPin size={12} className="text-alert shrink-0" />
            <input
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                searchPlaces(e.target.value);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              placeholder="Where to?"
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            {isLoading && <Loader2 size={12} className="text-primary animate-spin" />}
          </div>
        </div>

        {/* Predictions list */}
        {predictions.length > 0 && (
          <div className="border-t border-border max-h-40 overflow-y-auto">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                onClick={() => selectPlace(p)}
                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
              >
                <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.structured_formatting.main_text}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.structured_formatting.secondary_text}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeRoutePanel;
