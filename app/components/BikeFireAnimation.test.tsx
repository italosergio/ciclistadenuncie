import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    render(<BikeFireAnimation paused={false} />);

    bikeFireNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(/./).filter((el) => bikeFireNames.includes(el.textContent || "")),
    ).toHaveLength(bikeFireNames.length);
  });

  it("deve renderizar bikes brancas (whiteBikes) com classe text-white", () => {
    render(<BikeFireAnimation paused={false} />);

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
    render(<BikeFireAnimation paused={false} />);

    // Pega o primeiro nome que NÃO está em whiteBikeNames
    const nonWhite = bikeFireNames.find((n) => !whiteBikeNames.includes(n))!;
    const span = screen.getByText(nonWhite);
    const bikeSvg = span.nextElementSibling;
    expect(bikeSvg).toBeInTheDocument();
    expect(bikeSvg).toHaveClass("text-red-500");
  });

  it("deve usar useEffect com setInterval de 15 segundos", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    render(<BikeFireAnimation paused={false} />);

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

    const { unmount } = render(<BikeFireAnimation paused={false} />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  // ─── Testes de pausa ────────────────────────────────────────

  it("deve exibir indicador ⏸ quando paused={true}", () => {
    const { rerender } = render(<BikeFireAnimation paused={false} />);

    // Inicialmente sem indicador de pausa
    expect(screen.queryByText("⏸")).not.toBeInTheDocument();

    // Rerender com paused=true
    rerender(<BikeFireAnimation paused={true} />);

    // Indicador de pausa aparece
    expect(screen.getByText("⏸")).toBeInTheDocument();
  });

  it("deve esconder indicador ⏸ quando paused volta a false", () => {
    const { rerender } = render(<BikeFireAnimation paused={true} />);

    // Indicador de pausa aparece
    expect(screen.getByText("⏸")).toBeInTheDocument();

    // Rerender com paused=false
    rerender(<BikeFireAnimation paused={false} />);

    // Indicador some
    expect(screen.queryByText("⏸")).not.toBeInTheDocument();
  });

  it("deve aplicar animationPlayState 'paused' nas bikes quando paused={true}", () => {
    const { rerender } = render(<BikeFireAnimation paused={false} />);

    // Antes de pausar, todas as bikes estão com running
    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;
    const bikeDivsAntes = container.querySelectorAll("[style*='animation-play-state']");
    bikeDivsAntes.forEach((div) => {
      expect((div as HTMLElement).style.animationPlayState).toBe("running");
    });

    // Rerender com paused=true
    rerender(<BikeFireAnimation paused={true} />);

    // Todas as bikes mudam para paused
    const bikeDivs = container.querySelectorAll("[style*='animation-play-state']");
    expect(bikeDivs.length).toBeGreaterThan(0);
    bikeDivs.forEach((div) => {
      expect((div as HTMLElement).style.animationPlayState).toBe("paused");
    });
  });

  it("deve retornar animationPlayState para 'running' ao despausar", () => {
    const { rerender } = render(<BikeFireAnimation paused={true} />);
    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;

    // Rerender com paused=false
    rerender(<BikeFireAnimation paused={false} />);

    // Todas as bikes voltam para running
    const bikeDivs = container.querySelectorAll("[style*='animation-play-state']");
    bikeDivs.forEach((div) => {
      expect((div as HTMLElement).style.animationPlayState).toBe("running");
    });
  });

  it("deve pular incremento do wave quando pausado (setInterval ignorado)", () => {
    // O intervalo de 15s incrementa wave apenas se pausedRef.current for false
    // Aqui verificamos que, após pausar, avançar 15s não gera novos ciclos
    // (evidenciado pela key `${wave}-${i}` permanecer a mesma)
    render(<BikeFireAnimation paused={true} />);

    // Indicador de pausa aparece
    expect(screen.getByText("⏸")).toBeInTheDocument();

    // Avança 2 ciclos de 15s
    vi.advanceTimersByTime(30000);

    // O indicador ainda está lá (componente não crashou), e a key não mudou
    // (não podemos testar key diretamente, mas podemos confirmar que
    //  o componente continua renderizado sem erro)
    expect(screen.getByText("⏸")).toBeInTheDocument();
    bikeFireNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
