export interface BlogPost {
  slug: string;
  titleKey: string;
  introKey: string;
  excerptKey: string;
  paragraphs: number;
  date: string;
  image: string;
  category: string;
  categoryKey: string;
}

export interface BlogCategory {
  key: string;
  labelKey: string;
  placeholderKey: string;
  emoji: string;
}

export const ALL_CATEGORIES: BlogCategory[] = [
  {
    key: "mobilidade",
    labelKey: "blog.category.mobilidade",
    placeholderKey: "blog.placeholder.mobilidade",
    emoji: "🗺️",
  },
  {
    key: "ativismo",
    labelKey: "blog.category.ativismo",
    placeholderKey: "blog.placeholder.ativismo",
    emoji: "⚖️",
  },
  {
    key: "seguranca",
    labelKey: "blog.category.seguranca",
    placeholderKey: "blog.placeholder.seguranca",
    emoji: "🚲",
  },
  {
    key: "noticias",
    labelKey: "blog.category.noticias",
    placeholderKey: "blog.placeholder.noticias",
    emoji: "📰",
  },
  {
    key: "dicas",
    labelKey: "blog.category.dicas",
    placeholderKey: "blog.placeholder.dicas",
    emoji: "💡",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "por-que-o-ciclista-denuncie-existe",
    titleKey: "blog.post1.title",
    introKey: "blog.post1.intro",
    excerptKey: "blog.post1.excerpt",
    paragraphs: 6,
    date: "2025-05-29",
    image: "/logo-ciclistadenuncie-1.png",
    category: "ativismo",
    categoryKey: "blog.category.ativismo",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getCategories(): BlogCategory[] {
  return ALL_CATEGORIES;
}

export function getCategoryByKey(key: string): BlogCategory | undefined {
  return ALL_CATEGORIES.find((c) => c.key === key);
}
