# Plano G — Servidor de Imagens (Firebase Storage)

**Goal:** Adicionar upload de fotos às denúncias do Ciclista Denuncie usando Firebase Storage, com exibição das imagens no mapa, na página de detalhes e no painel admin.

**Arquitetura:** As imagens são enviadas para o Firebase Storage (já configurado no projeto — `VITE_FIREBASE_STORAGE_BUCKET` existe no `.env`), e a URL gerada é salva junto com os dados da denúncia no Realtime Database. A exibição acontece via componente de imagem com fallback e loading state.

**Tech Stack:** React 19, React Router 7, TypeScript, Tailwind CSS v4, Firebase v12 (Storage + Database), lucide-react, react-leaflet.

---

## Stack adicional
- Nenhuma — `firebase` já inclui `getStorage`, `ref` (Storage), `uploadBytes`, `getDownloadURL`

## Contexto atual

Arquivos inspcionados:
- `app/lib/firebase.ts` — só exporta `db` (Database) e `auth` (Auth). Storage não está sendo importado.
- `app/lib/denuncias.ts` — interface `DenunciaData` sem campo de imagem.
- `app/routes/denunciar.tsx` — formulário multi-etapas com localização, tipo, placa, relato. Sem upload de foto.
- `app/routes/mapa.tsx` — mapa Leaflet com marcadores. Sem exibição de imagem.
- `package.json` — `firebase` v12 já instalado.

O Firebase Storage já foi provisionado no projeto:
- `VITE_FIREBASE_STORAGE_BUCKET=ciclistadenuncie-prod.firebasestorage.app` no `.env`
- `storageBucket` já incluso no `firebaseConfig` dentro de `firebase.ts`

## Funcionalidades

### 1. Upload de imagens no formulário de denúncia

**Onde:** `app/routes/denunciar.tsx`, entre a etapa de localização e a de confirmação.

**Comportamento:**
- Botão "Adicionar foto" que abre o seletor de arquivos do navegador
- Preview da(s) foto(s) selecionada(s) com thumbnail e botão "X" para remover
- Validação: até 3 fotos, formato jpg/png/webp, máximo 5MB cada
- Compressão client-side opcional (via canvas ou similar) para reduzir tamanho antes do upload
- Upload acontece **após** o usuário confirmar a denúncia (no `onSubmit`)
- Indicador de progresso do upload (barra ou spinner)

### 2. Salvamento no Firebase Storage + Database

**Onde:** `app/lib/denuncias.ts` — função `salvarDenuncia`

**Estrutura:**
- Storage path: `denuncias/{denunciaId}/imagem-{0|1|2}.jpg`
- Ao salvar a denúncia, após `set()` no RTDB, adicionar campo `imagens?: string[]` com as URLs de download

**Fluxo:**
1. `salvarDenuncia()` recebe `files: File[]`
2. Para cada file, faz upload para Firebase Storage
3. Aguarda todas as URLs de download
4. Salva denúncia no RTDB com `imagens: string[]` contendo as URLs

### 3. Exibição das imagens

**Onde:**

#### a) Popup do marcador no mapa (`app/routes/mapa.tsx`)
- Se a denúncia tiver imagens, exibir mini-galeria (1-3 thumbnails) dentro do popup do Leaflet
- Ao clicar na thumbnail, abrir modal/imagem em tamanho maior

#### b) Painel admin — aba Denúncias (`app/routes/admin.tsx`)
- Adicionar coluna "Foto" com thumbnail clicável
- Ao expandir/exibir detalhes da denúncia, mostrar galeria completa

#### c) Página de perfil do usuário (`app/routes/usuario.$username.tsx`)
- Galeria de imagens nas denúncias do usuário

## Regras de segurança (Firebase Storage)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /denuncias/{denunciaId}/{fileName} {
      // Qualquer um pode fazer upload (usuário logado ou não)
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Arquivos novos
```
app/lib/storage.ts            → serviço de upload (getStorage, ref, uploadBytes, getDownloadURL)
```

## Arquivos modificados
```
app/lib/firebase.ts           → + export const storage = getStorage(app)
app/lib/denuncias.ts          → interface DenunciaData + imagens?: string[]
                              → salvarDenuncia() aceita File[] e faz upload
app/routes/denunciar.tsx      → + etapa/seção de seleção de fotos (até 3)
                              → + previews, remoção, validação
                              → + progresso do upload no submit
app/routes/mapa.tsx           → + mini-galeria no popup do Leaflet
app/routes/admin.tsx          → + coluna "Foto" com thumbnail na tabela de denúncias
app/routes/usuario.$username.tsx → + exibir imagens nas denúncias
```

## Tarefas passo a passo

### Task 1: Configurar Storage no Firebase lib
**Arquivo:** `app/lib/firebase.ts`
- Importar `getStorage` do firebase/storage
- Exportar `storage`

### Task 2: Criar serviço de upload
**Arquivo:** `app/lib/storage.ts`
- Função `uploadDenunciaImages(denunciaId: string, files: File[]): Promise<string[]>`
- Para cada file: `uploadBytes(storageRef, file)` → `getDownloadURL()`
- Validação de tipo e tamanho
- Compressão client-side via canvas (redimensionar para max 1920px)

### Task 3: Atualizar interface e salvarDenuncia
**Arquivo:** `app/lib/denuncias.ts`
- Adicionar `imagens?: string[]` em `DenunciaData`
- `salvarDenuncia()` aceitar `files?: File[]` como parâmetro extra
- Fluxo: se houver files, fazer upload → obter URLs → salvar com `imagens`

### Task 4: Adicionar seleção de fotos ao formulário de denúncia
**Arquivo:** `app/routes/denunciar.tsx`
- Adicionar seção de fotos entre a etapa de situações e a de confirmação
- Input file escondido + botão estilizado "Adicionar foto 📷"
- Preview de thumbnails + botão "X" para remover
- Validação: máximo 3, tipos permitidos
- Passar `files` para `salvarDenuncia()`
- Exibir loader/progresso durante upload

### Task 5: Exibir imagens no popup do mapa
**Arquivo:** `app/routes/mapa.tsx`
- Custom popup que renderiza mini-galeria se houver `imagens`
- Thumbnail clicável → modal maior

### Task 6: Exibir imagens no admin
**Arquivo:** `app/routes/admin.tsx`
- Coluna compacta "Foto" na tabela de denúncias
- Thumbnail clicável com modal de visualização

### Task 7: Exibir imagens no perfil do usuário
**Arquivo:** `app/routes/usuario.$username.tsx`
- Galeria nas denúncias listadas do usuário

## Observações de privacidade
- Imagens podem conter dados sensíveis (rostos, placas). O próprio Firebase Storage já fornece URLs ofuscadas e não enumeráveis.
- Futuramente: opção de desfocar placa automaticamente antes do upload.

## Testes
- `app/lib/storage.test.ts` — upload mockado
- `app/routes/denunciar.test.tsx` — seleção de foto, preview, remoção
- Verificar com `npm run typecheck && npm run test`
