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
      {isActive && (
        <>
          <span className="absolute w-20 h-20 rounded-full border-2 border-alert/40 animate-[pulse-ring_2s_ease-out_infinite]" />
          <span className="absolute w-20 h-20 rounded-full border-2 border-alert/30 animate-[pulse-ring_2s_ease-out_0.5s_infinite]" />
        </>
      )}
      <button
        onClick={handlePress}
        className={`
          relative z-10 w-16 h-16 rounded-full font-display font-bold text-sm
          transition-all duration-200 select-none shadow-lg
          ${isActive
            ? "gradient-alert glow-alert text-destructive-foreground scale-105"
            : "bg-alert text-destructive-foreground hover:scale-105"
          }
          ${isPressed ? "scale-90" : ""}
          active:scale-90
        `}
      >
        {isActive ? "STOP" : "SOS"}
      </button>
    </div>
  );
};

export default SOSButton;
