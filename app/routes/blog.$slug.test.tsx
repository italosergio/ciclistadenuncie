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

import BlogPost from "./blog.$slug";

describe("BlogPost — Post do Blog", () => {
  it("deve renderizar o título do post quando slug é válido", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "por-que-o-ciclista-denuncie-existe" }} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "blog.post1.title" })
    ).toBeInTheDocument();
  });

  it("deve renderizar o texto de introdução (introKey) do post", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "por-que-o-ciclista-denuncie-existe" }} />
      </MemoryRouter>
    );

    expect(screen.getByText("blog.post1.intro")).toBeInTheDocument();
  });

  it("deve renderizar a data formatada em português", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "por-que-o-ciclista-denuncie-existe" }} />
      </MemoryRouter>
    );

    // A data "2025-05-29" formatada em pt-BR: "29 de maio de 2025"
    expect(screen.getByText("29 de maio de 2025")).toBeInTheDocument();
  });

  it("deve renderizar o link '← Voltar ao blog' no rodapé do post", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "por-que-o-ciclista-denuncie-existe" }} />
      </MemoryRouter>
    );

    const backLink = screen.getByRole("link", { name: /blog\.backToBlog/ });
    expect(backLink).toHaveAttribute("href", "/blog");
  });

  it("não deve renderizar posts relacionados quando só existe 1 post no total", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "por-que-o-ciclista-denuncie-existe" }} />
      </MemoryRouter>
    );

    // Apenas 1 post no blogPosts, então não há posts relacionados
    expect(screen.queryByText("blog.relatedPosts")).not.toBeInTheDocument();
  });

  it("deve renderizar 'Post não encontrado' quando slug é inválido", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "slug-inexistente" }} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Post não encontrado")
    ).toBeInTheDocument();
  });

  it("deve renderizar link '← Voltar ao blog' quando post não encontrado", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "slug-inexistente" }} />
      </MemoryRouter>
    );

    const backLink = screen.getByRole("link", {
      name: /voltar ao blog/i,
    });
    expect(backLink).toHaveAttribute("href", "/blog");
  });

  it("deve renderizar os parágrafos do post", () => {
    render(
      <MemoryRouter>
        <BlogPost params={{ slug: "por-que-o-ciclista-denuncie-existe" }} />
      </MemoryRouter>
    );

    // O post tem 6 parágrafos
    expect(screen.getByText("blog.post1.p1")).toBeInTheDocument();
    expect(screen.getByText("blog.post1.p6")).toBeInTheDocument();
  });
});
