import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { loginUser, registerUser, resetPassword, getUserEmailByUsername, addEmailAndResetPassword } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";
import { Eye, EyeOff, AlertTriangle, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";

export default function Login() {
  const legibleCredentialInputClass = "font-mono tracking-wide text-base";

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotLookedUp, setForgotLookedUp] = useState<'idle' | 'found' | 'placeholder' | 'notfound'>('idle');
  const [forgotNewEmail, setForgotNewEmail] = useState("");
  const [forgotCurrentPassword, setForgotCurrentPassword] = useState("");

  // Cadastro multi-step
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [aceitaLGPD, setAceitaLGPD] = useState(false);
  const [aceitaTermoUsuario, setAceitaTermoUsuario] = useState(false);
  const [aceitaTermoPlataforma, setAceitaTermoPlataforma] = useState(false);
  const [aceitaContato, setAceitaContato] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Shared
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation('login');

  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'E-mail inválido',
    'auth/user-disabled': 'Usuário desativado',
    'auth/user-not-found': 'Usuário ou senha incorretos',
    'auth/wrong-password': 'Usuário ou senha incorretos',
    'auth/invalid-credential': 'Usuário ou senha incorretos',
    'auth/email-already-in-use': 'Este e-mail já está em uso',
    'auth/username-already-in-use': 'Este nome de usuário já está em uso',
    'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser(username, password);
      login(result);
      navigate(result.role === 'administrador' || result.role === 'moderador' ? "/admin" : "/");
    } catch (err: any) {
      const code = err.code || '';
      setError(errorMessages[code] || err.message || 'Erro ao entrar');
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setLoginAttempted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setError(errorMessages[err.code] || 'Erro ao enviar e-mail');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotUsername(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { email, uid } = await getUserEmailByUsername(forgotUsername);
      if (!email) {
        setForgotLookedUp('notfound');
        return;
      }
      // Verifica se é email real ou placeholder
      if (email.endsWith('@ciclistadenuncie.local')) {
        setForgotLookedUp('placeholder');
      } else {
        // Tem email real — preenche no campo de email e manda reset
        setForgotEmail(email);
        setShowForgotUsername(false);
        await resetPassword(email);
        setForgotSent(true);
      }
    } catch (err: any) {
      setError('Erro ao buscar usuário');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEmailAndReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addEmailAndResetPassword(forgotUsername, forgotCurrentPassword, forgotNewEmail);
      setForgotSent(true);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Senha atual incorreta. Tente novamente.');
      } else {
        setError(err.message || 'Erro ao adicionar email');
      }
    } finally {
      setLoading(false);
    }
  }

  async function nextStep(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!regUsername.trim()) return setError("Informe um nome de usuário");
      if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) return setError("Informe um e-mail válido");
      
      setLoading(true);
      try {
        // Verifica username e email antes de avançar
        const { get, ref } = await import('firebase/database');
        const { db } = await import('../lib/firebase');
        const { fetchSignInMethodsForEmail } = await import('firebase/auth');
        const { auth } = await import('../lib/firebase');

        const snap = await get(ref(db, 'usuarios'));
        if (snap.exists()) {
          const taken = Object.values(snap.val()).some(
            (u: any) => u.username?.toLowerCase() === regUsername.trim().toLowerCase()
          );
          if (taken) { setLoading(false); return setError("Este nome de usuário já está em uso"); }
        }

        const methods = await fetchSignInMethodsForEmail(auth, regEmail);
        if (methods.length > 0) { setLoading(false); return setError("Este e-mail já está em uso"); }
      } catch {
        // ignora erros de rede, deixa avançar
      } finally {
        setLoading(false);
      }
    }
    if (step === 2) {
      if (regPassword.length < 6) return setError("Senha deve ter no mínimo 6 caracteres");
      if (regPassword !== regConfirm) return setError("As senhas não coincidem");
    }
    setStep(s => s + 1);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!aceitaLGPD || !aceitaTermoUsuario || !aceitaTermoPlataforma) {
      return setError("Aceite todos os termos obrigatórios para continuar");
    }
    setLoading(true);
    setError("");
    try {
      await registerUser(regUsername, regPassword, regEmail);
      setRegistered(true);
    } catch (err: any) {
      setError(errorMessages[err.code] || err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  function resetRegister() {
    setIsRegister(false);
    setStep(1);
    setRegUsername(""); setRegEmail(""); setRegPassword(""); setRegConfirm("");
    setAceitaLGPD(false); setAceitaTermoUsuario(false); setAceitaTermoPlataforma(false); setAceitaContato(false);
    setRegistered(false);
    setError("");
  }

  // Tela de boas-vindas pós-cadastro
  if (registered) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700 text-center space-y-4">
          <div className="text-5xl">🚴‍♂️</div>
          <h1 className="text-2xl font-bold text-white">{t('cadastro.bemVindo.title', { username: regUsername })}</h1>
          <p className="text-gray-400 text-sm">
            {t('cadastro.bemVindo.desc1')}
          </p>
          <p className="text-gray-500 text-xs">{t('cadastro.bemVindo.desc2')}</p>
          <button onClick={resetRegister} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            {t('cadastro.bemVindo.button')}
          </button>
        </div>
      </div>
    );
  }

  // Tela de esqueci minha senha
  if (showForgot) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Link to="/" className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-1 text-sm transition">
          <ArrowLeft size={16} /> {t('back', { ns: 'translation' })}
        </Link>
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
          <button onClick={() => { setShowForgot(false); setForgotSent(false); setError(""); setShowForgotUsername(false); setForgotLookedUp('idle'); }} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> {t('backToLogin', { ns: 'translation' })}
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">{t('mudarSenha.title')}</h1>
          {forgotSent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📬</div>
              <p className="text-gray-300 text-sm">{t('sucesso.emailEnviado')}</p>
            </div>
          ) : showForgotUsername ? (
            <>
              {forgotLookedUp === 'idle' && (
                <form onSubmit={handleForgotUsername} className="space-y-4">
                  <p className="text-gray-400 text-sm">Digite seu nome de usuário para encontrarmos sua conta.</p>
                  <input type="text" value={forgotUsername} onChange={e => setForgotUsername(e.target.value)} required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="Nome de usuário"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 font-mono tracking-wide" />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                    {loading ? 'Buscando...' : 'Buscar conta'}
                  </button>
                </form>
              )}
              {forgotLookedUp === 'notfound' && (
                <div className="space-y-4">
                  <p className="text-yellow-400 text-sm">Usuário não encontrado. Verifique o nome ou tente com o email.</p>
                  <button onClick={() => { setShowForgotUsername(false); setForgotLookedUp('idle'); setError(""); }} className="w-full bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 font-medium text-sm">
                    Voltar e usar email
                  </button>
                </div>
              )}
              {forgotLookedUp === 'placeholder' && (
                <form onSubmit={handleAddEmailAndReset} className="space-y-4">
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 mb-2">
                    <p className="text-yellow-300 text-sm font-medium mb-1">⚠️ Email temporário</p>
                    <p className="text-gray-300 text-xs">
                      Sua conta foi criada com um email temporário. Para redefinir sua senha,
                      adicione seu email real abaixo. Precisamos da sua senha atual para confirmar a identidade.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Novo email</label>
                    <input type="email" value={forgotNewEmail} onChange={e => setForgotNewEmail(e.target.value)} required autoComplete="email" placeholder="seu@email.com"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Senha atual</label>
                    <input type="password" value={forgotCurrentPassword} onChange={e => setForgotCurrentPassword(e.target.value)} required autoComplete="current-password" placeholder="Sua senha atual"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                    {loading ? 'Adicionando...' : 'Adicionar email e redefinir senha'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-gray-400 text-sm">{t('mudarSenha.instrucao')}</p>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder={t('email.placeholder')} required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                {loading ? t('mudarSenha.loading') : t('mudarSenha.enviarLink')}
              </button>
              <button type="button" onClick={() => { setShowForgotUsername(true); setError(""); }} className="w-full text-blue-400 hover:underline text-sm">
                Não sei meu email / Não tenho email cadastrado
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Cadastro multi-step
  if (isRegister) {
    const steps = [t('cadastro.step1'), t('cadastro.step2'), t('cadastro.step3')];
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Link to="/" className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-1 text-sm transition">
          <ArrowLeft size={16} /> {t('back', { ns: 'translation' })}
        </Link>
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-6 h-px ${step > i + 1 ? 'bg-green-600' : 'bg-gray-600'}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-xl font-bold text-white mb-4">{steps[step - 1]}</h1>

          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('cadastro.nome')}</label>
                <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={t('cadastro.nomePlaceholder')}
                  className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${legibleCredentialInputClass}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('email.label')}</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required autoComplete="email" placeholder={t('email.placeholder')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
                {t('next', { ns: 'translation' })} <ChevronRight size={16} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('cadastro.senha')}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                    onKeyUp={e => setCapsLockOn(e.getModifierState("CapsLock"))} required minLength={6} autoComplete="new-password"
                    className={`w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${legibleCredentialInputClass}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('cadastro.confirmarSenha')}</label>
                <input type={showPassword ? "text" : "password"} value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                  onKeyUp={e => setCapsLockOn(e.getModifierState("CapsLock"))} required minLength={6} autoComplete="new-password"
                  className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${legibleCredentialInputClass}`} />
              </div>
              {capsLockOn && <div className="flex items-center gap-1 text-yellow-400 text-xs"><AlertTriangle size={13} /> {t('capsLock.on', { ns: 'translation' })}</div>}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setStep(1); setError(""); }} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 font-medium flex items-center justify-center gap-1">
                  <ChevronLeft size={16} /> {t('back', { ns: 'translation' })}
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-1">
                  {t('next', { ns: 'translation' })} <ChevronRight size={16} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-3">
              {[
                { id: 'lgpd', state: aceitaLGPD, set: setAceitaLGPD, label: <>Li e aceito a <Link to="/lgpd" target="_blank" className="text-blue-400 underline">Proteção de Dados (LGPD)</Link><span className="text-red-400 ml-1">*</span></> },
                { id: 'tu', state: aceitaTermoUsuario, set: setAceitaTermoUsuario, label: <>Li e aceito o <Link to="/termo-responsabilidade-usuario" target="_blank" className="text-blue-400 underline">Termo de Responsabilidade do Usuário</Link><span className="text-red-400 ml-1">*</span></> },
                { id: 'tp', state: aceitaTermoPlataforma, set: setAceitaTermoPlataforma, label: <>Li e aceito o <Link to="/termo-responsabilidade-plataforma" target="_blank" className="text-blue-400 underline">Termo de Responsabilidade da Plataforma</Link><span className="text-red-400 ml-1">*</span></> },
                { id: 'contato', state: aceitaContato, set: setAceitaContato, label: 'Aceito receber informações e comunicados da plataforma' },
              ].map(({ id, state, set, label }) => (
                <label key={id} className="flex items-start gap-2 cursor-pointer text-sm text-gray-300">
                  <input type="checkbox" checked={state} onChange={e => set(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
                  <span>{label}</span>
                </label>
              ))}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setStep(2); setError(""); }} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 font-medium flex items-center justify-center gap-1">
                  <ChevronLeft size={16} /> {t('back', { ns: 'translation' })}
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                  {loading ? t('cadastro.loading') : t('cadastro.button')}
                </button>
              </div>
            </form>
          )}

          <button onClick={resetRegister} className="w-full mt-4 text-blue-400 hover:underline text-sm">
            {t('toggle.login')}
          </button>
        </div>
      </div>
    );
  }

  // Login
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-1 text-sm transition">
        <ArrowLeft size={16} /> {t('back', { ns: 'translation' })}
      </Link>
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">{t('title')}</h1>

        <form onSubmit={handleLogin} className="space-y-4" autoComplete={rememberMe ? "on" : "off"}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('email.label')}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={t('email.placeholder')}
              className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${legibleCredentialInputClass}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('senha.label')}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                onKeyUp={e => setCapsLockOn(e.getModifierState("CapsLock"))} required autoComplete="current-password" placeholder={t('senha.placeholder')}
                className={`w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${legibleCredentialInputClass}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {capsLockOn && <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs"><AlertTriangle size={14} /> {t('capsLock.on', { ns: 'translation' })}</div>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
              {t('user.rememberMe', { ns: 'translation' })}
            </label>
            {loginAttempted && (
              <button type="button" onClick={() => setShowForgot(true)} className="text-blue-400 hover:underline text-xs">
                {t('user.forgotPassword', { ns: 'translation' })}
              </button>
            )}
          </div>

          {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm border border-red-800">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {loading ? t('login.loading') : t('login.button')}
          </button>
        </form>

        <button onClick={() => { setIsRegister(true); setError(""); }} className="w-full mt-4 text-blue-400 hover:underline text-sm">
          {t('user.register', { ns: 'translation' })}
        </button>
      </div>
    </div>
  );
}
