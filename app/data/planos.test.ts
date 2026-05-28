import { describe, it, expect } from "vitest";
import { PLANOS } from "./planos";

describe("PLANOS", () => {
  it("deve ter pelo menos 1 plano", () => {
    expect(PLANOS.length).toBeGreaterThan(0);
  });

  it("deve ter exatamente 6 planos (A, B, C, D, E, G)", () => {
    expect(PLANOS.length).toBe(6);
  });

  it.each(PLANOS)(
    "$id deve ter todos os campos obrigatórios",
    (plano) => {
      expect(plano.id).toBeTruthy();
      expect(plano.titulo).toBeTruthy();
      expect(plano.data).toBeTruthy();
      expect(plano.resumo).toBeTruthy();
      expect(plano.conteudo).toBeTruthy();
      expect(plano.categoria).toBeTruthy();
    }
  );

  it.each(PLANOS)("$id deve ter conteudo que não é string vazia", (plano) => {
    expect(plano.conteudo.trim().length).toBeGreaterThan(0);
  });

  it.each(PLANOS)("$id deve ter titulo que não é string vazia", (plano) => {
    expect(plano.titulo.trim().length).toBeGreaterThan(0);
  });

  it.each(PLANOS)(
    "$id deve ter categoria válida",
    (plano) => {
      const categoriasValidas = [
        "analytics",
        "placa",
        "boas-praticas",
        "pagina",
      ] as const;
      expect(categoriasValidas).toContain(plano.categoria);
    }
  );

  it.each(PLANOS)(
    "$id deve ter conteudo começando com #",
    (plano) => {
      expect(plano.conteudo.trimStart()).toMatch(/^#\s/);
    }
  );

  it.each(PLANOS)(
    "$id deve conter seção de objetivo ou goal no conteudo",
    (plano) => {
      // Planos A-D usam "## Objetivo", Plano E (redesign) usa "Goal"
      const temObjetivo =
        plano.conteudo.includes("## Objetivo") ||
        plano.conteudo.includes("**Goal:**") ||
        plano.conteudo.includes("## Goal");
      expect(temObjetivo).toBe(true);
    }
  );

  it.each(PLANOS)(
    "$id deve conter seção ## no conteudo",
    (plano) => {
      expect(plano.conteudo).toContain("##");
    }
  );

  it("todos os títulos devem conter 'Plano'", () => {
    for (const plano of PLANOS) {
      expect(plano.titulo).toContain("Plano");
    }
  });

  it("não deve ter planos com IDs duplicados", () => {
    const ids = PLANOS.map((p) => p.id);
    const unicos = new Set(ids);
    expect(unicos.size).toBe(ids.length);
  });

  it("não deve ter planos com títulos duplicados", () => {
    const titulos = PLANOS.map((p) => p.titulo);
    const unicos = new Set(titulos);
    expect(unicos.size).toBe(titulos.length);
  });

  it("cada id deve seguir o padrão plan-*", () => {
    for (const plano of PLANOS) {
      expect(plano.id).toMatch(/^plan-/);
    }
  });

  it("cada data deve estar no formato ISO (YYYY-MM-DD)", () => {
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const plano of PLANOS) {
      expect(plano.data).toMatch(dataRegex);
    }
  });

  it("Plano A deve conter referência a recharts no conteudo", () => {
    const planA = PLANOS.find((p) => p.id === "plan-a-dashboard-analitico");
    expect(planA).toBeDefined();
    expect(planA!.conteudo).toContain("recharts");
  });

  it("Plano B deve conter referência a busca no conteudo", () => {
    const planB = PLANOS.find((p) => p.id === "plan-b-busca-placa");
    expect(planB).toBeDefined();
    expect(planB!.conteudo).toContain("placa");
  });

  it("Plano C deve conter 'Boas Práticas' no título", () => {
    const planC = PLANOS.find((p) => p.id === "plan-c-boas-praticas");
    expect(planC).toBeDefined();
    expect(planC!.titulo).toContain("Boas Práticas");
  });

  it("Plano D deve conter '/planos' no conteudo", () => {
    const planD = PLANOS.find((p) => p.id === "plan-d-pagina-planos");
    expect(planD).toBeDefined();
    expect(planD!.conteudo).toContain("/planos");
  });

  it("Plano E deve conter 'Redesign' no título", () => {
    const planE = PLANOS.find((p) => p.id === "plan-e-redesign-painel-admin");
    expect(planE).toBeDefined();
    expect(planE!.titulo).toContain("Redesign");
  });
});
