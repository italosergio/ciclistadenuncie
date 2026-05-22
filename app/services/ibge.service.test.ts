import { describe, it, expect, beforeEach, vi } from "vitest";
import { buscarCidadesIBGE } from "./ibge.service";

const IBGE_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";

const mockMunicipios = [
  {
    nome: "São Paulo",
    microrregiao: {
      mesorregiao: {
        UF: { sigla: "SP" },
      },
    },
  },
  {
    nome: "Rio de Janeiro",
    microrregiao: {
      mesorregiao: {
        UF: { sigla: "RJ" },
      },
    },
  },
];

const mockMunicipiosComSemUF = [
  {
    nome: "São Paulo",
    microrregiao: {
      mesorregiao: {
        UF: { sigla: "SP" },
      },
    },
  },
  {
    nome: "Sem Microrregiao",
    microrregiao: null,
  },
  {
    nome: "Sem Mesorregiao",
    microrregiao: {
      mesorregiao: null,
    },
  },
  {
    nome: "Sem UF",
    microrregiao: {
      mesorregiao: {
        UF: null,
      },
    },
  },
];

describe("ibge.service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  describe("buscarCidadesIBGE", () => {
    it("deve chamar fetch com URL correta", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => [],
      });

      await buscarCidadesIBGE();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(IBGE_URL);
    });

    it("deve retornar cidades filtradas e formatadas", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => mockMunicipios,
      });

      const resultado = await buscarCidadesIBGE();

      expect(resultado).toEqual(["São Paulo - SP", "Rio de Janeiro - RJ"]);
    });

    it("deve ignorar municípios sem microrregiao, mesorregiao ou UF", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => mockMunicipiosComSemUF,
      });

      const resultado = await buscarCidadesIBGE();

      expect(resultado).toEqual(["São Paulo - SP"]);
    });

    it("deve retornar array vazio se não houver dados", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => [],
      });

      const resultado = await buscarCidadesIBGE();

      expect(resultado).toEqual([]);
    });
  });
});
