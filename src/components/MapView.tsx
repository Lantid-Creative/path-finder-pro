import { useState, useEffect, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Wifi, WifiOff, Locate } from "lucide-react";

const GOOGLE_MAPS_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 }; // NYC fallback

function LocationTracker({ location }: { location: LocationState | null }) {
  const map = useMap();

  useEffect(() => {
    if (map && location) {
      map.panTo({ lat: location.lat, lng: location.lng });
    }
  }, [map, location]);

  return null;
}

const MapView = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "offline">("connected");
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setIsTracking(true);
        setConnectionStatus("connected");
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setConnectionStatus("offline");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
  }, []);

  useEffect(() => {
    // Get initial position
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setIsTracking(true);
      },
      () => {
        // Use default location if denied
        setLocation({ ...DEFAULT_LOCATION, accuracy: 0, timestamp: Date.now() });
      },
      { enableHighAccuracy: true }
    );

    startTracking();

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const recenter = () => {
    if (location) {
      startTracking();
    }
  };

  const center = location ? { lat: location.lat, lng: location.lng } : DEFAULT_LOCATION;

  // Sample nearby community markers
  const communityMarkers = [
    { lat: center.lat + 0.003, lng: center.lng + 0.004, type: "safe" as const },
    { lat: center.lat - 0.002, lng: center.lng + 0.006, type: "safe" as const },
    { lat: center.lat + 0.005, lng: center.lng - 0.003, type: "safe" as const },
    { lat: center.lat - 0.004, lng: center.lng - 0.005, type: "warning" as const },
    { lat: center.lat + 0.001, lng: center.lng - 0.007, type: "safe" as const },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border">
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI
          mapId="pathly-dark-map"
          colorScheme="DARK"
          style={{ width: "100%", height: "100%", minHeight: "400px" }}
        >
          <LocationTracker location={location} />

          {/* User location */}
          {location && (
            <AdvancedMarker position={{ lat: location.lat, lng: location.lng }}>
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary-foreground glow-safe" />
                <div className="absolute w-10 h-10 rounded-full bg-primary/20 animate-ping" />
                {location.accuracy > 0 && (
                  <div
                    className="absolute rounded-full bg-primary/10 border border-primary/20"
                    style={{
                      width: `${Math.min(location.accuracy * 2, 100)}px`,
                      height: `${Math.min(location.accuracy * 2, 100)}px`,
                    }}
                  />
                )}
              </div>
            </AdvancedMarker>
          )}

          {/* Community markers */}
          {communityMarkers.map((m, i) => (
            <AdvancedMarker key={i} position={{ lat: m.lat, lng: m.lng }}>
              <div
                className={`w-3 h-3 rounded-full border border-background/50 ${
                  m.type === "safe" ? "bg-safe/70" : "bg-warning/70"
                }`}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Top status bar overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/50">
          <Navigation size={12} className="text-primary" />
          <span className="text-xs font-medium text-foreground">
            {isTracking ? "Live Tracking" : "Locating..."}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/50">
          {connectionStatus === "connected" ? (
            <Wifi size={12} className="text-safe" />
          ) : (
            <WifiOff size={12} className="text-alert" />
          )}
          <span className="text-xs text-muted-foreground">
            {connectionStatus === "connected" ? "Connected" : "Offline"}
          </span>
        </div>
      </div>

      {/* Recenter button */}
      <button
        onClick={recenter}
        className="absolute bottom-3 right-3 p-2.5 bg-card/80 backdrop-blur-md rounded-lg border border-border/50 text-muted-foreground hover:text-primary transition-colors pointer-events-auto"
      >
        <Locate size={18} />
      </button>

      {/* Location label */}
      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <div>
            <p className="text-xs font-medium text-foreground">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Locating..."}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {location
                ? `Accuracy: ${location.accuracy.toFixed(0)}m • Updated ${Math.round((Date.now() - location.timestamp) / 1000)}s ago`
                : "Waiting for GPS..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
