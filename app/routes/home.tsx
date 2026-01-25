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
  const [CountUpComponent, setCountUpComponent] = useState<any>(null);

  useEffect(() => {
    import('react-countup').then(module => {
      setCountUpComponent(() => module.default);
    });
  }, []);

  useEffect(() => {
    const denunciasRef = ref(db, "denuncias");
    const unsubscribe = onValue(denunciasRef, (snapshot) => {
      const data = snapshot.val();
      setTotal(data ? Object.keys(data).length : 0);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl text-center space-y-5">
        <h1 className="text-5xl md:text-7xl font-bold">🚲</h1>
        
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Ciclista Denuncie
        </h2>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Violência no trânsito não começa no atropelamento.
          <br />É hora de dar visibilidade ao que você vive nas ruas.
        </p>
        
        <Link to="/mapa" className="block py-5 hover:opacity-80 transition">
          <div className="text-8xl md:text-9xl font-bold text-red-600 dark:text-red-500">
            {CountUpComponent ? (
              <CountUpComponent 
                start={0}
                end={total} 
                duration={2.5}
                useEasing={true}
                separator="."
              />
            ) : total.toLocaleString('pt-BR')}
          </div>
          <p className="text-xl md:text-2xl font-semibold mt-3 text-gray-700 dark:text-gray-300">
            denúncias registradas
          </p>
        </Link>
        
        <div className="pt-3 pb-4">
          <Link
            to="/denunciar"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-7 py-3.5 text-lg font-semibold rounded-lg hover:opacity-90 transition"
          >
            Registrar Denúncia
          </Link>
        </div>
      </div>
    </div>
  );
}
