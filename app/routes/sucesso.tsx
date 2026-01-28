import { Link } from "react-router";
import type { Route } from "./+types/sucesso";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Denúncia Enviada - Ciclista Denuncie" }];
}

export default function Sucesso() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-6xl">✅</div>
        
        <h1 className="text-4xl font-bold">
          Denúncia Registrada
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Sua denúncia foi salva com sucesso no banco de dados.
          <br />
          Obrigado por contribuir com dados reais para a luta por um trânsito mais seguro.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/mapa"
            className="inline-block bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Ver no Mapa
          </Link>
          <Link
            to="/"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-semibold rounded-lg hover:opacity-90 transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
