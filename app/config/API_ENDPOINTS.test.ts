import { describe, it, expect } from "vitest";
import { API_ENDPOINTS, TILE_LAYERS } from "./API_ENDPOINTS";

describe("API_ENDPOINTS", () => {
  it("deve ter URL do IBGE", () => {
    expect(API_ENDPOINTS.IBGE_MUNICIPIOS).toBe(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
    );
  });

  it("deve ter URL do Nominatim reverse", () => {
    expect(API_ENDPOINTS.NOMINATIM_REVERSE).toBe(
      "https://nominatim.openstreetmap.org/reverse"
    );
  });

  it("deve ter URL do Nominatim search", () => {
    expect(API_ENDPOINTS.NOMINATIM_SEARCH).toBe(
      "https://nominatim.openstreetmap.org/search"
    );
  });
});

describe("TILE_LAYERS", () => {
  it("deve ter layer Street", () => {
    expect(TILE_LAYERS.STREET).toContain("tile.openstreetmap.org");
  });

  it("deve ter layer Satellite", () => {
    expect(TILE_LAYERS.SATELLITE).toContain("server.arcgisonline.com");
  });

  it("deve ter layer Light", () => {
    expect(TILE_LAYERS.LIGHT).toContain("basemaps.cartocdn.com");
  });

  it("deve ter layer Dark", () => {
    expect(TILE_LAYERS.DARK).toContain("basemaps.cartocdn.com");
  });
});
