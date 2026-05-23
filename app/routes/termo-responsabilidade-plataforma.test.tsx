import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import TermoResponsabilidadePlataforma from "./termo-responsabilidade-plataforma";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
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

describe("TermoResponsabilidadePlataforma", () => {
  it("deve renderizar o título principal e o link de voltar", () => {
    render(<TermoResponsabilidadePlataforma />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("termoPlataforma.title")).toBeInTheDocument();
    const backLink = screen.getByText((content) => content.includes("back"));
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("deve renderizar a caixa de aviso vermelha", () => {
    render(<TermoResponsabilidadePlataforma />);
    expect(
      screen.getByText("termoPlataforma.avisoImportante")
    ).toBeInTheDocument();
    expect(screen.getByText("termoPlataforma.avisoDesc")).toBeInTheDocument();
  });

  it("deve renderizar múltiplas seções com headings h2 e listas", () => {
    render(<TermoResponsabilidadePlataforma />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBeGreaterThanOrEqual(8);
    expect(
      screen.getByText("termoPlataforma.section1.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("termoPlataforma.section1.item1")
    ).toBeInTheDocument();
    expect(
      screen.getByText("termoPlataforma.section2.title")
    ).toBeInTheDocument();
  });

  it("deve renderizar a seção de resumo final", () => {
    render(<TermoResponsabilidadePlataforma />);
    expect(
      screen.getByText("termoPlataforma.resumo.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("termoPlataforma.resumo.desc")
    ).toBeInTheDocument();
    expect(screen.getByText("termoPlataforma.resumo.fim")).toBeInTheDocument();
  });

  it("deve renderizar a data de última atualização", () => {
    render(<TermoResponsabilidadePlataforma />);
    expect(
      screen.getByText((content) => content.includes("termoPlataforma.ultimaAtualizacao"))
    ).toBeInTheDocument();
  });
});
