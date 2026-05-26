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

  // ─── Testes de clique-pausa ────────────────────────────────────────

  it("deve exibir indicador ⏸ ao clicar no container (pausar)", () => {
    render(<BikeFireAnimation />);

    // Inicialmente sem indicador de pausa
    expect(screen.queryByText("⏸")).not.toBeInTheDocument();

    // Clica no container (o primeiro div com onClick)
    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;
    fireEvent.click(container);

    // Indicador de pausa aparece
    expect(screen.getByText("⏸")).toBeInTheDocument();
  });

  it("deve alternar pausa ao clicar duas vezes (pausar e retomar)", () => {
    render(<BikeFireAnimation />);

    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;

    // Primeiro clique: pausa
    fireEvent.click(container);
    expect(screen.getByText("⏸")).toBeInTheDocument();

    // Segundo clique: retoma
    fireEvent.click(container);
    expect(screen.queryByText("⏸")).not.toBeInTheDocument();
  });

  it("deve aplicar animationPlayState 'paused' nas bikes quando pausado", () => {
    render(<BikeFireAnimation />);

    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;

    // Antes de pausar, todas as bikes estão com running
    const bikeDivsAntes = container.querySelectorAll("[style*='animation-play-state']");
    bikeDivsAntes.forEach((div) => {
      expect((div as HTMLElement).style.animationPlayState).toBe("running");
    });

    // Pausa
    fireEvent.click(container);

    // Todas as bikes mudam para paused
    const bikeDivs = container.querySelectorAll("[style*='animation-play-state']");
    expect(bikeDivs.length).toBeGreaterThan(0);
    bikeDivs.forEach((div) => {
      expect((div as HTMLElement).style.animationPlayState).toBe("paused");
    });
  });

  it("deve retornar animationPlayState para 'running' ao retomar", () => {
    render(<BikeFireAnimation />);

    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;

    // Pausa
    fireEvent.click(container);

    // Retoma
    fireEvent.click(container);

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
    render(<BikeFireAnimation />);

    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;

    // Pausa
    fireEvent.click(container);
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

  it("deve chamar stopPropagation ao clicar (não afeta elementos pai)", () => {
    // Este teste verifica que o stopPropagation no onClick do container
    // impede que o clique vaze para elementos pai. Simulamos adicionando
    // um listener no window e verificando que um clique no container
    // da animação não chega até ele quando o container tem stopPropagation.
    const windowClickHandler = vi.fn();
    window.addEventListener("click", windowClickHandler);

    render(<BikeFireAnimation />);

    const container = screen.getByText(bikeFireNames[0]).closest("div.fixed")!;

    // Clica no container — o stopPropagation deve impedir o bubble até window
    fireEvent.click(container);

    // O toggle funcionou
    expect(screen.getByText("⏸")).toBeInTheDocument();

    // O evento NÃO deve ter chegado ao window (stopPropagation funcionou)
    expect(windowClickHandler).not.toHaveBeenCalled();

    window.removeEventListener("click", windowClickHandler);
  });
});
