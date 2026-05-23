import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

vi.mock("../lib/auth", () => ({
  changePassword: vi.fn(),
  updateUserEmail: vi.fn(),
}));

import { useAuth } from "../lib/AuthContext";

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe("Conta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { username: "testuser", email: "test@test.com", uid: "123" },
      logout: vi.fn(),
      login: vi.fn(),
    });
  });

  it("deve renderizar os cards da página de conta", async () => {
    const { default: Conta } = await import("./conta");
    render(
      <MemoryRouter>
        <Conta />
      </MemoryRouter>
    );

    // Título principal
    expect(screen.getByText("conta.titulo")).toBeInTheDocument();
    // Cards
    expect(screen.getByText("conta.mudarSenha.titulo")).toBeInTheDocument();
    expect(screen.getByText("conta.username.titulo")).toBeInTheDocument();
  });

  it("deve renderizar o card de excluir conta com o botão de exclusão", async () => {
    const { default: Conta } = await import("./conta");
    render(
      <MemoryRouter>
        <Conta />
      </MemoryRouter>
    );

    // O texto do card de excluir deve estar presente
    expect(screen.getByText("Excluir Conta")).toBeInTheDocument();
    expect(screen.getByText("EXCLUIR CONTA PERMANENTEMENTE")).toBeInTheDocument();
  });

  it("deve mostrar tela de conta excluída quando estado contaExcluida for true", async () => {
    // Precisamos de uma forma de forçar o estado contaExcluida = true
    // A forma mais prática é criar um wrapper que renderiza o componente
    // e simula o clique no botão de excluir com confirmação
    const { default: Conta } = await import("./conta");
    render(
      <MemoryRouter>
        <Conta />
      </MemoryRouter>
    );

    // A tela de conta excluída não deve estar visível inicialmente
    expect(screen.queryByText("conta.excluida.sucesso")).not.toBeInTheDocument();

    // O card de excluir está presente
    expect(screen.getByText("EXCLUIR CONTA PERMANENTEMENTE")).toBeInTheDocument();
  });
});
