import { useState, useEffect, useMemo, memo, useRef } from "react";
import { Bike } from "lucide-react";
import { bikeFireNames as names, whiteBikeNames as whiteBikes, bikeFireLinks } from "~/data/bike-fire-names";

/** Pares de pessoas que pedalam juntas (mesma velocidade, delay e posição) */
const pairRiders: string[][] = [
  ["STELLA", "OLGA", "ANDERSON", "OTTO"],
  ["DANIEL", "LIGIA", "VIOLETA", "CAMILO"],
  ["JOÃO PAULO", "LÍVIA", "JOAQUIM", "EMMANUEL"],
  ["CÍNTIA", "CAÍQUE", "CAUÊ"],
  ["SARA", "JOJÔ"],
  ["BRUNO", "JULIA", "DANIELZINHO"],
];

/** Conjunto de nomes que pertencem a alguma família */
const pairedSet = new Set(pairRiders.flat());

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
    const singles = names.filter(n => !pairedSet.has(n));
    const totalSlots = singles.length + pairRiders.length;
    // Faixa vertical: 2%-85% da viewport
    const topMin = 2;
    const topMax = 85;
    const range = topMax - topMin;
    const spacing = range / totalSlots;

    const randDelay = () => Math.random() * 3;
    const randDuration = (isWhite: boolean) => isWhite ? 12 + Math.random() * 12 : 6 + Math.random() * 6;

    let slot = 0;

    names.forEach(name => {
      if (used.has(name)) return;

      const pair = pairRiders.find(p => p.includes(name));
      if (pair) {
        // Par ocupa 1 slot — topo central para todo o grupo
        const centerTop = topMin + slot * spacing + spacing / 2;
        const delay = randDelay();
        const isWhiteGroup = pair.some(p => whiteBikes.includes(p));
        const duration = randDuration(isWhiteGroup);
        pair.forEach(p => {
          props.set(p, {
            delay,
            duration,
            top: centerTop,
            reverse: false,
          });
          used.add(p);
        });
        slot++;
      } else {
        const topPct = topMin + slot * spacing + spacing / 2;
        props.set(name, {
          delay: randDelay(),
          duration: randDuration(whiteBikes.includes(name)),
          top: topPct,
          reverse: slot % 2 === 1,
        });
        used.add(name);
        slot++;
      }
    });

    return props;
  }, []);

  /** Renderiza um grupo familiar em grid 2 colunas */
  const renderFamily = (group: string[], gi: number) => {
    const p = animProps.get(group[0])!;
    const numRows = Math.ceil(group.length / 2);
    const rows: string[][] = [];
    for (let r = 0; r < numRows; r++) {
      rows.push(group.slice(r * 2, r * 2 + 2));
    }

    return (
      <div
        key={`family-${wave}-${gi}`}
        className="absolute animate-bike-ride"
        style={{
          top: `${p.top}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-3 justify-center">
              {row.map(name => (
                <div key={name} className="flex flex-col items-center">
                  <span className="text-[10px] leading-tight text-gray-400 dark:text-gray-500 mb-0.5 whitespace-nowrap">
                    {name}
                  </span>
                  {bikeFireLinks[name] ? (
                    <a
                      href={bikeFireLinks[name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <Bike
                        className={`${
                          whiteBikes.includes(name) ? "w-9 h-9 sm:w-12 sm:h-12" : "w-6 h-6 sm:w-8 sm:h-8"
                        } ${
                          whiteBikes.includes(name) ? "text-white" : "text-red-500"
                        }`}
                      />
                    </a>
                  ) : (
                    <Bike
                      className={`${
                        whiteBikes.includes(name) ? "w-9 h-9 sm:w-12 sm:h-12" : "w-6 h-6 sm:w-8 sm:h-8"
                      } ${
                        whiteBikes.includes(name) ? "text-white" : "text-red-500"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden opacity-80">
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center z-[1]">
          <span className="text-6xl opacity-30 select-none pointer-events-none">⏸</span>
        </div>
      )}
      {/* Singles — fora de famílias (pedalam sozinhos, com direção alternada) */}
      {names.filter(n => !pairedSet.has(n)).map((name, i) => {
        const p = animProps.get(name)!;
        const dirClass = p.reverse ? "animate-bike-ride-reverse" : "animate-bike-ride";
        return (
          <div
            key={`${wave}-single-${i}`}
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
              {bikeFireLinks[name] ? (
                <a
                  href={bikeFireLinks[name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <Bike
                    className={`${
                      whiteBikes.includes(name) ? "w-9 h-9 sm:w-12 sm:h-12" : "w-6 h-6 sm:w-8 sm:h-8"
                    } ${
                      whiteBikes.includes(name) ? "text-white" : "text-red-500"
                    } ${p.reverse ? "scale-x-[-1]" : ""}`}
                  />
                </a>
              ) : (
                <Bike
                  className={`${
                    whiteBikes.includes(name) ? "w-9 h-9 sm:w-12 sm:h-12" : "w-6 h-6 sm:w-8 sm:h-8"
                  } ${
                    whiteBikes.includes(name) ? "text-white" : "text-red-500"
                  } ${p.reverse ? "scale-x-[-1]" : ""}`}
                />
              )}
            </div>
          </div>
        );
      })}
      {/* Famílias — em grid 2 colunas (duas na frente, duas atrás) */}
      {pairRiders.map((group, gi) => renderFamily(group, gi))}

      {/* Tour targets — elementos estáveis para o Tour Guiado */}
      {/* Bicicletas Brancas (homenagens, lado superior esquerdo) */}
      <div
        data-tour="firebikes-brancas"
        className="absolute pointer-events-auto"
        style={{ top: "10%", left: "10%", width: 1, height: 1 }}
      />
      {/* Bicicletas Vermelhas (famílias, lado central) */}
      <div
        data-tour="firebikes-vermelhas"
        className="absolute pointer-events-auto"
        style={{ top: "40%", left: "25%", width: 1, height: 1 }}
      />

      <style>{`
        @keyframes bike-ride {
          0% { transform: translateX(-120px); opacity: 0; }
          5%  { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 120px)); opacity: 0; }
        }
        @keyframes bike-ride-reverse {
          0% { transform: translateX(calc(100vw + 120px)); opacity: 0; }
          5%  { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(-120px); opacity: 0; }
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
