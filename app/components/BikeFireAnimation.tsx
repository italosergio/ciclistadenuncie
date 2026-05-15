import { useState, useEffect, memo } from "react";
import { Bike } from "lucide-react";

const names = ["MARINA", "RAUL", "RENATA", "DANIEL", "NEO", "ADEYLLE", "NAVE", "MAIK", "TARTA", "MAYRA", "VIQUE", "HEBLISA", "MILLENA", "CAROLINA", "JAQUELINE", "JANAINA", "SUJEIRA", "LIMPEZA", "NELSON", "FERNANDO", "ITALO", "DJ PRÉ", "ALDENIO", "ZERBINATO", "FALZONI", "LIGIA", "VIOLA", "DAMIAO", "JADSON", "JAIDIU", "DIEGO", "NINA"];
const whiteBikes = ["MARINA", "RAUL", "SUJEIRA", "NELSON", "LIMPEZA"];

export default memo(function BikeFireAnimation() {
  const [wave, setWave] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setWave(w => w + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
      {names.map((name, i) => (
        <div
          key={`${wave}-${i}`}
          className="absolute animate-bike-ride"
          style={{
            top: `${i * 2.9}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${5 + Math.random() * 8}s`,
          }}
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">{name}</span>
            <Bike className={`w-8 h-8 ${whiteBikes.includes(name) ? 'text-white' : 'text-red-500'}`} />
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes bike-ride {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px));
            opacity: 0;
          }
        }
        
        .animate-bike-ride {
          animation: bike-ride linear forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
});
