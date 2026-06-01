import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/blog";
import i18n from "../lib/i18n";
import { blogPosts, getCategories } from "../data/blog";
import type { BlogCategory } from "../data/blog";
import OrbitalSystem from "../components/OrbitalSystem";
import PlanetarySystem from "../components/PlanetarySystem";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("blog.pageTitle") },
    { name: "description", content: i18n.t("blog.description") },
  ];
}

export default function Blog() {
  const { t } = useTranslation("translation");

  const categories = getCategories();

  // Virtual category for the blog page planetary system
  const blogCategory: BlogCategory = {
    key: "blog",
    labelKey: "blog.title",
    placeholderKey: "blog.comingSoon",
    emoji: "📝",
  };
  const latestPosts = blogPosts.slice(0, 6);

  const postCountByCategory = (() => {
    const counts: Record<string, number> = {};
    for (const post of blogPosts) {
      counts[post.category] = (counts[post.category] || 0) + 1;
    }
    return counts;
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-bungee tracking-tight text-red-600 dark:text-red-500">
            {t("blog.title")}
          </h1>

          <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>

          {/* Planetary System — Posts mais recentes em órbita */}
          {latestPosts.length > 0 && (
            <div className="mt-2">
              <PlanetarySystem
                category={blogCategory}
                posts={latestPosts}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Orbital System — Categorias como Moléculas */}
        <section className="mb-10">
          <OrbitalSystem
            categories={categories}
            postCountByCategory={postCountByCategory}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {t("blog.categories")}
              </h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.key}>
                    <Link
                      to={`/blog/categoria/${cat.key}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors text-sm font-medium"
                    >
                      {t(cat.labelKey)}
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
