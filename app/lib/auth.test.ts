import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, get, set } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserData,
} from "./auth";

vi.mock("./historico", () => ({
  registrarEvento: vi.fn(() => Promise.resolve()),
}));

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve criar conta e salvar no DB", async () => {
    const result = await registerUser("novousuario", "senha123", "novo@email.com");

    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(
      expect.anything(),
      "novo@email.com"
    );
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "novo@email.com",
      "senha123"
    );
    expect(set).toHaveBeenCalledTimes(1);

    const [refArg, dataArg] = (vi.mocked(set).mock.calls[0] as unknown) as [
      { path: string },
      Record<string, unknown>
    ];
    expect(refArg.path).toMatch(/^usuarios\//);
    expect(dataArg).toMatchObject({
      username: "novousuario",
      email: "novo@email.com",
      role: "usuario",
    });
    expect(dataArg).toHaveProperty("createdAt");

    expect(signOut).toHaveBeenCalledTimes(1);

    expect(result).toMatchObject({
      uid: "mock-uid-123",
      username: "novousuario",
      role: "usuario",
    });
  });

  it("deve lancar erro se email ja em uso", async () => {
    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValueOnce([
      "email@user.com",
    ]);

    await expect(
      registerUser("usuario", "senha", "existente@email.com")
    ).rejects.toEqual({ code: "auth/email-already-in-use" });
  });
});

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve encontrar email por username e fazer login", async () => {
    const usuariosSnapshot = {
      exists: () => true,
      forEach: (
        callback: (snap: {
          key: string;
          val: () => Record<string, unknown>;
        }) => void
      ) => {
        callback({
          key: "uid-123",
          val: () => ({
            username: "joao",
            email: "joao@email.com",
            role: "usuario",
          }),
        });
      },
    };

    vi.mocked(get).mockResolvedValueOnce(usuariosSnapshot as any);

    const result = await loginUser("joao", "senha123");

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "joao@email.com",
      "senha123"
    );

    expect(result).toMatchObject({
      uid: "mock-uid-123",
      username: "joao",
      role: "usuario",
      email: "joao@email.com",
      token: "mock-token",
    });
  });

  it("deve lancar erro se username nao encontrado", async () => {
    const usuariosVaziosSnapshot = {
      exists: () => true,
      forEach: () => {},
    };

    vi.mocked(get).mockResolvedValueOnce(usuariosVaziosSnapshot as any);

    await expect(loginUser("inexistente", "senha")).rejects.toEqual({
      code: "auth/user-not-found",
    });
  });
});

describe("logoutUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve chamar signOut", async () => {
    await logoutUser();

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna null se sem currentUser", async () => {
    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});

describe("getUserData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna dados do usuario", async () => {
    const userSnapshot = {
      exists: () => true,
      val: () => ({
        username: "maria",
        role: "usuario",
        createdAt: "2024-01-01T00:00:00.000Z",
      }),
    };

    vi.mocked(get).mockResolvedValueOnce(userSnapshot as any);

    const result = await getUserData("uid-maria");

    expect(result).toMatchObject({
      uid: "uid-maria",
      username: "maria",
      role: "usuario",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });
});
