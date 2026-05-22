# Plano F — Planos Página + Tabela Usuários: Redesign e Melhorias

**Goal:** Adequar a página `/planos` ao redesign do painel admin (Plano E) e refatorar a tabela de usuários para remover a coluna "Ações", substituindo por modal ao clicar na linha.

**Architecture:** Mudanças puramente visuais e de UX na rota `planos.tsx` e no componente `admin-usuarios.tsx`. Nenhuma alteração em Firebase, regras de negócio, permissões ou histórico.

---

## Tarefa 1 — Página `/planos` integrada ao design do admin

Transformar `/planos` em uma **tab do painel admin** (como "Atividade", "Usuários", etc.), chamada "Planos de Implementação".

**Por que:** Mantém o usuário dentro do contexto admin com a sidebar visível, reaproveita as constantes visuais (`sectionShellClass`, `panelCardClass`, etc.), e remove a inconsistência visual (`bg-gray-900` da página vs `bg-slate-950` do admin).

**Arquivos:** `app/routes/admin.tsx` (+ import PlanosTab e sidebar com tab interna)

---

## Tarefa 2 — Modal de usuário em vez de coluna "Ações"

Remover a coluna "Ações" da tabela de usuários. Ao clicar em qualquer lugar da linha, abrir um modal com:
- Fundo fosco (`backdrop-blur-sm`)
- Informações do usuário (username, role, status, data, total denúncias)
- Menu de 3 pontinhos com opções: banir/desbanir, excluir (com confirmação dentro do modal)

**Arquivos:** `app/routes/admin-usuarios.tsx` (reestruturação completa)

---

## Task 1: Criar `PlanosTab` dentro de `admin.tsx`

1. Importar `PLANOS` e `Plano` type de `../data/planos` no `admin.tsx`
2. Criar componente `PlanosTab()` seguindo o padrão das outras tabs
3. Usar as constantes visuais (`sectionShellClass`, `panelCardClass`)
4. Adaptar cards: `bg-slate-900/80`, `border-white/10`, `hover:border-blue-500/30`
5. Adaptar modal: `bg-slate-900`, `border-gray-700/50`, `bg-black/60 backdrop-blur-sm`
6. Alterar botão "Planos" da sidebar de `navigate("/planos")` para `setSearchParams({ tab: "planos" })`
7. Renderizar `{tab === "planos" && <PlanosTab />}` no main content

## Task 2: Refatorar tabela de usuários

1. Remover coluna "Ações" do `<thead>`; ajustar `colSpan` para 4
2. Adicionar `cursor-pointer` + `onClick` na `<tr>` para abrir modal
3. Criar modal com overlay + backdrop fosco + card central (`max-w-md`)
4. Exibir informações do usuário e menu de ações (banir/desbanir, excluir)
5. Mover fluxos de confirmação para dentro do modal (remover linhas expandidas)

---

## Perguntas em aberto

1. **"Enviar cont"** — o que significa? Enviar email? Mensagem? Notificar?
2. **Rota `/planos` pública** — manter como redirect para `/admin?tab=planos`, remover, ou deixar ambos?

---

**Arquivos:** `app/routes/admin.tsx`, `app/routes/admin-usuarios.tsx`, opcionalmente `app/routes/planos.tsx` e `app/routes.ts`
**Validação:** `npm run typecheck && npm run build`
