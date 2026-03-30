import { useState } from "react";

interface SOSButtonProps {
  onTrigger: () => void;
  isActive: boolean;
}

const SOSButton = ({ onTrigger, isActive }: SOSButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    onTrigger();
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings */}
      {isActive && (
        <>
          <span className="absolute w-32 h-32 rounded-full border-2 border-alert/40 animate-[pulse-ring_2s_ease-out_infinite]" />
          <span className="absolute w-32 h-32 rounded-full border-2 border-alert/30 animate-[pulse-ring_2s_ease-out_0.5s_infinite]" />
          <span className="absolute w-32 h-32 rounded-full border-2 border-alert/20 animate-[pulse-ring_2s_ease-out_1s_infinite]" />
        </>
      )}

      {/* Main button */}
      <button
        onClick={handlePress}
        className={`
          relative z-10 w-28 h-28 rounded-full font-display font-bold text-xl
          transition-all duration-200 select-none
          ${isActive
            ? "gradient-alert glow-alert text-destructive-foreground scale-105"
            : "bg-alert/20 text-alert border-2 border-alert/50 hover:bg-alert/30 hover:scale-105"
          }
          ${isPressed ? "scale-95" : ""}
          active:scale-95
        `}
      >
        {isActive ? "ACTIVE" : "SOS"}
      </button>
    </div>
  );
};

export default SOSButton;
