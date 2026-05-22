import { useState, useEffect } from "react";
import { ref, onValue, update, remove, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";
import { MoreVertical, X, Trash2 } from "lucide-react";

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [excluindoUid, setExcluindoUid] = useState<string | null>(null);
  const [motivoExclusao, setMotivoExclusao] = useState("");
  const [manterDenuncias, setManterDenuncias] = useState(false);
  const [banindoUid, setBanindoUid] = useState<string | null>(null);
  const [totalDenunciasUsuario, setTotalDenunciasUsuario] = useState<Record<string, number>>({});
  const { user: currentUser } = useAuth();
  const [modalUsuario, setModalUsuario] = useState<any | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmandoBanimento, setConfirmandoBanimento] = useState(false);
  const [confirmandoExclusaoModal, setConfirmandoExclusaoModal] = useState(false);

  useEffect(() => {
    const usersRef = ref(db, 'usuarios');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.entries(data).map(([uid, value]: [string, any]) => ({
          uid,
          username: value?.username || uid,
          role: value?.role || 'user',
          banido: value?.banido || false,
          createdAt: value?.createdAt || '',
        }));
        setUsuarios(usersArray);
        
        // Contar denúncias de cada usuário
        const denunciasRef = ref(db, 'denuncias');
        get(denunciasRef).then(denSnapshot => {
          if (denSnapshot.exists()) {
            const denuncias = denSnapshot.val();
            const counts: Record<string, number> = {};
            Object.values(denuncias).forEach((d: any) => {
              if (d.userId) {
                counts[d.userId] = (counts[d.userId] || 0) + 1;
              }
            });
            setTotalDenunciasUsuario(counts);
          }
        });
      } else {
        setError('Nenhum usuário encontrado no banco');
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRoleDisplay = (role: string) => {
    switch(role) {
      case 'administrador': return 'Adm';
      case 'moderador': return 'Mod';
      case 'usuario': return 'Usu';
      default: return 'Usu';
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'administrador': return 'bg-purple-600 text-white';
      case 'moderador': return 'bg-blue-600 text-white';
      case 'usuario': return 'bg-green-600 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  async function handleRoleChange(uid: string, newRole: string) {
    const usuario = usuarios.find(u => u.uid === uid);
    const roleAnterior = usuario?.role;
    
    await update(ref(db, `usuarios/${uid}`), { role: newRole });
    
    if (currentUser && usuario) {
      await registrarEvento({
        tipo: 'modificar_role',
        usuario: currentUser.username,
        detalhes: {
          alvo: usuario.username,
          roleAnterior,
          roleNova: newRole,
        },
      });
    }
  }

  async function handleBanirUsuario(uid: string, username: string) {
    try {
      await update(ref(db, `usuarios/${uid}`), { banido: true });
      
      if (currentUser) {
        await registrarEvento({
          tipo: 'banir_usuario',
          usuario: currentUser.username,
          detalhes: {
            usuarioBanido: username,
            uid,
          },
        });
      }

      setBanindoUid(null);
    } catch (err: any) {
      alert("Erro ao banir usuário: " + err.message);
    }
  }

  async function handleDesbanirUsuario(uid: string, username: string) {
    try {
      await update(ref(db, `usuarios/${uid}`), { banido: false });
      
      if (currentUser) {
        await registrarEvento({
          tipo: 'desbanir_usuario',
          usuario: currentUser.username,
          detalhes: {
            usuarioDesbanido: username,
            uid,
          },
        });
      }
    } catch (err: any) {
      alert("Erro ao desbanir usuário: " + err.message);
    }
  }

  async function handleExcluirUsuario(uid: string, username: string) {
    if (!motivoExclusao.trim()) {
      alert("O motivo da exclusão é obrigatório");
      return;
    }

    try {
      const denunciasRef = ref(db, 'denuncias');
      const snapshot = await get(denunciasRef);
      let denunciasExcluidas = 0;
      
      if (snapshot.exists() && !manterDenuncias) {
        const denuncias = snapshot.val();
        for (const [id, denuncia] of Object.entries(denuncias) as [string, any][]) {
          if (denuncia.userId === uid) {
            await remove(ref(db, `denuncias/${id}`));
            denunciasExcluidas++;
          }
        }
      } else if (snapshot.exists() && manterDenuncias) {
        const denuncias = snapshot.val();
        for (const [id, denuncia] of Object.entries(denuncias) as [string, any][]) {
          if (denuncia.userId === uid) {
            denunciasExcluidas++;
          }
        }
      }

      if (currentUser) {
        await registrarEvento({
          tipo: 'excluir_usuario',
          usuario: currentUser.username,
          detalhes: {
            usuarioExcluido: username,
            uid,
            motivo: motivoExclusao,
            denunciasExcluidas,
            manterDenuncias,
          },
        });
      }

      await remove(ref(db, `usuarios/${uid}`));

      setExcluindoUid(null);
      setMotivoExclusao("");
      setManterDenuncias(false);
    } catch (err: any) {
      alert("Erro ao excluir usuário: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur">
          <p className="text-sm text-slate-400">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white mb-4">Gerenciar Usuários</h2>
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4">
            <p className="text-xs text-red-300">Erro: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
            <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">Gerenciar Usuários</h2>
            <p className="mt-1 text-xs md:text-sm text-slate-400">Gerencie permissões, status e contas cadastradas.</p>
          </div>
          <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">0 itens</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur text-center py-8">
          <p className="text-sm text-slate-400">Nenhum usuário cadastrado ainda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">Gerenciar Usuários</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Gerencie permissões, status e contas cadastradas.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{usuarios.length} itens</span>
      </div>
      
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 md:px-4 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Usuário</th>
              <th className="px-3 md:px-4 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Tipo</th>
              <th className="px-3 md:px-4 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Status</th>
              <th className="px-3 md:px-4 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {usuarios.map((user) => (
              <tr key={user.uid} className="hover:bg-white/[0.04] cursor-pointer" onClick={() => { setModalUsuario(user); setMenuAberto(false); setConfirmandoBanimento(false); setConfirmandoExclusaoModal(false); setMotivoExclusao(""); }}>
                <td className="px-3 md:px-4 py-2.5">
                  <span className="text-xs text-slate-200">{user.username}</span>
                  {user.banido && <span className="ml-2 text-[10px] bg-red-500/15 text-red-200 border border-red-400/20 px-1.5 py-0.5 rounded-full">BANIDO</span>}
                </td>
                <td className="px-3 md:px-4 py-2.5">
                  {user.role === 'administrador' || user.uid === currentUser?.uid ? (
                    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      user.role === 'administrador' ? 'bg-purple-500/15 text-purple-200 border-purple-400/20' :
                      user.role === 'moderador' ? 'bg-blue-500/15 text-blue-200 border-blue-400/20' :
                      'bg-green-500/15 text-green-200 border-green-400/20'
                    }`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => { e.stopPropagation(); handleRoleChange(user.uid, e.target.value); }}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border outline-none cursor-pointer ${
                        user.role === 'administrador' ? 'bg-purple-500/15 text-purple-200 border-purple-400/20' :
                        user.role === 'moderador' ? 'bg-blue-500/15 text-blue-200 border-blue-400/20' :
                        'bg-green-500/15 text-green-200 border-green-400/20'
                      }`}
                    >
                      <option value="usuario">Usu</option>
                      <option value="moderador">Mod</option>
                      <option value="administrador">Adm</option>
                    </select>
                  )}
                </td>
                <td className="px-3 md:px-4 py-2.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                    user.banido ? 'border-red-400/30 bg-red-500/10 text-red-300' : 'border-green-400/30 bg-green-500/10 text-green-300'
                  }`}>
                    {user.banido ? 'Banido' : 'Ativo'}
                  </span>
                </td>
                <td className="px-3 md:px-4 py-2.5 text-xs text-slate-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Usuário */}
      {modalUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setModalUsuario(null); setMenuAberto(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-white/10">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-sm font-semibold text-white">{modalUsuario.username}</h3>
              </div>
              <div className="flex items-center gap-1">
                {/* 3 pontinhos - só aparece se não for o próprio usuário */}
                {modalUsuario.uid !== currentUser?.uid && (
                  <div className="relative">
                    <button onClick={() => setMenuAberto(!menuAberto)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                      <MoreVertical size={16} />
                    </button>
                    {menuAberto && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-10">
                        {confirmandoBanimento && !modalUsuario.banido ? (
                          <div className="px-3 py-2 space-y-2">
                            <p className="text-xs text-yellow-300 font-semibold">Banir {modalUsuario.username}?</p>
                            <div className="flex gap-1">
                              <button onClick={() => { handleBanirUsuario(modalUsuario.uid, modalUsuario.username); setModalUsuario(null); }} className="flex-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700">Sim</button>
                              <button onClick={() => setConfirmandoBanimento(false)} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                            </div>
                          </div>
                        ) : confirmandoExclusaoModal ? (
                          <div className="px-3 py-2 space-y-2">
                            <p className="text-xs text-red-300 font-semibold">Excluir {modalUsuario.username}?</p>
                            <textarea
                              placeholder="Motivo (obrigatório)"
                              value={motivoExclusao}
                              onChange={(e) => setMotivoExclusao(e.target.value)}
                              rows={2}
                              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1 text-xs text-white outline-none transition focus:border-blue-500"
                            />
                            <div className="flex gap-1">
                              <button onClick={() => { setManterDenuncias(true); handleExcluirUsuario(modalUsuario.uid, modalUsuario.username); setModalUsuario(null); }} disabled={!motivoExclusao.trim()} className="flex-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">Excluir</button>
                              <button onClick={() => { setConfirmandoExclusaoModal(false); setMotivoExclusao(""); }} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {modalUsuario.banido ? (
                              <button onClick={() => { handleDesbanirUsuario(modalUsuario.uid, modalUsuario.username); setModalUsuario(null); }} className="w-full text-left px-3 py-2 text-xs text-green-300 hover:bg-white/5 flex items-center gap-2">
                                Desbanir usuário
                              </button>
                            ) : (
                              <button onClick={() => setConfirmandoBanimento(true)} className="w-full text-left px-3 py-2 text-xs text-yellow-300 hover:bg-white/5 flex items-center gap-2">
                                Banir usuário
                              </button>
                            )}
                            <button onClick={() => setConfirmandoExclusaoModal(true)} className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 flex items-center gap-2">
                              Excluir conta
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => { setModalUsuario(null); setMenuAberto(false); }} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Username</p>
                  <p className="text-sm text-white">{modalUsuario.username}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Role</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    modalUsuario.role === 'administrador' ? 'bg-purple-500/15 text-purple-200 border-purple-400/20' :
                    modalUsuario.role === 'moderador' ? 'bg-blue-500/15 text-blue-200 border-blue-400/20' :
                    'bg-green-500/15 text-green-200 border-green-400/20'
                  }`}>
                    {getRoleDisplay(modalUsuario.role)}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Status</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                    modalUsuario.banido ? 'border-red-400/30 bg-red-500/10 text-red-300' : 'border-green-400/30 bg-green-500/10 text-green-300'
                  }`}>
                    {modalUsuario.banido ? 'Banido' : 'Ativo'}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Criado em</p>
                  <p className="text-sm text-white">{modalUsuario.createdAt ? new Date(modalUsuario.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Denúncias</p>
                  <p className="text-sm text-white">{totalDenunciasUsuario[modalUsuario.uid] || 0} denúncias</p>
                </div>
              </div>
              
              {/* Role change (select) para outros usuários */}
              {modalUsuario.uid !== currentUser?.uid && (
                <div className="pt-3 border-t border-white/10">
                  <label className="block text-[11px] uppercase tracking-wide font-semibold mb-2 text-slate-400">Alterar Role</label>
                  <select
                    value={modalUsuario.role}
                    onChange={(e) => { handleRoleChange(modalUsuario.uid, e.target.value); setModalUsuario({...modalUsuario, role: e.target.value}); }}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="moderador">Moderador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
