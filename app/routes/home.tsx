import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import Logo from "../components/Logo";
import BikeFireAnimation from "../components/BikeFireAnimation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ciclista Denuncie - Plataforma Nacional de Denúncia do Ciclista" },
    { name: "description", content: "Registre e visualize denúncias de violência no trânsito, infraestrutura precária e incidentes contra ciclistas. Dê visibilidade ao que você vive nas ruas." },
    { name: "keywords", content: "ciclista, denúncia, mobilidade urbana, bicicleta, trânsito, segurança viária, infraestrutura cicloviária" },
    
    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Ciclista Denuncie 🚲" },
    { property: "og:description", content: "Violência no trânsito não começa no atropelamento. Registre denúncias e dê visibilidade aos problemas enfrentados por ciclistas." },
    { property: "og:image", content: "https://ciclistadenuncie.com.br/logo-ciclistadenuncie.png" },
    { property: "og:url", content: "https://ciclistadenuncie.com.br" },
    { property: "og:locale", content: "pt_BR" },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Ciclista Denuncie 🚲" },
    { name: "twitter:description", content: "Violência no trânsito não começa no atropelamento. Registre denúncias e dê visibilidade aos problemas enfrentados por ciclistas." },
    { name: "twitter:image", content: "https://ciclistadenuncie.com.br/logo-ciclistadenuncie.png" },
  ];
}

export default function Home() {
  const [total, setTotal] = useState(0);
  const [CountUpComponent, setCountUpComponent] = useState<any>(null);
  const [showAnimation, setShowAnimation] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center px-4 py-8" onClick={() => showAnimation && setShowAnimation(false)}>
      {showAnimation && <BikeFireAnimation />}
      <div className="max-w-6xl text-center space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center">
          <Logo onTripleClick={() => setShowAnimation(!showAnimation)} />
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          CICLISTA, DENUNCIE!
        </h2>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Violência no trânsito não começa no atropelamento.
          <br />É hora de dar <Link to="/mapa" className="text-red-600 dark:text-red-500 font-bold underline hover:opacity-80 transition">visibilidade</Link> ao que você vive nas ruas.
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
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-7 py-3.5 text-lg font-semibold rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white active:scale-95 transition-all"
          >
            Registrar Denúncia
          </Link>
        </div>
        
        <div className="pt-2 space-x-4">
          <Link
            to="/mapa"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
          >
            Mapa
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            to="/contato"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
          >
            Contato
          </Link>
        </div>
        
        <div className="pt-8 pb-4 text-xs text-gray-400 dark:text-gray-500 space-y-2">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/lgpd" className="hover:text-gray-600 dark:hover:text-gray-400 underline">
              Proteção de Dados
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/termo-responsabilidade-usuario" className="hover:text-gray-600 dark:hover:text-gray-400 underline">
              Termo de Responsabilidade do Usuário
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/termo-responsabilidade-plataforma" className="hover:text-gray-600 dark:hover:text-gray-400 underline">
              Termo de Responsabilidade da Plataforma
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
