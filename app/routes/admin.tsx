import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../lib/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Users, MessageSquare, LogOut, User, Pin, Clock, Tag, MessageCircle, Search, X, Menu, ChevronLeft, ChevronDown, AlertTriangle, History, UserPlus, LogIn, Trash2, Plus, Edit, Settings, CheckCircle } from "lucide-react";
import { db } from "../lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import type { Route } from "./+types/admin";
import { registrarEvento } from "../lib/historico";

import HistoricoTab from "./admin-historico";
import UsuariosTab from "./admin-usuarios";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin - Ciclista Denuncie" }];
}

export default function Admin() {
  const { user, logout, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const tab = searchParams.get("tab") || "atividade";

  useEffect(() => {
    if (user && user.role !== 'administrador' && user.role !== 'moderador') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (user && user.role !== 'administrador' && user.role !== 'moderador') {
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-900">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 bg-gray-800 p-3 rounded-lg text-white shadow-lg"
        >
          <Menu size={24} />
        </button>

        {/* Sidebar */}
        <aside className={`w-64 bg-gray-800 border-r border-gray-700 flex flex-col fixed md:sticky top-0 h-screen z-50 transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
          {/* Close Button - Mobile Only */}
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="p-6 border-b border-gray-700">
            <button
              onClick={() => navigate("/")}
              className="text-blue-400 hover:text-blue-300 text-sm mb-3 flex items-center gap-1"
            >
              ← Página Inicial
            </button>
            <h1 className="text-2xl font-bold text-white">Admin</h1>
            <p className="text-sm text-gray-400 mt-1">{user?.username}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
              user?.role === "administrador" ? "bg-purple-600 text-white" : "bg-gray-600 text-white"
            }`}>
              {user?.role === "administrador" ? "Administrador" : "Usuário"}
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setSearchParams({ tab: "atividade" });
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition whitespace-nowrap text-sm ${
                tab === "atividade"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <History size={18} className="flex-shrink-0" />
              <span>Atividade</span>
            </button>

            {user?.role === "administrador" && (
              <button
                onClick={() => {
                  setSearchParams({ tab: "usuarios" });
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition whitespace-nowrap text-sm ${
                  tab === "usuarios"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Users size={18} className="flex-shrink-0" />
                <span>Usuários</span>
              </button>
            )}

            <button
              onClick={() => {
                setSearchParams({ tab: "denuncias" });
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition whitespace-nowrap text-sm ${
                tab === "denuncias"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>Todas as Denúncias</span>
            </button>

            <button
              onClick={() => {
                setSearchParams({ tab: "contatos" });
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition whitespace-nowrap text-sm ${
                tab === "contatos"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <MessageSquare size={18} className="flex-shrink-0" />
              <span>Contatos Recebidos</span>
            </button>
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={() => {
                navigate("/conta");
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition whitespace-nowrap text-sm"
            >
              <User size={18} className="flex-shrink-0" />
              <span>Conta</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700 transition whitespace-nowrap text-sm"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="pt-16 md:pt-0">
          {tab === "atividade" && <HistoricoTab />}
          {tab === "usuarios" && user?.role === "administrador" && <UsuariosTab />}
          {tab === "denuncias" && <DenunciasTab />}
          {tab === "contatos" && <ContatosTab />}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function DenunciasTab() {
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [motivoExclusao, setMotivoExclusao] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const denunciasRef = ref(db, 'denuncias');
    const unsubscribe = onValue(denunciasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const denunciasArray = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setDenuncias(denunciasArray);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleDelete(id: string) {
    if (!motivoExclusao.trim()) {
      alert("O motivo da exclusão é obrigatório");
      return;
    }
    const denuncia = denuncias.find(d => d.id === id);
    
    if (user && denuncia) {
      const { excluirDenuncia } = await import('../lib/denuncias');
      await excluirDenuncia(id, user.username, motivoExclusao);
    }
    
    setExcluindoId(null);
    setMotivoExclusao("");
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Carregando denúncias...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Todas as Denúncias ({denuncias.length})</h2>
      
      {denuncias.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-400">Nenhuma denúncia registrada ainda</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Endereço</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {denuncias.map((denuncia) => (
                  <>
                    <tr key={denuncia.id} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {new Date(denuncia.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{denuncia.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">{denuncia.endereco}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{denuncia.username || 'Anônimo'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExcluindoId(excluindoId === denuncia.id ? null : denuncia.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                    {excluindoId === denuncia.id && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3">
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">Tem certeza que deseja excluir esta denúncia?</p>
                            <label className="block text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Motivo da exclusão *</label>
                            <textarea
                              placeholder="Informe o motivo da exclusão (obrigatório)"
                              value={motivoExclusao}
                              onChange={(e) => setMotivoExclusao(e.target.value)}
                              required
                              rows={3}
                              className="w-full p-2 border rounded-lg text-sm mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(denuncia.id)}
                                disabled={!motivoExclusao.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Confirmar Exclusão
                              </button>
                              <button
                                onClick={() => {
                                  setExcluindoId(null);
                                  setMotivoExclusao("");
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ContatosTab() {
  const [contatos, setContatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [filtroLida, setFiltroLida] = useState<"todas" | "lidas" | "nao-lidas" | "pendentes" | "resolvidas">("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const { user } = useAuth();
  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");

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
            pinada: value?.pinada || false,
            resolvido: value?.resolvido || false,
            aguardandoResposta: value?.aguardandoResposta || false,
            mensagens: value?.mensagens || {}
          }))
          .filter(c => c.tipo && c.mensagem)
          .sort((a, b) => {
            if (a.pinada && !b.pinada) return -1;
            if (!a.pinada && b.pinada) return 1;
            return b.id.localeCompare(a.id);
          });
        setContatos(contatosArray);
        
        const hash = window.location.hash.substring(1);
        if (hash) {
          setExpandidos(new Set([hash]));
          setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }, 100);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contatosFiltrados = useMemo(() => {
    return contatos.filter(c => {
      if (filtroLida === "lidas" && !c.lida) return false;
      if (filtroLida === "nao-lidas" && c.lida) return false;
      if (filtroLida === "pendentes" && !c.aguardandoResposta) return false;
      if (filtroLida === "resolvidas" && !c.resolvido) return false;
      if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
      if (dataInicio || dataFim) {
        const dataContato = c.id.split('T')[0];
        if (dataInicio && dataContato < dataInicio) return false;
        if (dataFim && dataContato > dataFim) return false;
      }
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

  const handleResponder = async (contatoId: string) => {
    if (!respostaTexto.trim() || !user?.username) return;
    try {
      const contato = contatos.find(c => c.id === contatoId);
      const contatoRef = ref(db, `contatos/${contatoId}`);
      const mensagensRef = ref(db, `contatos/${contatoId}/mensagens`);
      await push(mensagensRef, {
        texto: respostaTexto,
        autor: user.username,
        timestamp: new Date().toISOString(),
      });
      await update(contatoRef, { 
        aguardandoResposta: false
      });
      
      const mensagensAtualizadas = contato?.mensagens ? Object.values(contato.mensagens) : [];
      mensagensAtualizadas.push({
        texto: respostaTexto,
        autor: user.username,
        timestamp: new Date().toISOString(),
      });
      
      await registrarEvento({
        tipo: 'responder_contato',
        usuario: user.username,
        detalhes: {
          contatoId,
          usuarioContato: contato?.usuario,
          tipo: contato?.tipo,
          resposta: respostaTexto,
          mensagens: mensagensAtualizadas,
        },
      });
      setRespondendoId(null);
      setRespostaTexto("");
    } catch (error) {
      alert("Erro ao enviar resposta");
    }
  };

  const handleMarcarResolvido = async (contatoId: string) => {
    if (!user?.username) return;
    try {
      const contato = contatos.find(c => c.id === contatoId);
      const mensagensRef = ref(db, `contatos/${contatoId}/mensagens`);
      await push(mensagensRef, {
        texto: "[Sistema] Contato marcado como resolvido",
        autor: user.username,
        timestamp: new Date().toISOString(),
        tipo: 'sistema'
      });
      await update(ref(db, `contatos/${contatoId}`), { 
        resolvido: true,
        aguardandoResposta: false
      });
      await registrarEvento({
        tipo: 'resolver_contato',
        usuario: user.username,
        detalhes: {
          contatoId,
          usuarioContato: contato?.usuario,
          tipo: contato?.tipo,
        },
      });
    } catch (error) {
      alert("Erro ao marcar como resolvido");
    }
  };

  const handleMarcarPendente = async (contatoId: string) => {
    if (!user?.username) return;
    try {
      const contato = contatos.find(c => c.id === contatoId);
      const mensagensRef = ref(db, `contatos/${contatoId}/mensagens`);
      await push(mensagensRef, {
        texto: "[Sistema] Contato marcado como pendente",
        autor: user.username,
        timestamp: new Date().toISOString(),
        tipo: 'sistema'
      });
      await update(ref(db, `contatos/${contatoId}`), { 
        resolvido: false,
        aguardandoResposta: true
      });
      await registrarEvento({
        tipo: 'marcar_pendente_contato',
        usuario: user.username,
        detalhes: {
          contatoId,
          usuarioContato: contato?.usuario,
          tipo: contato?.tipo,
        },
      });
    } catch (error) {
      alert("Erro ao marcar como pendente");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Contatos Recebidos ({contatosFiltrados.length})</h2>

      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar em usuário ou mensagem..."
            className="w-full pl-10 pr-10 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
          />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-300">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">Status</label>
            <select
              value={filtroLida}
              onChange={(e) => setFiltroLida(e.target.value as any)}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
            >
              <option value="todas">Todas</option>
              <option value="lidas">Lidas</option>
              <option value="nao-lidas">Não Lidas</option>
              <option value="pendentes">Pendentes</option>
              <option value="resolvidas">Resolvidas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white capitalize"
            >
              {tipos.map(t => (
                <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
            />
          </div>
        </div>

        {(busca || filtroLida !== "todas" || filtroTipo !== "todos" || dataInicio || dataFim) && (
          <button
            onClick={() => {
              setBusca("");
              setFiltroLida("todas");
              setFiltroTipo("todos");
              setDataInicio("");
              setDataFim("");
            }}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <X size={16} /> Limpar filtros
          </button>
        )}
      </div>
      
      {contatosFiltrados.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-400">
            {contatos.length === 0 ? "Nenhum contato recebido ainda" : "Nenhum contato encontrado com os filtros aplicados"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contatosFiltrados.map((contato, index) => {
            const mensagens = contato.mensagens ? Object.values(contato.mensagens) as any[] : [];
            return (
            <div 
              key={index}
              id={contato.id}
              className={`bg-gray-800 p-6 rounded-xl shadow-lg border-2 transition-colors ${
                contato.pinada
                  ? 'border-yellow-500'
                  : contato.resolvido
                  ? 'border-green-500'
                  : contato.aguardandoResposta
                  ? 'border-yellow-500'
                  : contato.lida 
                  ? 'border-gray-700' 
                  : 'border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await update(ref(db, `contatos/${contato.id}`), { pinada: !contato.pinada });
                    }}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                    title={contato.pinada ? "Desafixar" : "Fixar"}
                  >
                    <Pin size={20} className={contato.pinada ? 'fill-yellow-500 text-yellow-500' : ''} />
                  </button>
                  {contato.resolvido && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    contato.resolvido
                      ? 'bg-green-500 text-white'
                      : contato.aguardandoResposta
                      ? 'bg-yellow-500 text-white'
                      : contato.lida 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {contato.resolvido ? 'Resolvido' : contato.aguardandoResposta ? 'Pendente' : contato.lida ? 'Lida' : 'Não Lida'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock size={16} />
                  <span className="hidden sm:inline">{contato.data}</span>
                  <span className="sm:hidden">{contato.data.split('T')[0]}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <User size={20} className="text-gray-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white break-words">Contato de {highlightText(contato.usuario)}</h2>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-300 capitalize">
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
                    if (!contato.lida && user) {
                      await update(ref(db, `contatos/${contato.id}`), { lida: true });
                      await registrarEvento({
                        tipo: 'ler_contato',
                        usuario: user.username,
                        detalhes: {
                          contatoId: contato.id,
                          usuarioContato: contato.usuario,
                          tipo: contato.tipo,
                        },
                      });
                    }
                  }
                  setExpandidos(novosExpandidos);
                }}
                className="flex items-start gap-2 bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
              >
                <MessageCircle size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <p className={`text-sm sm:text-base text-gray-200 whitespace-pre-wrap ${
                  expandidos.has(contato.id) ? '' : 'line-clamp-3'
                }`}>{highlightText(contato.mensagem)}</p>
              </div>
              {mensagens.length > 0 && expandidos.has(contato.id) && (
                <div className="mt-4 space-y-2">
                  {mensagens.map((msg: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded text-sm ${
                      msg.autor === contato.usuario
                        ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
                        : msg.tipo === 'sistema'
                        ? 'bg-gray-600 text-center italic'
                        : 'bg-gray-700 mr-8'
                    }`}>
                      {msg.tipo !== 'sistema' && <div className="font-semibold text-xs mb-1">{msg.autor}</div>}
                      <div>{msg.texto}</div>
                      {msg.timestamp && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {expandidos.has(contato.id) && (
                respondendoId === contato.id ? (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={respostaTexto}
                      onChange={(e) => setRespostaTexto(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="w-full p-3 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponder(contato.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={() => {
                          setRespondendoId(null);
                          setRespostaTexto("");
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setRespondendoId(contato.id)}
                      className="text-blue-400 text-sm hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={16} /> Responder
                    </button>
                    {user?.role === 'administrador' || user?.role === 'moderador' ? (
                      <>
                        <span className="text-gray-500">Marcar como:</span>
                        <button
                          onClick={() => handleMarcarResolvido(contato.id)}
                          className="text-green-400 text-sm hover:underline flex items-center gap-1"
                        >
                          <CheckCircle size={16} /> Resolvido
                        </button>
                        <span className="text-gray-500">|</span>
                        <button
                          onClick={() => handleMarcarPendente(contato.id)}
                          className="text-yellow-400 text-sm hover:underline flex items-center gap-1"
                        >
                          <AlertTriangle size={16} /> Pendente
                        </button>
                      </>
                    ) : (
                      !contato.resolvido && (
                        <button
                          onClick={() => handleMarcarResolvido(contato.id)}
                          className="text-green-400 text-sm hover:underline flex items-center gap-1"
                        >
                          <CheckCircle size={16} /> Marcar como Resolvido
                        </button>
                      )
                    )}
                  </div>
                )
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
