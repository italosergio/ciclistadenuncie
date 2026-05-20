# Plano B — Busca por Placa de Veículo

## Objetivo
Permitir que admin/moderador pesquise uma placa e veja todas as denúncias associadas, com localização no mapa.

## Contexto
Denúncias já armazenam `placa?: string` opcional. Dados em `denuncias/` no Firebase RTDB.

## Novos arquivos
```
app/routes/admin-busca-placa.tsx
```

## Arquivos modificados
```
app/routes/admin.tsx   → + import + sidebar + tab render (admin/moderador)
Firebase Rules         → + .indexOn: ["placa"] no nó denuncias
```

## Interface

### Campo de busca
- Input com auto-formatação: `ABC-1234`
- Normalizar: remover traços, uppercase
- Validar formato Mercosul (`ABC1D23`) ou antigo (`ABC-1234`)

### Resultados
- Lista de cards: data, tipo, endereço, relato, username
- Mapa Leaflet com marcador(es) da(s) denúncia(s) da placa
- Card expansível com detalhes completos
- Link "Ver no mapa" → `/mapa`

### Firebase query (client-side)
```ts
const denunciasComPlaca = allDenuncias.filter(d => 
  d.placa && normalizar(d.placa) === normalizar(placaBuscada)
);
```

## Regras de acesso
- Tab visível apenas para `administrador` e `moderador`
- Protegido pelo `admin.tsx` (já existente)

## Observações de privacidade
- Futuramente: notificar motorista via email se houver denúncia na placa dele
- Dados abertos para consulta pública podem ser considerados pela comunidade
