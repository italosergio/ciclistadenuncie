import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock("../lib/i18n", () => ({
  default: { t: (key: string) => key, language: 'pt', changeLanguage: vi.fn() },
}));

vi.mock("../lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-countup", () => ({
  default: ({ end }: { end: number }) => <span>{end}</span>,
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mapa-container">{children}</div>
  ),
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  Tooltip: () => null,
  useMapEvents: () => null,
  useMap: () => ({
    getContainer: () => document.createElement("div"),
    getBounds: () => ({ contains: () => true }),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    mouseEventToLatLng: () => ({ lat: 0, lng: 0 }),
  }),
  ZoomControl: () => null,
}));

vi.mock("../services/ibge.service", () => ({
  buscarCidadesIBGE: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../services/geocoding.service", () => ({
  buscarEnderecoPorCoordenadas: vi.fn(() => Promise.resolve("")),
  buscarCidadePorNome: vi.fn(),
}));

import { useAuth } from "../lib/AuthContext";

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Helper to provide Route.ComponentProps shape
const mockRouteProps = {
  params: {},
  loaderData: { cidades: [] },
  matches: [] as any[],
};

describe("Mapa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
    });
  });

  it("deve renderizar o container do mapa", async () => {
    const { default: Mapa } = await import("./mapa");
    render(
      <MemoryRouter initialEntries={["/mapa"]}>
        <Mapa {...mockRouteProps as any} />
      </MemoryRouter>
    );

    expect(await screen.findByTestId("mapa-container")).toBeInTheDocument();
  });

  it("deve renderizar link de login quando usuário não está logado", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    const { default: Mapa } = await import("./mapa");
    render(
      <MemoryRouter initialEntries={["/mapa"]}>
        <Mapa {...mockRouteProps as any} />
      </MemoryRouter>
    );

    expect(screen.getByText("user.signIn")).toBeInTheDocument();
  });

  it("deve renderizar campo de busca de cidade", async () => {
    const { default: Mapa } = await import("./mapa");
    render(
      <MemoryRouter initialEntries={["/mapa"]}>
        <Mapa {...mockRouteProps as any} />
      </MemoryRouter>
    );

    // O campo de busca de cidade usa placeholder "filtro.cidade"
    // Existem dois inputs com este placeholder, usamos getAllByPlaceholderText
    const cityInputs = screen.getAllByPlaceholderText("filtro.cidade");
    expect(cityInputs.length).toBeGreaterThan(0);
  });
});
