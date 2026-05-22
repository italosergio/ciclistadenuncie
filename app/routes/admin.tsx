import { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../lib/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Users, MessageSquare, LogOut, User, Pin, Clock, Tag, MessageCircle, Search, X, Menu, ChevronLeft, ChevronDown, AlertTriangle, History, UserPlus, LogIn, Trash2, Plus, Edit, Settings, CheckCircle, Globe, Heart, FileText } from "lucide-react";
import { db } from "../lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import type { Route } from "./+types/admin";
import { registrarEvento } from "../lib/historico";

import HistoricoTab from "./admin-historico";
import UsuariosTab from "./admin-usuarios";
import IniciativasTab from "./admin-iniciativas";
import ApoiadoresTab from "./admin-apoiadores";

// --- Admin visual constants ---
const adminShellClass = "min-h-screen flex bg-slate-950 text-slate-100 font-raleway";
const sidebarClass = "w-64 bg-slate-950/95 border-r border-white/10 flex flex-col fixed md:sticky top-0 h-screen z-50 transition-transform shadow-2xl shadow-black/30";
const navButtonBaseClass = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition whitespace-nowrap text-xs font-semibold tracking-wide";
const navButtonActiveClass = "bg-blue-600 text-white shadow-lg shadow-blue-950/40";
const navButtonIdleClass = "text-slate-300 hover:bg-white/5 hover:text-white";
const sectionShellClass = "p-4 md:p-6 lg:p-8 space-y-5";
const panelCardClass = "rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur";
const tableShellClass = "rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 overflow-hidden";
const fieldClass = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
      <div className={adminShellClass}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 bg-slate-900/90 border border-white/10 backdrop-blur p-3 rounded-xl text-white shadow-xl"
        >
          <Menu size={20} />
        </button>

        {/* Sidebar */}
        <aside className={`${sidebarClass} ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          {/* Close Button - Mobile Only */}
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="p-4 border-b border-white/10">
            <button
              onClick={() => navigate("/")}
              className="text-blue-400 hover:text-blue-300 text-xs mb-3 flex items-center gap-1 font-medium tracking-wide"
            >
              ← Página Inicial
            </button>
            <h1 className="text-lg font-bungee tracking-wide text-white">Painel Admin</h1>
            <p className="text-xs text-slate-400 mt-1 font-raleway">{user?.username}</p>
            <span className={`inline-block mt-2 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
              user?.role === "administrador" ? "bg-purple-500/15 text-purple-200 border border-purple-400/20" : "bg-slate-700/60 text-slate-200 border border-white/10"
            }`}>
              {user?.role === "administrador" ? "Administrador" : user?.role === "moderador" ? "Moderador" : "Usuário"}
            </span>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <button
              onClick={() => { setSearchParams({ tab: "atividade" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "atividade" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <History size={16} className="flex-shrink-0" />
              <span>Atividade</span>
            </button>

            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "usuarios" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "usuarios" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Users size={16} className="flex-shrink-0" />
                <span>Usuários</span>
              </button>
            )}

            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "iniciativas" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "iniciativas" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Globe size={16} className="flex-shrink-0" />
                <span>Iniciativas</span>
              </button>
            )}

            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "apoiadores" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "apoiadores" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Heart size={16} className="flex-shrink-0" />
                <span>Apoiadores</span>
              </button>
            )}

            <button
              onClick={() => { navigate("/planos"); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${navButtonIdleClass}`}
            >
              <FileText size={16} className="flex-shrink-0" />
              <span>Planos</span>
            </button>

            <button
              onClick={() => { setSearchParams({ tab: "denuncias" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "denuncias" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>Todas as Denúncias</span>
            </button>

            <button
              onClick={() => { setSearchParams({ tab: "contatos" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "contatos" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <MessageSquare size={16} className="flex-shrink-0" />
              <span>Contatos Recebidos</span>
            </button>
          </nav>

          <div className="p-3 border-t border-white/10 space-y-1">
            <button
              onClick={() => { navigate("/conta"); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${navButtonIdleClass}`}
            >
              <User size={16} className="flex-shrink-0" />
              <span>Conta</span>
            </button>
            <button
              onClick={handleLogout}
              className={`${navButtonBaseClass} text-red-400 hover:bg-white/5 hover:text-red-300`}
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {menuOpen && (
          <div onClick={() => setMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/60 z-30" />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="pt-16 md:pt-0">
          {tab === "atividade" && <HistoricoTab />}
          {tab === "usuarios" && user?.role === "administrador" && <UsuariosTab />}
          {tab === "iniciativas" && user?.role === "administrador" && <IniciativasTab />}
          {tab === "apoiadores" && user?.role === "administrador" && <ApoiadoresTab />}
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
      <div className={sectionShellClass}>
        <div className={panelCardClass}>
          <p className="text-sm text-slate-400">Carregando denúncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={sectionShellClass}>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">Todas as Denúncias</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Revise denúncias registradas e ações sensíveis.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{denuncias.length} itens</span>
      </div>
      
      {denuncias.length === 0 ? (
        <div className={panelCardClass + " text-center py-8"}>
          <p className="text-sm text-slate-400">Nenhuma denúncia registrada ainda</p>
        </div>
      ) : (
        <div className={tableShellClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Data</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Tipo</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Endereço</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Usuário</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {denuncias.map((denuncia) => (
                  <Fragment key={denuncia.id}>
                    <tr className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-3 py-2.5 text-xs text-slate-300">
                        {new Date(denuncia.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-300">{denuncia.tipo}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-300 max-w-xs truncate">{denuncia.endereco}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-300">{denuncia.username || 'Anônimo'}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setExcluindoId(excluindoId === denuncia.id ? null : denuncia.id)}
                          className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                    {excluindoId === denuncia.id && (
                      <tr>
                        <td colSpan={5} className="px-3 py-2.5">
                          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                            <p className="text-xs font-semibold text-red-300 mb-3">Tem certeza que deseja excluir esta denúncia?</p>
                            <label className="block text-[11px] font-semibold text-red-400 mb-1">Motivo da exclusão *</label>
                            <textarea
                              placeholder="Informe o motivo da exclusão (obrigatório)"
                              value={motivoExclusao}
                              onChange={(e) => setMotivoExclusao(e.target.value)}
                              required
                              rows={3}
                              className={fieldClass + " mb-3"}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(denuncia.id)}
                                disabled={!motivoExclusao.trim()}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Confirmar Exclusão
                              </button>
                              <button
                                onClick={() => { setExcluindoId(null); setMotivoExclusao(""); }}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
      <div className={sectionShellClass}>
        <div className={panelCardClass}>
          <p className="text-sm text-slate-400">Carregando contatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={sectionShellClass}>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">Contatos Recebidos</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Organize mensagens recebidas e pendências.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{contatosFiltrados.length} itens</span>
      </div>

      {/* Filtros */}
      <div className={panelCardClass + " space-y-4"}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar em usuário ou mensagem..."
            className={fieldClass + " pl-9 pr-9"}
          />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Status</label>
            <select
              value={filtroLida}
              onChange={(e) => setFiltroLida(e.target.value as any)}
              className={fieldClass}
            >
              <option value="todas">Todas</option>
              <option value="lidas">Lidas</option>
              <option value="nao-lidas">Não Lidas</option>
              <option value="pendentes">Pendentes</option>
              <option value="resolvidas">Resolvidas</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={fieldClass + " capitalize"}
            >
              {tipos.map(t => (
                <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        {(busca || filtroLida !== "todas" || filtroTipo !== "todos" || dataInicio || dataFim) && (
          <button
            onClick={() => { setBusca(""); setFiltroLida("todas"); setFiltroTipo("todos"); setDataInicio(""); setDataFim(""); }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Limpar filtros
          </button>
        )}
      </div>
      
      {contatosFiltrados.length === 0 ? (
        <div className={panelCardClass + " text-center py-8"}>
          <p className="text-sm text-slate-400">
            {contatos.length === 0 ? "Nenhum contato recebido ainda" : "Nenhum contato encontrado com os filtros aplicados"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contatosFiltrados.map((contato, index) => {
            const mensagens = contato.mensagens ? Object.values(contato.mensagens) as any[] : [];
            const borderClass = contato.pinada
              ? 'border-yellow-400/40 ring-1 ring-yellow-400/10'
              : contato.resolvido
              ? 'border-green-400/30 ring-1 ring-green-400/10'
              : contato.aguardandoResposta
              ? 'border-yellow-400/40 ring-1 ring-yellow-400/10'
              : contato.lida 
              ? 'border-white/10' 
              : 'border-blue-400/40 ring-1 ring-blue-400/10';
            return (
            <div 
              key={index}
              id={contato.id}
              className={`${panelCardClass} p-4 border ${borderClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await update(ref(db, `contatos/${contato.id}`), { pinada: !contato.pinada });
                    }}
                    className="text-slate-400 hover:text-yellow-500 transition-colors"
                    title={contato.pinada ? "Desafixar" : "Fixar"}
                  >
                    <Pin size={16} className={contato.pinada ? 'fill-yellow-500 text-yellow-500' : ''} />
                  </button>
                  {contato.resolvido && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${
                    contato.resolvido
                      ? 'border-green-400/30 bg-green-500/10 text-green-300'
                      : contato.aguardandoResposta
                      ? 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300'
                      : contato.lida 
                      ? 'border-blue-400/30 bg-blue-500/10 text-blue-300' 
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}>
                    {contato.resolvido ? 'Resolvido' : contato.aguardandoResposta ? 'Pendente' : contato.lida ? 'Lida' : 'Não Lida'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={14} />
                  <span className="hidden sm:inline">{contato.data}</span>
                  <span className="sm:hidden">{contato.data.split('T')[0]}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-slate-400" />
                <h3 className="text-sm md:text-base font-bold text-white break-words">Contato de {highlightText(contato.usuario)}</h3>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-300 capitalize">
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
                className="flex items-start gap-2 bg-slate-950/70 border border-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <MessageCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs sm:text-sm text-slate-200 whitespace-pre-wrap ${
                  expandidos.has(contato.id) ? '' : 'line-clamp-3'
                }`}>{highlightText(contato.mensagem)}</p>
              </div>
              {mensagens.length > 0 && expandidos.has(contato.id) && (
                <div className="mt-3 space-y-2">
                  {mensagens.map((msg: any, idx: number) => (
                    <div key={idx} className={`p-2.5 rounded-xl text-xs ${
                      msg.autor === contato.usuario
                        ? 'bg-blue-900/20 border border-blue-400/20 ml-8' 
                        : msg.tipo === 'sistema'
                        ? 'bg-slate-800/80 text-center italic border border-white/5'
                        : 'bg-slate-800/80 border border-white/10 mr-8'
                    }`}>
                      {msg.tipo !== 'sistema' && <div className="font-semibold text-[11px] mb-1 text-slate-300">{msg.autor}</div>}
                      <div className="text-slate-200">{msg.texto}</div>
                      {msg.timestamp && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          {new Date(msg.timestamp).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {expandidos.has(contato.id) && (
                respondendoId === contato.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={respostaTexto}
                      onChange={(e) => setRespostaTexto(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className={fieldClass}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponder(contato.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={() => { setRespondendoId(null); setRespostaTexto(""); }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setRespondendoId(contato.id)}
                      className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={14} /> Responder
                    </button>
                    {user?.role === 'administrador' || user?.role === 'moderador' ? (
                      <>
                        <span className="text-slate-600 text-xs">|</span>
                        <button
                          onClick={() => handleMarcarResolvido(contato.id)}
                          className="text-green-400 text-xs font-semibold hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Resolvido
                        </button>
                        <span className="text-slate-600 text-xs">|</span>
                        <button
                          onClick={() => handleMarcarPendente(contato.id)}
                          className="text-yellow-400 text-xs font-semibold hover:text-yellow-300 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangle size={14} /> Pendente
                        </button>
                      </>
                    ) : (
                      !contato.resolvido && (
                        <button
                          onClick={() => handleMarcarResolvido(contato.id)}
                          className="text-green-400 text-xs font-semibold hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Marcar como Resolvido
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
