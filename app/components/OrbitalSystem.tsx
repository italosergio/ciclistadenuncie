import { Link } from "react-router";
import { useTranslation } from "react-i18next";

interface AtomConfig {
  key: string;
  labelKey: string;
  label: string;
  nucleusClass: string;
  dotClass: string;
  hexColor: string;
  symbol: string;
}

const ATOM_CONFIGS: AtomConfig[] = [
  {
    key: "ativismo",
    labelKey: "blog.category.ativismo",
    label: "Ativismo",
    nucleusClass: "bg-red-500",
    dotClass: "bg-red-400",
    hexColor: "#ef4444",
    symbol: "✊",
  },
  {
    key: "mobilidade",
    labelKey: "blog.category.mobilidade",
    label: "Mobilidade",
    nucleusClass: "bg-blue-500",
    dotClass: "bg-blue-400",
    hexColor: "#3b82f6",
    symbol: "🚲",
  },
  {
    key: "seguranca",
    labelKey: "blog.category.seguranca",
    label: "Segurança",
    nucleusClass: "bg-amber-500",
    dotClass: "bg-amber-400",
    hexColor: "#f59e0b",
    symbol: "🛡️",
  },
  {
    key: "criancas",
    labelKey: "blog.category.criancas",
    label: "Crianças",
    nucleusClass: "bg-purple-500",
    dotClass: "bg-purple-400",
    hexColor: "#a855f7",
    symbol: "🧒",
  },
  {
    key: "luto",
    labelKey: "blog.category.luto",
    label: "Luto",
    nucleusClass: "bg-gray-500",
    dotClass: "bg-gray-400",
    hexColor: "#6b7280",
    symbol: "🖤",
  },
  {
    key: "papoCabeca",
    labelKey: "blog.category.papoCabeca",
    label: "Papo Cabeça",
    nucleusClass: "bg-teal-500",
    dotClass: "bg-teal-400",
    hexColor: "#14b8a6",
    symbol: "💡",
  },
  {
    key: "massaCritica",
    labelKey: "blog.category.massaCritica",
    label: "Massa Crítica",
    nucleusClass: "bg-orange-500",
    dotClass: "bg-orange-400",
    hexColor: "#f97316",
    symbol: "🔥",
  },
];

/** Orbit animation names mapped by electron index. */
const ORBIT_ANIMS = [
  "animate-orbit-a",
  "animate-orbit-b",
  "animate-orbit-c",
  "animate-orbit-d",
] as const;

/** Orbit radii mapped by electron index. */
const ORBIT_RADII = ["48px", "42px", "36px", "46px"];

/** Electron dot sizes mapped by electron index. */
const DOT_SIZES = ["w-2.5 h-2.5", "w-2 h-2", "w-2 h-2", "w-2.5 h-2.5"];

interface OrbitalSystemProps {
  categories: { key: string; labelKey: string }[];
  postCountByCategory: Record<string, number>;
  activeCategory?: string | null;
  onSelectCategory?: (key: string | null) => void;
}

export default function OrbitalSystem({
  categories,
  postCountByCategory,
  activeCategory,
  onSelectCategory,
}: OrbitalSystemProps) {
  const { t } = useTranslation("translation");

  const activeKeys = new Set(categories.map((c) => c.key));
  const atoms = ATOM_CONFIGS.filter((a) => activeKeys.has(a.key)).map(
    (config) => ({
      ...config,
      postCount: postCountByCategory[config.key] || 0,
    })
  );

  return (
    <div className="relative w-full overflow-hidden py-6">
      {/* Background subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/30 dark:via-gray-900/30 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-14">
        {atoms.map((atom) => {
          const isActive = activeCategory === atom.key;
          const isInactive = activeCategory !== null && activeCategory !== undefined && !isActive;
          const n = Math.min(atom.postCount, 4);

          return (
            <button
              key={atom.key}
              onClick={() => onSelectCategory?.(isActive ? null : atom.key)}
              className="relative flex flex-col items-center transition-all duration-500 outline-none group cursor-pointer"
              style={{
                opacity: isInactive ? 0.25 : 1,
                filter: isInactive ? "grayscale(0.7)" : "none",
                transform: isActive ? "scale(1.08)" : "scale(1)",
              }}
              title={atom.label}
            >
              {/* Atom canvas */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                {/* Orbital ring 1 (outer) */}
                <div
                  className={`absolute inset-0 rounded-full border-2 border-dashed transition-colors duration-500 ${
                    isActive
                      ? "border-red-400/40 dark:border-red-500/30"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  style={{ transform: "rotateX(65deg)" }}
                />

                {/* Orbital ring 2 (inner, offset) */}
                {n > 1 && (
                  <div
                    className={`absolute rounded-full border border-dashed transition-colors duration-500 ${
                      isActive
                        ? "border-red-400/30 dark:border-red-500/25"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    style={{
                      width: "75%",
                      height: "75%",
                      transform: "rotateX(65deg) rotateZ(45deg)",
                    }}
                  />
                )}

                {/* Electrons — orbit around nucleus */}
                {Array.from({ length: n }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${ORBIT_ANIMS[i]}`}
                    style={{ "--orbit-r": ORBIT_RADII[i] } as React.CSSProperties}
                  >
                    <div
                      className={`${DOT_SIZES[i]} rounded-full ${atom.dotClass} shadow-lg`}
                      style={{
                        boxShadow: `0 0 8px 3px ${atom.hexColor}55`,
                      }}
                    />
                  </div>
                ))}

                {/* Nucleus */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${atom.nucleusClass} flex items-center justify-center text-white text-base md:text-lg font-bold shadow-lg transition-all duration-500 relative z-10`}
                  style={
                    isActive
                      ? {
                          boxShadow: `0 0 22px 8px ${atom.hexColor}66`,
                          transform: "scale(1.1)",
                        }
                      : {
                          boxShadow: `0 0 10px 3px ${atom.hexColor}33`,
                        }
                  }
                >
                  {atom.symbol}
                </div>
              </div>

              {/* Category name */}
              <span
                className={`mt-2 text-xs font-bold tracking-wide uppercase text-center transition-all duration-300 max-w-20 leading-tight ${
                  isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                }`}
              >
                {t(atom.labelKey)}
              </span>

              {/* Post count */}
              {atom.postCount > 0 && (
                <span
                  className={`mt-0.5 text-[10px] font-mono transition-all duration-300 ${
                    isActive
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {atom.postCount} {atom.postCount === 1 ? "matéria" : "matérias"}
                </span>
              )}

              {/* Link to dedicated category page */}
              {atom.postCount > 0 && (
                <Link
                  to={`/blog/categoria/${atom.key}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 hover:underline ${
                    isActive
                      ? "text-red-500 dark:text-red-400"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  }`}
                >
                  ver tudo →
                </Link>
              )}

              {/* Empty label */}
              {atom.postCount === 0 && (
                <span className="mt-0.5 text-[10px] text-gray-300 dark:text-gray-600 italic">
                  vazio
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
