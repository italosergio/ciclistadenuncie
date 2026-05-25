# Página de Backup no Painel Admin

> **Para Hermes:** Usar subagent-driven-development para implementar este plano task por task.

**Objetivo:** Criar uma aba "Backup" no painel admin que permite ao administrador baixar os dados de cada nó do Firebase Realtime Database como arquivos JSON individuais, ou baixar todos de uma vez como ZIP.

**Arquitetura:** Componente React separado (`admin-backup.tsx`) que consulta cada nó do Firebase via `get()` (leitura única, sem listener contínuo), serializa como JSON e dispara download via blob URL. Segue o padrão Admin Tab Pattern já documentado.

**Tech Stack:** React 19, Firebase Realtime Database, `jszip` para exportação completa (ou alternativa nativa).

---

### Task 1: Criar componente admin-backup.tsx

**Objetivo:** Criar o componente de backup com lista de nós Firebase, botões de download individuais e download completo.

**Arquivos:**
- Criar: `app/routes/admin-backup.tsx`
- Modificar: `app/routes/admin.tsx`

**Passo 1: Escrever o componente admin-backup.tsx**

```tsx
import { useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../lib/firebase";

const NOS_FIREBASE = [
  { chave: "denuncias", label: "Denúncias", descricao: "Todas as denúncias registradas" },
  { chave: "contatos", label: "Contatos", descricao: "Mensagens de contato recebidas" },
  { chave: "usuarios", label: "Usuários", descricao: "Usuários cadastrados" },
  { chave: "iniciativas", label: "Iniciativas", descricao: "Iniciativas cicloativistas" },
  { chave: "apoiadores", label: "Apoiadores", descricao: "Apoiadores do projeto" },
  { chave: "historico", label: "Histórico", descricao: "Registro de eventos do sistema" },
  { chave: "novos_idiomas", label: "Contribuições de Idioma", descricao: "Traduções sugeridas pela comunidade" },
];

export default function BackupTab() {
  const [baixando, setBaixando] = useState<string | null>(null);
  const [baixandoTodos, setBaixandoTodos] = useState(false);

  async function baixarNo(chave: string, label: string) {
    setBaixando(chave);
    try {
      const snapshot = await get(ref(db, chave));
      const dados = snapshot.val() || {};
      const json = JSON.stringify(dados, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ciclistadenuncie-${chave}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Erro ao baixar ${chave}:`, err);
      alert(`Erro ao baixar ${label}. Verifique o console.`);
    } finally {
      setBaixando(null);
    }
  }

  async function baixarTodos() {
    setBaixandoTodos(true);
    const pacote: Record<string, any> = {};
    try {
      for (const no of NOS_FIREBASE) {
        const snapshot = await get(ref(db, no.chave));
        pacote[no.chave] = snapshot.val() || {};
      }
      const json = JSON.stringify(pacote, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ciclistadenuncie-backup-completo-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro no backup completo:", err);
      alert("Erro ao baixar backup completo. Verifique o console.");
    } finally {
      setBaixandoTodos(false);
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5">
      <h2 className="text-xl font-bungee tracking-wide text-white">Backup de Dados</h2>
      <p className="text-sm text-slate-400">
        Exporte os dados do Firebase como JSON. Use o backup individual para baixar
        uma coleção específica, ou o backup completo para baixar tudo de uma vez.
      </p>

      {/* Botão de backup completo */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-900/20 p-4 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-blue-300 tracking-wide">Backup Completo</h3>
            <p className="text-xs text-slate-400 mt-1">
              Baixa todos os nós do banco em um único arquivo JSON
            </p>
          </div>
          <button
            onClick={baixarTodos}
            disabled={baixandoTodos}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {baixandoTodos ? "Baixando..." : "⬇ Download All"}
          </button>
        </div>
      </div>

      {/* Lista de nós individuais */}
      <div className="grid gap-3">
        {NOS_FIREBASE.map((no) => (
          <div
            key={no.chave}
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{no.label}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{no.descricao}</p>
              <code className="text-[11px] text-slate-500 mt-1 block">/{no.chave}</code>
            </div>
            <button
              onClick={() => baixarNo(no.chave, no.label)}
              disabled={baixando === no.chave}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition border border-white/5"
            >
              {baixando === no.chave ? "Baixando..." : "⬇ JSON"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4">
        Os arquivos são gerados no seu navegador a partir dos dados atuais do Firebase.
        Nenhum dado é enviado para servidores externos.
      </p>
    </div>
  );
}
```

**Passo 2: Verificar estrutura**

- Usa `get()` (leitura única do Firebase) — sem listener contínuo
- Gera blob URL e trigger de download nativo
- Cada nó tem label + descrição + caminho Firebase
- Botão de backup completo baixa todos os 7 nós num JSON só
- Estados de loading individuais e coletivo

---

### Task 2: Registrar a aba Backup no admin.tsx

**Objetivo:** Adicionar a importação, botão na sidebar e renderização condicional para a aba Backup (visível apenas para administradores).

**Arquivos:**
- Modificar: `app/routes/admin.tsx`

**Passo 1: Adicionar import**

No bloco de imports (após linha 14), adicionar:

```tsx
import BackupTab from "./admin-backup";
```

**Passo 2: Adicionar ícone Download na import do lucide-react**

Na linha 5, adicionar `Download` à lista de ícones importados de `lucide-react`:

```tsx
import { ... Download, ... } from "lucide-react";
```

**Passo 3: Adicionar botão na sidebar**

Após o botão "Contatos" (após linha 161), adicionar:

```tsx
            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "backup" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "backup" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Download size={16} className="flex-shrink-0" />
                <span>Backup</span>
              </button>
            )}
```

**Passo 4: Adicionar renderização**

Após a linha 196, adicionar:

```tsx
          {tab === "backup" && user?.role === "administrador" && <BackupTab />}
```

---

### Task 3: Verificar type-check e tests

**Objetivo:** Garantir que o código compila e não quebra nada existente.

**Passo 1: Rodar type-check**

```bash
cd /home/italo/Projetos/ciclistadenuncie && npx tsc --noEmit
```

**Passo 2: Rodar tests**

```bash
npx vitest run
```

**Passo 3: Corrigir qualquer erro apontado**

Se houver erro de tipo no `get()` — o Firebase SDK pode retornar `DataSnapshot` que exige import adicional — ajuste a importação:

```tsx
import { ref, get } from "firebase/database";
```

Este import já é suficiente. `get()` é uma função exportada por `firebase/database` desde a v9.

---

### Task 4: Commit

**Objetivo:** Salvar o trabalho.

```bash
git add app/routes/admin-backup.tsx app/routes/admin.tsx
git commit -m "feat: adiciona pagina de backup no painel admin

- Cria componente admin-backup.tsx com exportacao individual e completa
- Registra aba Backup no admin.tsx (visivel apenas para administradores)
- Usa get() do Firebase para leitura unica e blob URL para download"
```

---

## Verificação

Após implementar, verificar:

1. A aba "Backup" aparece na sidebar apenas para admins
2. Cada botão "JSON" baixa o arquivo correto com os dados do Firebase
3. "Download All" baixa um JSON com todos os nós
4. Estados de loading funcionam (botão desabilitado + "Baixando..." durante download)
5. Type-check passa sem erros
6. Testes existentes continuam passando
