# Plano D — Página /planos

## Objetivo
Criar uma página pública `/planos` que lista todos os planos do projeto salvos em `plans/` (raiz do projeto), exibindo cards com resumo e modal com conteúdo completo e botão copiar.

## Local dos planos
```
/home/italo/Projetos/ciclistadenuncie/plans/
  ├── plan-a-dashboard-analitico.md
  ├── plan-b-busca-placa.md
  ├── plan-c-boas-praticas.md
  └── plan-d-pagina-planos.md
```

## Novos arquivos
```
app/routes/planos.tsx      → página /planos (cards + modal)
app/data/planos.ts         → dados estruturados (título, id, data, resumo, conteúdo)
```

## Arquivos modificados
```
app/routes.ts              → + route("planos", "routes/planos.tsx")
```

## Abordagem técnica

App é client-side (Firebase Hosting / Vite). Para exibir os planos:

### app/data/planos.ts
Array com os 4 planos:
```ts
export interface Plano {
  id: string;
  titulo: string;
  data: string;
  resumo: string;
  conteudo: string;   // markdown puro
}

export const PLANOS: Plano[] = [
  {
    id: "plan-a-dashboard-analitico",
    titulo: "Plano A — Dashboard Analítico de Denúncias",
    data: "2026-05-20",
    resumo: "Criar tab no admin com visualizações...",
    conteudo: "# Plano A — Dashboard Analítico...\n\n## Objetivo...",
  },
  // ... B, C, D
];
```

Manter sincronizado com os arquivos `.md` em `plans/`.

## Interface

### Lista de cards
- Grid responsivo: 1 col (mobile), 2 (tablet), 3 (desktop)
- Cada card: título, data, ID (ex: `plan-a`), resumo (2 linhas max)
- Ícone por categoria usando lucide-react

### Modal
- Fundo escuro fosco (`bg-black/60 backdrop-blur-sm`)
- Título + data + ID no topo
- Corpo com markdown renderizado
- Botão **Copiar texto** → `navigator.clipboard.writeText(conteudo)`
- Botão **Fechar** (ícone X ou fundo clicável)

### Renderização do markdown
Opções:
1. `<pre className="whitespace-pre-wrap font-mono text-sm">` — simples, sem dep
2. `react-markdown` — renderiza headings, links, listas (recomendado)

## Rota
```ts
// app/routes.ts
route("planos", "routes/planos.tsx"),
```

## Implementação
1. Criar `app/data/planos.ts` com os 4 planos
2. Criar `app/routes/planos.tsx`
3. Adicionar rota
4. `npx tsc --noEmit`
5. Commit e push
