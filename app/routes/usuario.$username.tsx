import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ref, onValue, push, update } from "firebase/database";
import { db } from "../lib/firebase";
import { ArrowLeft, MapPin, Edit2, Trash2, MessageSquare, CheckCircle } from "lucide-react";
import type { Route } from "./+types/usuario.$username";
import { useAuth } from "../lib/AuthContext";
import { editarDenuncia, excluirDenuncia } from "../lib/denuncias";
import { registrarEvento } from "../lib/historico";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Contribuições de ${params.username} - Ciclista Denuncie` }];
}

interface Denuncia {
  endereco: string;
  relato: string | Array<{ texto: string; editadoEm: string }> | Array<string>;
  tipo?: string;
  placa?: string;
  localizacao?: { lat: number; lng: number };
  createdAt: string;
  username?: string;
  userId?: string;
}

export default function UserContributions() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<'denuncias' | 'contatos'>('denuncias');
  const [denuncias, setDenuncias] = useState<[string, Denuncia][]>([]);
  const [contatos, setContatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoRelato, setNovoRelato] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [motivoExclusao, setMotivoExclusao] = useState("");
  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const isOwner = user?.username === username;

  useEffect(() => {
    if (user && user.username !== username) {
      navigate('/');
    }
  }, [user, username, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (user.username !== username) {
    return null;
  }

  useEffect(() => {
    const denunciasRef = ref(db, "denuncias");
    const unsubscribe = onValue(denunciasRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userDenuncias = Object.entries(data)
        .filter(([_, d]: [string, any]) => d.username === username)
        .sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt));
      setDenuncias(userDenuncias as [string, Denuncia][]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const contatosRef = ref(db, "contatos");
    const unsubscribe = onValue(contatosRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Snapshot existe?', snapshot.exists());
      console.log('Dados brutos:', data);
      console.log('Username procurado:', username);
      
      if (!data) {
        console.log('Nenhum dado retornado do Firebase');
        setContatos([]);
        return;
      }
      
      const userContatos = Object.entries(data)
        .filter(([id, c]: [string, any]) => {
          console.log(`Contato ${id}:`, c);
          console.log(`  c.usuario: "${c.usuario}" === username: "${username}" = ${c.usuario === username}`);
          return c.usuario === username;
        })
        .map(([id, c]: [string, any]) => ({ id, ...c }))
        .sort((a, b) => b.id.localeCompare(a.id));
      
      console.log('Total de contatos encontrados:', userContatos.length);
      console.log('Contatos:', userContatos);
      setContatos(userContatos);
    }, (error) => {
      console.error('Erro ao ler contatos:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
    });
    return () => unsubscribe();
  }, [username]);

  const handleEditar = (id: string, relatoAtual: string) => {
    setEditandoId(id);
    setNovoRelato(relatoAtual);
  };

  const handleSalvarEdicao = async (id: string) => {
    if (!novoRelato.trim() || !user?.username) return;
    try {
      await editarDenuncia(id, novoRelato, user.username);
      setEditandoId(null);
      setNovoRelato("");
    } catch (error) {
      alert("Erro ao editar denúncia");
    }
  };

  const handleExcluir = async (id: string) => {
    if (!user?.username) return;
    if (!motivoExclusao.trim()) {
      alert("O motivo da exclusão é obrigatório");
      return;
    }
    try {
      await excluirDenuncia(id, user.username, motivoExclusao);
      setExcluindoId(null);
      setMotivoExclusao("");
    } catch (error) {
      alert("Erro ao excluir denúncia");
    }
  };

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
        aguardandoResposta: true,
        resolvido: false 
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

  const getStatusContato = (contato: any) => {
    if (contato.resolvido) return { label: 'Resolvido', color: 'bg-green-500' };
    if (contato.aguardandoResposta) return { label: 'Pendente', color: 'bg-yellow-500' };
    
    const timestamp = contato.data || contato.id;
    const dataContato = new Date(timestamp);
    const agora = new Date();
    const diferencaMinutos = (agora.getTime() - dataContato.getTime()) / (1000 * 60);
    
    const temMensagens = contato.mensagens && Object.keys(contato.mensagens).length > 0;
    
    if (diferencaMinutos > 5 && !temMensagens) {
      return { label: 'Sem Resposta', color: 'bg-yellow-500' };
    }
    
    if (contato.lida) return { label: 'Lida', color: 'bg-blue-500' };
    return { label: 'Não Lida', color: 'bg-gray-500' };
  };

  const getRelatoAtual = (relato: string | Array<{ texto: string; editadoEm: string }> | Array<string>): string => {
    if (typeof relato === 'string') return relato;
    if (Array.isArray(relato) && relato.length > 0) {
      const ultimo = relato[relato.length - 1];
      return typeof ultimo === 'string' ? ultimo : ultimo?.texto || '';
    }
    return '';
  };

  const foiEditado = (relato: string | Array<{ texto: string; editadoEm: string }> | Array<string>): boolean => {
    return Array.isArray(relato) && relato.length > 1;
  };

  const tipos = [
    { value: "fina", label: "Fina" },
    { value: "ameaca", label: "Ameaça" },
    { value: "assedio", label: "Assédio" },
    { value: "agressao-verbal", label: "Agressão Verbal" },
    { value: "agressao-fisica", label: "Atropelamento" },
    { value: "invasao-ciclovia", label: "Invasão de Ciclovia/Ciclofaixa" },
    { value: "buraco-via", label: "Buraco na Via" },
    { value: "falta-sinalizacao", label: "Falta de Sinalização" },
    { value: "trecho-perigoso", label: "Trecho Perigoso" },
    { value: "ciclovia-obstruida", label: "Ciclovia Obstruída" },
    { value: "falta-iluminacao", label: "Falta de Iluminação" },
    { value: "veiculo-estacionado", label: "Veículo Estacionado na Ciclovia" },
    { value: "ma-conservacao", label: "Má Conservação da Via" },
    { value: "falta-ciclovia", label: "Falta de Ciclovia" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> voltar
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Minhas Contribuições
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {abaAtiva === 'denuncias' ? 'Denúncias' : 'Contatos'} de {username}
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAbaAtiva('denuncias')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              abaAtiva === 'denuncias' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Denúncias ({denuncias.length})
          </button>
          <button
            onClick={() => setAbaAtiva('contatos')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              abaAtiva === 'contatos' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Contatos ({contatos.length})
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        ) : abaAtiva === 'denuncias' ? (
          denuncias.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma denúncia registrada ainda.
              </p>
              <Link
                to="/denunciar"
                className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Registrar Primeira Denúncia
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: {denuncias.length} {denuncias.length === 1 ? "denúncia" : "denúncias"}
              </p>
              {denuncias.map(([id, denuncia]) => (
                <div
                  key={id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(denuncia.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {foiEditado(denuncia.relato) && (
                          <span className="ml-2 text-gray-400 dark:text-gray-500">~editado</span>
                        )}
                      </div>
                      {denuncia.tipo && (
                        <div className="text-sm font-semibold text-red-600 dark:text-red-500 mb-2">
                          {tipos.find((t) => t.value === denuncia.tipo)?.label || denuncia.tipo}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {denuncia.localizacao && (
                        <Link
                          to="/mapa"
                          state={{ center: [denuncia.localizacao.lat, denuncia.localizacao.lng], zoom: 16 }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Ver no mapa"
                        >
                          <MapPin size={20} />
                        </Link>
                      )}
                      {isOwner && (
                        <>
                          <button
                            onClick={() => handleEditar(id, getRelatoAtual(denuncia.relato))}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setExcluindoId(excluindoId === id ? null : id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Local:</strong> {denuncia.endereco}
                  </div>

                  {editandoId === id ? (
                    <div className="space-y-2">
                      <textarea
                        value={novoRelato}
                        onChange={(e) => setNovoRelato(e.target.value)}
                        className="w-full p-3 border rounded-lg text-sm text-gray-600 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSalvarEdicao(id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoId(null);
                            setNovoRelato("");
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    denuncia.relato && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {getRelatoAtual(denuncia.relato)}
                      </div>
                    )
                  )}

                  {denuncia.placa && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      Placa: {denuncia.placa}
                    </div>
                  )}

                  {excluindoId === id && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
                          onClick={() => handleExcluir(id)}
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
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          contatos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum contato enviado ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contatos.map((contato) => {
                const status = getStatusContato(contato);
                const mensagens = contato.mensagens ? Object.values(contato.mensagens) as any[] : [];
                return (
                  <div key={contato.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              const timestamp = contato.data || contato.id;
                              const date = new Date(timestamp);
                              return !isNaN(date.getTime()) ? date.toLocaleString('pt-BR') : '';
                            })()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-2">
                          {contato.tipo?.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                      onClick={() => {
                        const novosExpandidos = new Set(expandidos);
                        if (expandidos.has(contato.id)) {
                          novosExpandidos.delete(contato.id);
                        } else {
                          novosExpandidos.add(contato.id);
                        }
                        setExpandidos(novosExpandidos);
                      }}
                    >
                      <div className={expandidos.has(contato.id) ? '' : 'line-clamp-2'}>
                        {contato.mensagem}
                      </div>
                    </div>
                    {expandidos.has(contato.id) && mensagens.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {mensagens.map((msg: any, idx: number) => (
                          <div key={idx} className={`p-3 rounded text-sm ${
                            msg.autor === username 
                              ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
                              : msg.tipo === 'sistema'
                              ? 'bg-gray-600 text-center italic'
                              : 'bg-gray-100 dark:bg-gray-700 mr-8'
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
                    {expandidos.has(contato.id) && isOwner && mensagens.some((msg: any) => msg.autor !== username) && !contato.resolvido && (
                      respondendoId === contato.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={respostaTexto}
                            onChange={(e) => setRespostaTexto(e.target.value)}
                            placeholder="Digite sua resposta..."
                            className="w-full p-3 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRespondendoId(contato.id)}
                            className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center gap-1"
                          >
                            <MessageSquare size={16} /> Responder
                          </button>
                          <button
                            onClick={() => handleMarcarResolvido(contato.id)}
                            className="text-green-600 dark:text-green-400 text-sm hover:underline flex items-center gap-1"
                          >
                            <CheckCircle size={16} /> Marcar como Resolvido
                          </button>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
