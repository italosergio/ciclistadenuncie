import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("denunciar", "routes/denunciar.tsx"),
  route("mapa", "routes/mapa.tsx"),
  route("contato", "routes/contato.tsx"),
  route("login", "routes/login.tsx"),
  route("mudar-senha", "routes/mudar-senha.tsx"),
  route("admin", "routes/admin.tsx"),
  route("conta", "routes/conta.tsx"),
  route("sucesso", "routes/sucesso.tsx"),
  route("sucesso-contato", "routes/sucesso-contato.tsx"),
  route("sucesso-cadastro", "routes/sucesso-cadastro.tsx"),
  route("lgpd", "routes/lgpd.tsx"),
  route("termo-responsabilidade-usuario", "routes/termo-responsabilidade-usuario.tsx"),
  route("termo-responsabilidade-plataforma", "routes/termo-responsabilidade-plataforma.tsx"),
  route("usuario/:username", "routes/usuario.$username.tsx"),
] satisfies RouteConfig;
