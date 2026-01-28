import { useState, useEffect, useMemo } from "react";
import type { Route } from "./+types/admin-contatos";
import { db } from "../lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { MessageCircle, Clock, Tag, User, Pin, Search, Filter, X } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin - Contatos" }];
}

interface Contato {
  id: string;
  tipo: string;
  mensagem: string;
  usuario: string;
  data: string;
  lida: boolean;
  pinada: boolean;
}

export default function AdminContatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [filtroLida, setFiltroLida] = useState<"todas" | "lidas" | "nao-lidas">("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const contatosRef = ref(db, 'contatos');
    const unsubscribe = onValue(contatosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contatosArray = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            tipo: value?.tipo || 'N/A',
            mensagem: value?.mensagem || '',
            usuario: value?.usuario || 'Anônimo',
            data: value?.data || key,
            lida: value?.lida || false,
            pinada: value?.pinada || false
          }))
          .filter(c => c.tipo && c.mensagem)
          .sort((a, b) => {
            if (a.pinada && !b.pinada) return -1;
            if (!a.pinada && b.pinada) return 1;
            return b.id.localeCompare(a.id);
          });
        setContatos(contatosArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contatosFiltrados = useMemo(() => {
    return contatos.filter(c => {
      // Filtro de lida
      if (filtroLida === "lidas" && !c.lida) return false;
      if (filtroLida === "nao-lidas" && c.lida) return false;
      
      // Filtro de tipo
      if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
      
      // Filtro de data
      if (dataInicio || dataFim) {
        const dataContato = c.id.split('T')[0];
        if (dataInicio && dataContato < dataInicio) return false;
        if (dataFim && dataContato > dataFim) return false;
      }
      
      // Busca
      if (busca) {
        const termo = busca.toLowerCase();
        return c.usuario.toLowerCase().includes(termo) || c.mensagem.toLowerCase().includes(termo);
      }
      
      return true;
    });
  }, [contatos, filtroLida, filtroTipo, dataInicio, dataFim, busca]);

  const highlightText = (text: string) => {
    if (!busca) return text;
    const regex = new RegExp(`(${busca})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600">{part}</mark> : part
    );
  };

  const tipos = ["todos", "sugestao", "reportar-erro", "duvida", "feedback", "parceria", "outro"];

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-xl">Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Contatos Recebidos ({contatosFiltrados.length})</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-6 space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar em usuário ou mensagem..."
              className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-900"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro Lida */}
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={filtroLida}
                onChange={(e) => setFiltroLida(e.target.value as any)}
                className="w-full p-2 border rounded-lg dark:bg-gray-900"
              >
                <option value="todas">Todas</option>
                <option value="lidas">Lidas</option>
                <option value="nao-lidas">Não Lidas</option>
              </select>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-semibold mb-1">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-900 capitalize"
              >
                {tipos.map(t => (
                  <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-semibold mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-900"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-semibold mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-900"
              />
            </div>
          </div>

          {/* Limpar Filtros */}
          {(busca || filtroLida !== "todas" || filtroTipo !== "todos" || dataInicio || dataFim) && (
            <button
              onClick={() => {
                setBusca("");
                setFiltroLida("todas");
                setFiltroTipo("todos");
                setDataInicio("");
                setDataFim("");
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1"
            >
              <X size={16} /> Limpar filtros
            </button>
          )}
        </div>
        
        {contatosFiltrados.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {contatos.length === 0 ? "Nenhum contato recebido ainda" : "Nenhum contato encontrado com os filtros aplicados"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contatosFiltrados.map((contato, index) => (
              <div 
                key={index}
                className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 transition-colors ${
                  contato.pinada
                    ? 'border-yellow-500 dark:border-yellow-400'
                    : contato.lida 
                    ? 'border-gray-200 dark:border-gray-700' 
                    : 'border-blue-500 dark:border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-gray-600 dark:text-gray-400" />
                    <h2 className="text-xl font-bold">Contato de {highlightText(contato.usuario)}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contato.lida 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {contato.lida ? 'Lida' : 'Não Lida'}
                    </span>
                    {contato.pinada && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Pin size={12} /> Pinada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        await update(ref(db, `contatos/${contato.id}`), { pinada: !contato.pinada });
                      }}
                      className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                      title={contato.pinada ? "Desafixar" : "Fixar"}
                    >
                      <Pin size={20} className={contato.pinada ? 'fill-yellow-500 text-yellow-500' : ''} />
                    </button>
                    <Clock size={16} />
                    {contato.data}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {contato.tipo?.replace('-', ' ') || 'N/A'}
                  </span>
                </div>

                <div 
                  onClick={async () => {
                    const novosExpandidos = new Set(expandidos);
                    if (expandidos.has(contato.id)) {
                      novosExpandidos.delete(contato.id);
                    } else {
                      novosExpandidos.add(contato.id);
                      if (!contato.lida) {
                        await update(ref(db, `contatos/${contato.id}`), { lida: true });
                      }
                    }
                    setExpandidos(novosExpandidos);
                  }}
                  className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <MessageCircle size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className={`text-gray-800 dark:text-gray-200 whitespace-pre-wrap ${
                    expandidos.has(contato.id) ? '' : 'line-clamp-3'
                  }`}>{highlightText(contato.mensagem)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
