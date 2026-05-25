import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { salvarDenuncia } from "../lib/denuncias";
import type { Situacao } from "../lib/denuncias";
import type { Route } from "./+types/denunciar";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";
import { Wind, Megaphone, Hand, MessageSquareWarning, Car, Construction, MoreHorizontal, MapPin, AlertTriangle, Lightbulb, CircleSlash, Wrench, Bike, ShieldOff, ShieldAlert, ChevronRight, ChevronLeft, ArrowLeft, Plus, X } from "lucide-react";
import TeardropBikeIcon from "../components/TeardropBikeIcon";
import { buscarCidadesIBGE } from "../services/ibge.service";
import { buscarEnderecoPorCoordenadas } from "../services/geocoding.service";
import { TILE_LAYERS } from "../config/API_ENDPOINTS";
import { useAuth } from "../lib/AuthContext";

export function meta({}: Route.MetaArgs) {
  let title = "Registrar Denúncia - Ciclista Denuncie";
  try {
    title = i18n.t('title', { ns: 'denunciar', defaultValue: "Registrar Denúncia" }) + " - Ciclista Denuncie";
  } catch {}
  return [{ title }];
}

export async function loader() {
  const cidades = await buscarCidadesIBGE();
  return { cidades };
}

export default function Denunciar({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation('denunciar');
  const [etapaAtual, setEtapaAtual] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('denuncia_etapa');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('denuncia_location');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [mostrarPlaca, setMostrarPlaca] = useState(false);
  const [situacoes, setSituacoes] = useState<Situacao[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('denuncia_situacoes');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showAddSituacao, setShowAddSituacao] = useState(false);
  const [descricaoOutro, setDescricaoOutro] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('denuncia_descricaoOutro') || '';
    }
    return '';
  });
  const [relato, setRelato] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('denuncia_relato') || '';
    }
    return '';
  });
  const [placa, setPlaca] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('denuncia_placa') || '';
    }
    return '';
  });
  const [enderecoAtual, setEnderecoAtual] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('denuncia_endereco') || '';
    }
    return '';
  });
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [miniMapCenter, setMiniMapCenter] = useState<[number, number]>([-14.235, -51.925]);
  const [miniMapZoom, setMiniMapZoom] = useState(4);
  const [MiniMapComponent, setMiniMapComponent] = useState<any>(null);
  const [errors, setErrors] = useState<{situacoes?: string; descricaoOutro?: string; placa?: string; localizacao?: string}>({});
  const situacaoRef = useRef<HTMLDivElement>(null);
  const descricaoOutroRef = useRef<HTMLInputElement>(null);
  const placaRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (routeLocation.state?.localizacao) {
      setLocation(routeLocation.state.localizacao);
    }
  }, [routeLocation]);

  useEffect(() => {
    if (etapaAtual === 2 && !location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(pos);
          setMiniMapCenter([pos.lat, pos.lng]);
          setMiniMapZoom(16);
          const endereco = await buscarEnderecoPorCoordenadas(pos);
          setEnderecoAtual(endereco);
          setErrors(prev => ({ ...prev, localizacao: undefined }));
        },
        (error) => console.log('Localização não permitida:', error)
      );
    }
  }, [etapaAtual, location]);

  const proximaEtapa = () => {
    if (etapaAtual === 0) {
      const newErrors: {situacoes?: string; descricaoOutro?: string} = {};
      if (situacoes.length === 0) newErrors.situacoes = t('erro.minTipo');
      const outroSituacao = situacoes.find(s => s.tipo === "outro");
      if (outroSituacao && !outroSituacao.relato?.trim()) newErrors.descricaoOutro = t('erro.required');
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    if (etapaAtual < 2) {
      setErrors({});
      const novaEtapa = etapaAtual + 1;
      setEtapaAtual(novaEtapa);
      localStorage.setItem('denuncia_etapa', novaEtapa.toString());
    }
  };

  const voltarEtapa = () => {
    if (etapaAtual > 0) {
      const novaEtapa = etapaAtual - 1;
      setEtapaAtual(novaEtapa);
      localStorage.setItem('denuncia_etapa', novaEtapa.toString());
    }
  };

  const handleFinalSubmit = async () => {
    if (!location) {
      setErrors({ localizacao: t('erro.localizacao') });
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const situacoesData = situacoes.map(s => ({
        tipo: s.tipo === "outro" ? (s.relato || "outro") : s.tipo,
        ...(s.tipo === "outro" && s.relato ? { relato: s.relato } : {}),
      }));

      await salvarDenuncia({
        endereco: enderecoAtual || "",
        relato: relato || "",
        situacoes: situacoesData,
        placa: mostrarPlaca ? placa : undefined,
        localizacao: location,
        userId: user?.uid,
        username: user?.username,
      });
      
      // Limpa localStorage após envio bem-sucedido
      localStorage.removeItem('denuncia_situacoes');
      localStorage.removeItem('denuncia_descricaoOutro');
      localStorage.removeItem('denuncia_relato');
      localStorage.removeItem('denuncia_placa');
      localStorage.removeItem('denuncia_endereco');
      localStorage.removeItem('denuncia_location');
      localStorage.removeItem('denuncia_etapa');
      
      navigate("/sucesso", { state: { location, situacoes: situacoesData, endereco: enderecoAtual, placa: mostrarPlaca ? placa : undefined } });
    } catch (error) {
      console.error('Erro completo:', error);
      setErrors({ localizacao: t('erro.registro') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showMiniMap) {
      import("leaflet/dist/leaflet.css");
      Promise.all([
        import("react-leaflet"),
        import("leaflet")
      ]).then(([reactLeaflet, L]) => {
        const { MapContainer, TileLayer, useMapEvents } = reactLeaflet;

        const MapEvents = () => {
          const map = reactLeaflet.useMapEvents({
            moveend: async () => {
              const center = map.getCenter();
              const pos = { lat: center.lat, lng: center.lng };
              setLocation(pos);
              const endereco = await buscarEnderecoPorCoordenadas(pos);
              setEnderecoAtual(endereco);
              setErrors(prev => ({ ...prev, localizacao: undefined }));
            }
          });
          return null;
        };

        setMiniMapComponent(() => () => (
          <div style={{ position: 'relative' }}>
            <MapContainer 
              center={miniMapCenter} 
              zoom={miniMapZoom} 
              style={{ height: '300px', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url={TILE_LAYERS.STREET}
                attribution='&copy; OpenStreetMap'
              />
              <MapEvents />
            </MapContainer>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: 1000
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#dc2626" stroke="white" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="white"></circle>
              </svg>
            </div>
          </div>
        ));
      });
    }
  }, [showMiniMap, miniMapCenter]);

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(pos);
          setMiniMapCenter([pos.lat, pos.lng]);
          setMiniMapZoom(16);
          const endereco = await buscarEnderecoPorCoordenadas(pos);
          setEnderecoAtual(endereco);
          setErrors(prev => ({ ...prev, localizacao: undefined }));
        },
        (error) => {
          if (error.code === 1) {
            alert("Permissão negada.\n\nNo navegador:\n1. Toque no ícone de cadeado/informações na barra de endereço\n2. Ative a permissão de Localização\n3. Recarregue a página");
          } else {
            alert(error.code === 3 ? "Tempo esgotado. Tente novamente." : "Localização indisponível.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }

  const tipos = [
    { value: "fina", label: t('tipos.fina'), icon: Wind, desc: t('tipos.fina.desc'), punicao: t('tipos.fina.punicao') },
    { value: "ameaca", label: t('tipos.ameaca'), icon: Megaphone },
    { value: "assedio", label: t('tipos.assedio'), icon: Hand },
    { value: "agressao-verbal", label: t('tipos.agressaoVerbal'), icon: MessageSquareWarning },
    { value: "agressao-fisica", label: t('tipos.atropelamento'), icon: Car },
    { value: "invasao-ciclovia", label: t('tipos.invasaoCiclovia'), icon: Construction },
    { value: "buraco-via", label: t('tipos.buracoVia'), icon: AlertTriangle },
    { value: "falta-sinalizacao", label: t('tipos.faltaSinalizacao'), icon: CircleSlash },
    { value: "trecho-perigoso", label: t('tipos.trechoPerigoso'), icon: AlertTriangle },
    { value: "ciclovia-obstruida", label: t('tipos.cicloviaObstruida'), icon: Construction },
    { value: "falta-iluminacao", label: t('tipos.faltaIluminacao'), icon: Lightbulb },
    { value: "veiculo-estacionado", label: t('tipos.veiculoEstacionado'), icon: Car },
    { value: "ma-conservacao", label: t('tipos.maConservacao'), icon: Wrench },
    { value: "falta-ciclovia", label: t('tipos.faltaCiclovia'), icon: Bike },
    { value: "ausencia-paraciclo", label: t('tipos.ausenciaParaciclo'), icon: Bike },
    { value: "bicicleta-branca", label: t('tipos.bicicletaBranca'), icon: TeardropBikeIcon },
    { value: "bicicleta-furtada", label: t('tipos.bicicletaFurtada'), icon: ShieldOff },
    { value: "bicicleta-roubada", label: t('tipos.bicicletaRoubada'), icon: ShieldAlert },
    { value: "outro", label: t('tipos.outro'), icon: MoreHorizontal },
  ];

  function adicionarSituacao(tipoValue: string) {
    if (situacoes.some(s => s.tipo === tipoValue)) return; // já adicionado
    const novas = [...situacoes, { tipo: tipoValue, relato: "", placa: "" }];
    setSituacoes(novas);
    localStorage.setItem('denuncia_situacoes', JSON.stringify(novas));
    setShowAddSituacao(false);
  }

  function removerSituacao(index: number) {
    const novas = situacoes.filter((_, i) => i !== index);
    setSituacoes(novas);
    localStorage.setItem('denuncia_situacoes', JSON.stringify(novas));
  }

  function atualizarOutroRelato(valor: string) {
    const novas = situacoes.map(s =>
      s.tipo === "outro" ? { ...s, relato: valor } : s
    );
    setSituacoes(novas);
    localStorage.setItem('denuncia_situacoes', JSON.stringify(novas));
  }

  const tiposDisponiveis = tipos.filter(t => !situacoes.some(s => s.tipo === t.value));

  const etapas = [
    { numero: 1, titulo: t('step.tipo') },
    { numero: 2, titulo: t('step.relato') },
    { numero: 3, titulo: t('step.local') },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center md:justify-start relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm underline flex items-center gap-1"
      >
        <ArrowLeft size={14} /> {t('back', { ns: 'translation' })}
      </button>
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-center">{t('title')}</h1>

        {/* Indicador de Etapas */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {etapas.map((etapa, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    setEtapaAtual(index);
                    localStorage.setItem('denuncia_etapa', index.toString());
                  }}
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
          {/* Etapa 1: Tipo */}
          {etapaAtual === 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-2">{t('tipo.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('tipo.multipla')}</p>

              {/* Chips já selecionados */}
              {situacoes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {situacoes.map((sit, index) => {
                    const tipoInfo = tipos.find(t => t.value === sit.tipo);
                    const Icon = tipoInfo?.icon || MoreHorizontal;
                    const label = sit.tipo === "outro" && sit.relato ? sit.relato : (tipoInfo?.label || sit.tipo);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium"
                      >
                        {Icon === TeardropBikeIcon ? <TeardropBikeIcon size={16} color="red" /> : <Icon size={16} />}
                        <div>
                          <div className="text-sm">{label}</div>
                          {tipoInfo?.desc && <div className="text-[10px] opacity-60 leading-tight">{tipoInfo.desc}</div>}
                          {tipoInfo?.punicao && <div className="text-[9px] opacity-40 leading-tight mt-0.5">{tipoInfo.punicao}</div>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removerSituacao(index)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botão Adicionar */}
              <div className="relative" ref={situacaoRef}>
                <button
                  type="button"
                  onClick={() => setShowAddSituacao(!showAddSituacao)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
                >
                  <Plus size={18} />
                  {t('tipo.select')}
                </button>

                {showAddSituacao && tiposDisponiveis.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-900 border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {tiposDisponiveis.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => adicionarSituacao(t.value)}
                        className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-2"
                      >
                        {t.icon === TeardropBikeIcon ? <TeardropBikeIcon size={18} color="red" /> : <t.icon size={18} />}
                        <div>
                          <div>{t.label}</div>
                          {t.desc && <div className="text-[10px] opacity-60 leading-tight">{t.desc}</div>}
                          {t.punicao && <div className="text-[9px] opacity-40 leading-tight mt-0.5">{t.punicao}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showAddSituacao && tiposDisponiveis.length === 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-900 border rounded-lg mt-1 shadow-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('tipo.todosAdicionados')}
                  </div>
                )}
              </div>

              {/* Input "Outro" se adicionado */}
              {situacoes.some(s => s.tipo === "outro") && (
                <div className="mt-4">
                  <label className="block mb-2 font-semibold">{t('tipo.outroLabel')}</label>
                  <input
                    ref={descricaoOutroRef}
                    type="text"
                    value={situacoes.find(s => s.tipo === "outro")?.relato || ""}
                    onChange={(e) => atualizarOutroRelato(e.target.value)}
                    placeholder={t('tipo.outroPlaceholder')}
                    className={`w-full p-3 border rounded-lg dark:bg-gray-900 ${errors.descricaoOutro ? 'border-red-500' : ''}`}
                  />
                  {errors.descricaoOutro && <p className="text-red-500 text-sm mt-1">{errors.descricaoOutro}</p>}
                </div>
              )}

              {errors.situacoes && <p className="text-red-500 text-sm mt-2">{errors.situacoes}</p>}

              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                {situacoes.length === 0 ? t('tipo.nenhumaSelecionada') : t('tipo.selecionadas', { count: situacoes.length })}
              </div>
            </div>
          )}

          {/* Etapa 2: Relato */}
          {etapaAtual === 1 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-2">{t('relato.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('relato.ajuda')}</p>
              
              <textarea
                value={relato}
                onChange={(e) => {
                  setRelato(e.target.value);
                  localStorage.setItem('denuncia_relato', e.target.value);
                }}
                rows={6}
                placeholder={t('relato.placeholder')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
              />

              <div className="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setMostrarPlaca(!mostrarPlaca)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline"
                >
                  {t('relato.placa')}
                </button>
                <button
                  type="button"
                  onClick={proximaEtapa}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline"
                >
                  {t('relato.pular')}
                </button>
              </div>
              
              {mostrarPlaca && (
                <div className="mt-2">
                  <input
                    ref={placaRef}
                    type="text"
                    value={placa}
                    onChange={(e) => {
                      setPlaca(e.target.value.toUpperCase());
                      localStorage.setItem('denuncia_placa', e.target.value.toUpperCase());
                    }}
                    placeholder={t('relato.placaPlaceholder')}
                    maxLength={7}
                    className="w-full p-3 border rounded-lg dark:bg-gray-900 uppercase"
                  />
                </div>
              )}
            </div>
          )}

          {/* Etapa 3: Localização */}
          {etapaAtual === 2 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6">{t('local.title')}</h2>
              
              {enderecoAtual && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">{t('local.localizacaoAtual')}</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{enderecoAtual}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.localizacao && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.localizacao}</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowMiniMap(!showMiniMap)}
                className="w-full p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <MapPin size={20} />
                {showMiniMap ? t('local.fecharMapa') : t('local.mapa')}
              </button>
              {showMiniMap && MiniMapComponent && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <MiniMapComponent />
                  <p className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900">
                    {t('local.movaMapa')}
                  </p>
                </div>
              )}
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
                {t('back', { ns: 'translation' })}
              </button>
            )}
            {etapaAtual < 2 ? (
              <button
                type="button"
                onClick={proximaEtapa}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
              >
                {t('submit.proximo')}
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? t('submit.enviando') : t('submit.enviar')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
