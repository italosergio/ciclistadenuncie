import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import TermoResponsabilidadeUsuario from "./termo-responsabilidade-usuario";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

beforeAll(() => {
  localStorage.clear();
});

describe("TermoResponsabilidadeUsuario", () => {
  it("deve renderizar o título principal e o link de voltar", () => {
    render(<TermoResponsabilidadeUsuario />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("termoUsuario.title")).toBeInTheDocument();
    const backLink = screen.getByText((content) => content.includes("back"));
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("deve renderizar a caixa de aviso amarela com declaração de ciência", () => {
    render(<TermoResponsabilidadeUsuario />);
    expect(screen.getByText("termoUsuario.declaracaoCiencia")).toBeInTheDocument();
    expect(screen.getByText("termoUsuario.declaracaoDesc")).toBeInTheDocument();
    expect(screen.getByText("termoUsuario.declaracaoItem1")).toBeInTheDocument();
    expect(screen.getByText("termoUsuario.declaracaoItem2")).toBeInTheDocument();
  });

  it("deve renderizar múltiplas seções com headings h2 e listas", () => {
    render(<TermoResponsabilidadeUsuario />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBeGreaterThanOrEqual(5);
    expect(
      screen.getByText("termoUsuario.section1.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("termoUsuario.section2.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("termoUsuario.section2.aviso")
    ).toBeInTheDocument();
  });

  it("deve renderizar a data de última atualização", () => {
    render(<TermoResponsabilidadeUsuario />);
    expect(
      screen.getByText((content) => content.includes("termoUsuario.ultimaAtualizacao"))
    ).toBeInTheDocument();
  });
});
