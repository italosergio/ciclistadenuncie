import { useState, useRef } from "react";

export default function Logo({ onTripleClick }: { onTripleClick?: () => void }) {
  const [clicks, setClicks] = useState(0);
  const [shake, setShake] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    if (newClicks >= 3) {
      onTripleClick?.();
      setClicks(0);
      return;
    }
    
    timeoutRef.current = setTimeout(() => setClicks(0), 2000);
  };

  return (
    <div 
      className={`w-32 h-32 md:w-16 md:h-16 overflow-hidden cursor-pointer ${shake ? 'animate-shake' : ''}`}
      onClick={handleClick}
    >
      <img src="/logo-ciclistadenuncie.png" alt="Ciclista Denuncie" className="w-full h-full object-cover scale-120" />
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
