import { Link, useLocation } from "react-router";
import type { Route } from "./+types/sucesso";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Denúncia Enviada - Ciclista Denuncie" }];
}

export default function Sucesso() {
  const location = useLocation();
  const denunciaLocation = location.state?.location;
  
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
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-2">🔒 Cuidamos dos seus dados</p>
          <p className="mb-3">Você não aparece publicamente na denúncia. Ao fazer denúncia logado, você pode acessar a página <strong>Minhas Contribuições</strong> para ver, editar ou excluir suas denúncias.</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link to="/termo-responsabilidade-usuario" className="text-blue-600 dark:text-blue-400 hover:underline">
              Termo do Usuário
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/termo-responsabilidade-plataforma" className="text-blue-600 dark:text-blue-400 hover:underline">
              Termo da Plataforma
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/lgpd" className="text-blue-600 dark:text-blue-400 hover:underline">
              Proteção de Dados (LGPD)
            </Link>
          </div>
        </div>
        
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/mapa"
            state={{ center: denunciaLocation ? [denunciaLocation.lat, denunciaLocation.lng] : undefined, zoom: 16 }}
            className="inline-block bg-red-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-red-700 transition"
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
        
        <div className="pt-4">
          <Link
            to="/denunciar"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
          >
            Fazer Outra Denúncia
          </Link>
        </div>
      </div>
    </div>
  );
}
