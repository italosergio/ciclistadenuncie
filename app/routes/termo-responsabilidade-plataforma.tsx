import { Link } from "react-router";
import type { Route } from "./+types/termo-responsabilidade-plataforma";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Termo de Responsabilidade da Plataforma - Ciclista Denuncie" }];
}

export default function TermoResponsabilidadePlataforma() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-8 inline-block">
          ← Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Termo de Responsabilidade da Plataforma</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-2 border-red-400 dark:border-red-600">
            <p className="font-bold text-lg mb-2">⚠️ AVISO IMPORTANTE</p>
            <p>
              O Ciclista Denuncie é uma plataforma de mapeamento colaborativo. Todo o conteúdo publicado é de responsabilidade exclusiva dos usuários que o submetem. A plataforma não verifica, valida ou endossa as informações fornecidas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Natureza da Plataforma</h2>
            <p className="mb-4">
              O Ciclista Denuncie é uma ferramenta de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mapeamento colaborativo de incidentes relacionados à mobilidade urbana por bicicleta</li>
              <li>Visualização de dados fornecidos por usuários</li>
              <li>Conscientização sobre problemas enfrentados por ciclistas</li>
              <li>Subsídio informativo para discussões sobre políticas públicas</li>
            </ul>
            <p className="mb-4 mt-4 font-bold">
              A plataforma NÃO é:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Um órgão oficial de denúncias</li>
              <li>Uma autoridade policial ou judicial</li>
              <li>Um serviço de emergência</li>
              <li>Uma fonte oficial de dados estatísticos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Responsabilidade pelo Conteúdo</h2>
            <p className="mb-4">
              <strong>Todo o conteúdo publicado na plataforma é de responsabilidade exclusiva do usuário que o submete.</strong>
            </p>
            <p className="mb-4">
              A plataforma Ciclista Denuncie:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>NÃO verifica a veracidade das informações fornecidas</li>
              <li>NÃO valida a autenticidade dos relatos</li>
              <li>NÃO confirma a ocorrência dos incidentes reportados</li>
              <li>NÃO investiga as denúncias registradas</li>
              <li>NÃO assume responsabilidade por informações falsas, imprecisas ou enganosas</li>
              <li>NÃO se responsabiliza por danos causados por conteúdo publicado por usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Limitação de Responsabilidade</h2>
            <p className="mb-4">
              A plataforma e seus administradores NÃO se responsabilizam por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Precisão, completude ou confiabilidade das informações publicadas</li>
              <li>Danos diretos ou indiretos resultantes do uso da plataforma</li>
              <li>Decisões tomadas com base nas informações disponibilizadas</li>
              <li>Conflitos, disputas ou processos judiciais entre usuários e terceiros</li>
              <li>Violações de direitos de terceiros por parte dos usuários</li>
              <li>Crimes cometidos através do uso indevido da plataforma</li>
              <li>Perda de dados ou interrupção do serviço</li>
              <li>Conteúdo ofensivo, difamatório ou ilegal publicado por usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Uso das Informações</h2>
            <p className="mb-4">
              As informações disponibilizadas na plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>São fornecidas "como estão", sem garantias de qualquer tipo</li>
              <li>Não devem ser consideradas como prova legal ou evidência oficial</li>
              <li>Não substituem boletins de ocorrência ou denúncias formais às autoridades</li>
              <li>Podem conter erros, imprecisões ou informações desatualizadas</li>
              <li>Devem ser interpretadas com senso crítico e cautela</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Denúncias Oficiais</h2>
            <p className="mb-4 font-bold text-blue-600 dark:text-blue-400">
              IMPORTANTE: Esta plataforma NÃO substitui denúncias oficiais às autoridades competentes.
            </p>
            <p className="mb-4">
              Em caso de crimes ou situações que exijam intervenção oficial, procure:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Polícia Militar:</strong> 190 (emergências)</li>
              <li><strong>SAMU:</strong> 192 (emergências médicas)</li>
              <li><strong>Polícia Civil:</strong> Delegacias para registro de boletim de ocorrência</li>
              <li><strong>Ministério Público:</strong> Para denúncias de irregularidades</li>
              <li><strong>Ouvidorias municipais:</strong> Para problemas de infraestrutura urbana</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Disponibilidade do Serviço</h2>
            <p className="mb-4">
              A plataforma é fornecida sem garantias de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Disponibilidade contínua ou ininterrupta</li>
              <li>Ausência de erros ou falhas técnicas</li>
              <li>Segurança absoluta contra invasões ou ataques</li>
              <li>Backup ou recuperação de dados</li>
              <li>Manutenção indefinida do serviço</li>
            </ul>
            <p className="mb-4 mt-4">
              O serviço pode ser descontinuado, modificado ou interrompido a qualquer momento, sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Cooperação com Autoridades</h2>
            <p className="mb-4">
              A plataforma cooperará integralmente com autoridades competentes em investigações, fornecendo dados mediante ordem judicial, conforme previsto no Marco Civil da Internet.
            </p>
          </section>

          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="font-bold text-lg mb-2">📋 RESUMO</p>
            <p className="mb-4">
              Em resumo, o Ciclista Denuncie é uma ferramenta de mapeamento colaborativo onde:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usuários são responsáveis pelo conteúdo que publicam</li>
              <li>A plataforma não verifica ou valida informações</li>
              <li>Não substituímos denúncias oficiais às autoridades</li>
              <li>Não nos responsabilizamos por danos decorrentes do uso</li>
              <li>O serviço é fornecido "como está", sem garantias</li>
            </ul>
            <p className="mt-4 font-bold">
              Use com responsabilidade e bom senso. Em emergências, acione as autoridades competentes.
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
