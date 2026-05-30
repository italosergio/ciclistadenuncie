import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/blog.categoria.$key";
import i18n from "../lib/i18n";
import { getCategoryByKey, blogPosts } from "../data/blog";
import PlanetarySystem from "../components/PlanetarySystem";

export function meta({ params }: Route.MetaArgs) {
  const cat = getCategoryByKey(params.key);
  if (!cat) {
    return [
      { title: "Categoria não encontrada - Ciclista Denuncie" },
      {
        name: "description",
        content: "Categoria não encontrada.",
      },
    ];
  }
  return [
    {
      title: `${i18n.t(cat.labelKey)} - Blog - Ciclista Denuncie`,
    },
    {
      name: "description",
      content: `${i18n.t(cat.labelKey)} — Blog do Ciclista Denuncie.`,
    },
  ];
}

export default function CategoryPage({ params }: Route.ComponentProps) {
  const { t } = useTranslation("translation");
  const category = getCategoryByKey(params.key);

  if (!category) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Categoria não encontrada
          </h1>
          <Link
            to="/blog"
            className="text-red-600 dark:text-red-500 hover:underline font-semibold"
          >
            ← {t("blog.backToBlog")}
          </Link>
        </div>
      </div>
    );
  }

  const categoryPosts = blogPosts.filter(
    (p) => p.category === category.key
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-semibold transition-colors mb-4"
          >
            ← {t("blog.backToBlog")}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-3xl md:text-4xl">{category.emoji}</span>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold font-bungee tracking-tight text-red-600 dark:text-red-500">
                {t(category.labelKey)}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {categoryPosts.length}{" "}
                {categoryPosts.length === 1
                  ? t("blog.postCount.singular")
                  : t("blog.postCount.plural")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <PlanetarySystem category={category} posts={categoryPosts} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            to="/blog"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-semibold transition-colors"
          >
            ← {t("blog.backToBlog")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
