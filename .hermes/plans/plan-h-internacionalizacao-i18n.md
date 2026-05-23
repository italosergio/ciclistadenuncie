# Plano H: Internacionalização (i18n)

**Stack:** React 19 + React Router 7 (SSR) + Vite 7 + Tailwind 4 + TypeScript + Firebase

## Objetivo

Adicionar suporte a múltiplos idiomas no Ciclista Denuncie: português (pt-BR), inglês (en) e espanhol (es). O projeto usa `react-i18next` + `i18next-browser-languagedetector` com lazy loading por namespace.

---

## Estratégia

- **Biblioteca:** `react-i18next` + `i18next` + `i18next-browser-languagedetector`
- **Idiomas:** pt-BR (padrão), en, es
- **Detecção:** Cookie + localStorage (sem prefixo de URL)
- **Seletor:** LanguageSwitcher no canto superior direito (globo + sigla)
- **SSR:** Configurar i18next com Suspense no root.tsx

## Estrutura de arquivos

```
app/
├── lib/
│   └── i18n.ts                    ← Configuração do i18next
├── components/
│   └── LanguageSwitcher.tsx       ← Botão seletor de idioma
└── locales/
    ├── pt/
    │   ├── translation.json       ← Fallback comum
    │   ├── home.json
    │   ├── mapa.json
    │   ├── denunciar.json
    │   ├── login.json
    │   └── admin.json
    ├── en/
    │   ├── (mesma estrutura)
    └── es/
        └── (mesma estrutura)
```

---

## Etapas de Implementação

### Etapa 1 — Instalar dependências

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Etapa 2 — Configuração i18n (`app/lib/i18n.ts`)

- Inicializar i18next com detecção de idioma (cookie + localStorage)
- Namespaces: `translation` (padrão), `home`, `mapa`, `denunciar`, `login`, `admin`
- Fallback: pt-BR
- SSR-aware: exportar `initI18n()` para servidor, `i18n` instância para cliente

### Etapa 3 — LanguageSwitcher (`app/components/LanguageSwitcher.tsx`)

- Botão com ícone de globo + sigla do idioma (`PT`, `EN`, `ES`)
- Dropdown minimalista com os 3 idiomas
- Mudança de idioma via `i18next.changeLanguage()`
- Persistência em localStorage + cookie

### Etapa 4 — Integrar no root.tsx

- Envolver `<App>` com `<Suspense>` para SSR
- Embutir detect de idioma no `Layout` SSR
- Atualizar `<html lang="...">` dinamicamente

### Etapa 5 — Traduzir rotas (por prioridade)

1. **home** — hero, call-to-action, estatísticas, carrossel
2. **mapa** — filtros, popups, labels, vazios
3. **denunciar** — formulário, validação, tipos de denúncia
4. **login** — labels, botões, erros
5. **admin** — tabelas, ações, modais
6. **contato, conta, sucesso, planos** — conteúdo textual
7. **páginas legais (LGPD, Termos)** — versão completa em pt, resumo em en/es

### Etapa 6 — Meta/SEO

- Atualizar `<html lang>` dinamicamente conforme idioma
- Open Graph locale conforme idioma
- Título e descrição localizados

### Etapa 7 — Mensagens do Firebase

- Personalizar mensagens de erro do Firebase Auth (email inválido, senha fraca, etc.)
- Mensagens de sucesso e confirmação localizadas

### Etapa 8 — Tipos de denúncia

- Lista de tipos de denúncia (fina, ameaça, assédio, etc.) em cada idioma
- Manter código do tipo como chave invariável

---

## Decisões de Design

- **Nome do site:** "Ciclista Denuncie" NÃO é traduzido — é marca
- **Dados do usuário (denúncias):** permanecem no idioma original do autor
- **Ícones:** usar lucide-react (já instalado), glob icon para LanguageSwitcher
- **Placeholder IBGE:** localizado conforme idioma ("Selecione um estado", "Select a state", "Seleccione un estado")
- **Páginas legais:** manter versão completa em pt. Para en/es, resumo traduzido com link para versão oficial em pt

---

## Cronograma Estimado

| Etapa | Estimativa |
|-------|-----------|
| Instalação + Config | ~30min |
| LanguageSwitcher | ~30min |
| Tradução home + mapa | ~2h |
| Tradução denunciar + login | ~2h |
| Tradução admin | ~2h |
| Tradução demais páginas | ~2h |
| SEO + Meta | ~30min |
| Firebase messages | ~30min |
| Tipos denúncia localizados | ~1h |
| **Total** | **~10-12h** |
