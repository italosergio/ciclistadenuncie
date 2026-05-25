import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { ChevronDown, UserPlus, LogIn, LogOut, Trash2, Plus, Edit, Settings, AlertTriangle, X, MessageSquare, CheckCircle } from "lucide-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

export default function HistoricoTab() {
  const { t } = useTranslation('admin');
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Record<string, any>>({});
  const [abaHistorico, setAbaHistorico] = useState<'todos' | 'moderacao' | 'usuarios'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 30;
  const [searchParams, setSearchParams] = useSearchParams();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const historicoRef = ref(db, 'historico');
    const usuariosRef = ref(db, 'usuarios');
    
    const unsubscribeHistorico = onValue(historicoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventosArray = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }))
          .sort((a, b) => {
            try { return b.timestamp?.localeCompare(a.timestamp); } catch { return 0; }
          });
        setEventos(eventosArray);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar histórico:", error);
      setLoading(false);
    });
    
    const unsubscribeUsuarios = onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usuariosMap: Record<string, any> = {};
        Object.entries(data).forEach(([uid, userData]: [string, any]) => {
          usuariosMap[userData.username] = userData;
        });
        setUsuarios(usuariosMap);
      }
    });
    
    // Timeout de segurança: se após 10s o loading não resolveu, força false
    const safetyTimeout = setTimeout(() => setLoading(false), 10000);
    
    return () => {
      unsubscribeHistorico();
      unsubscribeUsuarios();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const normalizarTexto = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const calcularSimilaridade = (str1: string, str2: string) => {
    const s1 = normalizarTexto(str1);
    const s2 = normalizarTexto(str2);
    
    if (s1.includes(s2) || s2.includes(s1)) return 1;
    
    let matches = 0;
    const minLen = Math.min(s1.length, s2.length);
    
    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matches++;
    }
    
    return matches / Math.max(s1.length, s2.length);
  };

  const contemTermo = (texto: string, termo: string) => {
    const textoNorm = normalizarTexto(texto);
    const termoNorm = normalizarTexto(termo);
    
    if (textoNorm.includes(termoNorm)) return true;
    
    const palavras = textoNorm.split(/\s+/);
    return palavras.some(palavra => calcularSimilaridade(palavra, termoNorm) >= 0.4);
  };

  const eventosFiltrados = useMemo(() => {
    let filtrados = eventos;

    if (abaHistorico === 'moderacao') {
      filtrados = filtrados.filter(e => ['modificar_role', 'excluir_denuncia', 'ler_contato', 'responder_contato', 'resolver_contato', 'marcar_pendente_contato', 'banir_usuario', 'desbanir_usuario', 'excluir_usuario'].includes(e.tipo));
    } else if (abaHistorico === 'usuarios') {
      filtrados = filtrados.filter(e => ['criar_conta', 'login', 'logout', 'adicionar_denuncia', 'editar_denuncia', 'enviar_contato', 'alterar_senha', 'alterar_username', 'excluir_conta'].includes(e.tipo));
    }

    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(e => e.tipo === filtroTipo);
    }

    if (dataInicio || dataFim) {
      filtrados = filtrados.filter(e => {
        const dataEvento = e.timestamp.split('T')[0];
        if (dataInicio && dataEvento < dataInicio) return false;
        if (dataFim && dataEvento > dataFim) return false;
        return true;
      });
    }

    if (busca) {
      const termo = busca;
      filtrados = filtrados.filter(e => {
        const usuario = e.usuario || '';
        const detalhes = JSON.stringify(e.detalhes || {});
        const encontrouNoUsuario = contemTermo(usuario, termo);
        const encontrouNosDetalhes = contemTermo(detalhes, termo);
        
        // Auto-expandir se encontrou nos detalhes
        if (encontrouNosDetalhes && !encontrouNoUsuario) {
          setExpandido(e.id);
        }
        
        return encontrouNoUsuario || encontrouNosDetalhes;
      });
    }

    return filtrados;
  }, [eventos, abaHistorico, filtroTipo, busca, dataInicio, dataFim]);

  const totalPaginas = Math.ceil(eventosFiltrados.length / itensPorPagina);
  const eventosPaginados = eventosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [abaHistorico, filtroTipo, busca, dataInicio, dataFim]);

  const getRoleBadge = (username: string) => {
    const usuario = usuarios[username];
    if (!usuario) return null;
    
    const roleConfig: Record<string, { label: string; color: string }> = {
      administrador: { label: 'ADM', color: 'bg-purple-600' },
      moderador: { label: 'MOD', color: 'bg-blue-600' },
      usuario: { label: 'USU', color: 'bg-gray-600' }
    };
    
    const config = roleConfig[usuario.role];
    if (!config) return null;
    
    return (
      <span className={`${config.color} text-white text-xs px-2 py-0.5 rounded ml-1`}>
        {config.label}
      </span>
    );
  };

  const highlightText = (text: string) => {
    if (!busca) return text;
    const regex = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600">{part}</mark> : part
    );
  };

  const highlightUsername = (username: string) => {
    return <span className="underline decoration-2 decoration-gray-400">{highlightText(username)}</span>;
  };

  const getEventoTexto = (evento: any) => {
    switch (evento.tipo) {
      case 'criar_conta':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.criarConta')}</>;
      case 'login':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.login')}</>;
      case 'logout':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.logout')}</>;
      case 'enviar_contato':
        return <>{highlightUsername(evento.usuario)} {t('historico.evento.enviarContato')} - {highlightText((evento.detalhes?.tipo || '').replace('-', ' '))}</>;
      case 'ler_contato':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.lerContato')} {highlightUsername(evento.detalhes?.usuarioContato || '')} - {highlightText(evento.detalhes?.tipo || '')}</>;
      case 'responder_contato':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.responderContato')} {highlightUsername(evento.detalhes?.usuarioContato || '')}</>;
      case 'resolver_contato':
        const isProprioContato = evento.usuario === evento.detalhes?.usuarioContato;
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.resolverContato')} {evento.detalhes?.tipo ? highlightText((evento.detalhes.tipo || '').replace('-', ' ')) : ''} {isProprioContato ? '' : 'de ' + highlightUsername(evento.detalhes?.usuarioContato || '')}</>;
      case 'marcar_pendente_contato':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.marcarPendente')} {evento.detalhes?.tipo ? highlightText((evento.detalhes.tipo || '').replace('-', ' ')) : 'contato'} de {highlightUsername(evento.detalhes?.usuarioContato || '')}</>;
      case 'excluir_denuncia':
        const denunciaExcluida = evento.detalhes?.denuncia;
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.excluirDenuncia')} - {highlightText(denunciaExcluida?.tipo || '')} em {highlightText(denunciaExcluida?.endereco || '')}</>;
      case 'adicionar_denuncia':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.adicionarDenuncia')}: {highlightText(evento.detalhes?.tipo || '')} em {highlightText(evento.detalhes?.endereco || '')}</>;
      case 'editar_denuncia':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.editarDenuncia')}</>;
      case 'modificar_role':
        const roleAnteriorConfig: Record<string, { label: string; color: string }> = {
          administrador: { label: 'ADM', color: 'bg-purple-600' },
          moderador: { label: 'MOD', color: 'bg-blue-600' },
          usuario: { label: 'USU', color: 'bg-gray-600' }
        };
        const roleNovaConfig: Record<string, { label: string; color: string }> = {
          administrador: { label: 'ADM', color: 'bg-purple-600' },
          moderador: { label: 'MOD', color: 'bg-blue-600' },
          usuario: { label: 'USU', color: 'bg-gray-600' }
        };
        const configAnterior = roleAnteriorConfig[evento.detalhes?.roleAnterior || ''];
        const configNova = roleNovaConfig[evento.detalhes?.roleNova || ''];
        return (
          <>
            {highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.modificarRole')} {highlightUsername(evento.detalhes?.alvo || '')} {' '}
            {configAnterior && (
              <span className={`${configAnterior.color} text-white text-xs px-2 py-0.5 rounded mx-1`}>
                {configAnterior.label}
              </span>
            )}
            {!configAnterior && highlightText(evento.detalhes?.roleAnterior || '')}
            {' '}{t('historico.evento.para')}{' '}
            {configNova && (
              <span className={`${configNova.color} text-white text-xs px-2 py-0.5 rounded mx-1`}>
                {configNova.label}
              </span>
            )}
            {!configNova && highlightText(evento.detalhes?.roleNova || '')}
          </>
        );
      case 'alterar_senha':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.alterarSenha')}</>;
      case 'alterar_username':
        return <>{highlightUsername(evento.detalhes?.usernameAntigo || '')}{getRoleBadge(evento.usuario)} {t('historico.evento.alterarUsername')} {highlightUsername(evento.detalhes?.usernameNovo || '')}</>;
      case 'banir_usuario':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.banir')} {highlightUsername(evento.detalhes?.usuarioBanido || '')}</>;
      case 'desbanir_usuario':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.desbanir')} {highlightUsername(evento.detalhes?.usuarioDesbanido || '')}</>;
      case 'excluir_usuario':
        const manteveDenuncias = evento.detalhes?.manterDenuncias;
        const totalDenunciasExcluidas = evento.detalhes?.denunciasExcluidas || 0;
        return (
          <>
            {highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.excluirUsuario')} {highlightUsername(evento.detalhes?.usuarioExcluido || '')}
            {totalDenunciasExcluidas > 0 && (
              <span className="text-gray-400 text-sm">
                {' '}({manteveDenuncias ? t('historico.evento.manteveDenuncias', { count: totalDenunciasExcluidas }) : t('historico.evento.excluiuDenuncias', { count: totalDenunciasExcluidas })})
              </span>
            )}
          </>
        );
      case 'excluir_conta':
        const totalDenuncias = evento.detalhes?.denunciasExcluidas || 0;
        const manteve = evento.detalhes?.manterDenuncias;
        return (
          <>
            {highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} {t('historico.evento.excluirConta')}
            {totalDenuncias > 0 && (
              <span className="text-gray-400 text-sm">
                {' '}({manteve ? t('historico.evento.manteveDenuncias', { count: totalDenuncias }) : t('historico.evento.excluiuDenuncias', { count: totalDenuncias })})
              </span>
            )}
          </>
        );
      default:
        return <>{t('historico.evento.desconhecido', { tipo: evento.tipo || 'desconhecido' })}</>;
    }
  };

  const getEventoIcon = (tipo: string) => {
    switch (tipo) {
      case 'criar_conta': return UserPlus;
      case 'login': return LogIn;
      case 'logout': return LogOut;
      case 'enviar_contato': return MessageSquare;
      case 'ler_contato': return MessageSquare;
      case 'responder_contato': return MessageSquare;
      case 'resolver_contato': return CheckCircle;
      case 'marcar_pendente_contato': return AlertTriangle;
      case 'excluir_denuncia': return Trash2;
      case 'adicionar_denuncia': return Plus;
      case 'editar_denuncia': return Edit;
      case 'modificar_role': return Settings;
      case 'alterar_senha': return Settings;
      case 'alterar_username': return Edit;
      case 'excluir_conta': return Trash2;
      case 'banir_usuario': return AlertTriangle;
      case 'desbanir_usuario': return CheckCircle;
      case 'excluir_usuario': return Trash2;
      default: return AlertTriangle;
    }
  };

  const getEventoIconColor = (tipo: string) => {
    switch (tipo) {
      case 'excluir_denuncia': return 'text-red-400';
      case 'editar_denuncia': return 'text-blue-400';
      case 'adicionar_denuncia': return 'text-green-400';
      case 'modificar_role': return 'text-purple-400';
      case 'login': return 'text-cyan-400';
      case 'logout': return 'text-orange-400';
      case 'criar_conta': return 'text-green-400';
      case 'enviar_contato': return 'text-green-400';
      case 'ler_contato': return 'text-yellow-400';
      case 'responder_contato': return 'text-blue-400';
      case 'resolver_contato': return 'text-green-400';
      case 'marcar_pendente_contato': return 'text-yellow-400';
      case 'alterar_senha': return 'text-blue-400';
      case 'alterar_username': return 'text-blue-400';
      case 'excluir_conta': return 'text-red-400';
      case 'banir_usuario': return 'text-orange-400';
      case 'desbanir_usuario': return 'text-green-400';
      case 'excluir_usuario': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur">
          <p className="text-sm text-slate-400">{t('historico.carregando')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">{t('title')}</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">{t('historico.titulo')}</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{t('historico.descricao')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{t('historico.qtdItens', { count: eventosFiltrados.length })}</span>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
          >
            {t('historico.filtros')}
          </button>
        </div>
      </div>
      
      {mostrarFiltros && (
        <>
      <div className="flex gap-1.5 mb-3">
        <button
          onClick={() => setAbaHistorico('todos')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            abaHistorico === 'todos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {t('historico.aba.todos')}
        </button>
        <button
          onClick={() => setAbaHistorico('moderacao')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            abaHistorico === 'moderacao' ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {t('historico.aba.moderacao')}
        </button>
        <button
          onClick={() => setAbaHistorico('usuarios')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            abaHistorico === 'usuarios' ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {t('historico.aba.usuarios')}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('historico.buscaPlaceholder')}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="todos">{t('historico.filtro.todosTipos')}</option>
            <option value="criar_conta">{t('historico.filtro.criarConta')}</option>
            <option value="login">{t('historico.filtro.login')}</option>
            <option value="logout">{t('historico.filtro.logout')}</option>
            <option value="adicionar_denuncia">{t('historico.filtro.adicionarDenuncia')}</option>
            <option value="editar_denuncia">{t('historico.filtro.editarDenuncia')}</option>
            <option value="excluir_denuncia">{t('historico.filtro.excluirDenuncia')}</option>
            <option value="modificar_role">{t('historico.filtro.modificarRole')}</option>
            <option value="enviar_contato">{t('historico.filtro.enviarContato')}</option>
            <option value="ler_contato">{t('historico.filtro.lerContato')}</option>
            <option value="responder_contato">{t('historico.filtro.responderContato')}</option>
            <option value="resolver_contato">{t('historico.filtro.resolverContato')}</option>
            <option value="marcar_pendente_contato">{t('historico.filtro.marcarPendente')}</option>
            <option value="alterar_senha">{t('historico.filtro.alterarSenha')}</option>
            <option value="alterar_username">{t('historico.filtro.alterarUsername')}</option>
            <option value="excluir_conta">{t('historico.filtro.excluirConta')}</option>
            <option value="banir_usuario">{t('historico.filtro.banirUsuario')}</option>
            <option value="desbanir_usuario">{t('historico.filtro.desbanirUsuario')}</option>
            <option value="excluir_usuario">{t('historico.filtro.excluirUsuario')}</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur flex gap-3">
        <div className="flex-1">
          <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('historico.dataInicio')}</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('historico.dataFim')}</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {(busca || filtroTipo !== 'todos' || dataInicio || dataFim) && (
        <div className="flex gap-1.5 flex-wrap">
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 flex items-center gap-1"
            >
              {t('historico.filtroAtivo.busca', { termo: busca })} <X size={12} />
            </button>
          )}
          {filtroTipo !== 'todos' && (
            <button
              onClick={() => setFiltroTipo('todos')}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 flex items-center gap-1"
            >
              {t('historico.filtroAtivo.tipo', { tipo: filtroTipo.replace('_', ' ') })} <X size={12} />
            </button>
          )}
          {dataInicio && (
            <button
              onClick={() => setDataInicio('')}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 flex items-center gap-1"
            >
              {t('historico.filtroAtivo.de', { data: new Date(dataInicio).toLocaleDateString('pt-BR') })} <X size={12} />
            </button>
          )}
          {dataFim && (
            <button
              onClick={() => setDataFim('')}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 flex items-center gap-1"
            >
              {t('historico.filtroAtivo.ate', { data: new Date(dataFim).toLocaleDateString('pt-BR') })} <X size={12} />
            </button>
          )}
          <button
            onClick={() => { setBusca(''); setFiltroTipo('todos'); setDataInicio(''); setDataFim(''); }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
          >
            {t('historico.limparTodos')}
          </button>
        </div>
      )}
        </>
      )}

      {eventosFiltrados.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-400">{t('historico.vazio')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {eventosPaginados.map((evento) => {
              const IconComponent = getEventoIcon(evento.tipo);
              return (
              <div key={evento.id} className="bg-gray-800 p-4 rounded-lg shadow">
                <div 
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-750 -m-4 p-4 rounded-lg transition"
                  onClick={() => {
                    if (evento.tipo === 'responder_contato' || evento.tipo === 'resolver_contato' || evento.tipo === 'marcar_pendente_contato' || evento.tipo === 'ler_contato') {
                      setSearchParams({ tab: 'contatos' });
                      setTimeout(() => {
                        window.location.hash = evento.detalhes?.contatoId;
                      }, 100);
                    } else {
                      setExpandido(expandido === evento.id ? null : evento.id);
                    }
                  }}
                >
                  <IconComponent size={20} className={`${getEventoIconColor(evento.tipo)} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-white">{getEventoTexto(evento)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(evento.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandido === evento.id ? 'rotate-180' : ''}`} />
                </div>
                {expandido === evento.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    {evento.tipo === 'enviar_contato' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.tipo')}:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.dataContato')}:</strong> <span className="text-gray-400">{new Date(evento.detalhes.contatoId).toLocaleString('pt-BR')}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'ler_contato' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.usuarioContato')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioContato || t('historico.evento.anonimo'))}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.tipo')}:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.dataContato')}:</strong> <span className="text-gray-400">{new Date(evento.detalhes.contatoId).toLocaleString('pt-BR')}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'responder_contato' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.usuarioContato')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioContato || t('historico.evento.anonimo'))}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.tipo')}:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                        {evento.detalhes.mensagens && evento.detalhes.mensagens.length > 0 && (
                          <div>
                            <strong className="text-gray-300">{t('historico.detalhes.historicoConversa')}:</strong>
                            <div className="mt-2 space-y-2">
                              {evento.detalhes.mensagens.map((msg: any, idx: number) => (
                                <div key={idx} className={`p-2 rounded text-xs ${
                                  msg.tipo === 'sistema' 
                                    ? 'bg-gray-700 text-center italic' 
                                    : 'bg-gray-700'
                                }`}>
                                  {msg.tipo !== 'sistema' && <div className="font-semibold text-gray-300 mb-1">{msg.autor}</div>}
                                  <div className="text-gray-400">{msg.texto}</div>
                                  {msg.timestamp && (
                                    <div className="text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString('pt-BR')}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {(evento.tipo === 'resolver_contato' || evento.tipo === 'marcar_pendente_contato') && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.usuarioContato')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioContato || t('historico.evento.anonimo'))}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.tipo')}:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'adicionar_denuncia' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.tipo')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.tipo || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.endereco')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.endereco || '')}</span></div>
                        {evento.detalhes.relato && (
                          <div><strong className="text-gray-300">{t('historico.detalhes.relato')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.relato)}</span></div>
                        )}
                        {evento.detalhes.placa && (
                          <div><strong className="text-gray-300">{t('historico.detalhes.placa')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.placa)}</span></div>
                        )}
                        <div><strong className="text-gray-300">{t('historico.detalhes.id')}:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.id}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'editar_denuncia' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.relatoAnterior')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.relatoAnterior || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.relatoNovo')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.relatoNovo || '')}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'excluir_denuncia' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.motivo')}:</strong> <span className="text-red-400 font-semibold">{highlightText(evento.detalhes.motivo || '')}</span></div>
                        {evento.detalhes.denuncia && (
                          <>
                            <div><strong className="text-gray-300">{t('historico.detalhes.usuarioDenuncia')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.username || t('historico.evento.anonimo'))}</span></div>
                            <div><strong className="text-gray-300">{t('historico.detalhes.tipo')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.tipo || '')}</span></div>
                            <div><strong className="text-gray-300">{t('historico.detalhes.endereco')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.endereco || '')}</span></div>
                            <div><strong className="text-gray-300">{t('historico.detalhes.relato')}:</strong> <span className="text-gray-400">{highlightText(typeof evento.detalhes.denuncia.relato === 'string' ? evento.detalhes.denuncia.relato : (Array.isArray(evento.detalhes.denuncia.relato) && evento.detalhes.denuncia.relato.length > 0 ? (typeof evento.detalhes.denuncia.relato[evento.detalhes.denuncia.relato.length - 1] === 'string' ? evento.detalhes.denuncia.relato[evento.detalhes.denuncia.relato.length - 1] : evento.detalhes.denuncia.relato[evento.detalhes.denuncia.relato.length - 1]?.texto) : ''))}</span></div>
                            {evento.detalhes.denuncia.placa && (
                              <div><strong className="text-gray-300">{t('historico.detalhes.placa')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.placa)}</span></div>
                            )}
                            <div><strong className="text-gray-300">{t('historico.detalhes.dataCriacao')}:</strong> <span className="text-gray-400">{new Date(evento.detalhes.denuncia.createdAt).toLocaleString('pt-BR')}</span></div>
                          </>
                        )}
                      </div>
                    )}
                    {evento.tipo === 'alterar_senha' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.uid')}:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'alterar_username' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.usernameAnterior')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usernameAntigo || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.usernameNovo')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usernameNovo || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.uid')}:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {(evento.tipo === 'banir_usuario' || evento.tipo === 'desbanir_usuario') && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{evento.tipo === 'banir_usuario' ? t('historico.detalhes.usuarioBanido') : t('historico.detalhes.usuarioDesbanido')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioBanido || evento.detalhes.usuarioDesbanido || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.uid')}:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'excluir_usuario' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.usuarioExcluido')}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioExcluido || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.motivo')}:</strong> <span className="text-red-400 font-semibold">{highlightText(evento.detalhes.motivo || '')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.denunciasMantidas')}:</strong> <span className="text-gray-400">{evento.detalhes.denunciasExcluidas || 0}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.uid')}:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'excluir_conta' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">{t('historico.detalhes.email')}:</strong> <span className="text-gray-400">{evento.detalhes.email || t('historico.detalhes.na')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.uid')}:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.manteveDenuncias')}:</strong> <span className="text-gray-400">{evento.detalhes.manterDenuncias ? t('historico.detalhes.sim') : t('historico.detalhes.nao')}</span></div>
                        <div><strong className="text-gray-300">{t('historico.detalhes.totalDenuncias')}:</strong> <span className="text-gray-400">{evento.detalhes.denunciasExcluidas || 0}</span></div>
                        {evento.detalhes.manterDenuncias && evento.detalhes.denunciasExcluidas > 0 && evento.detalhes.denunciasIds && (
                          <div>
                            <strong className="text-gray-300">{t('historico.detalhes.idsDenuncias')}:</strong>
                            <div className="mt-1 space-y-1">
                              {evento.detalhes.denunciasIds.map((id: string, idx: number) => (
                                <div key={idx} className="text-gray-400 font-mono text-xs bg-gray-700 p-1 rounded">{id}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!['editar_denuncia', 'excluir_denuncia', 'adicionar_denuncia', 'alterar_senha', 'alterar_username', 'excluir_conta', 'banir_usuario', 'desbanir_usuario', 'excluir_usuario'].includes(evento.tipo) && (
                      <pre className="text-xs text-gray-400 overflow-x-auto">{JSON.stringify(evento.detalhes, null, 2)}</pre>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
              >
                {t('historico.paginacao.anterior')}
              </button>
              <span className="text-gray-400 text-sm">
                {t('historico.paginacao.pagina', { atual: paginaAtual, total: totalPaginas })}
              </span>
              <button
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
              >
                {t('historico.paginacao.proxima')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
