import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { salvarDenuncia } from "../lib/denuncias";
import type { Route } from "./+types/denunciar";
import { Wind, Megaphone, Hand, MessageSquareWarning, Car, Construction, MoreHorizontal, MapPin, AlertTriangle, Lightbulb, CircleSlash, Wrench, Bike } from "lucide-react";
import { buscarCidadesIBGE } from "../services/ibge.service";
import { buscarEnderecoPorCoordenadas } from "../services/geocoding.service";
import { TILE_LAYERS } from "../config/API_ENDPOINTS";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Registrar Denúncia - Ciclista Denuncie" }];
}

export async function loader() {
  const cidades = await buscarCidadesIBGE();
  return { cidades };
}

export default function Denunciar({ loaderData }: Route.ComponentProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mostrarPlaca, setMostrarPlaca] = useState(false);
  const [tipo, setTipo] = useState("");
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [descricaoOutro, setDescricaoOutro] = useState("");
  const [enderecoAtual, setEnderecoAtual] = useState("");
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [miniMapCenter, setMiniMapCenter] = useState<[number, number]>([-14.235, -51.925]);
  const [MiniMapComponent, setMiniMapComponent] = useState<any>(null);
  const [errors, setErrors] = useState<{tipo?: string; descricaoOutro?: string; placa?: string}>({});
  const tipoRef = useRef<HTMLDivElement>(null);
  const descricaoOutroRef = useRef<HTMLInputElement>(null);
  const placaRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const routeLocation = useLocation();

  useEffect(() => {
    if (routeLocation.state?.localizacao) {
      setLocation(routeLocation.state.localizacao);
    }
  }, [routeLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(pos);
          setMiniMapCenter([pos.lat, pos.lng]);
          const endereco = await buscarEnderecoPorCoordenadas(pos);
          setEnderecoAtual(endereco);
        },
        (error) => console.log('Localização não permitida:', error)
      );
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: {tipo?: string; descricaoOutro?: string; placa?: string} = {};
    
    if (!tipo) {
      newErrors.tipo = "Selecione o tipo";
    }
    if (tipo === "outro" && !descricaoOutro.trim()) {
      newErrors.descricaoOutro = "Descreva o tipo";
    }
    if (mostrarPlaca) {
      const placaValue = new FormData(e.currentTarget).get("placa") as string;
      if (placaValue && placaValue.length !== 7) {
        newErrors.placa = "A placa deve ter exatamente 7 caracteres";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      setTimeout(() => {
        if (newErrors.tipo && tipoRef.current) {
          tipoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (newErrors.descricaoOutro && descricaoOutroRef.current) {
          descricaoOutroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          descricaoOutroRef.current.focus();
        } else if (newErrors.placa && placaRef.current) {
          placaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          placaRef.current.focus();
        }
      }, 100);
      
      return;
    }
    
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await salvarDenuncia({
        endereco: enderecoAtual || "",
        relato: formData.get("relato") as string || "",
        tipo: tipo === "outro" ? descricaoOutro : tipo,
        placa: mostrarPlaca ? (formData.get("placa") as string) : undefined,
        localizacao: location,
      });
      navigate("/sucesso");
    } catch (error) {
      console.error('Erro completo:', error);
      alert("Erro ao registrar denúncia");
    } finally {
      setLoading(false);
    }
  }

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
            }
          });
          return null;
        };

        setMiniMapComponent(() => () => (
          <div style={{ position: 'relative' }}>
            <MapContainer 
              center={miniMapCenter} 
              zoom={16} 
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
          const endereco = await buscarEnderecoPorCoordenadas(pos);
          setEnderecoAtual(endereco);
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
    { value: "fina", label: "Fina", icon: Wind },
    { value: "ameaca", label: "Ameaça", icon: Megaphone },
    { value: "assedio", label: "Assédio", icon: Hand },
    { value: "agressao-verbal", label: "Agressão Verbal", icon: MessageSquareWarning },
    { value: "agressao-fisica", label: "Atropelamento", icon: Car },
    { value: "invasao-ciclovia", label: "Invasão de Ciclovia/Ciclofaixa", icon: Construction },
    { value: "buraco-via", label: "Buraco na Via", icon: AlertTriangle },
    { value: "falta-sinalizacao", label: "Falta de Sinalização", icon: CircleSlash },
    { value: "trecho-perigoso", label: "Trecho Perigoso", icon: AlertTriangle },
    { value: "ciclovia-obstruida", label: "Ciclovia Obstruída", icon: Construction },
    { value: "falta-iluminacao", label: "Falta de Iluminação", icon: Lightbulb },
    { value: "veiculo-estacionado", label: "Veículo Estacionado na Ciclovia", icon: Car },
    { value: "ma-conservacao", label: "Má Conservação da Via", icon: Wrench },
    { value: "falta-ciclovia", label: "Falta de Ciclovia", icon: Bike },
    { value: "outro", label: "Outro", icon: MoreHorizontal },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Registrar Denúncia</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative" ref={tipoRef}>
            <label className="block mb-2 font-semibold">Tipo *</label>
            <button
              type="button"
              onClick={() => setShowTipoDropdown(!showTipoDropdown)}
              className={`w-full p-3 border rounded-lg dark:bg-gray-800 text-left flex items-center gap-2 ${errors.tipo ? 'border-red-500' : ''}`}
            >
              {tipo ? (
                <>
                  {tipos.find(t => t.value === tipo)?.icon && (() => {
                    const Icon = tipos.find(t => t.value === tipo)!.icon;
                    return <Icon size={18} />;
                  })()}
                  {tipos.find(t => t.value === tipo)?.label}
                </>
              ) : "Selecione o tipo"}
            </button>
            {showTipoDropdown && (
              <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                {tipos.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setTipo(t.value);
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
            {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
          </div>

          {tipo === "outro" && (
            <div>
              <label className="block mb-2 font-semibold">Descreva o tipo *</label>
              <input
                ref={descricaoOutroRef}
                type="text"
                value={descricaoOutro}
                onChange={(e) => setDescricaoOutro(e.target.value)}
                placeholder="Ex: Buraco na ciclovia, falta de sinalização..."
                className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${errors.descricaoOutro ? 'border-red-500' : ''}`}
                required
              />
              {errors.descricaoOutro && <p className="text-red-500 text-sm mt-1">{errors.descricaoOutro}</p>}
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold">Relato</label>
            <textarea
              name="relato"
              rows={6}
              className="w-full p-3 border rounded-lg dark:bg-gray-800"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setMostrarPlaca(!mostrarPlaca)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline"
            >
              ~ pegou a placa? ~
            </button>
            {mostrarPlaca && (
              <div>
                <input
                  ref={placaRef}
                  type="text"
                  name="placa"
                  placeholder="Placa"
                  maxLength={7}
                  className={`w-full p-3 border rounded-lg dark:bg-gray-800 mt-2 uppercase ${errors.placa ? 'border-red-500' : ''}`}
                />
                {errors.placa && <p className="text-red-500 text-sm mt-1">{errors.placa}</p>}
              </div>
            )}
          </div>

          <div>
            {enderecoAtual && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Localização Atual</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{enderecoAtual}</p>
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMiniMap(!showMiniMap)}
              className="w-full p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              {showMiniMap ? 'Fechar Mapa' : 'Ajustar Localização no Mapa'}
            </button>
            {showMiniMap && MiniMapComponent && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <MiniMapComponent />
                <p className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800">
                  Mova o mapa para ajustar o ponto central da denúncia
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Denúncia"}
          </button>
        </form>
      </div>
    </div>
  );
}
