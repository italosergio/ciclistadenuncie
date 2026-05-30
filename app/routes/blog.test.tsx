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
    const heroLinks = screen.getAllByRole("link", {
      name: /blog\.readMore/,
    });
    expect(heroLinks.length).toBeGreaterThanOrEqual(1);
    expect(heroLinks[0].closest("a")).toHaveAttribute(
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

  it("deve renderizar a categoria 'Ativismo e Legislação' (pode aparecer em mais de um lugar)", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const items = screen.getAllByText("blog.category.ativismo");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar o link 'Ler matéria' no hero post", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
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
    const homeLinks = screen.getAllByText((content) =>
      content.includes("backToHome")
    );
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
  });
});
