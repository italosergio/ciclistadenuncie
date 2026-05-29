import { useTranslation } from "react-i18next";
import type { Route } from "./+types/blog";
import i18n from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t('blog.pageTitle') },
    { name: "description", content: i18n.t('blog.description') },
  ];
}

export default function Blog() {
  const { t } = useTranslation('translation');
  const paragraphs = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-bungee tracking-tight text-red-600 dark:text-red-500 mb-2">
            {t('blog.post1.title')}
          </h1>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-5 text-base md:text-lg leading-relaxed">
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            {t('blog.post1.intro')}
          </p>

          {paragraphs.map((n) => (
            <p key={n} className="text-gray-700 dark:text-gray-300">
              {t(`blog.post1.p${n}`)}
            </p>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/"
            className="inline-block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
          >
            {t('backToHome')}
          </a>
        </footer>
      </article>
    </div>
  );
}
