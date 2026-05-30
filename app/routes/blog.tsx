import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/blog";
import i18n from "../lib/i18n";
import { blogPosts, getCategories } from "../data/blog";
import OrbitalSystem from "../components/OrbitalSystem";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("blog.pageTitle") },
    { name: "description", content: i18n.t("blog.description") },
  ];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  ativismo:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  mobilidade:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  seguranca:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  criancas:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  luto:
    "bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
  papoCabeca:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  massaCritica:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function Blog() {
  const { t } = useTranslation("translation");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = getCategories();
  const [heroPost, ...restPosts] = blogPosts;

  const postCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of blogPosts) {
      counts[post.category] = (counts[post.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredPosts = activeCategory
    ? restPosts.filter((p) => p.category === activeCategory)
    : restPosts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-bungee tracking-tight text-red-600 dark:text-red-500">
            {t("blog.title")}
          </h1>
          <p className="mt-2 text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase text-sm">
            {t("blog.subtitle")}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Post — Featured */}
        <section className="mb-12">
          <Link
            to={`/blog/${heroPost.slug}`}
            className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="md:flex">
              <div className="md:w-3/5 aspect-[16/10] md:aspect-auto md:min-h-[320px] bg-gradient-to-br from-red-500 to-red-700 relative overflow-hidden">
                <img
                  src={heroPost.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span
                  className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    categoryColors[heroPost.category] ||
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {t(heroPost.categoryKey)}
                </span>
              </div>
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center">
                <time className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {formatDate(heroPost.date)}
                </time>
                <h2 className="mt-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-bungee group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                  {t(heroPost.titleKey)}
                </h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed">
                  {t(heroPost.introKey)}
                </p>
                <span className="mt-4 inline-flex items-center text-red-600 dark:text-red-500 font-semibold text-sm group-hover:underline">
                  {t("blog.readMore")} →
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Orbital System — Categorias como Moléculas */}
        <section className="mb-10">
          <OrbitalSystem
            categories={categories}
            postCountByCategory={postCountByCategory}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </section>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
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
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    categoryColors[post.category] ||
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {t(post.categoryKey)}
                </span>
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

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">{t("blog.noPostsInCategory")}</p>
          </div>
        )}
      </main>

      {/* Sidebar/Footer Stats */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {t("blog.categories")}
              </h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.key}>
                    <button
                      onClick={() => setActiveCategory(cat.key)}
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors text-sm font-medium"
                    >
                      {t(cat.labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {t("blog.recentPosts")}
              </h4>
              <ul className="space-y-3">
                {blogPosts.slice(0, 5).map((post) => (
                  <li key={post.slug}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors text-sm font-medium block"
                    >
                      <span className="line-clamp-2">{t(post.titleKey)}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(post.date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {t("blog.aboutSection")}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("blog.description")}
              </p>
              <Link
                to="/"
                className="mt-3 inline-block text-sm text-red-600 dark:text-red-500 hover:underline font-semibold"
              >
                ← {t("backToHome")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
