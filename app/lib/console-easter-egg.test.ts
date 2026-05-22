import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initConsoleEasterEgg } from "./console-easter-egg";

describe("initConsoleEasterEgg", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("não deve chamar console.log se window estiver undefined", () => {
    // Em ambiente jsdom, window existe. Simulamos window undefined
    // salvando o window original e deletando
    const winRef = (globalThis as any).window;
    delete (globalThis as any).window;

    initConsoleEasterEgg();

    expect(console.log).not.toHaveBeenCalled();

    // Restaura
    (globalThis as any).window = winRef;
  });

  it("deve chamar console.log quando window existe", () => {
    initConsoleEasterEgg();
    expect(console.log).toHaveBeenCalled();
  });
});
