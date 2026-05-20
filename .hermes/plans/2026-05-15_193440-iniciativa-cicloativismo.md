# Plano: Adicionar "Iniciativa de Cicloativismo" como novo tipo de situação na denúncia

## Objetivo

Adicionar um novo tipo de situação chamado **"Iniciativa de Cicloativismo"** (value: `iniciativa-cicloativismo`) ao formulário de inserção de denúncia e ao mapa, permitindo que usuários registrem iniciativas positivas de ativismo ciclístico.

## Contexto atual

O formulário de denúncia (`denunciar.tsx`) possui uma lista de 15 tipos de situação (linhas 253-269), selecionáveis via um dropdown com ícones. O mapa (`mapa.tsx`) possui uma cópia quase idêntica dessa lista (linhas 97-111) para renderizar marcadores com cores, além de uma lista de `<option>` em um `<select>` no modal de denúncia rápida (linhas 1318-1333).

## Arquivos que serão alterados

### 1. `app/routes/denunciar.tsx`

**Mudanças:**
- **Import**: Adicionar `Flag` (ou `Heart`/`Sparkles`) ao import do `lucide-react` na linha 5
- **Dados (array `tipos`)**: Inserir novo objeto no array entre o penúltimo item ("falta-ciclovia") e o último ("outro"), seguindo a ordem alfabética/temática:

```ts
{ value: "iniciativa-cicloativismo", label: "Iniciativa de Cicloativismo", icon: Flag },
```

**Localização exata:** Inserir entre a linha 267 (`{ value: "falta-ciclovia", ... }`) e a linha 268 (`{ value: "outro", ... }`).

### 2. `app/routes/mapa.tsx`

**Mudanças (2 locais):**

- **Import (linha 6)**: Adicionar `Flag` ao import do `lucide-react`
- **Array `tipos` (linhas 97-111)**: Inserir o mesmo objeto com `color: "#16a34a"` (verde — tom positivo por ser uma iniciativa construtiva, diferente das denúncias que usam vermelho):

```ts
{ value: "iniciativa-cicloativismo", label: "Iniciativa de Cicloativismo", icon: Flag, color: "#16a34a" },
```

- **Lista `<option>` (linhas 1318-1333)**: Inserir a option correspondente:

```html
<option value="iniciativa-cicloativismo">Iniciativa de Cicloativismo</option>
```

## Abordagem

1. Criar branch `feature/iniciativa-cicloativismo`
2. Aplicar 3 patches:
   - Patch 1: `denunciar.tsx` — import + array entry
   - Patch 2: `mapa.tsx` — import + array entry (tipos com cor verde)
   - Patch 3: `mapa.tsx` — option no select
3. Build de verificação: `npm run build`
4. Commit e push
5. Fornecer links

## Validação

- `npm run build` sem erros
- No formulário `/denunciar`, dropdown deve exibir "Iniciativa de Cicloativismo" com ícone
- Ao selecionar, o tipo deve ser salvo como `iniciativa-cicloativismo`
- No mapa, marcadores desse tipo devem aparecer com cor verde
- No modal de denúncia rápida do mapa, o tipo deve estar disponível no select

## Riscos e observações

- **Ícone**: `Flag` (bandeira) do lucide-react é sugestivo para "iniciativa". Alternativas: `Heart`, `Sparkles`, `ThumbsUp`. Confirmar com Ítalo.
- **Cor**: Usar verde (`#16a34a`) em vez do vermelho padrão para diferenciar iniciativas positivas de denúncias negativas. O mapa.tsx usa `color` no array de tipos.
- **Ordem no dropdown**: Inserir entre "Falta de Ciclovia" e "Outro" segue a coerência temática (antes de "Outro").
- **Nenhuma alteração necessária** em `admin.tsx`, `sucesso.tsx` ou `denuncias.tsx` — o tipo é armazenado como string e exibido dinamicamente.
- **Dados existentes**: Denúncias já registradas não são afetadas.

## Perguntas em aberto

- Qual ícone usar? Sugestão: `Flag` (bandeira). Alternativa: `Heart` (coração).
- A cor verde para marcadores no mapa está OK?
