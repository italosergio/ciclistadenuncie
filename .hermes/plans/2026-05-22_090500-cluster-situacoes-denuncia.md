# Plano: Cluster de Situações por Denúncia

## Objetivo

Permitir que uma mesma pessoa registre **múltiplas situações** em uma **única denúncia**, criando um cluster de denúncias no mesmo ponto geográfico.

Exemplo: um ciclista sofre "fina + ameaça + assédio" no mesmo local — em vez de criar 3 denúncias separadas, cria 1 denúncia com 3 situações.

---

## Contexto Atual

### Modelo de dados (Firebase RTDB — `denuncias/{id}`)

```
denuncias/{id}:
  endereco: string
  relato: string
  tipo: string       ← apenas 1 tipo
  placa?: string
  localizacao: {lat, lng}
  createdAt: timestamp
  userId?: string
  username?: string
```

### Fluxo atual

1. **`denunciar.tsx`** — 3 etapas: Tipo (dropdown único) → Relato (textarea) → Localização (mapa)
2. **`denuncias.ts`** — `salvarDenuncia()` salva 1 nó no Firebase por chamada
3. **`mapa.tsx`** — cada denúncia vira 1 marker no mapa com popup mostrando 1 tipo + relato
4. **`sucesso.tsx`** — confirmação exibindo 1 tipo, 1 endereço, 1 placa

### Arquivos envolvidos

| Arquivo | Papel |
|---------|-------|
| `app/lib/denuncias.ts` | Interface `DenunciaData`, funções `salvarDenuncia`, `editarDenuncia`, `excluirDenuncia` |
| `app/lib/denuncias.test.ts` | Testes das funções acima |
| `app/routes/denunciar.tsx` | Formulário de denúncia (3 etapas) |
| `app/routes/mapa.tsx` | Mapa com markers de denúncias |
| `app/routes/sucesso.tsx` | Página de confirmação pós-envio |

---

## Proposta de Abordagem

### Abordagem escolhida: denúncia como cluster com array de situações

Manter o mesmo nó `denuncias/{clusterId}`, mas substituir `tipo` (string) por `situacoes` (array de objetos).

### Novo modelo de dados

```
denuncias/{clusterId}:
  endereco: string
  localizacao: {lat, lng}
  createdAt: timestamp
  userId?: string
  username?: string
  relato?: string               ← relato geral (opcional, compartilhado)
  situacoes: [
    {
      tipo: string,             ← "fina", "ameaca", etc.
      placa?: string,
      relato?: string           ← relato específico da situação
    },
    ...
  ]
```

**Compatibilidade retroativa:** denúncias existentes (com `tipo: string`) continuam funcionando. O mapa e o popup tratam ambos os formatos.

---

## Etapas de Implementação

### Etapa 1 — Renomear `tipo` para `situacoes` no modelo de dados

**Arquivo:** `app/lib/denuncias.ts`

- [ ] Alterar interface `DenunciaData`:
  - **Remover:** `tipo: string`
  - **Adicionar:** `situacoes: Array<{ tipo: string; placa?: string; relato?: string }>`
  - **Manter:** `endereco`, `relato` (relato geral, opcional), `localizacao`, `userId`, `username`
- [ ] Atualizar `salvarDenuncia()`:
  - Salvar `situacoes` como array no Firebase
  - Manter `tipo` por compatibilidade (se vier, converter para `situacoes`)
- [ ] Atualizar `editarDenuncia()`:
  - Adaptar lógica de `relato` para lidar com o novo formato
- [ ] Atualizar `excluirDenuncia()` — provavelmente não precisa mudar

**Arquivo:** `app/lib/denuncias.test.ts`

- [ ] Atualizar testes de `salvarDenuncia` para usar `situacoes` em vez de `tipo`
- [ ] Adicionar teste de compatibilidade com denúncia legada (que ainda tem `tipo`)

### Etapa 2 — Formulário: seleção múltipla de situações

**Arquivo:** `app/routes/denunciar.tsx`

- [ ] **Etapa 1 (Tipo):** Trocar dropdown único por seleção múltipla
  - Checkboxes ou chips selecionáveis em vez de dropdown
  - Cada chip mostra o ícone + label do tipo
  - Permitir selecionar quantos quiser (mínimo 1)
  - Se selecionar "Outro", input de texto extra (como hoje)
- [ ] **Etapa 2 (Relato):** Manter textarea de relato geral (opcional)
  - Adicionar campo de placa por situação? Ou placa geral? Decisão: placa geral para simplicidade inicial
- [ ] **Validação:** pelo menos 1 situação selecionada antes de avançar
- [ ] **Estado:** salvar lista de `situacoes` no localStorage em vez de `tipo` único

### Etapa 3 — Mapa: renderizar cluster no popup

**Arquivo:** `app/routes/mapa.tsx`

- [ ] Atualizar interface `Denuncia`:
  - `tipo?: string` → `tipo?: string; situacoes?: Array<{ tipo: string; placa?: string; relato?: string }>`
- [ ] **Marker único por cluster:** se a denúncia tem `situacoes`, renderizar 1 marker com cor/símbolo de cluster (ex: círculo com número de situações)
- [ ] **Popup clusterizado:**
  - Cabeçalho: data e endereço (como hoje)
  - Lista numerada de situações, cada uma com:
    - Nome do tipo (com ícone)
    - Placa (se houver)
    - Relato específico (se houver)
- [ ] **Denúncias legadas:** manter comportamento atual para denúncias sem `situacoes`, que ainda têm `tipo: string`
- [ ] **Filtro por tipo:** filtrar por qualquer situação dentro do cluster — se o filtro for "ameaca" e o cluster tiver "fina" + "ameaca", o cluster aparece
- [ ] **Contagem visível:** `denunciasVisiveis` reflete número total de situações, não de clusters

### Etapa 4 — Tela de sucesso

**Arquivo:** `app/routes/sucesso.tsx`

- [ ] Aceitar `situacoes` no `location.state`
- [ ] Exibir lista de todas as situações registradas, cada uma com tipo + placa
- [ ] Manter exibição atual para denúncias legadas via estado `tipo`

### Etapa 5 — Mapa (modal de denúncia rápida)

**Arquivo:** `app/routes/mapa.tsx`

- [ ] Atualizar modal (`salvarDenunciaModal`, state `tipo`) para aceitar múltiplas situações
- [ ] Usar chips/checkboxes similar ao denunciar.tsx
- [ ] Chamar `salvarDenuncia` com `situacoes` array

---

## Testes / Validação

| Teste | O que verificar |
|-------|-----------------|
| Unitário: `salvarDenuncia` com múltiplas situações | Firebase recebe `situacoes: [{tipo}, {tipo}]` |
| Unitário: `salvarDenuncia` com denúncia legada (tipo string) | Converte para situacoes automaticamente |
| Unitário: `editarDenuncia` no novo formato | Push correto no array de situações |
| Unitário: filtro no mapa com clusters | Cluster aparece se qualquer situação match o filtro |
| E2E: formulário denunciar.tsx | Selecionar 3 tipos → enviar → ver na tela de sucesso |
| E2E: mapa.tsx | Cluster aparece no local com número de situações |
| E2E: modal de denúncia rápida no mapa | Múltiplas situações via modal |

---

## Riscos e Tradeoffs

| Risco | Mitigação |
|-------|-----------|
| **Compatibilidade reversa** — denúncias existentes com `tipo: string` quebram | Código do mapa trata `d.tipo` e `d.situacoes`; se não tiver `situacoes`, usa `tipo` como situação única |
| **Performance no mapa** — muitos markers em cluster | Leaflet MarkerClusterGroup (plugin) pode ser adicionado em PR futuro; por enquanto 1 marker por cluster já reduz o número total |
| **UX complexa** — formulário maior com seleção múltipla | Chips visuais com ícones são intuitivos; manter fluxo de 3 etapas |
| **Dados inconsistentes** — situação sem tipo obrigatório | Validação no frontend: mínimo 1 situação com tipo preenchido |

---

## Perguntas em Aberto

1. **Placa:** a placa deve ser por situação (ex: veículo diferente em cada) ou geral para o cluster? Sugestão: geral para simplicidade inicial.
2. **Relato por situação:** o relato deve ser um único campo geral ou um campo por situação? Sugestão: 1 relato geral + opção de detalhe por situação.
3. **Visual do marker no mapa:** cor única para clusters ou cor baseada no tipo da primeira situação?

---

## Resumo de Alterações

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `app/lib/denuncias.ts` | ✅ Alterar interface + funções |
| `app/lib/denuncias.test.ts` | ✅ Atualizar testes |
| `app/routes/denunciar.tsx` | ✅ Seleção múltipla de tipos |
| `app/routes/mapa.tsx` | ✅ Marker único + popup clusterizado |
| `app/routes/sucesso.tsx` | ✅ Listar situações na confirmação |
