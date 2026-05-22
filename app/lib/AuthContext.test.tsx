import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("./historico", () => ({
  registrarEvento: vi.fn(() => Promise.resolve()),
}));

// Componente de teste para acessar o contexto
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <p data-testid="authenticated">{String(auth.isAuthenticated)}</p>
      <p data-testid="is-admin">{String(auth.isAdmin)}</p>
      <p data-testid="loading">{String(auth.loading)}</p>
      <p data-testid="banido">{String(auth.banido)}</p>
      <p data-testid="user">{auth.user ? auth.user.username : "null"}</p>
    </div>
  );
}

describe("AuthProvider", () => {
  it("deve renderizar children", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Conteúdo</div>
      </AuthProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("deve prover valor inicial padrão via useAuth", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("useAuth deve lançar erro fora de AuthProvider", () => {
    // Suprimir erro de console esperado
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth deve ser usado dentro de AuthProvider"
    );

    consoleSpy.mockRestore();
  });
});
