import { Bike } from "lucide-react";

const names = ["MARINA", "RAUL", "RENATA", "DANIEL", "NEO", "ADEYLLE", "NAVE", "MAIK", "TARTA", "MAYRA", "VIQUE", "HEBLISA", "MILLENA", "CAROLINA", "JAQUELINE", "JANAINA", "SUJEIRA", "LIMPEZA", "NELSON", "FERNANDO", "ITALO", "DJ PRÉ", "ALDENIO", "ZERBINATO", "FALZONI", "LIGIA", "VIOLA", "DAMIAO", "JADSON", "JAIDIU", "DIEGO", "NINA"];
const whiteBikes = ["MARINA", "RAUL", "SUJEIRA", "NELSON", "LIMPEZA"];

export default function BikeFireAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(32)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bike-ride"
          style={{
            top: `${1 + i * 2.9}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 3}s`,
          }}
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">{names[i]}</span>
            <Bike className={`w-8 h-8 ${whiteBikes.includes(names[i]) ? 'text-white' : 'text-red-500'}`} />
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
          animation: bike-ride linear infinite;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
