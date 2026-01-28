import { Link } from "react-router";
import type { Route } from "./+types/sucesso-cadastro";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cadastro Realizado - Ciclista Denuncie" }];
}

export default function SucessoCadastro() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-6xl">✅</div>
        
        <h1 className="text-4xl font-bold">
          Cadastro Realizado
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Sua conta foi criada com sucesso!
          <br />
          Agora você pode fazer login e acessar o sistema.
        </p>
        
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
