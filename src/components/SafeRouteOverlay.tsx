import { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { RouteRequest } from "./SafeRoutePanel";

interface SafeRouteOverlayProps {
  routeRequest: RouteRequest | null;
  onRouteReady?: (info: { duration: string; distance: string } | null) => void;
}

const SafeRouteOverlay = ({ routeRequest, onRouteReady }: SafeRouteOverlayProps) => {
  const map = useMap();
  const safePolyline = useRef<google.maps.Polyline | null>(null);
  const dangerCircles = useRef<google.maps.Circle[]>([]);
  const destMarker = useRef<google.maps.Marker | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  // Clean up all overlays
  const cleanup = () => {
    safePolyline.current?.setMap(null);
    safePolyline.current = null;
    dangerCircles.current.forEach((c) => c.setMap(null));
    dangerCircles.current = [];
    destMarker.current?.setMap(null);
    destMarker.current = null;
  };

  useEffect(() => {
    if (!map || !window.google?.maps) return;
    directionsService.current = new google.maps.DirectionsService();
  }, [map]);

  useEffect(() => {
    if (!map || !directionsService.current) {
      cleanup();
      return;
    }

    if (!routeRequest) {
      cleanup();
      onRouteReady?.(null);
      return;
    }

    const { origin, destination, avoidZones } = routeRequest;

    // Generate waypoints that steer the route away from danger zones
    // We find the midpoint and push it away from nearby danger zones
    const waypoints: google.maps.DirectionsWaypoint[] = [];

    if (avoidZones.length > 0) {
      const midLat = (origin.lat + destination.lat) / 2;
      const midLng = (origin.lng + destination.lng) / 2;

      // Calculate repulsion vector from danger zones
      let repLat = 0;
      let repLng = 0;
      let totalWeight = 0;

      avoidZones.forEach((zone) => {
        const dLat = midLat - zone.lat;
        const dLng = midLng - zone.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.05) {
          // ~5km influence radius
          const force = (zone.weight * (0.05 - dist)) / Math.max(dist, 0.001);
          repLat += dLat * force;
          repLng += dLng * force;
          totalWeight += zone.weight;
        }
      });

      if (totalWeight > 0) {
        const scale = 0.003; // Offset magnitude
        const normDist = Math.sqrt(repLat * repLat + repLng * repLng) || 1;
        waypoints.push({
          location: new google.maps.LatLng(
            midLat + (repLat / normDist) * scale,
            midLng + (repLng / normDist) * scale
          ),
          stopover: false,
        });
      }
    }

    directionsService.current.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        cleanup();

        if (status !== "OK" || !result?.routes?.[0]) {
          onRouteReady?.(null);
          return;
        }

        const route = result.routes[0];
        const path = route.overview_path;

        // Draw the safe route polyline
        safePolyline.current = new google.maps.Polyline({
          path,
          strokeColor: "#22c55e",
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map,
          zIndex: 10,
        });

        // Draw danger zone circles on the map
        avoidZones.forEach((zone) => {
          const circle = new google.maps.Circle({
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

        // Destination marker
        destMarker.current = new google.maps.Marker({
          position: { lat: destination.lat, lng: destination.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#6366f1",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: destination.name,
          zIndex: 15,
        });

        // Fit bounds to show full route
        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, { top: 80, bottom: 280, left: 20, right: 20 });

        // Report route info
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
