# Plano: Carrossel de Apoiadores com Fade In/Out

## Objetivo

Transformar a seção de apoiadores na página inicial (`home.tsx`) de um layout paralelo (todos visíveis lado a lado) para um **carrossel automático** que exibe **um apoiador por vez** com **transição fade in/out**.

---

## Estado Atual

**Arquivo:** `app/routes/home.tsx` (linhas 192-204)

Atualmente os apoiadores são renderizados assim:

```tsx
<div className="flex flex-wrap justify-center items-center gap-4">
  <a href="..." className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition">
    <img src="/apoiadores/bicinosplanos.png" alt="Bici nos Planos MS" className="h-16 object-contain" />
    <span className="text-[10px] text-gray-400 dark:text-gray-500">Bici nos Planos MS</span>
  </a>
  <a href="..." ...>Ameciclo</a>
</div>
```

**Problema:** Com o crescimento do número de apoiadores (já temos 2), o layout paralelo vai ficar poluído e ocupar muito espaço vertical.

---

## Abordagem Proposta

Extrair os dados dos apoiadores para um array e criar um componente `CarrosselApoiadores` que:

1. Mantém um índice atual (`currentIndex`) no estado
2. Usa `setInterval` + `useEffect` para avançar a cada **4 segundos**
3. Em vez de `flex-wrap` com todos visíveis, renderiza **apenas o apoiador atual**
4. Aplica uma transição de opacidade: fade out (300ms) → troca o conteúdo → fade in (300ms)
5. Pausa o timer se o usuário fizer hover/mouse enter sobre o carrossel

---

## Passo a Passo

### 1. Extrair dados para array

Criar um array com os apoiadores e seus metadados:

```ts
const APOIADORES = [
  {
    nome: 'Bici nos Planos MS',
    url: 'https://www.instagram.com/bicinosplanos/',
    img: '/apoiadores/bicinosplanos.png',
    alt: 'Bici nos Planos MS',
  },
  {
    nome: 'Ameciclo',
    url: 'https://ameciclo.org',
    img: '/apoiadores/ameciclo.jpg',
    alt: 'Ameciclo',
  },
];
```

### 2. Adicionar estado do carrossel

```ts
const [apoiadorIndex, setApoiadorIndex] = useState(0);
const [fading, setFading] = useState(false);
```

### 3. Implementar timer de rotação

Usar `useEffect` + `setInterval` (ou custom hook `useInterval`):

```ts
useEffect(() => {
  const timer = setInterval(() => {
    setFading(true);
    setTimeout(() => {
      setApoiadorIndex(prev => (prev + 1) % APOIADORES.length);
      setFading(false);
    }, 300); // duração do fade out
  }, 4000);
  return () => clearInterval(timer);
}, []);
```

### 4. Substituir o bloco JSX

Substituir o `<div className="flex flex-wrap ...">` por:

```tsx
<div
  className="flex justify-center items-center"
  onMouseEnter={() => /* pausar timer */ }
  onMouseLeave={() => /* retomar timer */ }
>
  <a
    href={APOIADORES[apoiadorIndex].url}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-300 ${
      fading ? 'opacity-0' : ''
    }`}
  >
    <img
      src={APOIADORES[apoiadorIndex].img}
      alt={APOIADORES[apoiadorIndex].alt}
      className="h-16 object-contain"
    />
    <span className="text-[10px] text-gray-400 dark:text-gray-500">
      {APOIADORES[apoiadorIndex].nome}
    </span>
  </a>
</div>
```

### 5. (Opcional) Indicadores visuais

Adicionar pequenos dots/bolinhas abaixo do apoiador para indicar quantos existem e qual está ativo. Isso dá contexto visual de que há mais de um apoiador.

---

## Arquivos que serão modificados

| Arquivo | Tipo de mudança |
|---|---|
| `app/routes/home.tsx` | **Edição**: Substituir bloco flex paralelo (L192-204) por carrossel com fade |

Nenhum arquivo novo é necessário. Os assets (`bicinosplanos.png`, `ameciclo.jpg`) permanecem intactos.

---

## Testes / Validação

- A página inicial carrega sem erros
- O primeiro apoiador (Bici nos Planos MS) aparece inicialmente
- Após ~4 segundos, fade out → fade in revela a Ameciclo
- O ciclo continua infinitamente
- O link de cada apoiador abre em nova aba corretamente
- Em hover sobre o carrossel, a rotação **pausa** (boa prática de usabilidade)
- Ao tirar o mouse, a rotação **retoma**
- O layout não quebra em mobile (altura fixa evita layout shift)

---

## Riscos e Tradeoffs

| Risco | Mitigação |
|---|---|
| **Layout shift** durante a transição | Manter altura fixa no container ou usar `min-h` para evitar que o DOM "pule" |
| **Acessibilidade**: leitores de tela podem perder o conteúdo que muda | Adicionar `aria-live="polite"` no container |
| **Timer acumulado** se o usuário ficar trocando de aba | `clearInterval` no cleanup do `useEffect` resolve |
| **Um apoiador não fica visível tempo suficiente** | 4s é suficiente para leitura; podemos tornar configurável |

---

## Questões em Aberto (1 restante)

1. **Indicadores visuais** (bolinhas): incluir ou não?
