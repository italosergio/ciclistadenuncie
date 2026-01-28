import { useState } from "react";

export default function Logo({ onTripleClick }: { onTripleClick?: () => void }) {
  const [clicks, setClicks] = useState(0);
  const [shake, setShake] = useState(false);

  const handleClick = () => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    if (newClicks === 3) {
      onTripleClick?.();
      setClicks(0);
    }
    
    setTimeout(() => setClicks(0), 1000);
  };

  return (
    <div 
      className={`w-32 h-32 md:w-20 md:h-20 overflow-hidden cursor-pointer ${shake ? 'animate-shake' : ''}`}
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
