import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { ChevronDown, UserPlus, LogIn, LogOut, Trash2, Plus, Edit, Settings, AlertTriangle, X, MessageSquare, CheckCircle } from "lucide-react";
import { useSearchParams } from "react-router";

export default function HistoricoTab() {
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
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setEventos(eventosArray);
      }
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
    
    return () => {
      unsubscribeHistorico();
      unsubscribeUsuarios();
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
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} criou uma conta</>;
      case 'login':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} fez login</>;
      case 'logout':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} fez logout</>;
      case 'enviar_contato':
        return <>{highlightUsername(evento.usuario)} enviou contato - {highlightText((evento.detalhes?.tipo || '').replace('-', ' '))}</>;
      case 'ler_contato':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} leu contato de {highlightUsername(evento.detalhes?.usuarioContato || '')} - {highlightText(evento.detalhes?.tipo || '')}</>;
      case 'responder_contato':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} respondeu o contato de {highlightUsername(evento.detalhes?.usuarioContato || '')}</>;
      case 'resolver_contato':
        const isProprioContato = evento.usuario === evento.detalhes?.usuarioContato;
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} marcou contato {evento.detalhes?.tipo ? highlightText((evento.detalhes.tipo || '').replace('-', ' ')) : ''} {isProprioContato ? '' : 'de ' + highlightUsername(evento.detalhes?.usuarioContato || '')} como Resolvido</>;
      case 'marcar_pendente_contato':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} marcou {evento.detalhes?.tipo ? highlightText((evento.detalhes.tipo || '').replace('-', ' ')) : 'contato'} de {highlightUsername(evento.detalhes?.usuarioContato || '')} como Pendente</>;
      case 'excluir_denuncia':
        const denunciaExcluida = evento.detalhes?.denuncia;
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} excluiu denúncia - {highlightText(denunciaExcluida?.tipo || '')} em {highlightText(denunciaExcluida?.endereco || '')}</>;
      case 'adicionar_denuncia':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} adicionou denúncia: {highlightText(evento.detalhes?.tipo || '')} em {highlightText(evento.detalhes?.endereco || '')}</>;
      case 'editar_denuncia':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} editou denúncia</>;
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
            {highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} modificou permissões de {highlightUsername(evento.detalhes?.alvo || '')} de{' '}
            {configAnterior && (
              <span className={`${configAnterior.color} text-white text-xs px-2 py-0.5 rounded mx-1`}>
                {configAnterior.label}
              </span>
            )}
            {!configAnterior && highlightText(evento.detalhes?.roleAnterior || '')}
            {' '}para{' '}
            {configNova && (
              <span className={`${configNova.color} text-white text-xs px-2 py-0.5 rounded mx-1`}>
                {configNova.label}
              </span>
            )}
            {!configNova && highlightText(evento.detalhes?.roleNova || '')}
          </>
        );
      case 'alterar_senha':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} alterou a senha</>;
      case 'alterar_username':
        return <>{highlightUsername(evento.detalhes?.usernameAntigo || '')}{getRoleBadge(evento.usuario)} alterou o username para {highlightUsername(evento.detalhes?.usernameNovo || '')}</>;
      case 'banir_usuario':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} baniu {highlightUsername(evento.detalhes?.usuarioBanido || '')}</>;
      case 'desbanir_usuario':
        return <>{highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} desbaniu {highlightUsername(evento.detalhes?.usuarioDesbanido || '')}</>;
      case 'excluir_usuario':
        const manteveDenuncias = evento.detalhes?.manterDenuncias;
        const totalDenunciasExcluidas = evento.detalhes?.denunciasExcluidas || 0;
        return (
          <>
            {highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} excluiu o usuário {highlightUsername(evento.detalhes?.usuarioExcluido || '')}
            {totalDenunciasExcluidas > 0 && (
              <span className="text-gray-400 text-sm">
                {' '}({manteveDenuncias ? `manteve ${totalDenunciasExcluidas} denúncias` : `excluiu ${totalDenunciasExcluidas} denúncias`})
              </span>
            )}
          </>
        );
      case 'excluir_conta':
        const totalDenuncias = evento.detalhes?.denunciasExcluidas || 0;
        const manteve = evento.detalhes?.manterDenuncias;
        return (
          <>
            {highlightUsername(evento.usuario)}{getRoleBadge(evento.usuario)} excluiu a conta
            {totalDenuncias > 0 && (
              <span className="text-gray-400 text-sm">
                {' '}({manteve ? `manteve ${totalDenuncias} denúncias` : `excluiu ${totalDenuncias} denúncias`})
              </span>
            )}
          </>
        );
      default:
        return <>Evento: {evento.tipo || 'desconhecido'}</>;
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
      <div className="p-8">
        <p className="text-gray-400">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Histórico de Eventos ({eventosFiltrados.length})</h2>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="text-gray-400 hover:text-white underline text-sm"
        >
          ~ filtros ~
        </button>
      </div>
      
      {mostrarFiltros && (
        <>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAbaHistorico('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            abaHistorico === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setAbaHistorico('moderacao')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            abaHistorico === 'moderacao' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Moderação
        </button>
        <button
          onClick={() => setAbaHistorico('usuarios')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            abaHistorico === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Usuários
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-4 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por termo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
        >
          <option value="todos">Todos os tipos</option>
          <option value="criar_conta">Criar conta</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="adicionar_denuncia">Adicionar denúncia</option>
          <option value="editar_denuncia">Editar denúncia</option>
          <option value="excluir_denuncia">Excluir denúncia</option>
          <option value="modificar_role">Modificar role</option>
          <option value="enviar_contato">Enviar contato</option>
          <option value="ler_contato">Ler contato</option>
          <option value="responder_contato">Responder contato</option>
          <option value="resolver_contato">Resolver contato</option>
          <option value="marcar_pendente_contato">Marcar pendente</option>
          <option value="alterar_senha">Alterar senha</option>
          <option value="alterar_username">Alterar username</option>
          <option value="excluir_conta">Excluir conta</option>
          <option value="banir_usuario">Banir usuário</option>
          <option value="desbanir_usuario">Desbanir usuário</option>
          <option value="excluir_usuario">Excluir usuário</option>
        </select>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Data Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      {(busca || filtroTipo !== 'todos' || dataInicio || dataFim) && (
        <div className="flex gap-2 mb-4">
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
            >
              Busca: "{busca}" <X size={14} />
            </button>
          )}
          {filtroTipo !== 'todos' && (
            <button
              onClick={() => setFiltroTipo('todos')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
            >
              Tipo: {filtroTipo.replace('_', ' ')} <X size={14} />
            </button>
          )}
          {dataInicio && (
            <button
              onClick={() => setDataInicio('')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
            >
              De: {new Date(dataInicio).toLocaleDateString('pt-BR')} <X size={14} />
            </button>
          )}
          {dataFim && (
            <button
              onClick={() => setDataFim('')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
            >
              Até: {new Date(dataFim).toLocaleDateString('pt-BR')} <X size={14} />
            </button>
          )}
          <button
            onClick={() => {
              setBusca('');
              setFiltroTipo('todos');
              setDataInicio('');
              setDataFim('');
            }}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Limpar todos
          </button>
        </div>
      )}
        </>
      )}

      {eventosFiltrados.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-400">Nenhum evento encontrado</p>
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
                        <div><strong className="text-gray-300">Tipo:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                        <div><strong className="text-gray-300">Data do contato:</strong> <span className="text-gray-400">{new Date(evento.detalhes.contatoId).toLocaleString('pt-BR')}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'ler_contato' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Usuário do contato:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioContato || 'Anônimo')}</span></div>
                        <div><strong className="text-gray-300">Tipo:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                        <div><strong className="text-gray-300">Data do contato:</strong> <span className="text-gray-400">{new Date(evento.detalhes.contatoId).toLocaleString('pt-BR')}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'responder_contato' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Usuário do contato:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioContato || 'Anônimo')}</span></div>
                        <div><strong className="text-gray-300">Tipo:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                        {evento.detalhes.mensagens && evento.detalhes.mensagens.length > 0 && (
                          <div>
                            <strong className="text-gray-300">Histórico da conversa:</strong>
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
                        <div><strong className="text-gray-300">Usuário do contato:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioContato || 'Anônimo')}</span></div>
                        <div><strong className="text-gray-300">Tipo:</strong> <span className="text-gray-400 capitalize">{highlightText((evento.detalhes.tipo || '').replace('-', ' '))}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'adicionar_denuncia' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Tipo:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.tipo || '')}</span></div>
                        <div><strong className="text-gray-300">Endereço:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.endereco || '')}</span></div>
                        {evento.detalhes.relato && (
                          <div><strong className="text-gray-300">Relato:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.relato)}</span></div>
                        )}
                        {evento.detalhes.placa && (
                          <div><strong className="text-gray-300">Placa:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.placa)}</span></div>
                        )}
                        <div><strong className="text-gray-300">ID:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.id}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'editar_denuncia' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Relato anterior:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.relatoAnterior || '')}</span></div>
                        <div><strong className="text-gray-300">Relato novo:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.relatoNovo || '')}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'excluir_denuncia' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Motivo:</strong> <span className="text-red-400 font-semibold">{highlightText(evento.detalhes.motivo || '')}</span></div>
                        {evento.detalhes.denuncia && (
                          <>
                            <div><strong className="text-gray-300">Usuário da denúncia:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.username || 'Anônimo')}</span></div>
                            <div><strong className="text-gray-300">Tipo:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.tipo || '')}</span></div>
                            <div><strong className="text-gray-300">Endereço:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.endereco || '')}</span></div>
                            <div><strong className="text-gray-300">Relato:</strong> <span className="text-gray-400">{highlightText(typeof evento.detalhes.denuncia.relato === 'string' ? evento.detalhes.denuncia.relato : (Array.isArray(evento.detalhes.denuncia.relato) && evento.detalhes.denuncia.relato.length > 0 ? (typeof evento.detalhes.denuncia.relato[evento.detalhes.denuncia.relato.length - 1] === 'string' ? evento.detalhes.denuncia.relato[evento.detalhes.denuncia.relato.length - 1] : evento.detalhes.denuncia.relato[evento.detalhes.denuncia.relato.length - 1]?.texto) : ''))}</span></div>
                            {evento.detalhes.denuncia.placa && (
                              <div><strong className="text-gray-300">Placa:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.denuncia.placa)}</span></div>
                            )}
                            <div><strong className="text-gray-300">Data de criação:</strong> <span className="text-gray-400">{new Date(evento.detalhes.denuncia.createdAt).toLocaleString('pt-BR')}</span></div>
                          </>
                        )}
                      </div>
                    )}
                    {evento.tipo === 'alterar_senha' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">UID:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'alterar_username' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Username anterior:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usernameAntigo || '')}</span></div>
                        <div><strong className="text-gray-300">Username novo:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usernameNovo || '')}</span></div>
                        <div><strong className="text-gray-300">UID:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {(evento.tipo === 'banir_usuario' || evento.tipo === 'desbanir_usuario') && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Usuário {evento.tipo === 'banir_usuario' ? 'banido' : 'desbanido'}:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioBanido || evento.detalhes.usuarioDesbanido || '')}</span></div>
                        <div><strong className="text-gray-300">UID:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'excluir_usuario' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Usuário excluído:</strong> <span className="text-gray-400">{highlightText(evento.detalhes.usuarioExcluido || '')}</span></div>
                        <div><strong className="text-gray-300">Motivo:</strong> <span className="text-red-400 font-semibold">{highlightText(evento.detalhes.motivo || '')}</span></div>
                        <div><strong className="text-gray-300">Denúncias {evento.detalhes.manterDenuncias ? 'mantidas' : 'excluídas'}:</strong> <span className="text-gray-400">{evento.detalhes.denunciasExcluidas || 0}</span></div>
                        <div><strong className="text-gray-300">UID:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                      </div>
                    )}
                    {evento.tipo === 'excluir_conta' && evento.detalhes && (
                      <div className="space-y-2 text-sm">
                        <div><strong className="text-gray-300">Email:</strong> <span className="text-gray-400">{evento.detalhes.email || 'N/A'}</span></div>
                        <div><strong className="text-gray-300">UID:</strong> <span className="text-gray-400 font-mono text-xs">{evento.detalhes.uid}</span></div>
                        <div><strong className="text-gray-300">Manteve denúncias:</strong> <span className="text-gray-400">{evento.detalhes.manterDenuncias ? 'Sim' : 'Não'}</span></div>
                        <div><strong className="text-gray-300">Total de denúncias:</strong> <span className="text-gray-400">{evento.detalhes.denunciasExcluidas || 0}</span></div>
                        {evento.detalhes.manterDenuncias && evento.detalhes.denunciasExcluidas > 0 && evento.detalhes.denunciasIds && (
                          <div>
                            <strong className="text-gray-300">IDs das denúncias mantidas:</strong>
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
                Anterior
              </button>
              <span className="text-gray-400 text-sm">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 text-sm"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
