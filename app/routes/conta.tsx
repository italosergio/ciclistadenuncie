import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { changePassword, updateUserEmail } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Eye, EyeOff, Trash2, User as UserIcon, Key, Mail } from "lucide-react";
import { ref, update, remove, get } from "firebase/database";
import { db, auth } from "../lib/firebase";
import { deleteUser } from "firebase/auth";
import { registrarEvento } from "../lib/historico";

export default function Conta() {
  const { t } = useTranslation('login');
  const [aba, setAba] = useState<'senha' | 'username' | 'excluir'>('senha');
  const [contaExcluida, setContaExcluida] = useState(false);
  const [contador, setContador] = useState(5);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (contaExcluida && contador > 0) {
      const timer = setTimeout(() => setContador(contador - 1), 1000);
      return () => clearTimeout(timer);
    } else if (contaExcluida && contador === 0) {
      navigate("/");
    }
  }, [contaExcluida, contador, navigate]);

  if (contaExcluida) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700 text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h3 className="text-2xl font-bold text-green-400">{t('conta.excluida.sucesso')}</h3>
          <p className="text-gray-300">{t('conta.excluida.desc')}</p>
          <p className="text-gray-400 text-lg font-semibold">{t('conta.excluida.redirecionando', { count: contador })}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-bungee text-white mb-8">{t('conta.titulo')}</h1>
          
          <div className="space-y-6">
            <EmailCard />
            <MudarSenhaCard />
            <MudarUsernameCard />
            <ExcluirContaCard onSucesso={() => setContaExcluida(true)} />
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="mt-6 text-blue-400 hover:underline text-sm"
          >
            {t('conta.voltar')}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function EmailCard() {
  const { t } = useTranslation('login');
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const hasRealEmail = user?.email && !user.email.endsWith('@ciclistadenuncie.local');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!/\S+@\S+\.\S+/.test(email)) return setError(t('erro.emailInvalido'));
    setLoading(true);
    try {
      await updateUserEmail(email, senha);
      const token = await auth.currentUser?.getIdToken();
      login({ ...user!, email, token: token || user!.token });
      setSuccess(hasRealEmail ? t('conta.email.atualizado') : t('conta.email.adicionado'));
      setEmail(""); setSenha(""); setShowForm(false);
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/wrong-password': t('conta.email.erroSenha'),
        'auth/invalid-credential': t('conta.email.erroSenha'),
        'auth/email-already-in-use': t('erro.emailEmUso'),
        'auth/requires-recent-login': t('conta.email.erroSessao'),
      };
      setError(msgs[err.code] || err.message || t('conta.email.erroAtualizar'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bg-gray-800 rounded-lg shadow-xl p-6 border ${!hasRealEmail ? 'border-yellow-700' : 'border-gray-700'}`}>
      <div className="flex items-center gap-3 mb-2">
        <Mail size={24} className={!hasRealEmail ? 'text-yellow-400' : 'text-blue-400'} />
        <h2 className="text-xl font-bold text-white">{hasRealEmail ? t('conta.email.alterar') : t('conta.email.adicionar')}</h2>
      </div>
      {!hasRealEmail && (
        <p className="text-yellow-300 text-sm mb-3 bg-yellow-900/30 border border-yellow-700 rounded p-2">
          ⚠️ {t('conta.email.semEmailAviso')}
        </p>
      )}
      {hasRealEmail && <p className="text-gray-400 text-sm mb-3">{t('conta.email.atualLabel')} <span className="text-white">{user?.email}</span></p>}
      {success && <p className="text-green-400 text-sm mb-3">{success}</p>}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          {hasRealEmail ? t('conta.email.alterar') : t('conta.email.adicionar')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t('conta.email.novoEmail')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t('conta.email.senhaAtual')}</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 text-sm">{t('cancel')}</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {loading ? t('conta.salvando') : t('save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function MudarSenhaCard() {
  const { t } = useTranslation('login');
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError(t('erro.senhasDiferem'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('erro.senhaCurta'));
      return;
    }

    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      if (user) {
        await registrarEvento({
          tipo: 'alterar_senha',
          usuario: user.username,
          detalhes: { uid: user.uid },
        });
      }
      setSuccess(t('sucesso.senhaAlterada'));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError(t('conta.mudarSenha.erroIncorretaLogout'));
      } else if (err.code === "auth/too-many-requests") {
        setError(t('erro.muitasTentativas'));
      } else if (err.code === "auth/requires-recent-login") {
        setError(t('conta.mudarSenha.erroSessao'));
      } else {
        setError(err.message || t('mudarSenha.erroAlterar'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Key size={24} className="text-blue-400" />
        <h2 className="text-xl font-bold text-white">{t('conta.mudarSenha.titulo')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('mudarSenha.senhaAtual')}
        </label>
        <div className="relative max-w-sm">
          <input
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('mudarSenha.novaSenha')}
        </label>
        <div className="relative max-w-sm">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('mudarSenha.confirmarNovaSenha')}
        </label>
        <div className="relative max-w-sm">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 text-green-300 p-3 rounded-lg text-sm border border-green-800">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? t('mudarSenha.aguarde') : t('mudarSenha.button')}
      </button>
      </form>
    </div>
  );
}

function MudarUsernameCard() {
  const { t } = useTranslation('login');
  const [novoUsername, setNovoUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!novoUsername.trim()) {
      setError(t('conta.username.vazio'));
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error(t('conta.username.naoAutenticado'));

      // Verifica se username já existe
      const snapshot = await get(ref(db, 'usuarios'));
      if (snapshot.exists()) {
        const taken = Object.values(snapshot.val()).some(
          (u: any) => u.username?.toLowerCase() === novoUsername.trim().toLowerCase() && u.username !== user.username
        );
        if (taken) {
          setError(t('conta.username.jaEmUso'));
          setLoading(false);
          return;
        }
      }

      const usernameAntigo = user.username;
      await update(ref(db, `usuarios/${user.uid}`), { username: novoUsername });
      
      await registrarEvento({
        tipo: 'alterar_username',
        usuario: novoUsername,
        detalhes: { usernameAntigo, usernameNovo: novoUsername, uid: user.uid },
      });
      
      const token = await auth.currentUser?.getIdToken();
      login({ ...user, username: novoUsername, token: token || user.token });
      
      setSuccess(t('conta.username.alterado'));
      setNovoUsername("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <UserIcon size={24} className="text-blue-400" />
        <h2 className="text-xl font-bold text-white">{t('conta.username.titulo')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('conta.username.atualLabel')} <span className="text-white font-bold">{user?.username}</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('conta.username.novoLabel')}
        </label>
        <input
          type="text"
          value={novoUsername}
          onChange={(e) => setNovoUsername(e.target.value)}
          required
          className="max-w-xs px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
        />
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 text-green-300 p-3 rounded-lg text-sm border border-green-800">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? t('mudarSenha.aguarde') : t('conta.username.alterarBotao')}
      </button>
      </form>
    </div>
  );
}

function ExcluirContaCard({ onSucesso }: { onSucesso: () => void }) {
  const { t } = useTranslation('login');
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [manterDenuncias, setManterDenuncias] = useState(false);
  const [totalDenuncias, setTotalDenuncias] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const denunciasRef = ref(db, 'denuncias');
      get(denunciasRef).then(snapshot => {
        if (snapshot.exists()) {
          const count = Object.values(snapshot.val()).filter((d: any) => d.userId === user.uid).length;
          setTotalDenuncias(count);
        }
      });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (confirmacao.toUpperCase() !== "EXCLUIR") {
      setError(t('conta.excluir.confirmacaoVazia'));
      return;
    }

    if (!senha) {
      setError("Digite sua senha");
      return;
    }

    setLoading(true);

    try {
      if (!user || !auth.currentUser) throw new Error("Usuário não autenticado");

      // Reautenticar antes de excluir
      const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, senha);
      await reauthenticateWithCredential(auth.currentUser, credential);

      let denunciasExcluidas = 0;
      const denunciasIds: string[] = [];
      const denunciasRef = ref(db, 'denuncias');
      const snapshot = await get(denunciasRef);
      
      if (snapshot.exists()) {
        const denuncias = snapshot.val();
        for (const [id, denuncia] of Object.entries(denuncias) as [string, any][]) {
          if (denuncia.userId === user.uid) {
            denunciasExcluidas++;
            if (manterDenuncias) {
              denunciasIds.push(id);
            } else {
              await remove(ref(db, `denuncias/${id}`));
            }
          }
        }
      }

      await registrarEvento({
        tipo: 'excluir_conta',
        usuario: user.username,
        detalhes: { 
          uid: user.uid, 
          manterDenuncias, 
          denunciasExcluidas,
          ...(manterDenuncias && denunciasIds.length > 0 ? { denunciasIds } : {}),
          email: user.email || 'N/A'
        },
      });

      // Excluir dados do usuário
      await remove(ref(db, `usuarios/${user.uid}`));

      // Excluir conta do Firebase Auth
      await deleteUser(auth.currentUser);

      logout();
      onSucesso();
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Senha incorreta. Verifique e tente novamente.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Erro ao excluir conta. Verifique sua senha.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-red-900">
      <div className="flex items-center gap-3 mb-4">
        <Trash2 size={24} className="text-red-400" />
        <h2 className="text-xl font-bold text-white">Excluir Conta</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
        <p className="text-red-300 text-sm font-semibold mb-2">⚠️ ATENÇÃO</p>
        <p className="text-red-300 text-sm">
          Esta ação é IRREVERSÍVEL. Todos os seus dados serão permanentemente excluídos sem possibilidade de recuperação.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={manterDenuncias}
            onChange={(e) => setManterDenuncias(e.target.checked)}
            className="w-4 h-4"
          />
          Manter minhas denúncias no sistema ({totalDenuncias} total)
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Senha
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          autoComplete="current-password"
          className="max-w-sm px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Digite "EXCLUIR" para confirmar
        </label>
        <input
          type="text"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          required
          autoComplete="off"
          autoCapitalize="none"
          className="max-w-xs px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
        />
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
      >
        {loading ? "Aguarde..." : "EXCLUIR CONTA PERMANENTEMENTE"}
      </button>
      </form>
    </div>
  );
}
