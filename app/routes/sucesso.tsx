import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/sucesso";
import i18n from "../lib/i18n";
import { MapPin, Car, Wind, Megaphone, Hand, MessageSquareWarning, AlertTriangle, Lightbulb, CircleSlash, Wrench, Bike, Construction, MoreHorizontal } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  fina: Wind,
  ameaca: Megaphone,
  assedio: Hand,
  "agressao-verbal": MessageSquareWarning,
  "agressao-fisica": Car,
  "invasao-ciclovia": Construction,
  "buraco-via": AlertTriangle,
  "falta-sinalizacao": CircleSlash,
  "trecho-perigoso": AlertTriangle,
  "ciclovia-obstruida": Construction,
  "falta-iluminacao": Lightbulb,
  "veiculo-estacionado": Car,
  "ma-conservacao": Wrench,
  "falta-ciclovia": Bike,
};

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('sucesso.pageTitle') }];
}

export default function Sucesso() {
  const location = useLocation();
  const { location: coords, situacoes, tipo, endereco, placa } = location.state || {};
  const { t } = useTranslation('translation');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl">✅</div>

        <h1 className="text-3xl font-bold">{t('sucesso.title')}</h1>

        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t('sucesso.obrigado')}
        </p>

        {(situacoes || tipo || endereco || placa) && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {situacoes ? t('sucesso.resumoContagem', { count: situacoes.length }) : t('sucesso.resumo')}
            </p>

            {/* Lista de situações (novo formato) */}
            {situacoes && situacoes.length > 0 && (
              <div className="space-y-2">
                {situacoes.map((sit: any, index: number) => {
                  const Icon = ICON_MAP[sit.tipo] || MoreHorizontal;
                  const label = sit.tipo === "outro" && sit.relato ? sit.relato : sit.tipo;
                  return (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Icon size={15} className="mt-0.5 shrink-0 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fallback para denúncias legadas (único tipo) */}
            {!situacoes && tipo && (
              <div className="flex items-start gap-2 text-sm">
                <MoreHorizontal size={15} className="mt-0.5 shrink-0 text-gray-400" />
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
            {t('sucesso.verNoMapa')}
          </Link>
          <Link
            to="/"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-semibold rounded-lg hover:opacity-90 transition"
          >
            {t('backToHome')}
          </Link>
        </div>

        <Link
          to="/denunciar"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
        >
          {t('sucesso.fazerOutraDenuncia')}
        </Link>
      </div>
    </div>
  );
}
