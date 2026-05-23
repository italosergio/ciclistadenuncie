import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/sucesso-contato";
import i18n from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('sucessoContato.pageTitle') }];
}

export default function SucessoContato() {
  const { t } = useTranslation('translation');
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-6xl">✅</div>

        <h1 className="text-4xl font-bold">
          {t('sucessoContato.title')}
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('sucessoContato.mensagemRecebida')}
          <br />
          {t('sucessoContato.obrigado')}
        </p>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-semibold rounded-lg hover:opacity-90 transition"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
