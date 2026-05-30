import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/blog.$slug";
import i18n from "../lib/i18n";
import { getPostBySlug, blogPosts, getCategoryByKey } from "../data/blog";

export function meta({ params }: Route.MetaArgs) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return [
      { title: "Post não encontrado - Ciclista Denuncie" },
      { name: "description", content: "Post não encontrado." },
    ];
  }
  return [
    { title: `${i18n.t(post.titleKey)} - Ciclista Denuncie` },
    { name: "description", content: i18n.t(post.introKey) },
  ];
}

export default function BlogPost({ params }: Route.ComponentProps) {
  const { t } = useTranslation("translation");
  const post = getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Post não encontrado
          </h1>
          <Link
            to="/blog"
            className="mt-4 inline-block text-red-600 dark:text-red-500 hover:underline font-semibold"
          >
            ← Voltar ao blog
          </Link>
        </div>
      </div>
    );
  }

  const paragraphPrefix = post.titleKey.replace(".title", "");
  const hasContent = post.paragraphs > 0;

  const paragraphs = hasContent
    ? Array.from({ length: post.paragraphs }, (_, i) => i + 1)
    : [];

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Image */}
      <div className="w-full h-[320px] md:h-[420px] bg-gradient-to-br from-red-500 to-red-700 relative overflow-hidden">
        <img
          src={post.image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
          <time className="text-sm text-white/80 font-medium">
            {new Date(post.date + "T12:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </time>
          <h1 className="mt-2 text-2xl md:text-4xl font-bold font-bungee text-white leading-tight">
            {t(post.titleKey)}
          </h1>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed mb-6">
          {t(post.introKey)}
        </p>

        {hasContent ? (
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-5 text-base md:text-lg leading-relaxed">
            {paragraphs.map((n) => (
              <p key={n} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t(`${paragraphPrefix}.p${n}`)}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-5xl mb-4">
              {(() => {
                const cat = getCategoryByKey(post.category);
                return cat ? cat.emoji : "📝";
              })()}
            </p>
            <p className="text-lg font-medium">
              {t("blog.comingSoonPost")}
            </p>
          </div>
        )}

        {/* Share / Navigation */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-semibold transition-colors"
            >
              ← {t("blog.backToBlog")}
            </Link>
          </div>
        </footer>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 font-bungee">
              {t("blog.relatedPosts")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                >
                  <time className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {new Date(rp.date + "T12:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                  <h4 className="mt-1.5 text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
                    {t(rp.titleKey)}
                  </h4>
                  <span className="mt-2 inline-block text-red-600 dark:text-red-500 text-xs font-semibold group-hover:underline">
                    {t("blog.readMore")} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
