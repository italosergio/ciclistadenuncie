import { useState, useEffect, useMemo, memo, useRef } from "react";
import { Bike } from "lucide-react";
import { bikeFireNames as names, whiteBikeNames as whiteBikes } from "~/data/bike-fire-names";

/** Pares de pessoas que pedalam juntas (mesma velocidade, delay e posição) */
const pairRiders: string[][] = [
  ["STELLA", "OLGA", "ANDERSON", "OTTO"],
  ["DANIEL", "LIGIA", "VIOLETA", "CAMILO"],
  ["JOÃO PAULO", "LÍVIA", "JOAQUIM", "EMMANUEL"],
  ["CÍNTIA", "CAÍQUE", "CAUÊ"],
  ["SARA", "JOJÔ"],
  ["BRUNO", "JULIA", "DANIELZINHO"],
];

export default memo(function BikeFireAnimation({ paused }: { paused: boolean }) {
  const [wave, setWave] = useState(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Intervalo sempre roda, mas pula o wave increment quando pausado
  // Evita race condition de limpar/recriar o setInterval
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setWave(w => w + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Pré-computa propriedades para cada nome:
  //   - distribuição uniforme na altura da tela (2%-85%)
  //   - direções alternadas (ida e volta, simulando mão dupla)
  //   - pares mantêm mesma velocidade e delay
  const animProps = useMemo(() => {
    const props = new Map<string, { delay: number; duration: number; top: number; reverse: boolean }>();
    const used = new Set<string>();

    // Conta slots: cada par ocupa 1 slot, cada nome sem par ocupa 1 slot
    const pairedNames = new Set(pairRiders.flat());
    const singles = names.filter(n => !pairedNames.has(n));
    const totalSlots = singles.length + pairRiders.length;
    // Faixa segura: 2%-85% para que TODAS caibam na viewport
    const topMin = 2;
    const topMax = 85;
    const range = topMax - topMin;
    const spacing = range / totalSlots;

    const randDelay = () => Math.random() * 3;
    const randDuration = () => 6 + Math.random() * 6;

    let slot = 0;

    names.forEach(name => {
      if (used.has(name)) return;

      const pair = pairRiders.find(p => p.includes(name));
      if (pair) {
        // Par ocupa 1 slot — todos na mesma altura com leve espaçamento vertical
        const centerTop = topMin + slot * spacing + spacing / 2;
        const delay = randDelay();
        const duration = randDuration();
        pair.forEach((p, pIdx) => {
          const offset = (pIdx - (pair.length - 1) / 2) * 9;
          props.set(p, {
            delay,
            duration,
            top: Math.max(topMin, Math.min(topMax, centerTop + offset)),
            reverse: false,
          });
          used.add(p);
        });
        slot++;
      } else {
        const topPct = topMin + slot * spacing + spacing / 2;
        props.set(name, {
          delay: randDelay(),
          duration: randDuration(),
          top: topPct,
          reverse: slot % 2 === 1,
        });
        used.add(name);
        slot++;
      }
    });

    return props;
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-80"
    >
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center z-[1]">
          <span className="text-6xl opacity-30 select-none pointer-events-none">⏸</span>
        </div>
      )}
      {names.map((name, i) => {
        const p = animProps.get(name)!;
        const dirClass = p.reverse ? "animate-bike-ride-reverse" : "animate-bike-ride";
        return (
          <div
            key={`${wave}-${i}`}
            className={`absolute ${dirClass}`}
            style={{
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            <div className={`flex flex-col ${p.reverse ? "items-end" : "items-start"}`}>
              <span className="text-[10px] leading-tight text-gray-400 dark:text-gray-500 mb-0.5 whitespace-nowrap">
                {name}
              </span>
              <Bike
                className={`w-6 h-6 sm:w-8 sm:h-8 ${
                  whiteBikes.includes(name) ? "text-white" : "text-red-500"
                } ${p.reverse ? "scale-x-[-1]" : ""}`}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes bike-ride {
          0% { transform: translateX(-80px); opacity: 0; }
          5%  { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 80px)); opacity: 0; }
        }
        @keyframes bike-ride-reverse {
          0% { transform: translateX(calc(100vw + 80px)); opacity: 0; }
          5%  { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(-80px); opacity: 0; }
        }
        .animate-bike-ride {
          animation: bike-ride linear forwards;
          opacity: 0;
        }
        .animate-bike-ride-reverse {
          animation: bike-ride-reverse linear forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
});
