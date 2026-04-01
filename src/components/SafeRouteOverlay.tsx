/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { RouteRequest } from "./SafeRoutePanel";

interface SafeRouteOverlayProps {
  routeRequest: RouteRequest | null;
  onRouteReady?: (info: { duration: string; distance: string } | null) => void;
}

const SafeRouteOverlay = ({ routeRequest, onRouteReady }: SafeRouteOverlayProps) => {
  const map = useMap();
  const safePolyline = useRef<any>(null);
  const dangerCircles = useRef<any[]>([]);
  const destMarker = useRef<any>(null);
  const directionsService = useRef<any>(null);

  const cleanup = () => {
    safePolyline.current?.setMap(null);
    safePolyline.current = null;
    dangerCircles.current.forEach((c: any) => c.setMap(null));
    dangerCircles.current = [];
    destMarker.current?.setMap(null);
    destMarker.current = null;
  };

  useEffect(() => {
    const g = (window as any).google;
    if (!map || !g?.maps) return;
    directionsService.current = new g.maps.DirectionsService();
  }, [map]);

  useEffect(() => {
    const g = (window as any).google;
    if (!map || !directionsService.current || !g?.maps) {
      if (!routeRequest) cleanup();
      return;
    }

    if (!routeRequest) {
      cleanup();
      onRouteReady?.(null);
      return;
    }

    const { origin, destination, avoidZones } = routeRequest;
    const gmaps = g.maps;

    // Generate waypoints that steer route away from danger zones
    const waypoints: any[] = [];

    if (avoidZones.length > 0) {
      const midLat = (origin.lat + destination.lat) / 2;
      const midLng = (origin.lng + destination.lng) / 2;

      let repLat = 0;
      let repLng = 0;
      let totalWeight = 0;

      avoidZones.forEach((zone) => {
        const dLat = midLat - zone.lat;
        const dLng = midLng - zone.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.05) {
          const force = (zone.weight * (0.05 - dist)) / Math.max(dist, 0.001);
          repLat += dLat * force;
          repLng += dLng * force;
          totalWeight += zone.weight;
        }
      });

      if (totalWeight > 0) {
        const scale = 0.003;
        const normDist = Math.sqrt(repLat * repLat + repLng * repLng) || 1;
        waypoints.push({
          location: new gmaps.LatLng(
            midLat + (repLat / normDist) * scale,
            midLng + (repLng / normDist) * scale
          ),
          stopover: false,
        });
      }
    }

    directionsService.current.route(
      {
        origin: new gmaps.LatLng(origin.lat, origin.lng),
        destination: new gmaps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: gmaps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      },
      (result: any, status: string) => {
        cleanup();

        if (status !== "OK" || !result?.routes?.[0]) {
          onRouteReady?.(null);
          return;
        }

        const route = result.routes[0];
        const path = route.overview_path;

        safePolyline.current = new gmaps.Polyline({
          path,
          strokeColor: "#22c55e",
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map,
          zIndex: 10,
        });

        avoidZones.forEach((zone) => {
          const circle = new gmaps.Circle({
            center: { lat: zone.lat, lng: zone.lng },
            radius: zone.weight === 1 ? 200 : 120,
            fillColor: zone.weight === 1 ? "#ef4444" : "#f59e0b",
            fillOpacity: 0.15,
            strokeColor: zone.weight === 1 ? "#ef4444" : "#f59e0b",
            strokeOpacity: 0.4,
            strokeWeight: 1,
            map,
            zIndex: 5,
          });
          dangerCircles.current.push(circle);
        });

        destMarker.current = new gmaps.Marker({
          position: { lat: destination.lat, lng: destination.lng },
          map,
          icon: {
            path: gmaps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#6366f1",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: destination.name,
          zIndex: 15,
        });

        const bounds = new gmaps.LatLngBounds();
        path.forEach((p: any) => bounds.extend(p));
        map.fitBounds(bounds, { top: 80, bottom: 280, left: 20, right: 20 });

        const leg = route.legs[0];
        onRouteReady?.({
          duration: leg?.duration?.text || "",
          distance: leg?.distance?.text || "",
        });
      }
    );

    return cleanup;
  }, [map, routeRequest]);

  return null;
};

export default SafeRouteOverlay;
