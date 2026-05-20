# Dashboard Analítico + Busca por Placa

## 1. Contexto Atual

### Estrutura de Denúncias (`denuncias/` no Firebase RTDB)
```
denuncias/YYYY-MM-DDTHH-mm-ssZ
  ├── endereco: string
  ├── relato: string | Array<{texto, editadoEm}>
  ├── tipo: string (fina, ameaca, assedio, agressao-verbal, agressao-fisica,
  │              invasao-ciclovia, buraco-via, falta-sinalizacao, trecho-perigoso,
  │              ciclovia-obstruida, falta-iluminacao, veiculo-estacionado,
  │              ma-conservacao, falta-ciclovia, outro)
  ├── placa?: string (opcional)
  ├── localizacao: { lat, lng }
  ├── createdAt: string (ISO)
  ├── userId?: string
  └── username?: string
```

### Estrutura de Usuários (`usuarios/`)
```
usuarios/$uid
  ├── username: string
  ├── email: string
  ├── role: 'usuario' | 'moderador' | 'administrador'
  ├── createdAt: string (ISO)
  └── banido?: boolean
```

### Stack
- React 19 + React Router 7 (Remix-style) + Vite
- Firebase Realtime Database
- Leaflet / react-leaflet (já instalado)
- Tailwind CSS 4
- **Nenhuma lib de gráfico instalada** — será necessário instalar `recharts`

### Rotas existentes
```
/denunciar       → registro de denúncia
/mapa            → mapa com marcadores
/admin           → admin com tabs (atividade, usuarios, iniciativas, apoiadores, denuncias, contatos)
```

---

## 2. Feature A: Dashboard Analítico (/admin?tab=analytics)

### Objetivo
Criar uma tab no admin com visualizações de dados geográficos e temporais das denúncias, voltado para estudos territoriais e apoio acadêmico.

### Dependências
```bash
npm install recharts
```

### Novos arquivos
```
app/routes/admin-analytics.tsx   → componente da tab
```

### Arquivos modificados
```
app/routes/admin.tsx             → + import + tab render + sidebar button (ícone BarChart3)
app/routes.ts                    → (não precisa, é tab interna do admin)
```

### Gráficos e visuais propostos

#### A.1 — Série temporal de denúncias (linhas por tipo)
- Eixo X: tempo (dia/semana/mês)
- Eixo Y: contagem
- Uma linha colorida para cada `tipo` de denúncia
- **Filtros de período**: 30 dias, últimos 2 meses, 6 meses, 1 ano, mês atual, ano atual
- **Filtro de tipo**: ativar/desativar linhas individualmente (toggle legend)

#### A.2 — Novos usuários na plataforma
- Gráfico de barras: quantidade de novos `usuarios` por período
- Mesmos filtros de período (30d, 2m, 6m, 1a, mês atual, ano atual)
- Dados: contar `createdAt` de cada `usuarios/$uid`

#### A.3 — Ranking de regiões com mais denúncias
- Tabela rankeada: cidade/estado → total de denúncias
- Cada linha: nome da cidade/estado, contagem, **link para `/mapa` com filtro** (ex: `/mapa?cidade=Sao+Paulo` ou centralizar mapa naquela região)
- Extrair cidade do campo `endereco` (parse simples) ou agrupar por coordenadas via reverse geocoding

#### A.4 — Mapa de calor (Leaflet + Leaflet.heat)
- Usar `leaflet.heat` (plugin) para renderizar heatmap das denúncias
- Cores: azul (baixa) → verde → amarelo → vermelho (alta concentração)
- Mesmos filtros de período aplicados
- Link direto para o mapa interativo `/mapa`

#### A.5 — Cards de resumo (KPI)
- Total de denúncias no período
- Tipos mais frequentes (top 3)
- Média de denúncias por dia
- Estado com mais denúncias

### Filtros compartilhados
Todos os gráficos respondem aos mesmos filtros de período, posicionados no topo da página:
```tsx
const FILTROS = [
  { label: '30 dias', value: '30d' },
  { label: '2 meses', value: '2m' },
  { label: '6 meses', value: '6m' },
  { label: '1 ano', value: '1a' },
  { label: 'Mês atual', value: 'mes-atual' },
  { label: 'Ano atual', value: 'ano-atual' },
  { label: 'Todo período', value: 'all' },
];
```

### Firebase listener
Único `onValue(ref(db, "denuncias"))` + `onValue(ref(db, "usuarios"))` — todo o processamento é client-side (memória), ideal para o volume atual.

### Observação sobre horário
O campo `createdAt` já é ISO string. Para filtrar por período, comparar `new Date(d.createdAt) >= startDate`. Para agregar por mês/ano, extrair mês/ano da data.

---

## 3. Feature B: Busca por Placa (/admin?tab=busca-placa)

### Objetivo
Permitir pesquisar uma placa de veículo e visualizar todas as denúncias associadas a ela, com localização no mapa.

### Novos arquivos
```
app/routes/admin-busca-placa.tsx   → componente da tab
```

### Arquivos modificados
```
app/routes/admin.tsx               → + import + tab (somente admin/moderador) + sidebar
```

### Interface
- Campo de busca com auto-formatação (ABC-1234)
- Mapa Leaflet com marcadores das denúncias encontradas para aquela placa
- Lista de resultados com: data, tipo, endereço, relato, username
- Cards expansíveis com detalhes completos
- Link para visualizar no mapa maior (`/mapa`)

### Firebase query
Como Firebase RTDB não suporta queries por campo filho em nós sem `.indexOn`, a abordagem é:
1. Carregar todas as denúncias uma vez (`onValue(ref(db, "denuncias"))`)
2. Filtrar client-side por `denuncia.placa === placaBuscada`
3. Usar `.indexOn: ["placa"]` nas rules para otimizar futuramente

### Validação de placa
- Formato Mercosul: `ABC1D23` ou `ABC-1D23`
- Formato antigo: `ABC-1234` ou `ABC1234`
- Normalizar (remover traços, uppercase) antes de buscar
- Tanto faz o usuário digitar com ou sem traço

### Firebase Rules update
Adicionar `.indexOn: ["placa"]` no nó `denuncias` para performance.

---

## 4. Feature C: Boas Práticas de Denúncia (documento)

### Objetivo
Criar/atualizar documento de boas práticas para registro de denúncia, destacando a importância do horário, local exato, placa, fotos e relato detalhado.

### Arquivos modificados
```
app/routes/denunciar.tsx                  → + link/aviso sobre boas práticas
app/routes/termo-responsabilidade-usuario.tsx → + link para o documento de boas práticas
```

### Conteúdo sugerido
- Informe o **horário aproximado** do ocorrido (fundamental para comprovação via câmeras)
- Seja preciso no **endereço** ou use o mapa para marcar o local exato
- Inclua a **placa** do veículo sempre que possível
- Descreva o ocorrido com detalhes (direção, velocidade, testemunhas)
- Se tiver fotos ou vídeos, guarde para futuro compartilhamento com autoridades
- A precisão dos dados fortalece a credibilidade da plataforma e pode subsidiar políticas públicas

---

## 5. Resumo de Arquivos

| Arquivo | Ação | Feature |
|---------|------|---------|
| `app/routes/admin-analytics.tsx` | Criar | A |
| `app/routes/admin-busca-placa.tsx` | Criar | B |
| `app/routes/admin.tsx` | Modificar (2 novas tabs) | A, B |
| `app/routes/denunciar.tsx` | Modificar (link boas práticas) | C |
| `app/routes/termo-responsabilidade-usuario.tsx` | Modificar (link boas práticas) | C |
| `package.json` | Adicionar `recharts`, `leaflet.heat` (@types) | A |
| Firebase Rules | Adicionar `.indexOn: ["placa"]` | B |

---

## 6. Validação / Testes

- `npx tsc --noEmit` — sem erros de tipo
- `npx vite build` — build bem-sucedido
- Verificar visualmente cada gráfico com dados reais do Firebase
- Testar busca de placa com casos: com traço, sem traço, uppercase, lowercase
- Verificar heatmap no Leaflet

---

## 7. Riscos e Tradeoffs

| Risco | Mitigação |
|-------|-----------|
| `leaflet.heat` pode não ter tipos TS | Usar `@types/leaflet.heat` ou `// @ts-ignore` |
| Grande volume de denúncias no client-side | Firebase RTDB escuta com `onValue`; filtrar client-side é OK para ~10k registros. Acima disso, considerar migração para Firestore com queries nativas |
| Recharts adiciona ~30KB ao bundle | Tree-shaking do recharts; lazy-load via `React.lazy` |
| Privacidade: busca por placa expõe dados de veículos | Apenas admin/moderador podem acessar a tab de busca (protegido no admin.tsx) |
| Dados de localização no heatmap | Heatmap usa coordenadas lat/lng; sem exposição de endereço completo |

---

## 8. Ordem de Implementação Sugerida

1. Instalar dependências (`recharts`, `leaflet.heat`)
2. Criar tab `admin-analytics.tsx` com filtros de período e gráficos
3. Adicionar tab no `admin.tsx` (sidebar + render)
4. Criar tab `admin-busca-placa.tsx`
5. Adicionar tab no `admin.tsx`
6. Atualizar Firebase Rules (`.indexOn: ["placa"]`)
7. Adicionar documento de boas práticas no formulário de denúncia
8. Linkar boas práticas no termo de responsabilidade do usuário
