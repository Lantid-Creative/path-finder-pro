import { useState } from "react";
import StatusBar from "@/components/StatusBar";
import SOSButton from "@/components/SOSButton";
import MapView from "@/components/MapView";
import TrustedContacts from "@/components/TrustedContacts";
import CommunityAlerts from "@/components/CommunityAlerts";
import QuickFeatures from "@/components/QuickFeatures";
import { toast } from "sonner";

const Index = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);

  const handleSOS = () => {
    setIsAlertActive((prev) => !prev);
    if (!isAlertActive) {
      toast.error("🚨 Emergency Alert Triggered!", {
        description: "Notifying trusted contacts and sharing location...",
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
    <div className="min-h-screen bg-background flex flex-col">
      <StatusBar isAlertActive={isAlertActive} />

      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 h-full">
          {/* Left sidebar */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <TrustedContacts />
            <QuickFeatures />
          </div>

          {/* Center - Map + SOS */}
          <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
            <div className="relative">
              <MapView />

              {/* SOS overlay on map */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <SOSButton onTrigger={handleSOS} isActive={isAlertActive} />
              </div>
            </div>

            {/* Status message */}
            <div className={`text-center py-3 px-4 rounded-xl border transition-all ${
              isAlertActive
                ? "bg-alert/10 border-alert/30 text-alert"
                : "bg-safe/10 border-safe/30 text-safe"
            }`}>
              <p className="text-sm font-medium">
                {isAlertActive
                  ? "🚨 Alert active — sharing location with 4 contacts"
                  : "You're safe. Tap SOS if you need help."}
              </p>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-3 space-y-4 order-3">
            <CommunityAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
