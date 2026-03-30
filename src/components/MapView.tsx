import { useState, useEffect, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

export interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 };

function LocationTracker({ location }: { location: LocationState | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && location) map.panTo({ lat: location.lat, lng: location.lng });
  }, [map, location]);
  return null;
}

interface MapViewProps {
  location: LocationState | null;
  communityMarkers: { lat: number; lng: number; type: "safe" | "warning" }[];
}

const MapView = ({ location, communityMarkers }: MapViewProps) => {
  const center = location ? { lat: location.lat, lng: location.lng } : DEFAULT_LOCATION;

  return (
    <div className="absolute inset-0">
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={16}
          gestureHandling="greedy"
          disableDefaultUI
          mapId="pathly-dark-map"
          colorScheme="DARK"
          style={{ width: "100%", height: "100%" }}
        >
          <LocationTracker location={location} />

          {location && (
            <AdvancedMarker position={{ lat: location.lat, lng: location.lng }}>
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-primary border-[3px] border-primary-foreground glow-safe" />
                <div className="absolute w-10 h-10 rounded-full bg-primary/20 animate-ping" />
              </div>
            </AdvancedMarker>
          )}

          {communityMarkers.map((m, i) => (
            <AdvancedMarker key={i} position={{ lat: m.lat, lng: m.lng }}>
              <div
                className={`w-3 h-3 rounded-full border-2 border-background/60 ${
                  m.type === "safe" ? "bg-safe/80" : "bg-warning/80"
                }`}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapView;

export function useLocationTracking() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "offline">("connected");

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition(
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
      () => setConnectionStatus("offline"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
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
      () => setLocation({ ...DEFAULT_LOCATION, accuracy: 0, timestamp: Date.now() }),
      { enableHighAccuracy: true }
    );
    startTracking();
  }, [startTracking]);

  return { location, isTracking, connectionStatus, startTracking };
}
