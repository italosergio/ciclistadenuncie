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
    categoryKey: "blog.category.activism",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getCategories(): { key: string; labelKey: string }[] {
  const seen = new Set<string>();
  return blogPosts
    .filter((p) => {
      if (seen.has(p.category)) return false;
      seen.add(p.category);
      return true;
    })
    .map((p) => ({ key: p.category, labelKey: p.categoryKey }));
}
