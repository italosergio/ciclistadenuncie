import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { APOIADORES } from "./apoiadores";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

describe("APOIADORES", () => {
  it("deve ter pelo menos um apoiador", () => {
    expect(APOIADORES.length).toBeGreaterThan(0);
  });

  it.each(APOIADORES)("$nome deve ter todos os campos obrigatórios", (apoiador) => {
    expect(apoiador.nome).toBeTruthy();
    expect(apoiador.url).toBeTruthy();
    expect(apoiador.img).toBeTruthy();
    expect(apoiador.alt).toBeTruthy();
  });

  it.each(APOIADORES)("$nome deve ter um nome que não é string vazia", (apoiador) => {
    expect(apoiador.nome.trim().length).toBeGreaterThan(0);
  });

  it.each(APOIADORES)("$nome deve ter URL começando com https://", (apoiador) => {
    expect(apoiador.url).toMatch(/^https:\/\//);
  });

  it.each(APOIADORES)("$nome deve ter image path começando com /apoiadores/", (apoiador) => {
    expect(apoiador.img).toMatch(/^\/apoiadores\//);
  });

  it.each(APOIADORES)("$nome deve ter alt igual ao nome", (apoiador) => {
    expect(apoiador.alt).toBe(apoiador.nome);
  });

  it.each(APOIADORES)("imagem de $nome deve existir em public/apoiadores/", (apoiador) => {
    const imagePath = path.join(PUBLIC_DIR, apoiador.img);
    expect(fs.existsSync(imagePath)).toBe(true);
  });

  it("não deve ter apoiadores com nomes duplicados", () => {
    const nomes = APOIADORES.map((a) => a.nome);
    const unicos = new Set(nomes);
    expect(unicos.size).toBe(nomes.length);
  });

  it("não deve ter apoiadores com URLs duplicadas", () => {
    const urls = APOIADORES.map((a) => a.url);
    const unicos = new Set(urls);
    expect(unicos.size).toBe(urls.length);
  });

  it("não deve ter apoiadores com img duplicadas", () => {
    const imgs = APOIADORES.map((a) => a.img);
    const unicos = new Set(imgs);
    expect(unicos.size).toBe(imgs.length);
  });

  it("cada apoiador deve ter slug único derivado do nome", () => {
    const slugs = APOIADORES.map((a) =>
      a.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
    const unicos = new Set(slugs);
    expect(unicos.size).toBe(slugs.length);
  });
});
