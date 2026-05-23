import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: "pt-BR" } }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  Trans: ({ children }) => <>{children}</>,
}));

vi.mock("../lib/i18n", () => ({
  default: { t: (key) => key, language: 'pt', changeLanguage: vi.fn() },
}));

vi.mock("../lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../components/Logo", () => ({
  default: ({ onTripleClick }) => <div data-testid="logo">Logo</div>,
}));

vi.mock("../components/BikeFireAnimation", () => ({
  default: () => <div>BikeFireAnimation</div>,
}));

vi.mock("react-countup", () => ({
  default: ({ end }) => <span>{end}</span>,
}));

vi.mock("../components/WelcomeModal", () => ({
  default: () => null,
}));

import { useAuth } from "../lib/AuthContext";

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar links de login, denunciar e mapa quando usuário não está logado", async () => {
    mockedUseAuth.mockReturnValue({ user: null, logout: vi.fn() });

    const { default: Home } = await import("./home");
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Links de navegação
    expect(screen.getByText("user.signIn")).toBeInTheDocument();
    expect(screen.getByText("hero.ctaDenunciar")).toBeInTheDocument();
    expect(screen.getByText("nav.mapa")).toBeInTheDocument();

    // Logo
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("deve exibir o username do usuário quando logado", async () => {
    mockedUseAuth.mockReturnValue({
      user: { username: "testuser", email: "test@test.com", role: "usuario" },
      logout: vi.fn(),
    });

    const { default: Home } = await import("./home");
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("deve renderizar links para blog, contato e footer (lgpd, termos)", async () => {
    mockedUseAuth.mockReturnValue({ user: null, logout: vi.fn() });

    const { default: Home } = await import("./home");
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Links de navegação secundários
    expect(screen.getByText("nav.blog")).toBeInTheDocument();
    expect(screen.getByText("nav.contato")).toBeInTheDocument();

    // Footer links
    expect(screen.getByText("footer.protecaoDados")).toBeInTheDocument();
    expect(screen.getByText("footer.termoUsuario")).toBeInTheDocument();
    expect(screen.getByText("footer.termoPlataforma")).toBeInTheDocument();
  });
});
