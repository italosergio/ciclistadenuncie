import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Blog from "./blog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

beforeAll(() => {
  localStorage.clear();
});

describe("Blog — Jornal Digital", () => {
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

  it("deve renderizar o subtítulo 'Jornal Digital'", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getByText("blog.subtitle")).toBeInTheDocument();
  });

  it("deve renderizar o hero post com link para o post", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const heroLink = screen.getByRole("link", {
      name: /blog\.readMore/,
    });
    expect(heroLink.closest("a")).toHaveAttribute(
      "href",
      "/blog/por-que-o-ciclista-denuncie-existe"
    );
  });

  it("deve renderizar o título do hero post (pode aparecer em mais de um lugar)", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const titles = screen.getAllByText("blog.post1.title");
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar o sistema orbital de categorias", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    // O OrbitalSystem renderiza o nome das categorias
    const items = screen.getAllByText("blog.category.activism");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar a categoria 'Ativismo' (pode aparecer em mais de um lugar)", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const items = screen.getAllByText("blog.category.activism");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar o link 'Ler matéria' no hero post", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    // The text has " →" appended in the same element, so use a function matcher
    const readMoreLinks = screen.getAllByText((content) =>
      content.includes("blog.readMore")
    );
    expect(readMoreLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar a seção 'Categorias' no footer", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getByText("blog.categories")).toBeInTheDocument();
  });

  it("deve renderizar a seção 'Mais Recentes' no footer", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    expect(screen.getByText("blog.recentPosts")).toBeInTheDocument();
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
    // The text has "← " prepended, so use a function matcher
    const homeLinks = screen.getAllByText((content) =>
      content.includes("backToHome")
    );
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
  });
});
