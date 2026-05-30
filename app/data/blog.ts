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
    key: "ativismo",
    labelKey: "blog.category.ativismo",
    placeholderKey: "blog.placeholder.ativismo",
    emoji: "✊",
  },
  {
    key: "mobilidade",
    labelKey: "blog.category.mobilidade",
    placeholderKey: "blog.placeholder.mobilidade",
    emoji: "🚲",
  },
  {
    key: "seguranca",
    labelKey: "blog.category.seguranca",
    placeholderKey: "blog.placeholder.seguranca",
    emoji: "🛡️",
  },
  {
    key: "criancas",
    labelKey: "blog.category.criancas",
    placeholderKey: "blog.placeholder.criancas",
    emoji: "🧒",
  },
  {
    key: "luto",
    labelKey: "blog.category.luto",
    placeholderKey: "blog.placeholder.luto",
    emoji: "🖤",
  },
  {
    key: "papoCabeca",
    labelKey: "blog.category.papoCabeca",
    placeholderKey: "blog.placeholder.papoCabeca",
    emoji: "💡",
  },
  {
    key: "massaCritica",
    labelKey: "blog.category.massaCritica",
    placeholderKey: "blog.placeholder.massaCritica",
    emoji: "🔥",
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
  {
    slug: "mobilidade-urbana",
    titleKey: "blog.post2.title",
    introKey: "blog.post2.intro",
    excerptKey: "blog.post2.excerpt",
    paragraphs: 0,
    date: "2025-06-01",
    image: "/logo-ciclistadenuncie-1.png",
    category: "mobilidade",
    categoryKey: "blog.category.mobilidade",
  },
  {
    slug: "seguranca-no-transito",
    titleKey: "blog.post3.title",
    introKey: "blog.post3.intro",
    excerptKey: "blog.post3.excerpt",
    paragraphs: 0,
    date: "2025-06-01",
    image: "/logo-ciclistadenuncie-1.png",
    category: "seguranca",
    categoryKey: "blog.category.seguranca",
  },
  {
    slug: "criancas-no-transito",
    titleKey: "blog.post4.title",
    introKey: "blog.post4.intro",
    excerptKey: "blog.post4.excerpt",
    paragraphs: 0,
    date: "2025-06-01",
    image: "/logo-ciclistadenuncie-1.png",
    category: "criancas",
    categoryKey: "blog.category.criancas",
  },
  {
    slug: "luto",
    titleKey: "blog.post5.title",
    introKey: "blog.post5.intro",
    excerptKey: "blog.post5.excerpt",
    paragraphs: 0,
    date: "2025-06-01",
    image: "/logo-ciclistadenuncie-1.png",
    category: "luto",
    categoryKey: "blog.category.luto",
  },
  {
    slug: "papo-cabeca",
    titleKey: "blog.post6.title",
    introKey: "blog.post6.intro",
    excerptKey: "blog.post6.excerpt",
    paragraphs: 0,
    date: "2025-06-01",
    image: "/logo-ciclistadenuncie-1.png",
    category: "papoCabeca",
    categoryKey: "blog.category.papoCabeca",
  },
  {
    slug: "massa-critica",
    titleKey: "blog.post7.title",
    introKey: "blog.post7.intro",
    excerptKey: "blog.post7.excerpt",
    paragraphs: 0,
    date: "2025-06-01",
    image: "/logo-ciclistadenuncie-1.png",
    category: "massaCritica",
    categoryKey: "blog.category.massaCritica",
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
