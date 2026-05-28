import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../components/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./admin-historico", () => ({
  default: () => <div>HistoricoTab</div>,
}));

vi.mock("./admin-usuarios", () => ({
  default: () => <div>UsuariosTab</div>,
}));

vi.mock("./admin-iniciativas", () => ({
  default: () => <div>IniciativasTab</div>,
}));

vi.mock("./admin-apoiadores", () => ({
  default: () => <div>ApoiadoresTab</div>,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as any),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams("tab=atividade"), vi.fn()],
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

import { useAuth } from "../lib/AuthContext";

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe("Admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar 'Carregando...' quando user for null", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      isAdmin: false,
    });

    const { default: Admin } = await import("./admin");
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(screen.getByText("admin.carregando")).toBeInTheDocument();
  });

  it("deve retornar null quando user não for admin nem moderador", async () => {
    mockedUseAuth.mockReturnValue({
      user: { username: "user", role: "usuario" },
      logout: vi.fn(),
      isAdmin: false,
    });

    const { default: Admin } = await import("./admin");
    const { container } = render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // O componente retorna null quando role não é admin/moderador
    expect(container.innerHTML).toBe("");
  });

  it("deve renderizar sidebar e 'Painel Admin' quando user for administrador", async () => {
    mockedUseAuth.mockReturnValue({
      user: { username: "adminuser", role: "administrador" },
      logout: vi.fn(),
      isAdmin: true,
    });

    const { default: Admin } = await import("./admin");
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // O sidebar deve mostrar o título
    expect(screen.getByText("admin.painelAdmin")).toBeInTheDocument();
    // O username deve aparecer
    expect(screen.getByText("adminuser")).toBeInTheDocument();
    // A role deve aparecer
    expect(screen.getByText("role.administrador")).toBeInTheDocument();
  });
});
