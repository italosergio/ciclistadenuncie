import { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser, registerUser } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("As senhas não coincidem");
          setLoading(false);
          return;
        }
        await registerUser(username, password);
        setIsRegister(false);
        setConfirmPassword("");
      } else {
        const result = await loginUser(username, password);
        login(result);
        // Redireciona admin/mod para /admin, usuários normais para /
        if (result.role === 'administrador' || result.role === 'moderador') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      const errorCode = err.code || '';
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Usuário inválido',
        'auth/user-disabled': 'Usuário desativado',
        'auth/user-not-found': 'Usuário ou senha incorretos',
        'auth/wrong-password': 'Usuário ou senha incorretos',
        'auth/invalid-credential': 'Usuário ou senha incorretos',
        'auth/email-already-in-use': 'Usuário já existe',
        'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/operation-not-allowed': 'Operação não permitida',
      };
      setError(errorMessages[errorCode] || err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          {isRegister ? "Cadastrar" : "Login"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete={rememberMe ? "on" : "off"}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                required
                minLength={6}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {capsLockOn && (
              <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
                <AlertTriangle size={14} />
                <span>Caps Lock ativado</span>
              </div>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>
              {capsLockOn && (
                <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
                  <AlertTriangle size={14} />
                  <span>Caps Lock ativado</span>
                </div>
              )}
            </div>
          )}

          {!isRegister && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                Lembrar-me
              </label>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm border border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Aguarde..." : isRegister ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
            setConfirmPassword("");
            setRememberMe(true);
          }}
          className="w-full mt-4 text-blue-400 hover:underline text-sm"
        >
          {isRegister ? "Já tem conta? Fazer login" : "Criar nova conta"}
        </button>
      </div>
    </div>
  );
}
