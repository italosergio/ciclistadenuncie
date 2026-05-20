# Plano A — Dashboard Analítico de Denúncias

## Objetivo
Criar tab no admin com visualizações de dados para estudos territoriais e pesquisa acadêmica.

## Stack
- `recharts` para gráficos (instalar via npm)
- `leaflet.heat` para mapa de calor

## Novos arquivos
```
app/routes/admin-analytics.tsx
```

## Arquivos modificados
```
app/routes/admin.tsx          → + import + sidebar (BarChart3) + tab render
package.json                  → + recharts, leaflet.heat, @types/leaflet.heat
```

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
- Quantidade de novos `usuarios` por período
- Mesmos filtros de período

### Ranking de regiões
- Tabela: cidade/estado → total
- Cada linha com link para `/mapa` naquela região

### Mapa de calor
- Leaflet com plugin heatmap
- Pontos baseados nas coordenadas das denúncias filtradas

## Firebase
- `onValue(ref(db, "denuncias"))` + `onValue(ref(db, "usuarios"))`
- Processamento client-side
