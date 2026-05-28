# 🚲 Guia Passo a Passo — Ciclista Denuncie

**Plataforma Nacional de Denúncia do Ciclista**
Acesse: **https://ciclistadenuncie.com.br** (ou o domínio do deploy)

---

## 📋 Sumário

1. [Visitar a Página Inicial](#1-página-inicial)
2. [Registrar uma Denúncia](#2-registrar-uma-denúncia)
3. [Pós-denúncia — Página de Sucesso](#3-pós-denúncia---página-de-sucesso)
4. [Explorar o Mapa Interativo](#4-mapa-interativo)
5. [Criar uma Conta (Login/Cadastro)](#5-criar-uma-conta)
6. [Gerenciar Sua Conta](#6-gerenciar-sua-conta)
7. [Ver Suas Denúncias no Perfil Público](#7-perfil-público)
8. [Falar Conosco (Contato)](#8-contato)
9. [Painel Administrativo](#9-painel-administrativo)
10. [Páginas Legais e Informativas](#10-páginas-legais)
11. [Funcionalidades Globais](#11-funcionalidades-globais)

---

## 1. Página Inicial

> **Rota:** `/`
> **Acesso:** Público

A página inicial é a porta de entrada da plataforma. Ela apresenta:

**1.1. Contador Nacional de Denúncias**
- Um número grande e visível (tipo "3.142 denúncias registradas")
- Atualizado em tempo real a cada nova denúncia
- Reforça o impacto coletivo da causa

**1.2. Logo e identidade visual**
- Logo animado da Ciclista Denuncie
- Nome e slogan do projeto

**1.3. Call to Action principal**
- Botão **"Registrar denúncia"** — leva direto ao formulário

**1.4. Carrossel de Apoiadores**
- Mostra parceiros, coletivos e organizações que apoiam o projeto
- Cada card tem foto/logo + nome + link clicável
- Rolagem horizontal

**1.5. BikeFireAnimation**
- Animação artística de bicicletas pegando fogo — símbolo da plataforma
- Algumas bicicletas têm nomes clicáveis (homenagens)

**1.6. Seletor de Idioma (LanguageSwitcher)**
- Disponível em todas as páginas exceto na home (nos cantos)
- Troca entre português, inglês e espanhol

---

## 2. Registrar uma Denúncia

> **Rota:** `/denunciar`
> **Acesso:** Público (não requer login)
> **Salvamento automático:** O formulário salva o progresso no navegador (localStorage). Se fechar sem terminar, pode continuar de onde parou.

### Passo a passo completo:

**📌 Etapa 1 — Localização** *(página 1 do formulário)*

1. Escolha a **cidade** onde ocorreu o incidente
2. Marque o local exato no **mini mapa interativo** (clique no ponto)
3. O endereço é preenchido automaticamente via geolocalização reversa
4. Confira e ajuste o endereço se necessário
5. Avance com o botão **"Próximo →"**

**📌 Etapa 2 — Data e Hora**

1. Selecione a **data** da ocorrência (calendário)
2. Selecione o **horário aproximado**
3. Avance

**📌 Etapa 3 — Tipo de Ocorrência (Situações)**

1. Escolha uma ou mais **situações** que descrevem o ocorrido:
   - 🚴 **Fina** (ultrapassagem perigosa e proposital)
   - 📢 **Ameaça**
   - ✋ **Assédio** (incluindo assédio sexual)
   - 💬 **Agressão Verbal**
   - 🚗 **Agressão Física**
   - 🏗️ **Veículo estacionado em ciclovia/ciclofaixa**
   - ⚠️ **Buraco na via**
   - 🚧 **Ciclovia obstruída**
   - 🔦 **Falta de iluminação**
   - 🛑 **Falta de sinalização**
   - 🛠️ **Má conservação da via**
   - 🚲 **Falta de ciclovia**
   - Trecho perigoso
   - **Outro** (com campo de descrição livre)
2. Pode selecionar **várias situações** para uma mesma denúncia
3. Avance

**📌 Etapa 4 — Dados do Veículo Envolvido** *(opcional)*

1. **Tipo de veículo** (carro, moto, caminhão, ônibus, etc.)
2. **Placa** (se tiver)
3. Avance

**📌 Etapa 5 — Relato Livre**

1. Escreva com suas palavras **o que aconteceu**
2. Quanto mais detalhes, melhor para entender o contexto
3. Avance

**📌 Etapa 6 — Evidências** *(opcional)*

1. Faça **upload de fotos**:
   - Do veículo envolvido
   - Do local da ocorrência
   - Outras evidências relevantes
2. Múltiplas fotos permitidas
3. Avance

**📌 Etapa 7 — Identificação** *(opcional)*

1. Responda: **"Deseja se identificar?"** (Sim / Não)
2. Se sim: preencha **nome** e **e-mail**
3. Informações sociodemográficas opcionais:
   - Estado / Cidade / Bairro
   - Raça / Cor
   - Gênero
   - Idade

**📌 Etapa 8 — Consentimentos e Revisão**

✅ **Declaração de Veracidade:** "Declaro que as informações prestadas são verdadeiras e de minha responsabilidade."

✅ **LGPD:** "Li e concordo com o tratamento dos meus dados conforme a Lei Geral de Proteção de Dados (LGPD)."

⚠️ Ambos são **obrigatórios** — sem eles a denúncia não é enviada.

3. Revise todas as informações
4. Clique em **"Enviar denúncia"**

> Pronto! 🎉 Sua denúncia foi registrada e passa a fazer parte do contador nacional.

---

## 3. Pós-denúncia — Página de Sucesso

> **Rota:** `/sucesso`
> **Acesso:** Após enviar uma denúncia

Após registrar uma denúncia, você vê:

1. ✅ **Confirmação visual** com ícone de sucesso
2. **Resumo da denúncia** que acabou de fazer
3. **Reforço do impacto coletivo**: "Sua denúncia se soma a outras [N] denúncias"
4. **Link para o mapa** para ver sua denúncia no contexto
5. **Botão "Denunciar novamente"** para registrar outra ocorrência

---

## 4. Mapa Interativo

> **Rota:** `/mapa`
> **Acesso:** Público

O mapa é o coração visual da plataforma, mostrando todas as denúncias geolocalizadas.

### 4.1. Navegação Básica

1. **Navegue pelo mapa** arrastando e usando zoom (scroll ou botões +/-)
2. **Clique nos marcadores** vermelhos (denúncias) para ver detalhes
3. Um popup mostra: endereço, tipo de ocorrência, relato resumido, placa (se houver), data

### 4.2. Filtros

| Filtro | O que faz |
|--------|-----------|
| **Por tipo** | Filtra por tipo de situação (Fina, Ameaça, Assédio, etc.) |
| **Por período** | Últimas 24h, 7 dias, 30 dias, tudo |
| **Busca por cidade** | Digita o nome e vai direto para aquela cidade |

### 4.3. Camadas do Mapa

- **🔄 Toggle Iniciativas** (verde) — ativa/desativa marcadores de iniciativas cicloativistas
- **🔄 Toggle Apoiadores** (azul) — ativa/desativa marcadores de apoiadores/coletivos
- **🗺️ Trocar tiles** — alterna entre:
  - 🌍 Street (OpenStreetMap padrão)
  - 🛰️ Satélite (ArcGIS)
  - ☀️ Light (CartoDB claro)
  - 🌙 Dark (CartoDB escuro)

### 4.4. Ações no Mapa

- Clique em qualquer marcador para ver detalhes
- Botão "Ver rota" (se disponível)
- Mini mapa de busca por cidade com sugestões
- Geolocalização automática (se permitida pelo navegador)

---

## 5. Criar uma Conta

> **Rota:** `/login`
> **Acesso:** Público

### Cadastro passo a passo (multi-etapas):

**Passo 1: Escolher nome de usuário**
- Escolha um **username** único (ex: `ciclista.rec`)
- Será seu identificador público na plataforma

**Passo 2: E-mail e senha**
- Informe seu **e-mail**
- Crie uma **senha** (mínimo 6 caracteres)
- **Confirme a senha**

**Passo 3: Consentimentos obrigatórios**
- ✅ Aceitar os **Termos de Responsabilidade do Usuário**
- ✅ Aceitar os **Termos de Responsabilidade da Plataforma**
- ✅ Aceitar a **LGPD** (proteção de dados)
- ✅ Aceitar ser **contatado(a)** sobre a denúncia

**Passo 4: Finalizar**
- Clique em **"Criar conta"**
- ✅ Página de sucesso: `/sucesso-cadastro`
- Agora pode fazer login

### Login:

1. Informe **nome de usuário** e **senha**
2. Opção **"Lembrar de mim"** (mantém sessão ativa)
3. Clique em **"Entrar"**
4. 🎉 Painel personalizado disponível

### Esqueceu a senha?

1. Clique em **"Esqueceu a senha?"**
2. Informe o **e-mail** cadastrado
3. Receba o link de redefinição
4. Redefina a senha

### Esqueceu o username?

1. Clique em **"Esqueceu o username?"**
2. Informe o **e-mail** cadastrado
3. O sistema consulta e mostra o username vinculado

---

## 6. Gerenciar Sua Conta

> **Rota:** `/conta`
> **Acesso:** Requer login (rota protegida)

### 6.1. Alterar Senha

1. Acesse `/conta`
2. Aba **"Alterar Senha"**
3. Digite a **senha atual**
4. Digite a **nova senha**
5. Confirme a nova senha
6. Clique em "Alterar senha"

### 6.2. Alterar E-mail

1. Aba **"Alterar E-mail"**
2. Digite o novo e-mail
3. Confirme
4. O e-mail é atualizado no sistema

### 6.3. Excluir Conta

1. Aba **"Excluir Conta"**
2. ⚠️ Leia o aviso — a exclusão é irreversível
3. Confirme a exclusão
4. A conta é removida e você é redirecionado para a home em 5 segundos

---

## 7. Perfil Público

> **Rota:** `/usuario/:username`
> **Acesso:** Público (não requer login)

Cada usuário tem uma página pública onde aparecem:

1. **Nome de usuário** no topo
2. **Todas as denúncias** feitas por essa pessoa
3. Cada denúncia mostra: endereço, tipo, relato, placa (se houver), data
4. Se você for o **dono do perfil** (logado como aquele usuário), pode:
   - ✏️ **Editar** denúncias (relato, endereço, etc.)
   - 🗑️ **Excluir** denúncias
   - O histórico de edições fica registrado (audit trail)

---

## 8. Contato

> **Rota:** `/contato`
> **Acesso:** Público

### Passo a passo:

1. **Escolha o tipo de contato:**
   - 💡 Sugestão
   - 🐛 Reportar bug
   - 💬 Dúvida
   - ❓ Pergunta frequente
   - ⚠️ Reportar problema
   - Outro

2. **Escreva sua mensagem**

3. **Informe seu contato** (opcional) — e-mail ou telefone para resposta

4. **Aceita ser contatado?** (opcional)

5. **Envie**

✅ Confirmação em `/sucesso-contato`

---

## 9. Painel Administrativo

> **Rota:** `/admin`
> **Acesso:** Apenas administradores e moderadores (rota protegida)

O painel tem 7 abas no menu lateral:

### 9.1. 📊 Atividade
- Timeline com as últimas ações na plataforma
- Cada evento mostra: tipo, usuário, data
- Filtros por tipo de evento e período
- Ações monitoradas: novos cadastros, denúncias registradas, denúncias moderadas, etc.

### 9.2. 📋 Denúncias (Moderação)
- Lista de todas as denúncias pendentes de moderação
- Aprovar (torna pública no mapa e no contador)
- Rejeitar (remove)
- Visualizar detalhes completos (incluindo fotos)
- Anexar observações da moderação

### 9.3. 👥 Usuários
- Lista de todos os usuários cadastrados
- **Banir** usuário (impede login e novas denúncias)
- **Excluir** usuário (remove conta, com opção de manter ou remover denúncias)
- Ver papel/função (user, moderador, administrador)
- Busca por username

### 9.4. 🌱 Iniciativas Cicloativistas
- CRUD completo de **iniciativas** (movimentos, coletivos, ONGs)
- Campos: nome, URL, descrição, endereço, localização (lat/lng)
- As iniciativas aparecem como **marcadores verdes** no mapa público
- Mini mapa para definir a localização ao cadastrar
- Ordenação personalizada

### 9.5. 💚 Apoiadores
- CRUD completo de **apoiadores**
- Campos: nome, URL, imagem (logo/foto), descrição, endereço, localização, ordem
- Os apoiadores aparecem:
  - No **carrossel** da página inicial
  - Como **marcadores azuis** no mapa
- Ordem arrastável (drag to reorder)

### 9.6. 📄 Planos
- Visualização dos planos de desenvolvimento do projeto
- Lista de metas e funcionalidades futuras
- Ordenação por prioridade

### 9.7. 📜 Histórico
- Log detalhado de todas as ações do sistema
- Abas: Todos / Moderação / Usuários
- Filtros por tipo de evento
- Busca textual
- Filtro por período (data início / data fim)
- Paginação (30 itens por página)

---

## 10. Páginas Legais

Todas de acesso público, com links no rodapé:

### 10.1. LGPD — Política de Privacidade
> **Rota:** `/lgpd`
- Como os dados são coletados e tratados
- Finalidade social, política e jurídica
- Direitos do titular (acesso, correção, exclusão)
- Contato do encarregado de dados

### 10.2. Termo de Responsabilidade do Usuário
> **Rota:** `/termo-responsabilidade-usuario`
- Declaração de veracidade das denúncias
- Responsabilidade do usuário pelas informações prestadas
- Consequências de denúncias falsas

### 10.3. Termo de Responsabilidade da Plataforma
> **Rota:** `/termo-responsabilidade-plataforma`
- Limitação de responsabilidade da plataforma
- Aviso de que denúncias são de responsabilidade do usuário
- Procedimentos de moderação

---

## 11. Funcionalidades Globais

Presentes em toda a plataforma:

### 🌓 Dark Mode
- Suporte a tema claro/escuro automático (segue a preferência do sistema)
- Interface otimizada para ambos os temas

### 🌐 Internacionalização
- **Português** 🇧🇷 (padrão)
- **Inglês** 🇺🇸
- **Espanhol** 🇪🇸
- Botão de troca de idioma visível em todas as páginas (exceto home)

### 📱 Responsivo
- Funciona perfeitamente em:
  - 💻 Desktop
  - 📱 Celular
  - 📟 Tablet

### 🗺️ Leaflet (Mapas)
- Múltiplos provedores de tiles:
  - OpenStreetMap (padrão)
  - ArcGIS Satélite
  - CartoDB Light
  - CartoDB Dark
- Agrupamento de marcadores (cluster)
- Ícones personalizados (TeardropBikeIcon, GhostBikeIcon)

---

## 🎯 Resumo do Fluxo do Usuário

```
Visitante
   │
   ├─► Página Inicial (contador + apresentação)
   │
   ├─► Registrar Denúncia (público, sem login)
   │     └─► Página de Sucesso
   │
   ├─► Explorar Mapa (público)
   │     └─► Filtros + Camadas
   │
   ├─► Criar Conta (login/cadastro)
   │     └─► Minha Conta (senha, email, excluir)
   │     └─► Meu Perfil Público (editar/excluir denúncias)
   │
   ├─► Contato (público)
   │
   └─► Páginas Legais (LGPD, Termos)
```

---

## 🛠️ Para Acessar em Desenvolvimento

```bash
# No terminal do projeto:
cd ~/Projetos/ciclistadenuncie
npm install
npm run dev
# Abra http://localhost:5173
```

> 💡 **Dica:** O formulário de denúncia salva rascunho automaticamente. Se fechar a página sem terminar, ao voltar o progresso estará salvo (localStorage).
