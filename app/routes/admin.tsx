import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../lib/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Users, MessageSquare, LogOut, User, Pin, Clock, Tag, MessageCircle, Search, X, Menu, ChevronLeft, ChevronDown, AlertTriangle, History, UserPlus, LogIn, Trash2, Plus, Edit, Settings, CheckCircle, Globe, Heart, FileText, Clipboard, Check, MoreVertical, BarChart3, BookOpen, Smartphone } from "lucide-react";
import { db } from "../lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import type { Route } from "./+types/admin";
import { registrarEvento } from "../lib/historico";

import HistoricoTab from "./admin-historico";
import UsuariosTab from "./admin-usuarios";
import IniciativasTab from "./admin-iniciativas";
import ApoiadoresTab from "./admin-apoiadores";
import { PLANOS, type Plano } from "../data/planos";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('admin');
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
        <p className="text-gray-400">{t('admin.carregando')}</p>
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
              {t('admin.paginaInicial')}
            </button>
            <h1 className="text-lg font-bungee tracking-wide text-white">{t('admin.painelAdmin')}</h1>
            <p className="text-xs text-slate-400 mt-1 font-raleway">{user?.username}</p>
            <span className={`inline-block mt-2 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
              user?.role === "administrador" ? "bg-purple-500/15 text-purple-200 border border-purple-400/20" : "bg-slate-700/60 text-slate-200 border border-white/10"
            }`}>
              {user?.role === "administrador" ? t('role.administrador') : user?.role === "moderador" ? t('role.moderador') : t('role.usuario')}
            </span>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <button
              onClick={() => { setSearchParams({ tab: "atividade" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "atividade" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <History size={16} className="flex-shrink-0" />
              <span>{t('sidebar.atividade')}</span>
            </button>

            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "usuarios" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "usuarios" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Users size={16} className="flex-shrink-0" />
                <span>{t('sidebar.usuarios')}</span>
              </button>
            )}

            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "iniciativas" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "iniciativas" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Globe size={16} className="flex-shrink-0" />
                <span>{t('sidebar.iniciativas')}</span>
              </button>
            )}

            {user?.role === "administrador" && (
              <button
                onClick={() => { setSearchParams({ tab: "apoiadores" }); setMenuOpen(false); }}
                className={`${navButtonBaseClass} ${tab === "apoiadores" ? navButtonActiveClass : navButtonIdleClass}`}
              >
                <Heart size={16} className="flex-shrink-0" />
                <span>{t('sidebar.apoiadores')}</span>
              </button>
            )}

            <button
              onClick={() => { setSearchParams({ tab: "planos" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "planos" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <FileText size={16} className="flex-shrink-0" />
              <span>{t('sidebar.planos')}</span>
            </button>

            <button
              onClick={() => { setSearchParams({ tab: "denuncias" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "denuncias" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{t('sidebar.todasDenuncias')}</span>
            </button>

            <button
              onClick={() => { setSearchParams({ tab: "contatos" }); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${tab === "contatos" ? navButtonActiveClass : navButtonIdleClass}`}
            >
              <MessageSquare size={16} className="flex-shrink-0" />
              <span>{t('sidebar.contatosRecebidos')}</span>
            </button>
          </nav>

          <div className="p-3 border-t border-white/10 space-y-1">
            <button
              onClick={() => { navigate("/conta"); setMenuOpen(false); }}
              className={`${navButtonBaseClass} ${navButtonIdleClass}`}
            >
              <User size={16} className="flex-shrink-0" />
              <span>{t('sidebar.conta')}</span>
            </button>
            <button
              onClick={handleLogout}
              className={`${navButtonBaseClass} text-red-400 hover:bg-white/5 hover:text-red-300`}
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span>{t('sidebar.sair')}</span>
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
          {tab === "planos" && <PlanosTab />}
          {tab === "denuncias" && <DenunciasTab />}
          {tab === "contatos" && <ContatosTab />}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function PlanosTab() {
  const { t } = useTranslation('admin');
  const [modalPlano, setModalPlano] = useState<Plano | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleCopiar(conteudo: string) {
    try {
      await navigator.clipboard.writeText(conteudo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert("Erro ao copiar. Selecione o texto manualmente.");
    }
  }

  function renderConteudo(conteudo: string) {
    const lines = conteudo.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-blue-400 mt-8 mb-3 border-b border-gray-700 pb-2">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold text-white mt-2 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith("```")) return null;
      if (line.trim().startsWith("- `") || line.trim().startsWith("- **")) {
        return <p key={i} className="text-slate-300 text-sm leading-relaxed ml-4 mb-1">{formatInline(line.replace(/^-\s*/, ""))}</p>;
      }
      if (line.trim().startsWith("- ")) {
        return <li key={i} className="text-slate-300 text-sm leading-relaxed ml-4 mb-1 list-disc">{formatInline(line.trim().slice(2))}</li>;
      }
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+\.)\s(.+)/);
        if (match) return <li key={i} className="text-slate-300 text-sm leading-relaxed ml-4 mb-1 list-decimal">{formatInline(match[2])}</li>;
      }
      if (!line.trim()) return <div key={i} className="h-2" />;
      return <p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">{formatInline(line)}</p>;
    });
  }

  function formatInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      const codeParts = part.split(/(`[^`]+`)/g);
      if (codeParts.length === 1) return part;
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) return <code key={j} className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">{cp.slice(1, -1)}</code>;
        return cp;
      });
    });
  }

  const categoriaIcon: Record<string, { icon: typeof BarChart3; color: string }> = {
    analytics: { icon: BarChart3, color: "text-blue-400" },
    placa: { icon: Search, color: "text-yellow-400" },
    "boas-praticas": { icon: BookOpen, color: "text-green-400" },
    pagina: { icon: Globe, color: "text-purple-400" },
    ar: { icon: Smartphone, color: "text-cyan-400" },
  };

  return (
    <div className={sectionShellClass}>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">{t('title')}</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">{t('planos.titulo')}</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{t('planos.descricao')}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{t('planos.qtdItens', { count: PLANOS.length })}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANOS.map((plano) => {
          const cat = categoriaIcon[plano.categoria] || categoriaIcon.pagina;
          const Icon = cat.icon;
          return (
            <button key={plano.id} onClick={() => { setModalPlano(plano); setCopiado(false); }}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur text-left w-full transition hover:border-blue-500/30 hover:bg-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <div className={cat.color}><Icon size={20} /></div>
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{plano.id}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{plano.titulo}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-3">{plano.resumo}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileText size={14} />
                <span>{plano.data}</span>
              </div>
            </button>
          );
        })}
      </div>

      {modalPlano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalPlano(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-white/10">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{modalPlano.id}</span>
                  <span className="text-xs text-slate-500">{modalPlano.data}</span>
                </div>
                <h2 className="text-sm font-bold text-white">{modalPlano.titulo}</h2>
              </div>
              <button onClick={() => setModalPlano(null)} className="text-slate-400 hover:text-white p-1 flex-shrink-0 rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{renderConteudo(modalPlano.conteudo)}</div>
            <div className="p-4 border-t border-white/10 flex justify-end">
              <button onClick={() => handleCopiar(modalPlano.conteudo)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-semibold">
                {copiado ? <><Check size={14} /> {t('planos.copiado')}</> : <><Clipboard size={14} /> {t('planos.copiarTexto')}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DenunciasTab() {
  const { t } = useTranslation('admin');
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivoExclusao, setMotivoExclusao] = useState("");
  const [modalDenuncia, setModalDenuncia] = useState<any | null>(null);
  const [menuDenunciaAberto, setMenuDenunciaAberto] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
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
      alert(t('usuarios.erroMotivoObrigatorio'));
      return;
    }
    const denuncia = denuncias.find(d => d.id === id);
    
    if (user && denuncia) {
      const { excluirDenuncia } = await import('../lib/denuncias');
      await excluirDenuncia(id, user.username, motivoExclusao);
    }
    
    setConfirmandoExclusao(false);
    setMenuDenunciaAberto(false);
    setModalDenuncia(null);
    setMotivoExclusao("");
  }

  if (loading) {
    return (
      <div className={sectionShellClass}>
        <div className={panelCardClass}>
          <p className="text-sm text-slate-400">{t('denuncias.carregando')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={sectionShellClass}>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">{t('title')}</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">{t('denuncias.titulo')}</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{t('denuncias.descricao')}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{t('denuncias.qtdItens', { count: denuncias.length })}</span>
      </div>
      
      {denuncias.length === 0 ? (
        <div className={panelCardClass + " text-center py-8"}>
          <p className="text-sm text-slate-400">{t('denuncias.vazio')}</p>
        </div>
      ) : (
        <div className={tableShellClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">{t('denuncias.table.data')}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">{t('denuncias.table.tipo')}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">{t('denuncias.table.local')}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">{t('denuncias.table.usuario')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {denuncias.map((denuncia) => (
                  <tr key={denuncia.id} onClick={() => { setModalDenuncia(denuncia); setMenuDenunciaAberto(false); setConfirmandoExclusao(false); setMotivoExclusao(""); }} className="hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <td className="px-3 py-2.5 text-xs text-slate-300">
                      {new Date(denuncia.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-300">{denuncia.tipo}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-300 max-w-xs truncate">{denuncia.endereco}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-300">{denuncia.username || t('denuncias.anonimo')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalDenuncia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setModalDenuncia(null); setMenuDenunciaAberto(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-white/10">
              <div className="flex-1 min-w-0 pr-4"><h3 className="text-sm font-semibold text-white">{t('denuncias.modal.titulo')}</h3></div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setMenuDenunciaAberto(!menuDenunciaAberto)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                    <MoreVertical size={16} />
                  </button>
                  {menuDenunciaAberto && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-10">
                      {confirmandoExclusao ? (
                        <div className="px-3 py-2 space-y-2">
                          <p className="text-xs text-red-300 font-semibold">{t('denuncias.modal.confirmar')}</p>
                          <textarea placeholder={t('usuarios.motivoPlaceholder')} value={motivoExclusao}
                            onChange={(e) => setMotivoExclusao(e.target.value)} rows={2}
                            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1 text-xs text-white outline-none transition focus:border-blue-500" />
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(modalDenuncia.id)} disabled={!motivoExclusao.trim()}
                              className="flex-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">{t('denuncias.confirmar')}</button>
                            <button onClick={() => { setConfirmandoExclusao(false); setMotivoExclusao(""); }}
                              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10">{t('usuarios.cancelar')}</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmandoExclusao(true)}
                          className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 flex items-center gap-2">
                          <Trash2 size={14} /> {t('denuncias.modal.apagar')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => { setModalDenuncia(null); setMenuDenunciaAberto(false); }} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{t('denuncias.table.data')}</p><p className="text-sm text-white">{new Date(modalDenuncia.createdAt).toLocaleDateString('pt-BR')}</p></div>
                <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{t('denuncias.table.tipo')}</p><p className="text-sm text-white">{modalDenuncia.tipo}</p></div>
                <div className="col-span-2"><p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{t('denuncias.table.local')}</p><p className="text-sm text-white">{modalDenuncia.endereco}</p></div>
                {modalDenuncia.relato && <div className="col-span-2"><p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{t('denuncias.table.relato')}</p><p className="text-sm text-white whitespace-pre-wrap">{modalDenuncia.relato}</p></div>}
                <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{t('denuncias.table.usuario')}</p><p className="text-sm text-white">{modalDenuncia.username || t('denuncias.anonimo')}</p></div>
                {modalDenuncia.placa && <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{t('denuncias.table.placa')}</p><p className="text-sm text-white">{modalDenuncia.placa}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContatosTab() {
  const { t } = useTranslation('admin');
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
  const [menuContatoAberto, setMenuContatoAberto] = useState<string | null>(null);
  const [confirmandoExclusaoContato, setConfirmandoExclusaoContato] = useState<string | null>(null);

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

  const excluirContato = async (contatoId: string) => {
    if (!user?.username) return;
    try {
      const contato = contatos.find(c => c.id === contatoId);
      await remove(ref(db, `contatos/${contatoId}`));
      await registrarEvento({
        tipo: 'excluir_contato',
        usuario: user.username,
        detalhes: { contatoId, usuarioContato: contato?.usuario, tipo: contato?.tipo },
      });
    } catch (error) { alert(t('contatos.erroExcluir')); }
  };

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
      alert(t('contatos.erroResponder'));
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
      alert(t('contatos.erroResolver'));
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
      alert(t('contatos.erroPendente'));
    }
  };

  if (loading) {
    return (
      <div className={sectionShellClass}>
        <div className={panelCardClass}>
          <p className="text-sm text-slate-400">{t('contatos.carregando')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={sectionShellClass}>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">{t('title')}</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">{t('contatos.titulo')}</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{t('contatos.descricao')}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{t('contatos.qtdItens', { count: contatosFiltrados.length })}</span>
      </div>

      {/* Filtros */}
      <div className={panelCardClass + " space-y-4"}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={t('contatos.buscaPlaceholder')}
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
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('denuncias.filtroStatus')}</label>
            <select
              value={filtroLida}
              onChange={(e) => setFiltroLida(e.target.value as any)}
              className={fieldClass}
            >
              <option value="todas">{t('contatos.filtro.todas')}</option>
              <option value="lidas">{t('contatos.filtro.lidas')}</option>
              <option value="nao-lidas">{t('contatos.filtro.naoLidas')}</option>
              <option value="pendentes">{t('contatos.filtro.pendentes')}</option>
              <option value="resolvidas">{t('contatos.filtro.resolvidas')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('denuncias.filtroTipo')}</label>
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
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('historico.dataInicio')}</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('historico.dataFim')}</label>
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
            <X size={14} /> {t('contatos.limparFiltros')}
          </button>
        )}
      </div>
      
      {contatosFiltrados.length === 0 ? (
        <div className={panelCardClass + " text-center py-8"}>
          <p className="text-sm text-slate-400">
            {contatos.length === 0 ? t('contatos.vazio') : t('contatos.vazioFiltros')}
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
                    title={contato.pinada ? t('contatos.desafixar') : t('contatos.fixar')}
                  >
                    <Pin size={16} className={contato.pinada ? 'fill-yellow-500 text-yellow-500' : ''} />
                  </button>
                  {/* 3 pontinhos */}
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setMenuContatoAberto(menuContatoAberto === contato.id ? null : contato.id); }}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5" title={t('contatos.acoes')}>
                      <MoreVertical size={16} />
                    </button>
                    {menuContatoAberto === contato.id && (
                      <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-10">
                        {confirmandoExclusaoContato === contato.id ? (
                          <div className="px-3 py-2 space-y-2">
                            <p className="text-xs text-red-300 font-semibold">{t('contatos.confirmarExclusao')}</p>
                            <div className="flex gap-1">
                              <button onClick={async (e) => { e.stopPropagation(); await excluirContato(contato.id); setConfirmandoExclusaoContato(null); setMenuContatoAberto(null); }}
                                className="flex-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700">{t('historico.detalhes.sim')}</button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmandoExclusaoContato(null); }}
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10">{t('historico.detalhes.nao')}</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {!contato.resolvido ? (
                              <button onClick={(e) => { e.stopPropagation(); handleMarcarResolvido(contato.id); setMenuContatoAberto(null); }}
                                className="w-full text-left px-3 py-2 text-xs text-green-300 hover:bg-white/5 flex items-center gap-2">
                                <CheckCircle size={14} /> {t('contatos.status.resolvido')}
                              </button>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); handleMarcarPendente(contato.id); setMenuContatoAberto(null); }}
                                className="w-full text-left px-3 py-2 text-xs text-yellow-300 hover:bg-white/5 flex items-center gap-2">
                                <AlertTriangle size={14} /> {t('contatos.marcarPendente')}
                              </button>
                            )}
                            {!expandidos.has(contato.id) && (
                              <button onClick={(e) => { e.stopPropagation(); setExpandidos(new Set(expandidos).add(contato.id)); setMenuContatoAberto(null); if (!contato.lida && user) { update(ref(db, `contatos/${contato.id}`), { lida: true }); } }}
                                className="w-full text-left px-3 py-2 text-xs text-blue-300 hover:bg-white/5 flex items-center gap-2">
                                <MessageCircle size={14} /> {t('contatos.lerMensagem')}
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); setRespondendoId(contato.id); setMenuContatoAberto(null); }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2">
                              <MessageSquare size={14} /> {t('contatos.responder')}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmandoExclusaoContato(contato.id); }}
                              className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 flex items-center gap-2">
                              <Trash2 size={14} /> {t('contatos.excluir')}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
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
                    {contato.resolvido ? t('contatos.status.resolvido') : contato.aguardandoResposta ? t('contatos.status.pendente') : contato.lida ? t('contatos.status.lida') : t('contatos.status.naoLida')}
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
                <h3 className="text-sm md:text-base font-bold text-white break-words">{t('contatos.label.contatoDe', { usuario: highlightText(contato.usuario) })}</h3>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-300 capitalize">
                  {contato.tipo?.replace('-', ' ') || t('historico.detalhes.na')}
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
                      placeholder={t('contatos.respostaPlaceholder')}
                      className={fieldClass}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponder(contato.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        {t('contatos.enviar')}
                      </button>
                      <button
                        onClick={() => { setRespondendoId(null); setRespostaTexto(""); }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                      >
                        {t('contatos.cancelar')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setRespondendoId(contato.id)}
                      className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={14} /> {t('contatos.responder')}
                    </button>
                    {user?.role === 'administrador' || user?.role === 'moderador' ? (
                      <>
                        <span className="text-slate-600 text-xs">|</span>
                        <button
                          onClick={() => handleMarcarResolvido(contato.id)}
                          className="text-green-400 text-xs font-semibold hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> {t('contatos.status.resolvido')}
                        </button>
                        <span className="text-slate-600 text-xs">|</span>
                        <button
                          onClick={() => handleMarcarPendente(contato.id)}
                          className="text-yellow-400 text-xs font-semibold hover:text-yellow-300 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangle size={14} /> {t('contatos.marcarPendente')}
                        </button>
                      </>
                    ) : (
                      !contato.resolvido && (
                        <button
                          onClick={() => handleMarcarResolvido(contato.id)}
                          className="text-green-400 text-xs font-semibold hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> {t('contatos.marcarResolvido')}
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
