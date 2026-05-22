import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buscarEnderecoPorCoordenadas,
  buscarCidadePorNome,
} from "./geocoding.service";

const MOCK_NOMINATIM_REVERSE =
  "https://nominatim.openstreetmap.org/reverse?lat=-23.5505&lon=-46.6333&format=json&addressdetails=1";
const MOCK_NOMINATIM_SEARCH =
  "https://nominatim.openstreetmap.org/search?city=S%C3%A3o%20Paulo&country=Brazil&format=json&limit=1";

const mockReverseResponse = {
  address: {
    road: "Avenida Paulista",
    house_number: "1000",
    suburb: "Bela Vista",
    city: "São Paulo",
    state: "São Paulo",
  },
};

const mockReverseResponseMinimal = {
  address: {},
};

describe("geocoding.service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  describe("buscarEnderecoPorCoordenadas", () => {
    it("deve buscar endereço por coordenadas e montar string correta", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => mockReverseResponse,
      });

      const resultado = await buscarEnderecoPorCoordenadas({
        lat: -23.5505,
        lng: -46.6333,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(MOCK_NOMINATIM_REVERSE);
      expect(resultado).toBe("Avenida Paulista, 1000 - Bela Vista - São Paulo - São Paulo");
    });

    it("deve retornar coordenadas quando endereço não tem partes", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => mockReverseResponseMinimal,
      });

      const resultado = await buscarEnderecoPorCoordenadas({
        lat: -23.5505,
        lng: -46.6333,
      });

      expect(resultado).toBe("-23.550500, -46.633300");
    });

    it("deve lidar com erro de fetch", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network Error")
      );

      const resultado = await buscarEnderecoPorCoordenadas({
        lat: -23.5505,
        lng: -46.6333,
      });

      expect(resultado).toBe("-23.550500, -46.633300");
    });
  });

  describe("buscarCidadePorNome", () => {
    it("deve buscar cidade por nome", async () => {
      const mockData = [
        { lat: "-23.5505", lon: "-46.6333", display_name: "São Paulo, Brasil" },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => mockData,
      });

      const resultado = await buscarCidadePorNome("São Paulo");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(MOCK_NOMINATIM_SEARCH);
      expect(resultado).toEqual(mockData);
    });
  });
});
