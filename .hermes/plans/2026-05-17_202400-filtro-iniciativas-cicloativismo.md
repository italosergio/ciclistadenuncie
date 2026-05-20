# Plano: Iniciativas Cicloativistas no Mapa

## Objetivo

Adicionar as **Iniciativas Cicloativistas** (cadastradas no admin) como markers no mapa, com filtro para visualização e contagem por estado/cidade/região.

## O que já existe

- `app/routes/admin-iniciativas.tsx` — CRUD completo (nome, URL, descrição) salvando em `/iniciativas` no Firebase
- `admin.tsx` — já importa e renderiza a aba Iniciativas na sidebar
- `mapa.tsx` — já carrega denúncias e renderiza markers no Leaflet

## O que precisa ser feito

### 1. Admin — Adicionar localização no formulário

Arquivo: `app/routes/admin-iniciativas.tsx`

- Adicionar campo de **endereço** (input de texto com busca via Nominatim)
- Adicionar **mini-mapa Leaflet** pra clicar e marcar o ponto exato
- Salvar `localizacao: { lat, lng }` e `endereco: string` no Firebase
- Interface `Iniciativa` atualizada com campos de localização

### 2. Mapa — Carregar e renderizar iniciativas

Arquivo: `app/routes/mapa.tsx`

- Novo estado: `iniciativas: Iniciativa[]`
- `useEffect` escutando `ref(db, "iniciativas")` com `onValue`
- Filtrar apenas iniciativas com `localizacao`
- Renderizar markers com **ícone diferenciado** (ex: verde/azul, ícone de bike/globe)
- Popup com: nome, descrição, URL linkável, endereço, data

### 3. Mapa — Filtro toggle

Arquivo: `app/routes/mapa.tsx`

- Novo estado: `mostrarIniciativas: boolean` (default: true)
- Toggle/checkbox na UI dos filtros: "Mostrar Iniciativas Cicloativistas"
- Controlar visibilidade dos markers

### 4. Mapa — Contagem separada

- Contar iniciativas visíveis no viewport atual (separado das denúncias)
- Exibir no header: "X denúncias | Y iniciativas" ou similar

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `app/routes/admin-iniciativas.tsx` | Adicionar localização (input endereço + mini-mapa) |
| `app/routes/mapa.tsx` | Carregar, renderizar, filtrar e contar iniciativas |

## Fluxo

1. Admin cria iniciativa com localização (endereço + clique no mapa)
2. Firebase salva em `/iniciativas/{id}` com localizacao
3. Mapa carrega todas as iniciativas com localizacao
4. Usuário vê markers no mapa + pode ativar/desativar o filtro
5. Contagem de iniciativas visíveis no viewport
