import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/lgpd";
import i18n from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('lgpd.pageTitle') }];
}

export default function LGPD() {
  const { t } = useTranslation('translation');
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-8 inline-block">
          ← {t('back')}
        </Link>

        <h1 className="text-4xl font-bold font-bungee mb-8">{t('lgpd.title')}</h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.protecaoDados.title')}</h2>
            <p className="mb-4">
              {t('lgpd.protecaoDados.desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.dadosColetados.title')}</h2>
            <p className="mb-4">
              {t('lgpd.dadosColetados.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('lgpd.dadosColetados.item1')}</li>
              <li>{t('lgpd.dadosColetados.item2')}</li>
              <li>{t('lgpd.dadosColetados.item3')}</li>
              <li>{t('lgpd.dadosColetados.item4')}</li>
              <li>{t('lgpd.dadosColetados.item5')}</li>
              <li>{t('lgpd.dadosColetados.item6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.finalidade.title')}</h2>
            <p className="mb-4">
              {t('lgpd.finalidade.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('lgpd.finalidade.item1')}</li>
              <li>{t('lgpd.finalidade.item2')}</li>
              <li>{t('lgpd.finalidade.item3')}</li>
              <li>{t('lgpd.finalidade.item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.baseLegal.title')}</h2>
            <p className="mb-4">
              {t('lgpd.baseLegal.desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.compartilhamento.title')}</h2>
            <p className="mb-4">
              {t('lgpd.compartilhamento.desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.direitos.title')}</h2>
            <p className="mb-4">
              {t('lgpd.direitos.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('lgpd.direitos.item1')}</li>
              <li>{t('lgpd.direitos.item2')}</li>
              <li>{t('lgpd.direitos.item3')}</li>
              <li>{t('lgpd.direitos.item4')}</li>
              <li>{t('lgpd.direitos.item5')}</li>
              <li>{t('lgpd.direitos.item6')}</li>
              <li>{t('lgpd.direitos.item7')}</li>
              <li>{t('lgpd.direitos.item8')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.seguranca.title')}</h2>
            <p className="mb-4">
              {t('lgpd.seguranca.desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.retencao.title')}</h2>
            <p className="mb-4">
              {t('lgpd.retencao.desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('lgpd.contato.title')}</h2>
            <p className="mb-4">
              {t('lgpd.contato.desc')} <a href="mailto:ciclistadenuncie@email.com" className="text-blue-600 dark:text-blue-400 underline">ciclistadenuncie@email.com</a>
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              {t('lgpd.ultimaAtualizacao')}: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
