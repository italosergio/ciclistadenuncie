import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";

// Mock do AuthContext
vi.mock("../lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock do react-router useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

import { useAuth } from "../lib/AuthContext";

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar 'Carregando...' quando loading for true", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo Protegido")).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deve renderizar children quando autenticado", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Conteúdo Protegido")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("não deve renderizar children quando não autenticado e navegar para /login", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Conteúdo Protegido")).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("deve renderizar children quando requireAdmin e isAdmin for true", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
    });

    render(
      <ProtectedRoute requireAdmin>
        <div>Conteúdo Admin</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Conteúdo Admin")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("não deve renderizar children quando requireAdmin e não for admin, navegando para /admin", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    render(
      <ProtectedRoute requireAdmin>
        <div>Conteúdo Admin</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Conteúdo Admin")).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("deve retornar null quando não autenticado e não loading", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    // O container deve estar vazio (apenas o elemento raiz <div> sem conteúdo)
    expect(container.innerHTML).toBe("");
  });
});
