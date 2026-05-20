import { useEffect, useState, useRef } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import Logo from "../components/Logo";
import BikeFireAnimation from "../components/BikeFireAnimation";
import { useAuth } from "../lib/AuthContext";
import { ChevronDown, BarChart3, LogOut, User, Shield, X } from "lucide-react";
import { APOIADORES } from "../data/apoiadores";

interface ApoiadorCarousel {
  nome: string;
  url: string;
  img: string;
  alt: string;
}

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
  const [countUpDone, setCountUpDone] = useState(false);
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const [apoiadoresFirebase, setApoiadoresFirebase] = useState<ApoiadorCarousel[]>([]);

  useEffect(() => {
    const apoiadoresRef = ref(db, "apoiadores");
    const unsubscribe = onValue(apoiadoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            nome: value.nome || "",
            url: value.url || "",
            img: value.img || `/apoiadores/default.jpg`,
            alt: value.alt || value.nome || "",
          }))
          .filter(a => a.nome);
        setApoiadoresFirebase(lista);
      } else {
        setApoiadoresFirebase([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const allApoiadores = apoiadoresFirebase.length > 0 ? apoiadoresFirebase : APOIADORES;

  const [showEmailBanner, setShowEmailBanner] = useState(false);

  const [apoiadorIndex, setApoiadorIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const hoverRef = useRef(false);
  const preloadedRef = useRef(new Set<string>());

  // Pré-carrega a imagem do próximo apoiador
  const preloadNext = useRef((index: number) => {
    const src = allApoiadores[index].img;
    if (!preloadedRef.current.has(src)) {
      preloadedRef.current.add(src);
      const img = new Image();
      img.src = src;
    }
  });

  useEffect(() => {
    // Pré-carrega a primeira imagem seguinte já no início
    preloadNext.current((apoiadorIndex + 1) % allApoiadores.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (hoverRef.current || fading) return;
      const next = (apoiadorIndex + 1) % allApoiadores.length;
      preloadNext.current((next + 1) % allApoiadores.length); // pré-carrega a próxima
      setFading(true); // inicia fade OUT
    }, 2000);
    return () => clearInterval(timer);
  }, [apoiadorIndex, fading]);

  // Fade OUT completo (300ms) → troca conteúdo → aguarda paint → fade IN
  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => {
      // Troca o índice (nova img aparece invisível, opacity-0)
      setApoiadorIndex(prev => (prev + 1) % allApoiadores.length);
      // Espera o browser pintar a nova imagem
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Agora sim: fade IN (remove opacity-0, transiciona para opacity-100)
          setFading(false);
        });
      });
    }, 300);
    return () => clearTimeout(t);
  }, [fading]);

  useEffect(() => {
    if (user && (!user.email || user.email.endsWith('@ciclistadenuncie.local'))) {
      setShowEmailBanner(true);
    }
  }, [user]);

  return (
    <div className="h-screen flex items-center justify-center px-4 pt-8 md:pt-0 overflow-hidden" onClick={() => showAnimation && setShowAnimation(false)}>
      {(showAnimation || countUpDone) && <BikeFireAnimation />}

      {showEmailBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-black px-4 py-2 flex items-center justify-between text-sm">
          <span>⚠️ Sua conta não tem e-mail cadastrado. <Link to="/conta" className="underline font-semibold">Adicione agora</Link> para poder recuperar sua senha.</span>
          <button onClick={() => setShowEmailBanner(false)}><X size={16} /></button>
        </div>
      )}
      
      {/* Links de autenticação no topo direito */}
      <div className="absolute top-4 right-4 z-50">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-[10px] md:text-xs flex items-center gap-1"
            >
              Bem-vindo, <span className="text-red-600 dark:text-red-500">{user.username}</span>!
              <ChevronDown size={12} />
            </button>
            {showUserMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-w-[180px] overflow-hidden z-10">
                <Link
                  to={`/usuario/${user.username}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <BarChart3 size={16} /> Minhas Contribuições
                </Link>
                <Link
                  to="/conta"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} /> Conta
                </Link>
                {(user.role === 'administrador' || user.role === 'moderador') && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 font-semibold"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Shield size={16} /> Painel ADM
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-xs"
            >
              Entrar
            </Link>
          </>
        )}
      </div>

      <div className="max-w-6xl text-center space-y-4 md:space-y-2 relative z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center">
          <Logo onTripleClick={() => setShowAnimation(!showAnimation)} />
        </div>
        
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
          CICLISTA, DENUNCIE!
        </h2>
        
        <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Violência no trânsito não começa no atropelamento.
          <br />É hora de dar <Link to="/mapa" className="text-red-600 dark:text-red-500 font-bold underline hover:opacity-80 transition">visibilidade</Link> ao que você vive nas ruas.
        </p>
        
        <Link to="/mapa" className="block py-3 md:py-3 hover:opacity-80 transition">
          <div className="text-6xl md:text-8xl font-bold text-red-600 dark:text-red-500">
            {CountUpComponent ? (
              <CountUpComponent 
                start={0}
                end={total} 
                duration={2.5}
                useEasing={true}
                separator="."
                onEnd={() => setCountUpDone(true)}
              />
            ) : total.toLocaleString('pt-BR')}
          </div>
          <p className="text-base md:text-xl font-semibold mt-2 md:mt-2 text-gray-700 dark:text-gray-300">
            denúncias registradas
          </p>
        </Link>
        
        <div className="pt-1 pb-2 md:pt-1 md:pb-2">
          <Link
            to="/denunciar"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-sm md:text-base font-semibold rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white active:scale-95 transition-all"
          >
            Registrar Denúncia
          </Link>
        </div>
        
        <div className="pt-1 md:pt-1 space-x-4">
          <Link
            to="/mapa"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-xs md:text-sm"
          >
            Mapa
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            to="/contato"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-xs md:text-sm"
          >
            Contato
          </Link>
        </div>
        
        <div className="pt-2 pb-1">
          <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mb-2">Apoiadores</p>
          <div
            className="flex flex-col items-center gap-3"
            onMouseEnter={() => { hoverRef.current = true; }}
            onMouseLeave={() => { hoverRef.current = false; }}
            aria-live="polite"
          >
            <a
              href={allApoiadores[apoiadorIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1 opacity-100 hover:opacity-100 transition-opacity duration-300 ${
                fading ? 'opacity-0' : ''
              }`}
            >
              <img
                src={allApoiadores[apoiadorIndex].img}
                alt={allApoiadores[apoiadorIndex].alt}
                className="h-16 object-contain"
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {allApoiadores[apoiadorIndex].nome}
              </span>
            </a>
            {/* Indicadores (dots) */}
            <div className="flex items-center gap-1.5">
              {allApoiadores.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setApoiadorIndex(i);
                    setFading(false);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === apoiadorIndex
                      ? 'bg-red-600 dark:bg-red-500 w-3'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Apoiador ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="pt-2 md:pt-2 text-[10px] md:text-[11px] font-light italic font-raleway text-gray-400 dark:text-gray-600 tracking-wide">
          Criadores{" "}
          <a href="https://heblisamello.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 dark:hover:text-gray-400 underline">Heblisa Mello</a>
          {" "}&{" "}
          <a href="https://italosergio.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 dark:hover:text-gray-400 underline">Ítalo Sérgio</a>
        </p>

        <div className="pb-2 text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link to="/lgpd" className="hover:text-gray-600 dark:hover:text-gray-400 underline">Proteção de Dados</Link>
            <span>•</span>
            <Link to="/termo-responsabilidade-usuario" className="hover:text-gray-600 dark:hover:text-gray-400 underline">Termo de Responsabilidade do Usuário</Link>
            <span>•</span>
            <Link to="/termo-responsabilidade-plataforma" className="hover:text-gray-600 dark:hover:text-gray-400 underline">Termo de Responsabilidade da Plataforma</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
