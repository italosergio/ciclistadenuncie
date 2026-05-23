import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../lib/denuncias", () => ({
  editarDenuncia: vi.fn(),
  excluirDenuncia: vi.fn(),
}));

vi.mock("../lib/historico", () => ({
  registrarEvento: vi.fn(),
}));

import { useAuth } from "../lib/AuthContext";

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Mock useParams to return a specific username
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual as any,
    useParams: () => ({ username: "testuser" }),
    useNavigate: () => vi.fn(),
  };
});

describe("Usuario.$username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar 'Carregando...' quando user for null", async () => {
    mockedUseAuth.mockReturnValue({ user: null });

    const { default: UserContributions } = await import("./usuario.$username");
    render(
      <MemoryRouter>
        <UserContributions />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("deve redirecionar (retornar null) quando username diferente do user logado", async () => {
    mockedUseAuth.mockReturnValue({
      user: { username: "otheruser", uid: "123" },
    });

    const { default: UserContributions } = await import("./usuario.$username");
    const { container } = render(
      <MemoryRouter>
        <UserContributions />
      </MemoryRouter>
    );

    // O componente retorna null quando user.username !== username do params
    // Container deve estar vazio
    expect(container.innerHTML).toBe("");
  });

  it("deve renderizar título com o username quando user corresponde ao parâmetro", async () => {
    mockedUseAuth.mockReturnValue({
      user: { username: "testuser", uid: "123" },
    });

    const { default: UserContributions } = await import("./usuario.$username");
    render(
      <MemoryRouter>
        <UserContributions />
      </MemoryRouter>
    );

    expect(screen.getByText("Minhas Contribuições")).toBeInTheDocument();
    expect(screen.getByText(/testuser/)).toBeInTheDocument();
  });
});
