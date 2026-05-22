import { describe, it, expect, vi, beforeEach } from "vitest";
import { push } from "firebase/database";
import { registrarEvento } from "./historico";

describe("registrarEvento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve chamar push com a ref do historico", async () => {
    await registrarEvento({
      tipo: "criar_conta",
      usuario: "usuario-teste",
    });

    expect(push).toHaveBeenCalledTimes(1);

    const [refArg, dataArg] = (push as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(refArg).toEqual(
      expect.objectContaining({ path: "historico" })
    );
  });

  it("deve salvar objeto com tipo e usuario", async () => {
    await registrarEvento({
      tipo: "login",
      usuario: "joao",
    });

    const [, data] = (push as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data).toMatchObject({
      tipo: "login",
      usuario: "joao",
    });
  });

  it("deve incluir timestamp no formato ISO", async () => {
    const before = new Date().toISOString();

    await registrarEvento({
      tipo: "logout",
      usuario: "maria",
    });

    const [, data] = (push as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data).toHaveProperty("timestamp");
    expect(typeof data.timestamp).toBe("string");
    expect(new Date(data.timestamp).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it("deve aceitar e salvar detalhes opcionais", async () => {
    const detalhes = { motivo: "teste", origem: "admin" };

    await registrarEvento({
      tipo: "banir_usuario",
      usuario: "carlos",
      detalhes,
    });

    const [, data] = (push as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data).toMatchObject({
      tipo: "banir_usuario",
      usuario: "carlos",
      detalhes,
    });
  });

  it("deve funcionar com diferentes tipos de evento", async () => {
    const tipos = [
      "criar_conta",
      "login",
      "logout",
      "excluir_denuncia",
      "adicionar_denuncia",
      "modificar_role",
      "adicionar_iniciativa",
      "excluir_iniciativa",
      "editar_iniciativa",
      "adicionar_apoiador",
      "excluir_apoiador",
      "editar_apoiador",
      "responder_contato",
      "resolver_contato",
      "marcar_pendente_contato",
      "ler_contato",
      "enviar_contato",
      "banir_usuario",
      "desbanir_usuario",
      "excluir_usuario",
      "editar_denuncia",
      "alterar_senha",
      "alterar_username",
      "excluir_conta",
      "excluir_contato",
    ] as const;

    for (const tipo of tipos) {
      await registrarEvento({ tipo, usuario: "testador" });
    }

    expect(push).toHaveBeenCalledTimes(tipos.length);

    const chamadas = (push as ReturnType<typeof vi.fn>).mock.calls;
    tipos.forEach((tipo, i) => {
      const [, data] = chamadas[i];
      expect(data.tipo).toBe(tipo);
      expect(data.usuario).toBe("testador");
      expect(data).toHaveProperty("timestamp");
    });
  });
});
