import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import SucessoContato from "./sucesso-contato";

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

describe("SucessoContato", () => {
  it("deve renderizar o ícone de check e o título", () => {
    render(<SucessoContato />);
    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("sucessoContato.title")).toBeInTheDocument();
  });

  it("deve renderizar as mensagens de agradecimento", () => {
    render(<SucessoContato />);
    expect(
      screen.getByText((content) => content.includes("sucessoContato.mensagemRecebida"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("sucessoContato.obrigado"))
    ).toBeInTheDocument();
  });

  it("deve renderizar link de volta para home com href /", () => {
    render(<SucessoContato />);
    const link = screen.getByText("backToHome");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
