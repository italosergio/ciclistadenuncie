import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/contato";
import { Lightbulb, Bug, MessageCircle, HelpCircle, FileQuestion, AlertCircle, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { db } from "../lib/firebase";
import { ref, push } from "firebase/database";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('contato.pageTitle') }];
}

export default function Contato() {
  const { t } = useTranslation('translation');
  const { user } = useAuth();
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tipoContato, setTipoContato] = useState("");
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [contato, setContato] = useState("");
  const [mostrarContato, setMostrarContato] = useState(false);
  const [errors, setErrors] = useState<{tipoContato?: string; mensagem?: string}>({});
  const tipoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const tipos = [
    { value: "sugestao", label: t('contato.tipo.sugestao'), icon: Lightbulb },
    { value: "reportar-erro", label: t('contato.tipo.reportarErro'), icon: Bug },
    { value: "duvida", label: t('contato.tipo.duvida'), icon: HelpCircle },
    { value: "feedback", label: t('contato.tipo.feedback'), icon: MessageCircle },
    { value: "parceria", label: t('contato.tipo.parceria'), icon: FileQuestion },
    { value: "outro", label: t('contato.tipo.outro'), icon: AlertCircle },
  ];

  const etapas = [
    { numero: 1, titulo: t('contato.step.tipo') },
    { numero: 2, titulo: t('contato.step.mensagem') },
  ];

  const proximaEtapa = () => {
    if (etapaAtual === 0) {
      const newErrors: {tipoContato?: string} = {};
      if (!tipoContato) newErrors.tipoContato = t('contato.erroSelecioneTipo');
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    if (etapaAtual < 1) {
      setErrors({});
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const voltarEtapa = () => {
    if (etapaAtual > 0) setEtapaAtual(etapaAtual - 1);
  };

  const handleFinalSubmit = async () => {
    if (!mensagem.trim()) {
      setErrors({ mensagem: t('contato.erroDigiteMensagem') });
      return;
    }

    setLoading(true);

    try {
      const contatosRef = ref(db, `contatos`);
      const novoContatoRef = await push(contatosRef, {
        tipo: tipoContato,
        mensagem,
        usuario: user?.username || contato.trim() || "Anônimo",
        data: new Date().toISOString(),
        lida: false,
        pinada: false
      });

      // Registra evento de envio de contato
      await registrarEvento({
        tipo: 'enviar_contato',
        usuario: user?.username || contato.trim() || 'Anônimo',
        detalhes: {
          contatoId: novoContatoRef.key,
          tipo: tipoContato,
        },
      });

      navigate("/sucesso-contato");
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      alert(t('contato.erroEnviar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center md:justify-start relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm underline flex items-center gap-1"
      >
        <ArrowLeft size={14} /> {t('back')}
      </button>
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-4xl font-bold font-bungee mb-8 text-center">{t('contato.title')}</h1>

        {/* Indicador de Etapas */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {etapas.map((etapa, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setEtapaAtual(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors cursor-pointer ${
                    index === etapaAtual 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : index < etapaAtual 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  {index < etapaAtual ? '✓' : etapa.numero}
                </button>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{etapa.titulo}</span>
              </div>
              {index < etapas.length - 1 && (
                <div className={`w-12 h-1 mx-2 mb-5 transition-colors ${
                  index < etapaAtual ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Etapa 1: Tipo do Contato */}
          {etapaAtual === 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6">{t('contato.tipoPergunta')}</h2>
              <div className="relative" ref={tipoRef}>
                <div
                  tabIndex={0}
                  onClick={() => setShowTipoDropdown(!showTipoDropdown)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowTipoDropdown(!showTipoDropdown);
                    }
                  }}
                  className={`w-full p-4 cursor-pointer text-left flex items-center gap-3 text-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-lg ${
                    errors.tipoContato ? 'text-red-500' : tipoContato ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {tipoContato ? (
                    <>
                      {tipos.find(t => t.value === tipoContato)?.icon && (() => {
                        const Icon = tipos.find(t => t.value === tipoContato)!.icon;
                        return <Icon size={28} />;
                      })()}
                      {tipos.find(t => t.value === tipoContato)?.label}
                    </>
                  ) : t('contato.selecioneTipo')}
                </div>
                {showTipoDropdown && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-900 border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {tipos.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          setTipoContato(t.value);
                          setShowTipoDropdown(false);
                        }}
                        className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-2"
                      >
                        <t.icon size={18} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
                {errors.tipoContato && <p className="text-red-500 text-sm mt-1">{errors.tipoContato}</p>}
              </div>
            </div>
          )}

          {/* Etapa 2: Mensagem */}
          {etapaAtual === 1 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6">{t('contato.suaMensagem')}</h2>
              
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
                placeholder={t('contato.digiteMensagem')}
                className={`w-full p-3 border rounded-lg dark:bg-gray-900 ${errors.mensagem ? 'border-red-500' : ''}`}
              />
              {errors.mensagem && <p className="text-red-500 text-sm mt-1">{errors.mensagem}</p>}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setMostrarContato(!mostrarContato)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline"
                >
                  {t('contato.deixarContato')}
                </button>
                {mostrarContato && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={contato}
                      onChange={(e) => setContato(e.target.value)}
                      placeholder={t('contato.emailOuCelular')}
                      className="w-full p-3 border rounded-lg dark:bg-gray-900"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de Navegação */}
          <div className="flex gap-4">
            {etapaAtual > 0 && (
              <button
                type="button"
                onClick={voltarEtapa}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white py-4 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                {t('back')}
              </button>
            )}
            {etapaAtual < 1 ? (
              <button
                type="button"
                onClick={proximaEtapa}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
              >
                {t('next')}
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? t('contato.enviando') : t('contato.enviarMensagem')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
