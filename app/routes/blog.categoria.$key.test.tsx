import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

vi.mock("../lib/i18n", () => ({
  default: {
    t: (key: string) => key,
    language: "pt",
    changeLanguage: vi.fn(),
  },
}));

vi.mock("../components/PlanetarySystem", () => ({
  default: ({ category, posts }: { category: any; posts: any[] }) => (
    <div data-testid="planetary-system">
      PlanetarySystem — {category.key} ({posts.length} posts)
    </div>
  ),
}));

import CategoryPage from "./blog.categoria.$key";

describe("BlogCategory — Página de Categoria do Blog", () => {
  it("deve renderizar o título da categoria quando key é válida", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "ativismo" }} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "blog.category.ativismo" })
    ).toBeInTheDocument();
  });

  it("deve renderizar o emoji da categoria no cabeçalho", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "ativismo" }} />
      </MemoryRouter>
    );

    expect(screen.getByText("✊")).toBeInTheDocument();
  });

  it("deve renderizar a contagem de posts da categoria", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "ativismo" }} />
      </MemoryRouter>
    );

    // A categoria "ativismo" tem 1 post no blogPosts mock
    expect(screen.getByText(/1 blog\.postCount\.singular/)).toBeInTheDocument();
  });

  it("deve renderizar PlanetarySystem com os posts da categoria", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "ativismo" }} />
      </MemoryRouter>
    );

    const planetarySystem = screen.getByTestId("planetary-system");
    expect(planetarySystem).toBeInTheDocument();
    expect(planetarySystem).toHaveTextContent("ativismo");
    expect(planetarySystem).toHaveTextContent("1 posts");
  });

  it("deve renderizar link '← Voltar ao blog' no cabeçalho", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "ativismo" }} />
      </MemoryRouter>
    );

    // Existem dois links "blog.backToBlog" (header e footer)
    const backLinks = screen.getAllByRole("link", { name: /blog\.backToBlog/ });
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
    backLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/blog");
    });
  });

  it("deve renderizar 'Categoria não encontrada' quando key é inválida", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "categoria-inexistente" }} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Categoria não encontrada")
    ).toBeInTheDocument();
  });

  it("deve renderizar link '← blog.backToBlog' quando categoria não encontrada", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "categoria-inexistente" }} />
      </MemoryRouter>
    );

    const backLink = screen.getByRole("link", {
      name: /blog\.backToBlog/,
    });
    expect(backLink).toHaveAttribute("href", "/blog");
  });

  it("deve renderizar emojis diferentes para cada categoria", () => {
    render(
      <MemoryRouter>
        <CategoryPage params={{ key: "mobilidade" }} />
      </MemoryRouter>
    );

    // Mobilidade tem emoji 🚲
    expect(screen.getByText("🚲")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "blog.category.mobilidade" })
    ).toBeInTheDocument();
  });
});
