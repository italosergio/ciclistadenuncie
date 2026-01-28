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
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Gerenciar Usuários</h2>
        <p className="text-gray-400">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Gerenciar Usuários</h2>
        <div className="bg-red-900/50 text-red-300 p-4 rounded-lg">
          Erro: {error}
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Gerenciar Usuários (0)</h2>
        <p className="text-gray-400">Nenhum usuário cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Gerenciar Usuários ({usuarios.length})</h2>
      
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Usuário</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tipo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Criado em</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {usuarios.map((user) => (
              <>
              <tr key={user.uid} className="hover:bg-gray-750">
                <td className="px-6 py-4">
                  <span className="text-white">{user.username}</span>
                  {user.banido && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">BANIDO</span>}
                </td>
                <td className="px-6 py-4">
                  {user.role === 'administrador' || user.uid === currentUser?.uid ? (
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold ${
                      getRoleColor(user.role)
                    }`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                      className={`px-3 py-1 rounded text-xs font-semibold border-0 outline-none cursor-pointer ${
                        getRoleColor(user.role)
                      }`}
                    >
                      <option value="usuario">Usu</option>
                      <option value="moderador">Mod</option>
                      <option value="administrador">Adm</option>
                    </select>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.banido ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {user.banido ? 'Banido' : 'Ativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {user.uid !== currentUser?.uid && (
                    <div className="flex gap-2">
                      {user.banido ? (
                        <button
                          onClick={() => handleDesbanirUsuario(user.uid, user.username)}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          Desbanir
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanindoUid(banindoUid === user.uid ? null : user.uid)}
                          className="text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          Banir
                        </button>
                      )}
                      <span className="text-gray-600">|</span>
                      <button
                        onClick={() => setExcluindoUid(excluindoUid === user.uid ? null : user.uid)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              {banindoUid === user.uid && (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-yellow-400 mb-3">Tem certeza que deseja banir o usuário {user.username}?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBanirUsuario(user.uid, user.username)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                        >
                          Confirmar Banimento
                        </button>
                        <button
                          onClick={() => setBanindoUid(null)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
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
                  <td colSpan={5} className="px-6 py-4">
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-red-400 mb-3">Tem certeza que deseja excluir este usuário? Esta ação é IRREVERSÍVEL.</p>
                      <label className="block text-xs font-semibold text-red-400 mb-1">Motivo da exclusão *</label>
                      <textarea
                        placeholder="Informe o motivo da exclusão (obrigatório)"
                        value={motivoExclusao}
                        onChange={(e) => setMotivoExclusao(e.target.value)}
                        required
                        rows={3}
                        className="w-full p-2 border rounded-lg text-sm mb-3 bg-gray-700 border-gray-600 text-white"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-3 cursor-pointer">
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
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Confirmar Exclusão
                        </button>
                        <button
                          onClick={() => {
                            setExcluindoUid(null);
                            setMotivoExclusao("");
                            setManterDenuncias(false);
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
  );
}
