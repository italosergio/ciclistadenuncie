import { Link } from "react-router";
import type { Route } from "./+types/lgpd";

export function meta({}: Route.MetaArgs) {
  return [{ title: "LGPD - Ciclista Denuncie" }];
}

export default function LGPD() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-8 inline-block">
          ← Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Lei Geral de Proteção de Dados (LGPD)</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4">Proteção de Dados Pessoais</h2>
            <p className="mb-4">
              O Ciclista Denuncie está em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD) e respeita a privacidade de todos os usuários da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Dados Coletados</h2>
            <p className="mb-4">
              Coletamos apenas os dados estritamente necessários para o funcionamento da plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Localização geográfica das denúncias (coordenadas GPS)</li>
              <li>Endereço aproximado do incidente</li>
              <li>Tipo de ocorrência relatada</li>
              <li>Descrição do incidente (opcional)</li>
              <li>Placa de veículo (opcional)</li>
              <li>Data e hora do registro</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Finalidade do Tratamento</h2>
            <p className="mb-4">
              Os dados coletados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mapeamento de incidentes relacionados à mobilidade urbana por bicicleta</li>
              <li>Geração de estatísticas públicas sobre segurança viária</li>
              <li>Conscientização sobre problemas enfrentados por ciclistas</li>
              <li>Subsídio para políticas públicas de mobilidade urbana</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Base Legal</h2>
            <p className="mb-4">
              O tratamento de dados pessoais nesta plataforma fundamenta-se no legítimo interesse (Art. 7º, IX da LGPD) para fins de exercício regular de direitos e proteção ao crédito, bem como no consentimento do titular para dados sensíveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Compartilhamento de Dados</h2>
            <p className="mb-4">
              Todas as denúncias registradas são públicas e podem ser visualizadas por qualquer pessoa através do mapa interativo. Não compartilhamos dados pessoais identificáveis com terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Direitos do Titular</h2>
            <p className="mb-4">
              Conforme Art. 18 da LGPD, você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmação da existência de tratamento de dados</li>
              <li>Acesso aos dados tratados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Eliminação dos dados tratados com consentimento</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Segurança</h2>
            <p className="mb-4">
              Adotamos medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acessos não autorizados, destruição, perda, alteração ou divulgação indevida.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Retenção de Dados</h2>
            <p className="mb-4">
              Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas, respeitando os prazos legais de retenção e prescrição aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contato</h2>
            <p className="mb-4">
              Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais, entre em contato através do e-mail: <a href="mailto:ciclistadenuncie@email.com" className="text-blue-600 dark:text-blue-400 underline">ciclistadenuncie@email.com</a>
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
