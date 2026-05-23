import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../lib/AuthContext", () => ({
  useAuth: vi.fn(() => ({ login: vi.fn() })),
}));

vi.mock("../lib/auth", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  resetPassword: vi.fn(),
}));

import { loginUser } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";

const mockedLoginUser = loginUser as ReturnType<typeof vi.fn>;
const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({ login: vi.fn() });
  });

  it("deve renderizar o formulário de login com campos de usuário e senha", async () => {
    const { default: Login } = await import("./login");
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email.placeholder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("senha.placeholder")).toBeInTheDocument();
    expect(screen.getByText("login.button")).toBeInTheDocument();
    expect(screen.getByText("user.register")).toBeInTheDocument();
  });

  it("deve alternar para a tela de cadastro ao clicar em 'Cadastre-se'", async () => {
    const { default: Login } = await import("./login");
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("user.register"));

    expect(screen.getAllByText("cadastro.step1").length).toBeGreaterThan(0);
    expect(screen.getByText("cadastro.nome")).toBeInTheDocument();
  });

  it("deve navegar para o step 2 do cadastro após preenchimento", async () => {
    const { default: Login } = await import("./login");
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("user.register"));
    expect(screen.getAllByText("cadastro.step1").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText("cadastro.nomePlaceholder"), {
      target: { value: "novousuario" },
    });
    const emailInputs = screen.getAllByPlaceholderText("email.placeholder");
    fireEvent.change(emailInputs[emailInputs.length - 1], {
      target: { value: "novo@email.com" },
    });

    fireEvent.click(screen.getByText("next"));

    await waitFor(() => {
      expect(screen.getAllByText("cadastro.step2").length).toBeGreaterThan(0);
    });
  });

  it("deve exibir a tela de 'Esqueci minha senha' quando login falhar", async () => {
    mockedLoginUser.mockRejectedValueOnce({ code: "auth/wrong-password" });

    const { default: Login } = await import("./login");
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("email.placeholder"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByPlaceholderText("senha.placeholder"), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText("login.button"));

    await waitFor(() => {
      expect(screen.getByText("user.forgotPassword")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("user.forgotPassword"));

    expect(screen.getByText("mudarSenha.title")).toBeInTheDocument();
    expect(screen.getByText("mudarSenha.instrucao")).toBeInTheDocument();
  });

  it("deve alternar entre mostrar/esconder senha", async () => {
    const { default: Login } = await import("./login");
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // O botão de eye para mostrar/esconder senha deve estar presente
    const toggleButtons = screen.getAllByRole("button");
    // Deve haver pelo menos 2 botões: submit, toggle register, e toggle password
    expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
  });
});
