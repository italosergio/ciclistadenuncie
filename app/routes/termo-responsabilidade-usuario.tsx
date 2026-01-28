import { Link } from "react-router";
import type { Route } from "./+types/termo-responsabilidade-usuario";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Termo de Responsabilidade do Usuário - Ciclista Denuncie" }];
}

export default function TermoResponsabilidadeUsuario() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-8 inline-block">
          ← Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Termo de Responsabilidade do Usuário</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
            <p className="font-bold text-lg mb-2">⚠️ DECLARAÇÃO DE CIÊNCIA</p>
            <p>
              Ao utilizar esta plataforma, você declara estar ciente de que:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Forneceu informações verdadeiras</li>
              <li>Compreende as responsabilidades legais envolvidas</li>
              <li>Concorda com todos os termos aqui estabelecidos</li>
              <li>Utilizará a plataforma de forma ética e responsável</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
            <p className="mb-4">
              Ao utilizar a plataforma Ciclista Denuncie, você concorda com os termos e condições aqui estabelecidos. Se não concordar com qualquer parte destes termos, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Veracidade das Informações</h2>
            <p className="mb-4 font-bold text-red-600 dark:text-red-400">
              ATENÇÃO: Fornecer informações falsas constitui crime previsto no Art. 299 do Código Penal Brasileiro (falsidade ideológica), punível com reclusão de 1 a 5 anos e multa.
            </p>
            <p className="mb-4">
              O usuário declara e garante que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Todas as informações fornecidas são verdadeiras e precisas</li>
              <li>Os fatos relatados ocorreram conforme descrito</li>
              <li>As localizações indicadas correspondem aos locais reais dos incidentes</li>
              <li>Não utilizará a plataforma para difamação, calúnia ou injúria</li>
              <li>Não registrará denúncias falsas ou enganosas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Uso Adequado da Plataforma</h2>
            <p className="mb-4">
              A plataforma destina-se exclusivamente ao registro de incidentes reais relacionados à mobilidade urbana por bicicleta. O usuário compromete-se a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar a plataforma apenas para fins legítimos</li>
              <li>Não publicar conteúdo ofensivo, discriminatório ou ilegal</li>
              <li>Não utilizar a plataforma para perseguição ou assédio</li>
              <li>Respeitar a privacidade de terceiros</li>
              <li>Não divulgar dados pessoais sensíveis de outras pessoas sem consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Responsabilidade Civil e Criminal</h2>
            <p className="mb-4">
              O usuário é integralmente responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Todo conteúdo que publicar na plataforma</li>
              <li>Danos causados a terceiros por informações falsas ou difamatórias</li>
              <li>Consequências legais decorrentes do uso indevido da plataforma</li>
              <li>Violações de direitos de terceiros</li>
            </ul>
            <p className="mb-4 mt-4">
              O usuário concorda em indenizar e isentar a plataforma Ciclista Denuncie de qualquer reclamação, perda ou dano resultante do uso inadequado do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Crimes Relacionados</h2>
            <p className="mb-4">
              Esteja ciente das seguintes tipificações criminais:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Falsidade Ideológica (Art. 299 CP):</strong> Omitir ou inserir declaração falsa em documento - Reclusão de 1 a 5 anos e multa</li>
              <li><strong>Calúnia (Art. 138 CP):</strong> Imputar falsamente fato definido como crime - Detenção de 6 meses a 2 anos e multa</li>
              <li><strong>Difamação (Art. 139 CP):</strong> Imputar fato ofensivo à reputação - Detenção de 3 meses a 1 ano e multa</li>
              <li><strong>Injúria (Art. 140 CP):</strong> Ofender dignidade ou decoro - Detenção de 1 a 6 meses ou multa</li>
              <li><strong>Denunciação Caluniosa (Art. 339 CP):</strong> Dar causa à instauração de investigação contra alguém inocente - Reclusão de 2 a 8 anos e multa</li>
            </ul>
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
