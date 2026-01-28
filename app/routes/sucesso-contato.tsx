import { Link } from "react-router";
import type { Route } from "./+types/sucesso-contato";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mensagem Enviada - Ciclista Denuncie" }];
}

export default function SucessoContato() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-6xl">✅</div>
        
        <h1 className="text-4xl font-bold">
          Mensagem Enviada
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Sua mensagem foi recebida com sucesso.
          <br />
          Obrigado pelo contato!
        </p>
        
        <div className="pt-4">
          <Link
            to="/"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-semibold rounded-lg hover:opacity-90 transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
