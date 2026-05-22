export interface Plano {
  id: string;
  titulo: string;
  data: string;
  resumo: string;
  conteudo: string;
  categoria: "analytics" | "placa" | "boas-praticas" | "pagina";
}

const planA = `# Plano A — Dashboard Analítico de Denúncias

## Objetivo
Criar tab no admin com visualizações de dados para estudos territoriais e pesquisa acadêmica.

## Stack
- \`recharts\` para gráficos (instalar via npm)
- \`leaflet.heat\` para mapa de calor

## Novos arquivos
\`\`\`
app/routes/admin-analytics.tsx
\`\`\`

## Arquivos modificados
\`\`\`
app/routes/admin.tsx          → + import + sidebar (BarChart3) + tab render
package.json                  → + recharts, leaflet.heat, @types/leaflet.heat
\`\`\`

## Conteúdo da tab

### Filtros de período (topo, compartilhados)
30d | 2m | 6m | 1a | Mês atual | Ano atual | Todo período

### Cards KPI
- Total de denúncias no período
- Top 3 tipos mais frequentes
- Média de denúncias/dia
- Estado com mais registros

### Gráfico 1 — Série temporal (Recharts LineChart)
- Eixo X: tempo (dia/mês)
- Eixo Y: contagem
- Uma linha colorida por tipo de denúncia
- Legend clicável para ativar/desativar linhas

### Gráfico 2 — Novos usuários (BarChart)
- Quantidade de novos \`usuarios\` por período
- Mesmos filtros de período

### Ranking de regiões
- Tabela: cidade/estado → total
- Cada linha com link para \`/mapa\` naquela região

### Mapa de calor
- Leaflet com plugin heatmap
- Pontos baseados nas coordenadas das denúncias filtradas

## Firebase
- \`onValue(ref(db, "denuncias"))\` + \`onValue(ref(db, "usuarios"))\`
- Processamento client-side`;

const planB = `# Plano B — Busca por Placa de Veículo

## Objetivo
Permitir que admin/moderador pesquise uma placa e veja todas as denúncias associadas, com localização no mapa.

## Contexto
Denúncias já armazenam \`placa?: string\` opcional. Dados em \`denuncias/\` no Firebase RTDB.

## Novos arquivos
\`\`\`
app/routes/admin-busca-placa.tsx
\`\`\`

## Arquivos modificados
\`\`\`
app/routes/admin.tsx   → + import + sidebar + tab render (admin/moderador)
Firebase Rules         → + .indexOn: ["placa"] no nó denuncias
\`\`\`

## Interface

### Campo de busca
- Input com auto-formatação: \`ABC-1234\`
- Normalizar: remover traços, uppercase
- Validar formato Mercosul (\`ABC1D23\`) ou antigo (\`ABC-1234\`)

### Resultados
- Lista de cards: data, tipo, endereço, relato, username
- Mapa Leaflet com marcador(es) da(s) denúncia(s) da placa
- Card expansível com detalhes completos
- Link "Ver no mapa" → \`/mapa\`

### Firebase query (client-side)
\`\`\`ts
const denunciasComPlaca = allDenuncias.filter(d => 
  d.placa && normalizar(d.placa) === normalizar(placaBuscada)
);
\`\`\`

## Regras de acesso
- Tab visível apenas para \`administrador\` e \`moderador\`
- Protegido pelo \`admin.tsx\` (já existente)

## Observações de privacidade
- Futuramente: notificar motorista via email se houver denúncia na placa dele
- Dados abertos para consulta pública podem ser considerados pela comunidade`;

const planC = `# Plano C — Boas Práticas de Denúncia

## Objetivo
Criar documento de boas práticas para registro de denúncia, com ênfase na importância do horário do ocorrido para comprovação futura via câmeras/testemunhas.

## Justificativa
Denúncias precisas (horário, local, placa) são fundamentais para:
- Comprovação via imagens de câmeras de segurança
- Validação cruzada por testemunhas
- Credibilidade da plataforma perante poder público e academia
- Futuras punições formais (multas, pontos na carteira)

## Conteúdo do documento

### Informações essenciais ao denunciar
1. **Horário aproximado** — fundamental para cruzar com câmeras
2. **Endereço exato** — usar o mapa para marcar o ponto
3. **Placa do veículo** — sempre que possível
4. **Descrição detalhada** — direção, velocidade, testemunhas
5. **Fotos/vídeos** — guardar para futuro compartilhamento

### O que NÃO fazer
- Denúncias anônimas sem localização precisa
- Múltiplas denúncias da mesma ocorrência
- Denúncias falsas ou maliciosas (sujeito a banimento)

## Arquivos modificados
\`\`\`
app/routes/denunciar.tsx                        → aviso/link "Boas Práticas" no formulário
app/routes/termo-responsabilidade-usuario.tsx   → link para o documento
\`\`\`

## Observação técnica
O campo \`createdAt\` já existe. Para registrar o **horário do ocorrido** (que pode ser diferente do momento do registro), adicionar campo \`horarioOcorrido?: string\` no formulário de denúncia e no schema salvo.`;

const planD = `# Plano D — Página /planos

## Objetivo
Criar uma página pública \`/planos\` que lista todos os planos do projeto salvos em \`plans/\` (raiz do projeto), exibindo cards com resumo e modal com conteúdo completo e botão copiar.

## Local dos planos
\`\`\`
/home/italo/Projetos/ciclistadenuncie/plans/
  ├── plan-a-dashboard-analitico.md
  ├── plan-b-busca-placa.md
  ├── plan-c-boas-praticas.md
  └── plan-d-pagina-planos.md
\`\`\`

## Novos arquivos
\`\`\`
app/routes/planos.tsx      → página /planos (cards + modal)
app/data/planos.ts         → dados estruturados (título, id, data, resumo, conteúdo)
\`\`\`

## Arquivos modificados
\`\`\`
app/routes.ts              → + route("planos", "routes/planos.tsx")
\`\`\`

## Interface

### Lista de cards
- Grid responsivo: 1 col (mobile), 2 (tablet), 3 (desktop)
- Cada card: título, data, ID, resumo (2 linhas max)
- Ícone por categoria usando lucide-react

### Modal
- Fundo escuro fosco (\`bg-black/60 backdrop-blur-sm\`)
- Título + data + ID no topo
- Corpo com markdown formatado
- Botão **Copiar texto** → \`navigator.clipboard.writeText(conteudo)\`
- Botão **Fechar** (ícone X ou fundo clicável)

## Rota
\`\`\`ts
// app/routes.ts
route("planos", "routes/planos.tsx"),
\`\`\``;

const planE = `# Redesign do Painel Admin Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. Não subir para \`main\` no final; deixar somente alterações locais para aprovação visual do Ítalo.

**Goal:** Modernizar a página de administração (\`/admin\`) com cards menores, mais bonitos, intuitivos e coerentes com a tipologia atual do projeto.

**Architecture:** A melhoria deve ser principalmente visual e incremental, preservando dados, filtros, abas, permissões e ações existentes. O plano propõe criar pequenos helpers/classes reutilizáveis dentro das rotas admin para evitar repetição, reduzir tamanho de fonte, modernizar cards/tabelas e manter a identidade visual escura com destaque azul/verde/roxo.

**Tech Stack:** React 19, React Router 7, TypeScript, Tailwind CSS v4, Firebase Realtime Database, lucide-react.

---

## Contexto atual

Arquivos inspecionados:
- \`app/routes/admin.tsx\`
- \`app/routes/admin-historico.tsx\`
- \`app/routes/admin-usuarios.tsx\`
- \`app/app.css\`

Tipologia atual:
- \`app/app.css\` define \`--font-sans: "Bungee"\` e \`--font-raleway: "Raleway"\`.
- O \`body\` usa \`font-sans\`, então a interface inteira tende a herdar Bungee, que é forte para títulos/logotipo, mas pesada para tabelas, listas e textos administrativos.

Problemas visuais percebidos:
- Títulos grandes demais (\`text-3xl\`, \`text-2xl\`) para uma área administrativa densa.
- Cards usam muito \`p-6\`/\`p-8\`, deixando a tela espaçosa demais e menos eficiente.
- Cards/tabelas são funcionais, mas com aparência antiga: \`bg-gray-800\`, borda simples, sombra genérica.
- A sidebar repete classes em todos os botões e poderia ganhar hierarquia visual mais clara.
- As abas internas têm estilos diferentes entre si: histórico, usuários, denúncias e contatos não compartilham o mesmo padrão de container/header/card.
- Há classes como \`hover:bg-gray-750\`, que não parecem padrão do Tailwind e podem não gerar efeito.

## Direção visual proposta

### 1. Manter identidade escura, mas mais moderna

Usar uma base visual consistente:
- Fundo geral: \`bg-slate-950\` ou \`bg-gray-950\`.
- Sidebar/card: \`bg-slate-900/80\`, \`bg-gray-900/80\`.
- Bordas: \`border-white/10\`, \`border-slate-800\`.
- Hover: \`hover:bg-white/5\` ou \`hover:border-blue-500/40\`.
- Sombras suaves: \`shadow-xl shadow-black/20\`.
- Destaques: azul para navegação, verde para sucesso/resolvido, amarelo para pendente, vermelho para perigo, roxo para administrador.

### 2. Seguir a tipologia, sem deixar a área admin pesada

Proposta:
- Usar Bungee apenas em títulos curtos e elementos de marca: \`font-bungee\`.
- Usar Raleway nos textos administrativos, tabelas, filtros, botões e cards: \`font-raleway\`.
- Reduzir títulos:
  - H1 da sidebar: \`text-xl\` ou \`text-lg\` em vez de \`text-2xl\`.
  - H2 das abas: \`text-xl md:text-2xl\` em vez de \`text-3xl\`.
  - Textos de cards: \`text-xs\`/\`text-sm\`, com \`leading-relaxed\`.

### 3. Cards menores e mais informativos

Padrão de card recomendado:
\`\`\`tsx
className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur transition hover:border-blue-500/30 hover:bg-slate-900"
\`\`\`

Para cards de lista densa:
\`\`\`tsx
className="rounded-xl border border-white/10 bg-slate-900/70 p-3 transition hover:bg-white/[0.04]"
\`\`\`

### 4. Melhorar intuitividade

- Criar cabeçalhos de seção com título, descrição curta e contagem.
- Deixar filtros em card compacto com label menor e inputs de altura consistente.
- Usar badges/status chips consistentes.
- Transformar ações soltas em botões pequenos com ícone e cor semântica.
- Padronizar estados vazios com ícone, título curto e mensagem clara.

---

## Restrições obrigatórias

- Não fazer push para \`main\` ao final da implementação.
- Não alterar regras de negócio, permissões, filtros, Firebase paths ou eventos do histórico.
- Não remover funcionalidades existentes.
- Não mexer nos arquivos não rastreados atuais:
  - \`firebase-debug.log\`
  - \`s3cr3t_users.csv\`
- Evitar bibliotecas novas; usar Tailwind e lucide-react já existentes.
- Validar com \`npm run typecheck\` e \`npm run build\`.

---

## Plano passo a passo

### Task 1: Criar base visual reutilizável no \`admin.tsx\`

**Objective:** Reduzir repetição de classes e estabelecer o estilo moderno para sidebar, botões, cards e títulos.

**Files:**
- Modify: \`app/routes/admin.tsx\`

**Steps:**
1. No topo do arquivo, após imports, criar constantes de classe para navegação e cards:
   - \`adminShellClass\`
   - \`sidebarClass\`
   - \`navButtonBaseClass\`
   - \`navButtonActiveClass\`
   - \`navButtonIdleClass\`
   - \`sectionShellClass\`
   - \`panelCardClass\`
   - \`tableShellClass\`
   - \`fieldClass\`
2. Aplicar somente onde o próprio \`admin.tsx\` já renderiza layout principal, sidebar, \`DenunciasTab\` e \`ContatosTab\`.
3. Não alterar lógica de \`tab\`, \`setSearchParams\`, \`navigate\`, \`handleLogout\`.

**Suggested code pattern:**
\`\`\`tsx
const adminShellClass = "min-h-screen flex bg-slate-950 text-slate-100 font-raleway";
const sidebarClass = "w-64 bg-slate-950/95 border-r border-white/10 flex flex-col fixed md:sticky top-0 h-screen z-50 transition-transform shadow-2xl shadow-black/30";
const navButtonBaseClass = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition whitespace-nowrap text-xs font-semibold tracking-wide";
const navButtonActiveClass = "bg-blue-600 text-white shadow-lg shadow-blue-950/40";
const navButtonIdleClass = "text-slate-300 hover:bg-white/5 hover:text-white";
const sectionShellClass = "p-4 md:p-6 lg:p-8 space-y-5";
const panelCardClass = "rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur";
const tableShellClass = "rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 overflow-hidden";
const fieldClass = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
\`\`\`

**Validation:**
- Abrir diff e confirmar que a task alterou apenas classes/markup visual, sem mexer nas funções.

---

### Task 2: Modernizar sidebar e header do painel

**Objective:** Tornar a navegação mais compacta, bonita e intuitiva.

**Files:**
- Modify: \`app/routes/admin.tsx:51-240\`

**Steps:**
1. Trocar o container principal para usar \`adminShellClass\`.
2. Aplicar \`sidebarClass\` no \`<aside>\`.
3. Reduzir padding do topo da sidebar de \`p-6\` para \`p-4\`.
4. Alterar o título \`Admin\` para \`Painel Admin\` com:
   - \`font-bungee\`
   - \`text-lg\`
   - \`tracking-wide\`
5. Exibir username com \`font-raleway text-xs text-slate-400\`.
6. Padronizar o badge de role com pill moderno:
   - administrador: \`bg-purple-500/15 text-purple-200 border border-purple-400/20\`
   - moderador/usuário: \`bg-slate-700/60 text-slate-200 border border-white/10\`
7. Substituir todos os botões de navegação para usar \`navButtonBaseClass + active/idle\`.
8. Reduzir ícones da sidebar para \`size={16}\` ou \`size={17}\`.
9. Melhorar botão mobile de menu com borda e blur:
   - \`bg-slate-900/90 border border-white/10 backdrop-blur\`.

**Validation:**
- Sidebar deve ficar mais compacta.
- Estado ativo deve continuar evidente.
- Todos os links/tabs devem continuar funcionando.

---

### Task 3: Padronizar cabeçalhos de seção

**Objective:** Cada aba deve ter título menor, descrição curta e contagem visível sem poluição.

**Files:**
- Modify: \`app/routes/admin.tsx\`
- Modify: \`app/routes/admin-historico.tsx\`
- Modify: \`app/routes/admin-usuarios.tsx\`
- Opcional: \`app/routes/admin-iniciativas.tsx\`
- Opcional: \`app/routes/admin-apoiadores.tsx\`

**Steps:**
1. Em cada aba, substituir \`h2 text-3xl\` por header compacto:
\`\`\`tsx
<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
    <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">Título</h2>
    <p className="mt-1 text-xs md:text-sm text-slate-400">Descrição curta da seção.</p>
  </div>
  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">N itens</span>
</div>
\`\`\`
2. Manter os nomes das abas, mas melhorar descrições:
   - Atividade: "Acompanhe ações recentes e eventos de moderação."
   - Usuários: "Gerencie permissões, status e contas cadastradas."
   - Denúncias: "Revise denúncias registradas e ações sensíveis."
   - Contatos: "Organize mensagens recebidas e pendências."
3. Estados loading/error também devem usar título menor e card moderno.

**Validation:**
- Títulos devem ficar menores e coerentes com a tipologia.
- Não deve haver \`text-3xl\` nas abas admin principais, salvo se conscientemente mantido em outra área fora do painel.

---

### Task 4: Redesign da aba Denúncias

**Objective:** Melhorar tabela/lista de denúncias com visual mais moderno e compacto.

**Files:**
- Modify: \`app/routes/admin.tsx:244-378\`

**Steps:**
1. Trocar container externo de \`p-8\` para \`sectionShellClass\` ou classes equivalentes.
2. Trocar o card da tabela para \`tableShellClass\`.
3. Modernizar \`<thead>\`:
   - \`bg-white/5\`
   - \`text-[11px] uppercase tracking-wide text-slate-400\`
4. Reduzir padding das células:
   - \`px-3 py-2.5\` em vez de \`px-4 py-3\`.
5. Usar \`text-xs\`/\`text-sm\` em células, priorizando legibilidade.
6. Melhorar botão \`Excluir\` para botão pequeno com borda vermelha:
\`\`\`tsx
className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
\`\`\`
7. Modernizar painel de confirmação de exclusão com fundo \`bg-red-950/30\`, borda \`border-red-500/30\` e textarea com \`fieldClass\`.
8. Corrigir \`hover:bg-gray-750\` para \`hover:bg-white/[0.04]\`.

**Validation:**
- Denúncias continuam ordenadas por data.
- Confirmar exclusão continua exigindo motivo.
- Visual deve caber mais informação na tela sem ficar espremido.

---

### Task 5: Redesign da aba Contatos Recebidos

**Objective:** Tornar filtros e cards de contato mais compactos, claros e modernos.

**Files:**
- Modify: \`app/routes/admin.tsx:380-853\`

**Steps:**
1. Trocar container externo para \`sectionShellClass\`.
2. Modernizar card de filtros:
   - \`panelCardClass\`
   - labels \`text-[11px] uppercase tracking-wide text-slate-400\`
   - inputs/selects com \`fieldClass\`
3. Reduzir espaçamentos do grid de filtros: \`gap-3\` em vez de \`gap-4\`.
4. Reduzir padding dos cards de contato de \`p-6\` para \`p-4\`.
5. Trocar \`border-2\` por \`border\` e indicar status com barra lateral ou ring suave:
   - pinada/pendente: \`border-yellow-400/40 ring-1 ring-yellow-400/10\`
   - resolvido: \`border-green-400/30 ring-1 ring-green-400/10\`
   - não lida: \`border-blue-400/40 ring-1 ring-blue-400/10\`
6. Reduzir título do contato de \`text-lg sm:text-xl\` para \`text-sm md:text-base\`.
7. Melhorar status badge com padrão pill:
\`\`\`tsx
className="rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
\`\`\`
8. Tornar a mensagem clicável mais moderna:
   - \`bg-slate-950/70\`
   - \`border border-white/10\`
   - \`hover:bg-white/[0.04]\`
9. Trocar ações de texto sublinhado por botões pequenos com ícone.
10. Manter comportamento de expandir, marcar como lida, responder, resolver e pendente.

**Validation:**
- Busca e filtros continuam funcionando.
- Expandir contato continua marcando como lida.
- Resposta e status continuam registrando evento no histórico.

---

### Task 6: Redesign da aba Usuários

**Objective:** Modernizar tabela de usuários, reduzir tamanho das letras e melhorar leitura de permissões/status.

**Files:**
- Modify: \`app/routes/admin-usuarios.tsx\`

**Steps:**
1. Aplicar base visual local semelhante:
   - \`sectionShellClass\`
   - \`tableShellClass\`
   - \`fieldClass\`
2. Reduzir títulos de \`text-3xl\` para \`font-bungee text-xl md:text-2xl\`.
3. Reduzir headers da tabela para \`text-[11px] uppercase tracking-wide\`.
4. Reduzir células de \`px-6 py-4\` para \`px-3 md:px-4 py-2.5\`.
5. Melhorar badge de role:
   - Administrador roxo suave.
   - Moderador azul suave.
   - Usuário verde suave.
6. Melhorar badge \`BANIDO\` para pill vermelho com borda.
7. Ações perigosas devem ter visual claro, mas compacto:
   - Banir/excluir: vermelho suave.
   - Desbanir: verde suave.
8. Se a tabela ficar larga no mobile, envolver com \`overflow-x-auto\` sem quebrar layout.

**Validation:**
- Troca de role continua funcionando.
- Banir/desbanir/excluir continuam registrando histórico.
- Usuário atual e administradores continuam protegidos conforme lógica existente.

---

### Task 7: Redesign da aba Histórico/Atividade

**Objective:** Deixar o histórico mais legível e menos pesado visualmente.

**Files:**
- Modify: \`app/routes/admin-historico.tsx\`

**Steps:**
1. Aplicar header compacto da Task 3.
2. Modernizar filtros e tabs internos usando cards compactos.
3. Reduzir tamanho dos eventos para \`text-sm\` e detalhes para \`text-xs\`.
4. Usar cards/list items com:
   - \`rounded-xl\`
   - \`border border-white/10\`
   - \`bg-slate-900/70\`
   - \`hover:bg-white/[0.04]\`
5. Manter paginação, filtros por tipo/data/busca e expansão de detalhes.
6. Melhorar badges de role para o mesmo padrão da aba usuários.

**Validation:**
- Busca fuzzy continua funcionando.
- Expansão de detalhes continua funcionando.
- Paginação continua funcionando.

---

### Task 8: Revisar abas complementares admin

**Objective:** Garantir consistência visual em Iniciativas e Apoiadores se fizerem parte do mesmo painel.

**Files:**
- Inspect/Modify: \`app/routes/admin-iniciativas.tsx\`
- Inspect/Modify: \`app/routes/admin-apoiadores.tsx\`

**Steps:**
1. Inspecionar os dois arquivos antes de alterar.
2. Aplicar apenas ajustes visuais equivalentes:
   - Título menor.
   - Cards compactos.
   - Inputs/selects/botões consistentes.
   - Estados vazios modernos.
3. Não alterar dados, importações Firebase ou funções de CRUD além de classes CSS.

**Validation:**
- CRUD de iniciativas/apoiadores continua funcionando.
- Visual fica coerente com as demais abas.

---

### Task 9: Verificação visual local sem push

**Objective:** Validar que o redesign compila e fica pronto para aprovação, sem enviar para o GitHub.

**Files:**
- No file changes expected beyond previous tasks.

**Steps:**
1. Rodar typecheck:
\`\`\`bash
npm run typecheck
\`\`\`
Expected: exit code 0.

2. Rodar build:
\`\`\`bash
npm run build
\`\`\`
Expected: exit code 0. Warnings existentes de CSS/import dinâmico podem aparecer, mas não devem ser causados pelo redesign.

3. Se precisar validar no navegador:
\`\`\`bash
npm run dev
\`\`\`
Abrir \`/admin\` e revisar:
- Sidebar.
- Atividade.
- Usuários.
- Iniciativas.
- Apoiadores.
- Denúncias.
- Contatos.

4. Conferir diff:
\`\`\`bash
git diff -- app/routes/admin.tsx app/routes/admin-historico.tsx app/routes/admin-usuarios.tsx app/routes/admin-iniciativas.tsx app/routes/admin-apoiadores.tsx
\`\`\`

5. Conferir status:
\`\`\`bash
git status --short
\`\`\`
Expected:
- Arquivos modificados do redesign.
- Podem continuar aparecendo os não rastreados preexistentes \`firebase-debug.log\` e \`s3cr3t_users.csv\`; não adicionar.

6. Não executar:
\`\`\`bash
git push
\`\`\`

**Validation:**
- O painel está visualmente aprovado localmente antes de qualquer push.

---

## Critérios de aceitação

- Página \`/admin\` com aparência mais moderna e compacta.
- Letras menores e mais adequadas para painel administrativo.
- Bungee preservada em títulos/marca; Raleway usada para leitura e interface.
- Cards com bordas/sombras/hover mais modernos.
- Filtros, tabelas e ações mais intuitivos.
- Todas as ações atuais continuam funcionando.
- \`npm run typecheck\` passa.
- \`npm run build\` passa.
- Nenhum push feito ao final.

---

## Riscos e tradeoffs

- \`font-raleway\` depende do import atual em \`app/app.css\`; o build já mostra warning de ordem do \`@import\`. Este plano não precisa corrigir isso, mas se o redesign depender muito da fonte, pode ser bom corrigir em plano separado.
- Alterações grandes de classe podem gerar regressões visuais em mobile; testar em largura pequena é obrigatório.
- Evitar transformar tabela em cards mobile nesta primeira rodada para reduzir risco e tempo; modernizar tabela com \`overflow-x-auto\` já melhora sem mudar a estrutura.
- Se o painel estiver usando dados reais, não testar ações destrutivas como excluir usuário/denúncia; validar apenas aparência e ausência de erros de build.

---

## Ordem sugerida de implementação

1. \`app/routes/admin.tsx\` layout/sidebar/helpers.
2. \`DenunciasTab\` em \`app/routes/admin.tsx\`.
3. \`ContatosTab\` em \`app/routes/admin.tsx\`.
4. \`app/routes/admin-usuarios.tsx\`.
5. \`app/routes/admin-historico.tsx\`.
6. \`app/routes/admin-iniciativas.tsx\` e \`app/routes/admin-apoiadores.tsx\`, se necessário.
7. Typecheck/build.
8. Revisão visual local com Ítalo.
9. Só depois da aprovação: commit/push, se solicitado.
`;

export const PLANOS: Plano[] = [
  {
    id: "plan-a-dashboard-analitico",
    titulo: "Plano A — Dashboard Analítico de Denúncias",
    data: "2026-05-20",
    resumo: "Criar tab no admin com visualizações de dados para estudos territoriais e pesquisa acadêmica: gráficos de série temporal, heatmap, ranking regional, KPIs.",
    conteudo: planA,
    categoria: "analytics",
  },
  {
    id: "plan-b-busca-placa",
    titulo: "Plano B — Busca por Placa de Veículo",
    data: "2026-05-20",
    resumo: "Permitir que admin/moderador pesquise uma placa e veja todas as denúncias associadas, com localização no mapa.",
    conteudo: planB,
    categoria: "placa",
  },
  {
    id: "plan-c-boas-praticas",
    titulo: "Plano C — Boas Práticas de Denúncia",
    data: "2026-05-20",
    resumo: "Documento de boas práticas para registro de denúncia com ênfase no horário do ocorrido para comprovação futura via câmeras.",
    conteudo: planC,
    categoria: "boas-praticas",
  },
  {
    id: "plan-d-pagina-planos",
    titulo: "Plano D — Página /planos",
    data: "2026-05-20",
    resumo: "Página pública que lista todos os planos do projeto com cards, modal de detalhes e botão copiar.",
    conteudo: planD,
    categoria: "pagina",
  },
  {
    id: "plan-e-redesign-painel-admin",
    titulo: "Plano E — Redesign do Painel Admin",
    data: "2026-05-21",
    resumo: "Modernizar o painel /admin com cards menores, tipologia mais legível, sidebar compacta, tabelas e filtros mais intuitivos, sem subir para main antes de aprovação.",
    conteudo: planE,
    categoria: "pagina",
  },
];
