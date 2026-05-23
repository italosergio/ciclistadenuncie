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
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-red-600 dark:text-red-500">
          🚲 {t('blog.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          {t('blog.comingSoon')}
        </p>
        <a
          href="/"
          className="inline-block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-xs md:text-sm"
        >
          {t('backToHome')}
        </a>
      </div>
    </div>
  );
}
