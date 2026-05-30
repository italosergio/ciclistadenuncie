import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { BlogPost, BlogCategory } from "../data/blog";

interface PlanetarySystemProps {
  category: BlogCategory;
  posts: BlogPost[];
}

const PLANET_CONFIGS: Record<
  string,
  { nucleusClass: string; hexColor: string; symbol: string }
> = {
  ativismo: {
    nucleusClass: "bg-red-500",
    hexColor: "#ef4444",
    symbol: "✊",
  },
  mobilidade: {
    nucleusClass: "bg-blue-500",
    hexColor: "#3b82f6",
    symbol: "🚲",
  },
  seguranca: {
    nucleusClass: "bg-amber-500",
    hexColor: "#f59e0b",
    symbol: "🛡️",
  },
  criancas: {
    nucleusClass: "bg-purple-500",
    hexColor: "#a855f7",
    symbol: "🧒",
  },
  luto: {
    nucleusClass: "bg-gray-500",
    hexColor: "#6b7280",
    symbol: "🖤",
  },
  papoCabeca: {
    nucleusClass: "bg-teal-500",
    hexColor: "#14b8a6",
    symbol: "💡",
  },
  massaCritica: {
    nucleusClass: "bg-orange-500",
    hexColor: "#f97316",
    symbol: "🔥",
  },
  // Virtual category for the main blog page (all posts)
  blog: {
    nucleusClass: "bg-red-500",
    hexColor: "#ef4444",
    symbol: "📝",
  },
};

const PLANET_ANIMS = [
  "animate-[planet-a_25s_linear_infinite]",
  "animate-[planet-b_20s_linear_infinite]",
  "animate-[planet-c_28s_linear_infinite]",
  "animate-[planet-d_22s_linear_infinite]",
  "animate-[planet-e_18s_linear_infinite]",
  "animate-[planet-f_24s_linear_infinite]",
] as const;

const PLANET_RADII = ["260px", "280px", "300px", "320px", "250px", "290px"];

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PlanetarySystem({
  category,
  posts,
}: PlanetarySystemProps) {
  const { t } = useTranslation("translation");
  const config = PLANET_CONFIGS[category.key];
  const displayPosts = posts.slice(0, 6);

  if (!config) return null;

  return (
    <section className="relative">
      {/* Orbital Section — Desktop only */}
      {displayPosts.length > 0 && (
        <div className="hidden md:block relative py-16 overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.08] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.hexColor} 0%, transparent 70%)`,
            }}
          />

          {/* Orbital rings */}
          <div className="relative w-[620px] h-[620px] mx-auto flex items-center justify-center">
            {[0, 1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border border-dashed border-gray-200 dark:border-gray-700/50"
                style={{
                  width: `${260 + ring * 50}px`,
                  height: `${260 + ring * 50}px`,
                  transform: "rotateX(65deg)",
                }}
              />
            ))}

            {/* Planets orbiting */}
            {displayPosts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group ${PLANET_ANIMS[i % PLANET_ANIMS.length]}`}
                style={
                  {
                    "--planet-r": PLANET_RADII[i % PLANET_RADII.length],
                    animationDelay: `${i * 1.5}s`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 group-hover:scale-125 group-hover:z-20 relative"
                  style={{
                    borderColor: config.hexColor,
                    boxShadow: `0 0 12px 2px ${config.hexColor}44`,
                  }}
                >
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay with title */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-[10px] font-bold text-center px-1 leading-tight line-clamp-3">
                      {t(post.titleKey)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Nucleus */}
            <div
              className="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold shadow-2xl animate-[nucleus-glow_3s_ease-in-out_infinite]"
              style={
                {
                  "--glow-color": `${config.hexColor}88`,
                  backgroundColor: config.hexColor,
                } as React.CSSProperties
              }
            >
              {config.symbol}
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid — visible on all screen sizes */}
      <div className="mt-6">
        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 flex flex-col"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-red-400 to-red-600 relative overflow-hidden">
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <time className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {formatDate(post.date)}
                  </time>
                  <h3 className="mt-1.5 text-lg font-bold text-gray-900 dark:text-white font-bungee group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
                    {t(post.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 flex-1 leading-relaxed">
                    {t(post.excerptKey)}
                  </p>
                  <span className="mt-3 text-red-600 dark:text-red-500 font-semibold text-xs group-hover:underline inline-flex items-center gap-1">
                    {t("blog.readMore")} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-2xl mb-3">{category.emoji}</p>
            <p className="text-lg font-medium">
              {t(category.placeholderKey)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
