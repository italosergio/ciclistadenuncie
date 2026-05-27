import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/sucesso-cadastro";
import i18n from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('sucessoCadastro.pageTitle') }];
}

export default function SucessoCadastro() {
  const { t } = useTranslation('translation');
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-6xl">✅</div>

        <h1 className="text-4xl font-bold font-bungee">
          {t('sucessoCadastro.title')}
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('sucessoCadastro.contaCriada')}
          <br />
          {t('sucessoCadastro.facaLogin')}
        </p>

        <div className="pt-4">
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {t('user.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
