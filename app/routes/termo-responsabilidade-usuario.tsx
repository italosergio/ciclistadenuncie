import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/termo-responsabilidade-usuario";
import i18n from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('termoUsuario.pageTitle') }];
}

export default function TermoResponsabilidadeUsuario() {
  const { t } = useTranslation('translation');
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-8 inline-block">
          ← {t('back')}
        </Link>

        <h1 className="text-4xl font-bold font-bungee mb-8">{t('termoUsuario.title')}</h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
            <p className="font-bold text-lg mb-2">{t('termoUsuario.declaracaoCiencia')}</p>
            <p>
              {t('termoUsuario.declaracaoDesc')}
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{t('termoUsuario.declaracaoItem1')}</li>
              <li>{t('termoUsuario.declaracaoItem2')}</li>
              <li>{t('termoUsuario.declaracaoItem3')}</li>
              <li>{t('termoUsuario.declaracaoItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoUsuario.section1.title')}</h2>
            <p className="mb-4">
              {t('termoUsuario.section1.desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoUsuario.section2.title')}</h2>
            <p className="mb-4 font-bold text-red-600 dark:text-red-400">
              {t('termoUsuario.section2.aviso')}
            </p>
            <p className="mb-4">
              {t('termoUsuario.section2.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoUsuario.section2.item1')}</li>
              <li>{t('termoUsuario.section2.item2')}</li>
              <li>{t('termoUsuario.section2.item3')}</li>
              <li>{t('termoUsuario.section2.item4')}</li>
              <li>{t('termoUsuario.section2.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoUsuario.section3.title')}</h2>
            <p className="mb-4">
              {t('termoUsuario.section3.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoUsuario.section3.item1')}</li>
              <li>{t('termoUsuario.section3.item2')}</li>
              <li>{t('termoUsuario.section3.item3')}</li>
              <li>{t('termoUsuario.section3.item4')}</li>
              <li>{t('termoUsuario.section3.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoUsuario.section4.title')}</h2>
            <p className="mb-4">
              {t('termoUsuario.section4.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoUsuario.section4.item1')}</li>
              <li>{t('termoUsuario.section4.item2')}</li>
              <li>{t('termoUsuario.section4.item3')}</li>
              <li>{t('termoUsuario.section4.item4')}</li>
            </ul>
            <p className="mb-4 mt-4">
              {t('termoUsuario.section4.indenizacao')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoUsuario.section5.title')}</h2>
            <p className="mb-4">
              {t('termoUsuario.section5.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoUsuario.section5.item1')}</li>
              <li>{t('termoUsuario.section5.item2')}</li>
              <li>{t('termoUsuario.section5.item3')}</li>
              <li>{t('termoUsuario.section5.item4')}</li>
              <li>{t('termoUsuario.section5.item5')}</li>
            </ul>
          </section>

          <section>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              {t('termoUsuario.ultimaAtualizacao')}: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
