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
];
