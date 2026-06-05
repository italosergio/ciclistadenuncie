import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Logo from "./Logo";

describe("Logo", () => {
  it("deve renderizar a imagem com o src correto", () => {
    render(<Logo />);
    const img = screen.getByAltText("Ciclista Denuncie");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/logo-ciclistadenuncie-1.png");
  });

  it("deve ter o estilo de animação CSS @keyframes shake", () => {
    render(<Logo />);
    const styleElement = document.querySelector("style");
    expect(styleElement).toBeInTheDocument();
    expect(styleElement!.textContent).toContain("@keyframes shake");
  });

  it("deve chamar onTripleClick após três cliques rápidos", () => {
    vi.useFakeTimers();
    const onTripleClick = vi.fn();

    render(<Logo onTripleClick={onTripleClick} />);

    const div = screen.getByAltText("Ciclista Denuncie").closest("div")!;

    // Clicar 3x fora do act para React processar estado entre cliques
    fireEvent.click(div);
    fireEvent.click(div);
    fireEvent.click(div);

    expect(onTripleClick).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("não deve chamar onTripleClick com menos de três cliques", () => {
    vi.useFakeTimers();
    const onTripleClick = vi.fn();

    render(<Logo onTripleClick={onTripleClick} />);

    const div = screen.getByAltText("Ciclista Denuncie").closest("div")!;

    act(() => {
      fireEvent.click(div);
      fireEvent.click(div);
    });

    expect(onTripleClick).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("não deve chamar onTripleClick se os cliques forem espaçados além de 2s", () => {
    vi.useFakeTimers();
    const onTripleClick = vi.fn();

    render(<Logo onTripleClick={onTripleClick} />);

    const div = screen.getByAltText("Ciclista Denuncie").closest("div")!;

    act(() => { fireEvent.click(div); });

    // Avança 2.5s para disparar o setTimeout de reset (2s)
    act(() => { vi.advanceTimersByTime(2500); });

    act(() => { fireEvent.click(div); });
    act(() => { vi.advanceTimersByTime(2500); });

    act(() => { fireEvent.click(div); });

    expect(onTripleClick).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
