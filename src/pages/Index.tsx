import { useState, useRef, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import MapView, { useLocationTracking } from "@/components/MapView";
import SOSButton from "@/components/SOSButton";
import BottomSheet from "@/components/BottomSheet";
import { toast } from "sonner";
import {
  Shield, Menu, Search, Locate, Layers, Wifi, WifiOff,
  Navigation, Bell, Mic, Video, MicOff, VideoOff
} from "lucide-react";

const Index = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { location, isTracking, connectionStatus, startTracking } = useLocationTracking();

  const toggleVideo = useCallback(async () => {
    if (isRecordingVideo) {
      videoStreamRef.current?.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setIsRecordingVideo(false);
      toast.success("Video recording stopped");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }
      setIsRecordingVideo(true);
      toast.success("📹 Video recording started");
    } catch (err) {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  }, [isRecordingVideo]);

  const toggleAudio = useCallback(async () => {
    if (isRecordingAudio) {
      audioStreamRef.current?.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
      setIsRecordingAudio(false);
      toast.success("Audio recording stopped");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setIsRecordingAudio(true);
      toast.success("🎙️ Audio recording started");
    } catch (err) {
      toast.error("Microphone access denied. Please allow mic permissions.");
    }
  }, [isRecordingAudio]);

  const center = location ? { lat: location.lat, lng: location.lng } : { lat: 40.7128, lng: -74.006 };

  const communityMarkers = [
    { lat: center.lat + 0.003, lng: center.lng + 0.004, type: "safe" as const },
    { lat: center.lat - 0.002, lng: center.lng + 0.006, type: "safe" as const },
    { lat: center.lat + 0.005, lng: center.lng - 0.003, type: "safe" as const },
    { lat: center.lat - 0.004, lng: center.lng - 0.005, type: "warning" as const },
    { lat: center.lat + 0.001, lng: center.lng - 0.007, type: "safe" as const },
  ];

  const handleSOS = () => {
    setIsAlertActive((prev) => !prev);
    if (!isAlertActive) {
      toast.error("🚨 Emergency Alert Triggered!", {
        description: "Notifying contacts & sharing location...",
        duration: 5000,
      });
    } else {
      toast.success("✅ Alert Deactivated", {
        description: "Your contacts have been notified you are safe.",
        duration: 3000,
      });
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative h-[100dvh] w-full flex overflow-hidden">
        <AppSidebar />

        <div className="flex-1 relative h-full">
          {/* Full-screen map */}
          <MapView location={location} communityMarkers={communityMarkers} />

          {/* Top bar — Google Maps style */}
          <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
            <div className="flex items-center gap-2 p-3">
              {/* Menu + Search bar */}
              <div className="flex-1 flex items-center gap-2 bg-card backdrop-blur-xl rounded-full px-1 py-1 shadow-lg border border-border">
                <SidebarTrigger className="p-2.5 rounded-full hover:bg-secondary/60 text-muted-foreground shrink-0">
                  <Menu size={20} />
                </SidebarTrigger>
                <div
                  className="flex-1 flex items-center gap-2 pr-3"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Search size={16} className="text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={(e) => e.stopPropagation()}
                    placeholder="Search places..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                {/* Status indicator */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold mr-1 ${
                  isAlertActive
                    ? "bg-alert/20 text-alert"
                    : "bg-safe/20 text-safe"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAlertActive ? "bg-alert animate-pulse" : "bg-safe"}`} />
                  {isAlertActive ? "ALERT" : "SAFE"}
                </div>
              </div>
            </div>
          </div>

          {/* Right side floating buttons (Google Maps style) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
            {/* Record buttons */}
            <button className="p-2.5 bg-card backdrop-blur-xl rounded-full shadow-lg border border-border text-foreground hover:text-primary transition-colors">
              <Video size={18} />
            </button>
            <button className="p-2.5 bg-card backdrop-blur-xl rounded-full shadow-lg border border-border text-foreground hover:text-primary transition-colors">
              <Mic size={18} />
            </button>

            <div className="h-2" />

            {/* Map controls */}
            <button className="p-2.5 bg-card backdrop-blur-xl rounded-full shadow-lg border border-border text-foreground hover:text-primary transition-colors">
              <Layers size={18} />
            </button>
            <button
              onClick={startTracking}
              className="p-2.5 bg-card backdrop-blur-xl rounded-full shadow-lg border border-border text-primary hover:text-primary/80 transition-colors"
            >
              <Locate size={18} />
            </button>
          </div>

          {/* Connection status chip */}
          <div className="absolute top-16 right-3 z-10">
            <div className="flex items-center gap-1.5 bg-card backdrop-blur-md rounded-full px-2.5 py-1 border border-border shadow">
              {connectionStatus === "connected" ? (
                <Wifi size={11} className="text-safe" />
              ) : (
                <WifiOff size={11} className="text-alert" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {connectionStatus === "connected" ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          {/* SOS Button — floating center bottom above sheet */}
          <div className="absolute bottom-[14.5rem] left-1/2 -translate-x-1/2 z-20">
            <SOSButton onTrigger={handleSOS} isActive={isAlertActive} />
          </div>

          {/* Alert banner when active */}
          {isAlertActive && (
            <div className="absolute top-16 left-3 right-14 z-10">
              <div className="bg-alert/90 backdrop-blur-md text-destructive-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <Bell size={14} className="animate-pulse shrink-0" />
                <p className="text-xs font-medium flex-1">Alert active — sharing location with 4 contacts</p>
              </div>
            </div>
          )}

          {/* Bottom sheet */}
          <BottomSheet isAlertActive={isAlertActive} />

          {/* Location info bar — just above bottom sheet */}
          <div className="absolute bottom-[13.5rem] left-3 z-10">
            <div className="bg-card backdrop-blur-md rounded-xl px-3 py-2 border border-border shadow">
              <div className="flex items-center gap-2">
                <Navigation size={12} className="text-primary" />
                <p className="text-[11px] text-muted-foreground">
                  {location
                    ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : "Locating..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
