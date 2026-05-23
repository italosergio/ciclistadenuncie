import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/termo-responsabilidade-plataforma";

export function meta({}: Route.MetaArgs) {
  const { t } = useTranslation('translation');
  return [{ title: t('termoPlataforma.pageTitle') }];
}

export default function TermoResponsabilidadePlataforma() {
  const { t } = useTranslation('translation');
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-8 inline-block">
          ← {t('back')}
        </Link>

        <h1 className="text-4xl font-bold mb-8">{t('termoPlataforma.title')}</h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-2 border-red-400 dark:border-red-600">
            <p className="font-bold text-lg mb-2">{t('termoPlataforma.avisoImportante')}</p>
            <p>
              {t('termoPlataforma.avisoDesc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section1.title')}</h2>
            <p className="mb-4">
              {t('termoPlataforma.section1.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section1.item1')}</li>
              <li>{t('termoPlataforma.section1.item2')}</li>
              <li>{t('termoPlataforma.section1.item3')}</li>
              <li>{t('termoPlataforma.section1.item4')}</li>
            </ul>
            <p className="mb-4 mt-4 font-bold">
              {t('termoPlataforma.section1.naoDesc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section1.naoItem1')}</li>
              <li>{t('termoPlataforma.section1.naoItem2')}</li>
              <li>{t('termoPlataforma.section1.naoItem3')}</li>
              <li>{t('termoPlataforma.section1.naoItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section2.title')}</h2>
            <p className="mb-4">
              <strong>{t('termoPlataforma.section2.desc1')}</strong>
            </p>
            <p className="mb-4">
              {t('termoPlataforma.section2.desc2')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section2.item1')}</li>
              <li>{t('termoPlataforma.section2.item2')}</li>
              <li>{t('termoPlataforma.section2.item3')}</li>
              <li>{t('termoPlataforma.section2.item4')}</li>
              <li>{t('termoPlataforma.section2.item5')}</li>
              <li>{t('termoPlataforma.section2.item6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section3.title')}</h2>
            <p className="mb-4">
              {t('termoPlataforma.section3.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section3.item1')}</li>
              <li>{t('termoPlataforma.section3.item2')}</li>
              <li>{t('termoPlataforma.section3.item3')}</li>
              <li>{t('termoPlataforma.section3.item4')}</li>
              <li>{t('termoPlataforma.section3.item5')}</li>
              <li>{t('termoPlataforma.section3.item6')}</li>
              <li>{t('termoPlataforma.section3.item7')}</li>
              <li>{t('termoPlataforma.section3.item8')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section4.title')}</h2>
            <p className="mb-4">
              {t('termoPlataforma.section4.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section4.item1')}</li>
              <li>{t('termoPlataforma.section4.item2')}</li>
              <li>{t('termoPlataforma.section4.item3')}</li>
              <li>{t('termoPlataforma.section4.item4')}</li>
              <li>{t('termoPlataforma.section4.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section5.title')}</h2>
            <p className="mb-4 font-bold text-blue-600 dark:text-blue-400">
              {t('termoPlataforma.section5.aviso')}
            </p>
            <p className="mb-4">
              {t('termoPlataforma.section5.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section5.item1')}</li>
              <li>{t('termoPlataforma.section5.item2')}</li>
              <li>{t('termoPlataforma.section5.item3')}</li>
              <li>{t('termoPlataforma.section5.item4')}</li>
              <li>{t('termoPlataforma.section5.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section6.title')}</h2>
            <p className="mb-4">
              {t('termoPlataforma.section6.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section6.item1')}</li>
              <li>{t('termoPlataforma.section6.item2')}</li>
              <li>{t('termoPlataforma.section6.item3')}</li>
              <li>{t('termoPlataforma.section6.item4')}</li>
              <li>{t('termoPlataforma.section6.item5')}</li>
            </ul>
            <p className="mb-4 mt-4">
              {t('termoPlataforma.section6.fim')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section7.title')}</h2>
            <p className="mb-4">
              <strong>{t('termoPlataforma.section7.autenticacao')}</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section7.authItem1')}</li>
              <li>{t('termoPlataforma.section7.authItem2')}</li>
              <li>{t('termoPlataforma.section7.authItem3')}</li>
              <li>{t('termoPlataforma.section7.authItem4')}</li>
            </ul>
            <p className="mb-4 mt-4">
              <strong>{t('termoPlataforma.section7.privacidade')}</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section7.privItem1')}</li>
              <li>{t('termoPlataforma.section7.privItem2')}</li>
              <li>{t('termoPlataforma.section7.privItem3')}</li>
              <li>{t('termoPlataforma.section7.privItem4')}</li>
            </ul>
            <p className="mb-4 mt-4">
              <strong>{t('termoPlataforma.section7.autonomia')}</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section7.autItem1')}</li>
              <li>{t('termoPlataforma.section7.autItem2')}</li>
              <li>{t('termoPlataforma.section7.autItem3')}</li>
              <li>{t('termoPlataforma.section7.autItem4')}</li>
            </ul>
            <p className="mb-4 mt-4">
              <strong>{t('termoPlataforma.section7.historico')}</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.section7.histItem1')}</li>
              <li>{t('termoPlataforma.section7.histItem2')}</li>
              <li>{t('termoPlataforma.section7.histItem3')}</li>
              <li>{t('termoPlataforma.section7.histItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('termoPlataforma.section8.title')}</h2>
            <p className="mb-4">
              {t('termoPlataforma.section8.desc')}
            </p>
          </section>

          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="font-bold text-lg mb-2">{t('termoPlataforma.resumo.title')}</p>
            <p className="mb-4">
              {t('termoPlataforma.resumo.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('termoPlataforma.resumo.item1')}</li>
              <li>{t('termoPlataforma.resumo.item2')}</li>
              <li>{t('termoPlataforma.resumo.item3')}</li>
              <li>{t('termoPlataforma.resumo.item4')}</li>
              <li>{t('termoPlataforma.resumo.item5')}</li>
            </ul>
            <p className="mt-4 font-bold">
              {t('termoPlataforma.resumo.fim')}
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              {t('termoPlataforma.ultimaAtualizacao')}: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
