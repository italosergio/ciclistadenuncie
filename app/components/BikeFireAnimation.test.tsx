import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BikeFireAnimation from "./BikeFireAnimation";
import { bikeFireNames, whiteBikeNames } from "../data/bike-fire-names";

describe("BikeFireAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(`deve renderizar ${bikeFireNames.length} elementos (um para cada nome)`, () => {
    render(<BikeFireAnimation />);

    bikeFireNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(/./).filter((el) => bikeFireNames.includes(el.textContent || "")),
    ).toHaveLength(bikeFireNames.length);
  });

  it("deve renderizar bikes brancas (whiteBikes) com classe text-white", () => {
    render(<BikeFireAnimation />);

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

    // Pega o primeiro nome que NÃO está em whiteBikeNames
    const nonWhite = bikeFireNames.find((n) => !whiteBikeNames.includes(n))!;
    const span = screen.getByText(nonWhite);
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
      ([_cb, delay]) => delay === 15000,
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
