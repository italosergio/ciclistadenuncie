# 🚲 Ciclista Denuncie

**Plataforma Nacional de Denúncia do Ciclista**

## 1. Visão Geral

A **Ciclista Denuncie** tem como objetivo registrar, centralizar e dar visibilidade a ocorrências e infrações cometidas contra ciclistas no trânsito brasileiro.

O **diferencial central** da plataforma é reconhecer e registrar um **campo mais amplo e realista de violências e riscos** vividos diariamente por ciclistas — incluindo situações que **costumam ser ignoradas, relativizadas ou minimizadas** por condutores de veículos motorizados e, muitas vezes, pelo próprio **Código de Trânsito Brasileiro (CTB)**.

Aqui são consideradas como denúncias válidas não apenas ocorrências graves, como atropelamentos, mas também **contextos de agressão cotidiana**, como:

* **"Fina"**: quando carro ou moto passa muito próximo do ciclista, em velocidade incompatível, colocando sua vida em risco
* Agressões verbais, xingamentos e intimidações
* Movimentos perigosos e manobras ameaçadoras
* Ameaças explícitas
* Veículos motorizados pressionando, fechando ou expulsando ciclistas da via
* Estacionamento irregular em ciclovias e ciclofaixas
* Agressões físicas e atropelamentos

A plataforma parte do entendimento de que **violência no trânsito não começa no atropelamento**, mas em uma sequência de comportamentos hostis e negligentes que expõem ciclistas a risco constante.

O sistema exibirá de forma **bem visível** um **contador nacional de denúncias**, reforçando o impacto coletivo e estatístico do problema.

---

## 2. Objetivos do Projeto

* Catalogar dados de ocorrências envolvendo ciclistas em escala **nacional**
* Trabalhar esses dados em parceria com **movimentos ciclistas nacionais**
* Produzir evidências concretas (dados, números e padrões) para **pleitear mudanças no Código de Trânsito Brasileiro (CTB)**
* Fortalecer a pauta do direito do ciclista de **denunciar infrações e violências no trânsito**
* Transformar denúncias individuais em **força política e jurídica coletiva**
* Apoiar campanhas, ações judiciais, projetos de lei e políticas públicas
* Garantir transparência, responsabilidade e conformidade com a LGPD

---

## 3. Valores Entregues

A plataforma **Ciclista Denuncie** se fundamenta na promoção da **vida, da dignidade e do direito à cidade** para quem anda de bicicleta.

Os principais valores entregues pelo projeto são:

* **Visibilidade**: tornar o ciclista visível enquanto sujeito de direitos, rompendo com a invisibilização histórica de quem se desloca de bicicleta
* **Respeito**: reconhecer o ciclista como parte legítima do trânsito, merecedor de segurança e consideração
* **Pertencimento à cidade**: promover a cidade como um espaço compartilhado, onde a pessoa que pedala se sinta incluída, protegida e representada
* **Promoção da vida**: afirmar que a mobilidade ativa é uma política de cuidado com a vida, a saúde e o meio ambiente
* **Escuta ativa**: valorizar relatos e experiências que normalmente são desconsiderados ou silenciados
* **Força coletiva**: transformar vivências individuais em ação coletiva, incidência política e mudança estrutural

A plataforma existe para que quem anda de bicicleta **se sinta visto, respeitado e devidamente considerado** na luta por mobilidade segura, justa e humana.

---

## 4. Stack Tecnológica

### Frontend

* React
* TypeScript
* React Router
* Vite
* Deploy: **Vercel**

### Backend / Banco de Dados

* Firebase
  * Firestore (banco de dados)
  * Firebase Storage (upload de imagens)
  * Firebase Authentication (opcional)

### Infraestrutura

* Sem Docker
* Deploy contínuo via GitHub + Vercel

---

## 5. Estrutura de Páginas

### 5.1 Página Inicial

* Apresentação do projeto
* Texto de impacto sobre violência no trânsito
* **Contador nacional de denúncias (em destaque)**
* Botão: "Registrar denúncia"

### 5.2 Página de Denúncia

* Formulário completo de registro
* Validações de campos
* Consentimentos obrigatórios

### 5.3 Página de Confirmação

* Mensagem de agradecimento
* Reforço do impacto coletivo

### 5.4 Página de Transparência (futuro)

* Estatísticas públicas (dados anonimizados)

---

## 6. Tipos de Ocorrência Considerados

A plataforma reconhece que a violência no trânsito contra ciclistas assume **múltiplas dimensões**, muitas delas atravessadas por marcadores sociais como raça, gênero, território e classe.

Entre os tipos de ocorrência que podem ser denunciados, incluem-se:

* **Racismo no trânsito**
  * Ofensas racistas, xingamentos ou comentários discriminatórios durante a circulação
  * Ameaças com motivação racial
  * Tratamento violento, intimidador ou desumanizante direcionado a ciclistas negros
  * Associações criminosas, estigmatização ou deslegitimação do direito de circular

* "Fina" (ultrapassagem perigosa e proposital)
* Agressões verbais
* Ameaças
* Movimentos perigosos e manobras hostis
* Assédio (incluindo assédio sexual)
* Veículos estacionados em ciclovias ou ciclofaixas
* Agressões físicas
* Atropelamentos

O projeto parte do entendimento de que **o racismo estrutura também as violências no trânsito**, tornando a experiência de pedalar ainda mais insegura para pessoas negras.

O registro desses dados é fundamental para evidenciar desigualdades, apoiar ações antirracistas e fortalecer políticas públicas que promovam justiça social e mobilidade segura.

---

## 7. Dados Coletados

### 7.1 Identificação do Usuário

* Deseja se identificar? **(Sim / Não)**

Se **Sim**:
* Nome
* Email

---

### 7.2 Dados Sociodemográficos

*(Campos opcionais, usados apenas para estatísticas)*

* Estado
* Cidade
* Bairro
* Raça / Cor
* Gênero
* Idade

---

### 7.3 Dados da Ocorrência

#### Localização

* Cidade
* Rua
* Número (se possível)

#### Data e Hora

* Horário da ocorrência

---

### 7.4 Dados do Veículo Envolvido

*(Campos independentes)*

* Tipo de veículo (carro, moto, caminhão, ônibus, etc.)
* Modelo
* Cor
* Placa (se houver)
* Descrição adicional

---

### 7.5 Evidências (Opcional)

* Upload de fotos:
  * Veículo
  * Ocorrência
  * Outras evidências relevantes

Armazenamento via **Firebase Storage**.

---

### 7.6 Relato Livre

* Campo de texto para descrição detalhada da ocorrência

---

## 8. Por que coletamos esses dados?

A coleta, armazenamento e tratamento dos dados desta plataforma têm **finalidade social, política e jurídica**.

Esses dados serão utilizados para:

* Mapear a violência e as infrações cometidas contra ciclistas no trânsito brasileiro
* Demonstrar, com base em evidências, que tais ocorrências **não são casos isolados**, mas sim um problema estrutural
* Subsidiar **movimentos ciclistas, coletivos e organizações da sociedade civil** na formulação de propostas
* Apoiar o **pleito por mudanças no Código de Trânsito Brasileiro (CTB)**, visando:
  * Reconhecimento legal do direito do ciclista à denúncia
  * Criação de mecanismos oficiais de registro de infrações contra ciclistas
  * Fortalecimento da fiscalização e da responsabilização

Os dados poderão ser trabalhados de forma:

* Estatística
* Agregada
* Anonimizada

Nenhuma informação pessoal será utilizada para fins comerciais.

A participação do usuário é voluntária, e o fornecimento de dados pessoais é opcional.

---

## 9. Consentimentos Obrigatórios

### 9.1 Declaração de Veracidade

Checkbox obrigatório:

> "Declaro que as informações prestadas são verdadeiras e de minha responsabilidade."

### 9.2 LGPD – Proteção de Dados

Checkbox obrigatório com link/modal explicativo:

> "Li e concordo com o tratamento dos meus dados conforme a Lei Geral de Proteção de Dados (LGPD)."

---

## 10. Estrutura de Dados (Firestore – Exemplo)

### Collection: `denuncias`

```json
{
  "identificado": true,
  "nome": "João da Silva",
  "email": "joao@email.com",
  "estado": "PE",
  "cidade": "Recife",
  "bairro": "Boa Viagem",
  "racaCor": "Parda",
  "genero": "Masculino",
  "idade": 32,
  "rua": "Av. Conselheiro Aguiar",
  "numero": "123",
  "horario": "2026-01-20T18:45:00",
  "veiculo": {
    "tipo": "Carro",
    "modelo": "Sedan",
    "cor": "Preto",
    "placa": "ABC1D23"
  },
  "fotos": ["url1", "url2"],
  "relato": "Veículo estacionado na ciclovia...",
  "createdAt": "timestamp"
}
```

---

## 11. Contador Nacional de Denúncias

* Campo agregado no Firestore (ex: `stats/contadorGlobal`)
* Incremento atômico a cada nova denúncia
* Exibição em tempo real usando `onSnapshot`

---

## 12. Segurança e Privacidade

* Dados pessoais opcionais
* Exibição pública apenas de dados agregados
* Regras de segurança do Firestore
* Upload de imagens com limite de tamanho

---

## 13. Conformidade com a LGPD

* Consentimento explícito
* Finalidade clara do uso dos dados
* Possibilidade de anonimato
* Dados usados apenas para estatísticas e advocacy

---

## 14. Evoluções Futuras

* Dashboard público de estatísticas
* Filtros por cidade/estado
* Exportação de dados anonimizados
* Integração com órgãos públicos
* Mapa interativo de ocorrências

---

## 15. Considerações Finais

Este projeto tem caráter **social, educativo e político**, buscando dar voz aos ciclistas e transformar dados em impacto real para cidades mais seguras.
