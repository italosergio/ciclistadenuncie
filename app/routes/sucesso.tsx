import { Link, useLocation } from "react-router";
import type { Route } from "./+types/sucesso";
import { MapPin, Tag, Car } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Denúncia Enviada - Ciclista Denuncie" }];
}

export default function Sucesso() {
  const location = useLocation();
  const { location: coords, tipo, endereco, placa } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl">✅</div>

        <h1 className="text-3xl font-bold">Denúncia Registrada!</h1>

        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Obrigado por contribuir com dados reais para a luta por um trânsito mais seguro.
        </p>

        {(tipo || endereco || placa) && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resumo da denúncia</p>
            {tipo && (
              <div className="flex items-start gap-2 text-sm">
                <Tag size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{tipo}</span>
              </div>
            )}
            {endereco && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{endereco}</span>
              </div>
            )}
            {placa && (
              <div className="flex items-start gap-2 text-sm">
                <Car size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="font-mono text-gray-700 dark:text-gray-300">{placa}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/mapa"
            state={{ center: coords ? [coords.lat, coords.lng] : undefined, zoom: 16 }}
            className="inline-block bg-red-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Ver no Mapa
          </Link>
          <Link
            to="/"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-semibold rounded-lg hover:opacity-90 transition"
          >
            Voltar ao Início
          </Link>
        </div>

        <Link
          to="/denunciar"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
        >
          Fazer Outra Denúncia
        </Link>
      </div>
    </div>
  );
}
