import { useLocation, useNavigate } from "react-router-dom";
import { Map, Users, MessageCircle, Bell } from "lucide-react";

const tabs = [
  { label: "Map", path: "/", icon: Map },
  { label: "Community", path: "/community", icon: Users },
  { label: "Chat", path: "/chat", icon: MessageCircle },
  { label: "Alerts", path: "/alerts", icon: Bell },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-stretch h-14">
        {tabs.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
