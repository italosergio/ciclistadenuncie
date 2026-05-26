/**
 * Script para adicionar um nome à lista do BikeFireAnimation.
 *
 * Uso:
 *   pnpm bikefire:add "NOME"                  # bicicleta vermelha
 *   pnpm bikefire:add "NOME" --white          # bicicleta branca
 *
 * Exemplo:
 *   pnpm bikefire:add "PEDRO"
 *   pnpm bikefire:add "ANA" --white
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dataFile = resolve("app", "data", "bike-fire-names.ts");

function main() {
  const args = process.argv.slice(2);
  const nameIndex = args.findIndex((a) => !a.startsWith("--"));
  const name = nameIndex !== -1 ? args[nameIndex].toUpperCase().trim() : null;
  const isWhite = args.includes("--white");

  if (!name) {
    console.error('❌ Uso: pnpm bikefire:add "NOME" [--white]');
    process.exit(1);
  }

  // ── 1. Lê data file ──────────────────────────────────────────
  let data = readFileSync(dataFile, "utf-8");

  // Extrai o array de nomes atual
  const namesMatch = data.match(
    /export const bikeFireNames: string\[\] = \[([\s\S]*?)\];/,
  );
  if (!namesMatch) {
    console.error("❌ Não foi possível encontrar o array bikeFireNames no data file.");
    process.exit(1);
  }

  const existingNames = namesMatch[1]
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  if (existingNames.includes(name)) {
    console.log(`⚠️  "${name}" já existe na lista. Nada a fazer.`);
    return;
  }

  // Adiciona o novo nome (antes do ];)
  data = data.replace(
    /(export const bikeFireNames: string\[\] = \[[\s\S]*?)(\];)/,
    (_, before, closing) => {
      const trimmed = before.trimEnd();
      const separator = trimmed.endsWith(",") ? "" : ",";
      return `${trimmed}${separator}\n  "${name}",\n${closing}`;
    },
  );

  // ── 2. Se for white, adiciona ao whiteBikeNames ──────────────
  if (isWhite) {
    const whiteMatch = data.match(
      /export const whiteBikeNames: string\[\] = \[([\s\S]*?)\];/,
    );
    if (whiteMatch) {
      const existingWhite = whiteMatch[1]
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);

      if (!existingWhite.includes(name)) {
        data = data.replace(
          /(export const whiteBikeNames: string\[\] = \[[\s\S]*?)(\];)/,
          (_, before, closing) => {
            const trimmed = before.trimEnd();
            const separator = trimmed.endsWith(",") ? "" : ",";
            return `${trimmed}${separator}\n  "${name}",\n${closing}`;
          },
        );
      }
    }
  }

  writeFileSync(dataFile, data, "utf-8");
  console.log(
    `✅ "${name}" adicionado${isWhite ? " (branca)" : " (vermelha)"} ao BikeFireAnimation!`,
  );

  // ── 3. Teste é automático ────────────────────────────────────
  console.log("📋 Teste já importa os dados dinamicamente — sem alterações necessárias.");
  console.log("\n▶️  Rode os testes pra confirmar: pnpm test");
}

main();
