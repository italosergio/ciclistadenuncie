import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("denunciar", "routes/denunciar.tsx"),
  route("mapa", "routes/mapa.tsx"),
  route("sucesso", "routes/sucesso.tsx"),
] satisfies RouteConfig;
