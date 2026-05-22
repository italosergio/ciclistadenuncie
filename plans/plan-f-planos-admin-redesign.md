# Plano F — Planos Página + Tabela Usuários: Redesign e Melhorias

**Goal:** Adequar a página `/planos` ao redesign do painel admin (Plano E) e refatorar a tabela de usuários para remover a coluna "Ações", substituindo por modal ao clicar na linha.

**Architecture:** Mudanças puramente visuais e de UX na rota `planos.tsx` e no componente `admin-usuarios.tsx`. Nenhuma alteração em Firebase, regras de negócio, permissões ou histórico.

**Tech Stack:** React 19, React Router 7, TypeScript, Tailwind CSS v4, Firebase Realtime Database, lucide-react.

---

## Contexto atual

### Página `/planos` (`app/routes/planos.tsx`)
- Rota independente com layout próprio: `bg-gray-900` (fundo), `bg-gray-800` (header), `bg-gray-800` (cards)
- Header próprio → link "← Página Inicial"
- Grid de cards com modal + botão copiar
- **Problema:** Estilo visual totalmente diferente do admin panel redesenhado que usa `bg-slate-950`, `border-white/10`, `backdrop-blur`, `font-raleway`

### Admin sidebar (`app/routes/admin.tsx`)
- Já tem botão "Planos" na sidebar que navega para `/planos` (linha 138-144)
- A navegação sai do contexto admin → perde a sidebar, carrega página com visual diferente

### Tabela de Usuários (`app/routes/admin-usuarios.tsx`)
- Tabela com colunas: Usuário, Tipo, Status, Criado em, **Ações**
- Coluna "Ações" contém botões: Banir/Desbanir, Excluir
- Estados de confirmação (banindo/excluindo) são linhas expandidas na tabela com `colSpan`

### Admin redesign (Plano E — já aplicado)
- Constantes visuais em `admin.tsx`: `adminShellClass`, `sidebarClass`, `navButtonBaseClass`, `sectionShellClass`, `panelCardClass`, `tableShellClass`, `fieldClass`
- `admin-usuarios.tsx` já tem `sectionShellClass`, `tableShellClass` aplicados
- Cabeçalhos de seção padronizados: `text-[11px] uppercase tracking-[0.2em] text-blue-300/80` + `font-bungee text-xl md:text-2xl`

---

## Proposta de abordagem

### Tarefa 1 — Página `/planos` integrada ao design do admin

Em vez de uma página isolada, transformar `/planos` em uma **tab do painel admin** (similar a "Atividade", "Usuários", etc.), chamada "Planos de Implementação".

**Justificativa:**
- Mantém o usuário dentro do contexto admin (sidebar visível, navegação consistente)
- Reaproveita as constantes visuais (`sectionShellClass`, `panelCardClass`, etc.)
- Remove a inconsistência entre fundo `bg-gray-900` da página vs `bg-slate-950` do admin

**Alternativa considerada:** Manter rota separada mas espelhar o design do admin. Descartada porque o botão "Planos" na sidebar já navega para fora, criando quebra de fluxo.

### Tarefa 2 — Modal de usuário em vez de coluna "Ações"

Remover a coluna "Ações" da tabela. Ao clicar em qualquer lugar da linha do usuário, abrir um modal com:
- Fundo fosco (`backdrop-blur-sm`)
- Informações do usuário (username, role, status, data de criação, total de denúncias)
- Menu de 3 pontinhos com opções (banir/desbanir, excluir — com fluxos de confirmação dentro do próprio modal)
- Opção de "enviar contato" (pendente de clarificação)

---

## Plano passo a passo

### Task 1: Criar `PlanosTab` dentro de `admin.tsx`

**Objetivo:** Migrar o conteúdo de `planos.tsx` para uma tab interna do admin, acessível via sidebar.

**Arquivos modificados:**
- `app/routes/admin.tsx` — adicionar import, sidebar button, tab render
- `app/routes/planos.tsx` — manter como rota pública OU redirecionar para `/admin?tab=planos`

**Passos:**
1. Importar `PLANOS` e `Plano` type de `../data/planos` no `admin.tsx`
2. Criar componente `PlanosTab()` seguindo o padrão das outras tabs (header compacto + grid de cards + modal)
3. Usar as constantes visuais existentes (`sectionShellClass`, `panelCardClass`)
4. Adaptar os cards para usar `bg-slate-900/80`, `border-white/10`, `hover:border-blue-500/30`
5. Adaptar o modal para usar `bg-slate-900`, `border-gray-700/50`, `bg-black/60 backdrop-blur-sm`
6. Adicionar botão "Planos" na sidebar (já existe na linha 138-144, mas navega para rota externa — alterar para `setSearchParams({ tab: "planos" })`)
7. Renderizar `{tab === "planos" && <PlanosTab />}` no main content

**O que NÃO mudar:**
- Lógica de copiar texto, formatação markdown, categorias e ícones
- Dados dos planos (`planos.ts`)

**Validação:**
- Clicar em "Planos" na sidebar admin abre a tab internamente
- Cards e modal mantêm funcionalidade de copiar
- Rota `/planos` pública pode ser mantida como redirecionamento ou removida (decidir)

---

### Task 2: Refatorar tabela de usuários — remover coluna "Ações", criar modal

**Objetivo:** Tornar a tabela mais limpa removendo a coluna "Ações" e substituindo por modal interativo ao clicar na linha.

**Arquivos modificados:**
- `app/routes/admin-usuarios.tsx` — reestruturação completa

**Passos:**

#### 2.1 Preparar dados do modal
- Manter `usuarioSelecionado` state (ou similar) que armazena o usuário clicado ou `null`
- Garantir que `totalDenunciasUsuario` continue sendo computado (já existe)

#### 2.2 Remover coluna "Ações" do `<thead>`
- Remover `<th>Ações</th>`
- Ajustar `colSpan` nos formulários de confirmação (banir/excluir) para `4` em vez de `5`

#### 2.3 Tornar linha do usuário clicável
- Adicionar `cursor-pointer` e `onClick={() => setUsuarioSelecionado(user)}` no `<tr>`
- Opcional: efeito sutil de `hover:bg-white/[0.06]` para indicar clickabilidade

#### 2.4 Criar modal de detalhes do usuário
- Modal com overlay: `fixed inset-0 z-50 flex items-center justify-center p-4`
- Backdrop: `absolute inset-0 bg-black/60 backdrop-blur-sm`
- Card modal: `relative bg-slate-900 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md`
- **Cabeçalho:** username, badge de role + status, botão X
- **Corpo:** informações em formato label:value
  - Username
  - Role (com badge colorido)
  - Status (Ativo/Banido)
  - Criado em (data formatada)
  - Total de denúncias
- **Ações** (menu 3 pontinhos no canto do cabeçalho ou footer do modal):
  - Botão "Banir" / "Desbanir" (toggle conforme status)
  - Botão "Excluir"
  - Botão "Enviar contato" (ver clarificação abaixo)
- **Fluxo de confirmação:** ao clicar em Banir/Excluir, exibir confirmação dentro do próprio modal (não expandir tabela)

#### 2.5 Remover linhas de confirmação expandidas
- Remover os `<tr>` com `colSpan` que mostram confirmação de banir/excluir
- Mover toda a lógica de confirmação para dentro do modal

**O que NÃO mudar:**
- Funções `handleRoleChange`, `handleBanirUsuario`, `handleDesbanirUsuario`, `handleExcluirUsuario`
- Registro de eventos no histórico
- Lógica de proteção do próprio usuário (`user.uid !== currentUser?.uid`)
- Select de role (continua na tabela)

**Validação:**
- Tabela sem coluna "Ações", mais enxuta
- Clicar em qualquer lugar da linha abre o modal
- Modal fecha ao clicar no X, fora do modal, ou ESC
- Todas as ações (banir, desbanir, excluir, mudar role) continuam funcionando
- Confirmações aparecem dentro do modal

---

### Task 3: (Opcional / Pós) Redirecionar rota `/planos`

**Objetivo:** Decidir destino da rota pública `/planos`.

**Opções:**
1. Manter rota `/planos` como redirecionamento para `/admin?tab=planos` (requer auth)
2. Remover rota `/planos` de `app/routes.ts`
3. Manter ambos (rota pública + tab admin)

**Recomendação:** Opção 1 — redirecionar para `/admin?tab=planos` se usuário logado, caso contrário para `/login`.

---

## Perguntas em aberto

1. **"Enviar cont"** na task 2 — o que significa exatamente? Opções possíveis:
   - Enviar dados de contato do usuário para alguém
   - Enviar mensagem / notificação para o usuário
   - Enviar e-mail para o email cadastrado do usuário
   Precisamos clarificar com Ítalo.

2. **Rota `/planos` pública** — manter, remover ou redirecionar?

---

## Arquivos que vão mudar

| Arquivo | Tipo | Mudança |
|---|---|---|
| `app/routes/admin.tsx` | Modificar | + PlanosTab, + sidebar Planos como tab interna |
| `app/routes/admin-usuarios.tsx` | Modificar | Remover coluna Ações, adicionar modal |
| `app/routes/planos.tsx` | Opcional | Pode virar redirect ou ser removido |
| `app/routes.ts` | Opcional | Se remover rota /planos |

---

## Testes / Validação

- `npm run typecheck` — sem erros de tipo
- `npm run build` — build bem-sucedido
- Testar manualmente:
  - Tab Planos no admin: cards, modal, copiar
  - Tabela usuários: clique na linha abre modal
  - Modal de usuário: banir, desbanir, excluir com confirmação
  - Confirmações de exclusão com motivo obrigatório
  - Role change continua funcionando via select na tabela
