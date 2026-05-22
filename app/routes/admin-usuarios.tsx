import { useState, useEffect } from "react";
import { ref, onValue, update, remove, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";

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
              <th className="px-3 md:px-4 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {usuarios.map((user) => (
              <>
              <tr key={user.uid} className="hover:bg-white/[0.04]">
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
                      onChange={(e) => handleRoleChange(user.uid, e.target.value)}
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
                <td className="px-3 md:px-4 py-2.5">
                  {user.uid !== currentUser?.uid && (
                    <div className="flex gap-2">
                      {user.banido ? (
                        <button
                          onClick={() => handleDesbanirUsuario(user.uid, user.username)}
                          className="rounded-lg border border-green-500/30 px-2.5 py-1 text-xs font-semibold text-green-300 transition hover:bg-green-500/10 hover:text-green-200"
                        >
                          Desbanir
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanindoUid(banindoUid === user.uid ? null : user.uid)}
                          className="rounded-lg border border-yellow-500/30 px-2.5 py-1 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/10 hover:text-yellow-200"
                        >
                          Banir
                        </button>
                      )}
                      <button
                        onClick={() => setExcluindoUid(excluindoUid === user.uid ? null : user.uid)}
                        className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              {banindoUid === user.uid && (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-2.5">
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-4">
                      <p className="text-sm font-semibold text-yellow-300 mb-3">Tem certeza que deseja banir o usuário {user.username}?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBanirUsuario(user.uid, user.username)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirmar Banimento
                        </button>
                        <button
                          onClick={() => setBanindoUid(null)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {excluindoUid === user.uid && (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-2.5">
                    <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                      <p className="text-sm font-semibold text-red-300 mb-3">Tem certeza que deseja excluir este usuário? Esta ação é IRREVERSÍVEL.</p>
                      <label className="block text-xs font-semibold text-red-300 mb-1">Motivo da exclusão *</label>
                      <textarea
                        placeholder="Informe o motivo da exclusão (obrigatório)"
                        value={motivoExclusao}
                        onChange={(e) => setMotivoExclusao(e.target.value)}
                        required
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 mb-3"
                      />
                      <label className="flex items-center gap-2 text-xs text-slate-300 mb-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manterDenuncias}
                          onChange={(e) => setManterDenuncias(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Manter denúncias do usuário no sistema ({totalDenunciasUsuario[user.uid] || 0} total)
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExcluirUsuario(user.uid, user.username)}
                          disabled={!motivoExclusao.trim()}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirmar Exclusão
                        </button>
                        <button
                          onClick={() => {
                            setExcluindoUid(null);
                            setMotivoExclusao("");
                            setManterDenuncias(false);
                          }}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
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
  );
}
