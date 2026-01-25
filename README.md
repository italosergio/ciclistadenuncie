# Ciclista Denuncie 🚴

Plataforma web para registro e visualização de denúncias relacionadas à mobilidade urbana por bicicleta.

[![React Router](https://img.shields.io/badge/React%20Router-v7-red)](https://reactrouter.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8)](https://tailwindcss.com/)

## 🎯 Sobre

Sistema que permite ciclistas reportarem problemas de infraestrutura, assédio, ameaças e outros incidentes relacionados à mobilidade por bicicleta. Inclui mapa interativo para visualização e registro geolocalizado de denúncias.

## ✨ Funcionalidades

- 📝 **Registro de Denúncias** - Formulário multi-etapas intuitivo
- 🗺️ **Mapa Interativo** - Visualização geolocalizada com múltiplas camadas
- 🔍 **Filtros Avançados** - Por tipo e período
- 🔐 **Autenticação** - Login com Google
- 📱 **Responsivo** - Funciona em desktop e mobile
- 🌓 **Dark Mode** - Suporte a tema escuro

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

Acesse: `http://localhost:5173`

## 📚 Documentação

Para documentação completa, incluindo arquitetura, APIs, estrutura de dados e guia de contribuição, consulte:

**[📖 DOCUMENTATION.md](./DOCUMENTATION.md)**

## 🛠️ Tecnologias

- React Router v7 (SSR)
- TypeScript
- TailwindCSS
- Leaflet (Mapas)
- Firebase
- Lucide React (Ícones)

## 🐳 Docker

```bash
docker build -t ciclistadenuncie .
docker run -p 3000:3000 ciclistadenuncie
```

## 📦 Estrutura

```
ciclistadenuncie/
├── app/
│   ├── routes/          # Páginas
│   ├── components/      # Componentes
│   ├── lib/            # Utilitários
│   └── services/       # APIs externas
├── public/             # Assets estáticos
└── DOCUMENTATION.md    # Documentação completa
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [DOCUMENTATION.md](./DOCUMENTATION.md) para detalhes sobre como contribuir.

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

## 🔗 Links

- [Documentação Completa](./DOCUMENTATION.md)
- [React Router Docs](https://reactrouter.com/)
- [Repositório](https://github.com/italosergio/ciclistadenuncie)

---

Desenvolvido com ❤️ para melhorar a mobilidade urbana por bicicleta
