import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ciclista Denuncie" },
    { name: "description", content: "Plataforma Nacional de Denúncia do Ciclista" },
  ];
}

export default function Home() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const denunciasRef = ref(db, "denuncias");
    const unsubscribe = onValue(denunciasRef, (snapshot) => {
      const data = snapshot.val();
      setTotal(data ? Object.keys(data).length : 0);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold">🚲</h1>
        
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
          Ciclista Denuncie
        </h2>
        
        <div className="py-8">
          <div className="text-7xl md:text-9xl font-bold text-red-600 dark:text-red-500">
            {total.toLocaleString('pt-BR')}
          </div>
          <p className="text-2xl md:text-3xl font-semibold mt-4 text-gray-700 dark:text-gray-300">
            denúncias registradas
          </p>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Violência no trânsito não começa no atropelamento.
          <br />É hora de dar visibilidade ao que você vive nas ruas.
        </p>
        
        <div className="pt-4">
          <Link
            to="/denunciar"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-semibold rounded-lg hover:opacity-90 transition"
          >
            Registrar Denúncia
          </Link>
        </div>
      </div>
    </div>
  );
}
