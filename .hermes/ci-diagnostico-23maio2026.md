# Diagnóstico de Falha no CI — 23 maio 2026

**Commit:** 0207b0d — TeardropBikeIcon teardrop verdadeiro
**Branch:** main
**CI:** GitHub Actions (ubuntu 24.04)

## Erro: typecheck falha (exit code 2)

O comando `npm run typecheck` executa `react-router typegen && tsc`.
O `tsc` usa o `tsconfig.json` que **inclui** todos os arquivos `**/*`, incluindo arquivos de teste (`.test.ts`, `.test.tsx`).

### Problemas detectados:

### 1️⃣ `vitest.config.ts` — `environmentMatch` não existe no Vitest 4.x

```
vitest.config.ts(11,5): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, but 'environmentMatch'
    does not exist in type 'InlineConfig'. Did you mean to write 'environment'?
```

**Causa:** O projeto instalou Vitest v4.1.6 (via `^4.1.6` no package.json).
Nessa versão, a opção `environmentMatch` foi **removida** do `InlineConfig`.
O `InLineConfig` do Vitest 4.x só tem `environmentOptions?: Record<string, any>`.

**Solução possível:**
- Remover o bloco `environmentMatch` do `vitest.config.ts`
- Usar comentários inline `// @vitest-environment node` nos arquivos de teste que precisam de ambiente node
- Ou encontrar a API equivalente no Vitest 4.x

### 2️⃣ Arquivos `.test.tsx` — `'vi'` não encontrado

```
app/test-setup.ts(4,1): error TS2304: Cannot find name 'vi'.
app/routes/contato.test.tsx(16,60): error TS2556: A spread argument must either have a tuple type
app/routes/home.test.tsx(6,32): error TS7006: Parameter 'key' implicitly has an 'any' type.
app/routes/mudar-senha.test.tsx(20,58): error TS2556: A spread argument must either have a tuple type
```

**Causa:** O `tsconfig.json` só inclui `"types": ["node", "vite/client"]` — não inclui `vitest/globals`.
Test files usam `vi` (mock de funções do Vitest) e funções globais de teste (`describe`, `it`, `expect`),
mas o `tsc` não sabe que esses símbolos existem.

**Soluções possíveis:**
- Opção A (rápida): Adicionar `"exclude": ["**/*.test.ts", "**/*.test.tsx"]` ao `tsconfig.json`
- Opção B (correta): Adicionar `"vitest/globals"` aos `"types"` do `tsconfig.json`
- Opção C (alternativa): Usar `vitest --typecheck` em vez de `tsc` para test files

### 3️⃣ `.test.tsx` — Propriedades com implicit `any`

Vários parâmetros de callbacks em arquivos de teste não têm tipagem explícita.
Relacionado ao ponto 2 — se o `vi` não for encontrado, o `tsc` não consegue inferir
os tipos das funções mock.

## Notas

- **Os testes em si** (`vitest run`) podem rodar sem problemas — a falha é **apenas no typecheck** (`tsc`).
- O commit já está em `origin/main` ✅
- O CI bloqueia merge se o typecheck falhar
- O arquivo de teste visual está em `test-visual-teardrop.html`

## Como proceder

1. Decidir qual solução adotar para os erros de typecheck
2. Fazer o fix
3. Rodar `npm run typecheck` localmente pra confirmar
4. Commitar e push
