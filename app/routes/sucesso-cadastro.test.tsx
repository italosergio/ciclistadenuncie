import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import SucessoCadastro from "./sucesso-cadastro";

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

describe("SucessoCadastro", () => {
  it("deve renderizar o ícone de check e o título", () => {
    render(<SucessoCadastro />);
    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("sucessoCadastro.title")).toBeInTheDocument();
  });

  it("deve renderizar as mensagens de conta criada e faça login", () => {
    render(<SucessoCadastro />);
    expect(
      screen.getByText((content) => content.includes("sucessoCadastro.contaCriada"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("sucessoCadastro.facaLogin"))
    ).toBeInTheDocument();
  });

  it("deve renderizar link para /login com texto de sign in", () => {
    render(<SucessoCadastro />);
    const link = screen.getByText("user.signIn");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
