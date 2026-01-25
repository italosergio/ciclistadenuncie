# Documentação - Ciclista Denuncie

## Sobre o Projeto

Ciclista Denuncie é uma plataforma web para registro e visualização de denúncias relacionadas à mobilidade urbana por bicicleta. O sistema permite que ciclistas reportem problemas como infraestrutura inadequada, assédio, ameaças e outros incidentes.

## Tecnologias

- **React Router v7** - Framework full-stack React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **Leaflet** - Mapas interativos
- **Lucide React** - Ícones
- **Firebase** - Backend e autenticação

## Estrutura do Projeto

```
ciclistadenuncie/
├── app/
│   ├── routes/          # Páginas da aplicação
│   ├── components/      # Componentes reutilizáveis
│   ├── lib/            # Utilitários e helpers
│   ├── services/       # Serviços externos (API, geocoding)
│   └── config/         # Configurações
├── public/             # Arquivos estáticos
└── build/              # Build de produção
```

## Funcionalidades Principais

### 1. Registro de Denúncias (Multi-etapas)

Sistema de formulário em 3 etapas com navegação intuitiva:

#### Etapa 1: Tipo de Denúncia
- Seleção do tipo de incidente
- Categorias: Fina, Ameaça, Assédio, Agressão, Infraestrutura, etc.
- Campo customizável para "Outro"
- Validação obrigatória

#### Etapa 2: Relato
- Descrição detalhada do ocorrido (opcional mas recomendado)
- Campo para placa do veículo (opcional)
- Suporte para navegação por teclado (Tab/Enter)

#### Etapa 3: Localização
- Confirmação automática via GPS
- Ajuste manual através de mapa interativo
- Geocodificação reversa para exibir endereço

**Características:**
- Navegação por botões (Próximo/Voltar)
- Indicadores visuais de progresso
- Navegação direta clicando nos círculos de etapa
- Validação por etapa
- Prevenção de envio acidental

### 2. Visualização de Denúncias

- Mapa interativo com marcadores
- Filtros por tipo de denúncia
- Filtros por período (últimos 7, 30, 90 dias ou todos)
- Visualização de detalhes ao clicar no marcador
- Diferentes camadas de mapa (Rua, Satélite, Topográfico)

### 3. Autenticação

- Login com Google
- Perfil de usuário
- Histórico de denúncias do usuário

## APIs e Serviços

### Geocoding
- **Nominatim (OpenStreetMap)** - Geocodificação reversa
- Conversão de coordenadas em endereços legíveis

### Mapas
- **OpenStreetMap** - Camada de rua
- **Esri World Imagery** - Camada satélite
- **OpenTopoMap** - Camada topográfica

### IBGE
- Busca de cidades brasileiras
- Dados municipais

## Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone git@github.com:italosergio/ciclistadenuncie.git
cd ciclistadenuncie

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Criar arquivo `.env` na raiz:

```env
# Firebase
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Build e Deploy

### Build de Produção

```bash
npm run build
```

### Deploy com Docker

```bash
docker build -t ciclistadenuncie .
docker run -p 3000:3000 ciclistadenuncie
```

## Estrutura de Dados

### Denúncia

```typescript
interface Denuncia {
  id: string;
  tipo: string;
  relato?: string;
  placa?: string;
  endereco: string;
  localizacao: {
    lat: number;
    lng: number;
  };
  data: Date;
  usuarioId?: string;
}
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Convenções de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## Licença

Este projeto está sob a licença  GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007.

## Contato

- GitHub: [@italosergio](https://github.com/italosergio)
- Repositório: [ciclistadenuncie](https://github.com/italosergio/ciclistadenuncie)
