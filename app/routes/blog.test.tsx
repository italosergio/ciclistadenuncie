import { describe, it, expect, vi, beforeAll } from "vitest";
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

beforeAll(() => {
  localStorage.clear();
});

import Blog from "./blog";

describe("Blog", () => {
  it("deve renderizar o título principal do blog", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "blog.title"
    );
  });

  it("deve renderizar o PlanetarySystem com os posts mais recentes", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const planetarySystem = screen.getByTestId("planetary-system");
    expect(planetarySystem).toBeInTheDocument();
    expect(planetarySystem).toHaveTextContent("blog");
    expect(planetarySystem).toHaveTextContent("6 posts");
  });

  it("deve renderizar todas as 7 categorias no sistema orbital", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getAllByText("blog.category.mobilidade").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("blog.category.ativismo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("blog.category.seguranca").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("blog.category.criancas").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("blog.category.luto").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("blog.category.papoCabeca").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("blog.category.massaCritica").length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar a seção 'Categorias' no footer", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getByText("blog.categories")).toBeInTheDocument();
  });

  it("deve renderizar a seção 'Sobre o Blog' no footer", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getByText("blog.aboutSection")).toBeInTheDocument();
  });

  it("deve renderizar o link de voltar ao início no footer", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const homeLinks = screen.getAllByText((content) =>
      content.includes("backToHome")
    );
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar links das categorias no footer apontando para a página dedicada", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const ativismoLink = screen.getByRole("link", { name: "blog.category.ativismo" });
    expect(ativismoLink).toHaveAttribute("href", "/blog/categoria/ativismo");
  });
});
