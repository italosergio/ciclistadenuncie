import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BikeFireAnimation from "./BikeFireAnimation";

describe("BikeFireAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deve renderizar 32 elementos (um para cada nome)", () => {
    render(<BikeFireAnimation />);

    const names = [
      "MARINA", "RAUL", "RENATA", "DANIEL", "NEO", "ADEYLLE", "NAVE", "MAIK",
      "TARTA", "MAYRA", "VIQUE", "HEBLISA", "MILLENA", "CAROLINA", "JAQUELINE",
      "JANAINA", "SUJEIRA", "LIMPEZA", "NELSON", "FERNANDO", "ITALO", "DJ PRÉ",
      "ALDENIO", "ZERBINATO", "FALZONI", "LIGIA", "VIOLA", "DAMIAO", "JADSON",
      "JAIDIU", "DIEGO", "NINA",
    ];

    names.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/./).filter(el => names.includes(el.textContent || ''))).toHaveLength(32);
  });

  it("deve renderizar bikes brancas (whiteBikes) com classe text-white", () => {
    render(<BikeFireAnimation />);

    const whiteBikeNames = ["MARINA", "RAUL", "SUJEIRA", "NELSON", "LIMPEZA"];

    whiteBikeNames.forEach((name) => {
      const span = screen.getByText(name);
      // O próximo irmão do span é o elemento SVG do icone Bike
      const bikeSvg = span.nextElementSibling;
      expect(bikeSvg).toBeInTheDocument();
      expect(bikeSvg?.tagName).toBe("svg");
      expect(bikeSvg).toHaveClass("text-white");
    });
  });

  it("deve renderizar bikes não-brancas com classe text-red-500", () => {
    render(<BikeFireAnimation />);

    // ITALO não está na lista whiteBikes
    const span = screen.getByText("ITALO");
    const bikeSvg = span.nextElementSibling;
    expect(bikeSvg).toBeInTheDocument();
    expect(bikeSvg).toHaveClass("text-red-500");
  });

  it("deve usar useEffect com setInterval de 15 segundos", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    render(<BikeFireAnimation />);

    expect(setIntervalSpy).toHaveBeenCalled();
    const calls = setIntervalSpy.mock.calls;
    const hasFifteenSecInterval = calls.some(
      ([_cb, delay]) => delay === 15000
    );
    expect(hasFifteenSecInterval).toBe(true);

    setIntervalSpy.mockRestore();
  });

  it("deve limpar o intervalo ao desmontar", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = render(<BikeFireAnimation />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });
});
