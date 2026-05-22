import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, set, get, remove } from "firebase/database";
import { salvarDenuncia, editarDenuncia, excluirDenuncia } from "./denuncias";

vi.mock("./historico", () => ({
  registrarEvento: vi.fn(() => Promise.resolve()),
}));

describe("salvarDenuncia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve criar ID e salvar no Firebase", async () => {
    const data = {
      endereco: "Rua Teste, 123",
      relato: "Buraco na calcada",
      tipo: "buraco",
      localizacao: { lat: -23.5, lng: -46.6 },
    };

    await salvarDenuncia(data);

    expect(set).toHaveBeenCalledTimes(1);

    const [refArg, dataArg] = (vi.mocked(set).mock.calls[0] as unknown) as [
      { path: string },
      Record<string, unknown>
    ];
    expect(refArg.path).toMatch(
      /^denuncias\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/
    );
    expect(dataArg).toMatchObject({
      endereco: "Rua Teste, 123",
      relato: "Buraco na calcada",
      tipo: "buraco",
      localizacao: { lat: -23.5, lng: -46.6 },
    });
    expect(dataArg).toHaveProperty("createdAt");
  });

  it("deve salvar denuncia com userId e username", async () => {
    const data = {
      endereco: "Av Paulista, 1000",
      relato: "Semafaro quebrado",
      tipo: "semaforo",
      localizacao: { lat: -23.56, lng: -46.65 },
      userId: "user-123",
      username: "joao",
    };

    await salvarDenuncia(data);

    const [, dataArg] = (vi.mocked(set).mock.calls[0] as unknown) as [
      unknown,
      Record<string, unknown>
    ];
    expect(dataArg).toMatchObject({
      userId: "user-123",
      username: "joao",
    });
  });
});

describe("editarDenuncia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar denuncia e adicionar ao array de relato", async () => {
    const denunciaExistente = {
      endereco: "Rua A, 10",
      relato: "Relato original",
      tipo: "buraco",
      localizacao: { lat: -23.5, lng: -46.6 },
    };

    vi.mocked(get).mockResolvedValueOnce({
      exists: () => true,
      val: () => denunciaExistente,
    } as any);

    await editarDenuncia("id-test", "Novo relato", "maria");

    expect(set).toHaveBeenCalledTimes(1);

    const [, dataArg] = (vi.mocked(set).mock.calls[0] as unknown) as [
      unknown,
      { relato: unknown[] }
    ];
    expect(dataArg.relato).toHaveLength(2);
    expect(dataArg.relato[0]).toBe("Relato original");
    expect(dataArg.relato[1]).toMatchObject({
      texto: "Novo relato",
      editadoEm: expect.any(String),
    });
  });

  it("deve lancar erro se denuncia nao encontrada", async () => {
    vi.mocked(get).mockResolvedValueOnce({
      exists: () => false,
      val: () => null,
    } as any);

    await expect(
      editarDenuncia("id-inexistente", "Novo", "user")
    ).rejects.toThrow("Denúncia não encontrada");
  });
});

describe("excluirDenuncia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve remover e registrar evento", async () => {
    const denunciaExistente = {
      endereco: "Rua B, 20",
      relato: "Relato",
      tipo: "buraco",
      localizacao: null,
    };

    vi.mocked(get).mockResolvedValueOnce({
      exists: () => true,
      val: () => denunciaExistente,
    } as any);

    await excluirDenuncia("id-test", "admin", "Motivo do teste");

    expect(remove).toHaveBeenCalledTimes(1);

    const [refArg] = (vi.mocked(remove).mock.calls[0] as unknown) as [
      { path: string }
    ];
    expect(refArg.path).toBe("denuncias/id-test");
  });
});
