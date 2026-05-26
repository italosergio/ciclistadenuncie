import { useState, useEffect, useMemo, memo } from "react";
import { Bike } from "lucide-react";
import { bikeFireNames as names, whiteBikeNames as whiteBikes } from "~/data/bike-fire-names";

/** Pares de pessoas que pedalam juntas (mesma velocidade, lado a lado) */
const pairRiders: string[][] = [["STELLA", "OLGA"]];

export default memo(function BikeFireAnimation() {
  const [wave, setWave] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setWave(w => w + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  // Pré-computa propriedades de animação para cada nome,
  // garantindo que pares tenham mesma velocidade e delay
  const animProps = useMemo(() => {
    const props = new Map<string, { delay: number; duration: number; top: number }>();
    const used = new Set<string>();

    const randDelay = () => Math.random() * 2;
    const randDuration = () => 5 + Math.random() * 8;

    names.forEach((name, i) => {
      if (used.has(name)) return;

      const pair = pairRiders.find(p => p.includes(name));
      if (pair) {
        // Par — mesmo delay e duração, top sequencial
        const delay = randDelay();
        const duration = randDuration();
        pair.forEach((p, pIdx) => {
          const topPct = i + pIdx * 1; // ocupa slots consecutivos
          props.set(p, { delay, duration, top: topPct * 2.9 });
          used.add(p);
        });
      } else {
        props.set(name, { delay: randDelay(), duration: randDuration(), top: i * 2.9 });
        used.add(name);
      }
    });

    return props;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
      {names.map((name, i) => {
        const p = animProps.get(name)!;
        return (
          <div
            key={`${wave}-${i}`}
            className="absolute animate-bike-ride"
            style={{
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">{name}</span>
              <Bike className={`w-8 h-8 ${whiteBikes.includes(name) ? 'text-white' : 'text-red-500'}`} />
            </div>
          </div>
        );
      })}
      
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
