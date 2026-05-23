import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import LGPD from "./lgpd";

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

describe("LGPD", () => {
  it("deve renderizar o título principal e o link de voltar", () => {
    render(<LGPD />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("lgpd.title")).toBeInTheDocument();
    const backLink = screen.getByText((content) => content.includes("back"));
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("deve renderizar múltiplas seções com headings h2", () => {
    render(<LGPD />);
    const sections = screen.getAllByRole("heading", { level: 2 });
    expect(sections.length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText("lgpd.protecaoDados.title")).toBeInTheDocument();
    expect(screen.getByText("lgpd.dadosColetados.title")).toBeInTheDocument();
  });

  it("deve renderizar listas com itens", () => {
    render(<LGPD />);
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("lgpd.dadosColetados.item1")).toBeInTheDocument();
    expect(screen.getByText("lgpd.finalidade.item1")).toBeInTheDocument();
  });

  it("deve renderizar link de email para contato", () => {
    render(<LGPD />);
    const emailLink = screen.getByText("ciclistadenuncie@email.com");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute(
      "href",
      "mailto:ciclistadenuncie@email.com"
    );
  });

  it("deve renderizar a data de última atualização", () => {
    render(<LGPD />);
    expect(screen.getByText((content) => content.includes("lgpd.ultimaAtualizacao"))).toBeInTheDocument();
  });
});
