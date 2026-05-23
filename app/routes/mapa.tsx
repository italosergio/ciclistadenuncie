import { useEffect, useState, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../lib/firebase";
import { salvarDenuncia } from "../lib/denuncias";
import type { Route } from "./+types/mapa";
import { Maximize2, MapPin, Map, Satellite, Layers, Moon, Wind, Megaphone, Hand, MessageSquareWarning, Car, Construction, MoreHorizontal, AlertTriangle, Lightbulb, CircleSlash, Wrench, Bike, Snowflake, Calendar, ArrowLeft, ChevronDown, BarChart3, LogOut, Shield, Globe, Filter, Eye, EyeOff, Heart } from "lucide-react";
import TeardropBikeIcon from "../components/TeardropBikeIcon";
import { renderToString } from "react-dom/server";
import { useNavigate, Link, useLocation } from "react-router";
import { buscarCidadesIBGE } from "../services/ibge.service";
import { buscarEnderecoPorCoordenadas, buscarCidadePorNome } from "../services/geocoding.service";
import { TILE_LAYERS } from "../config/API_ENDPOINTS";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";
import { useAuth } from "../lib/AuthContext";

export function meta({}: Route.MetaArgs) {
  let title = "Mapa de Denúncias - Ciclista Denuncie";
  try {
    title = i18n.t('title', { ns: 'mapa', defaultValue: title }) + " - Ciclista Denuncie";
  } catch {}
  return [{ title }];
}

export async function loader() {
  const cidades = await buscarCidadesIBGE();
  return { cidades };
}

interface Situacao {
  tipo: string;
  relato?: string;
}

interface Denuncia {
  endereco: string;
  relato: string | Array<{ texto: string; editadoEm: string }> | Array<string>;
  tipo?: string;
  placa?: string;
  situacoes?: Situacao[];
  localizacao?: { lat: number; lng: number };
  createdAt: string;
}

interface Iniciativa {
  id: string;
  nome: string;
  url: string;
  descricao?: string;
  endereco?: string;
  localizacao?: { lat: number; lng: number };
  criadoPor: string;
  createdAt: string;
}

interface ApoiadorMapa {
  id: string;
  nome: string;
  url: string;
  descricao?: string;
  endereco?: string;
  localizacao?: { lat: number; lng: number };
  criadoPor: string;
  createdAt: string;
}

export default function Mapa({ loaderData }: Route.ComponentProps) {
  const [denuncias, setDenuncias] = useState<Record<string, Denuncia>>({});
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [apoiadores, setApoiadores] = useState<ApoiadorMapa[]>([]);
  const [mostrarIniciativas, setMostrarIniciativas] = useState(true);
  const [mostrarApoiadores, setMostrarApoiadores] = useState(true);
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [cidade, setCidade] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const routeLocation = useLocation();
  const [center, setCenter] = useState<[number, number]>(() => {
    if (routeLocation.state?.center) {
      return routeLocation.state.center;
    }
    return [-14.235, -51.925];
  });
  const [zoom, setZoom] = useState(() => {
    if (routeLocation.state?.zoom) {
      return routeLocation.state.zoom;
    }
    return 4;
  });
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState<{lat: number, lng: number, timestamp: number}[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [CountUpComponent, setCountUpComponent] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [markingMode, setMarkingMode] = useState(false);
  const [tempMarker, setTempMarker] = useState<{lat: number, lng: number} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [relato, setRelato] = useState("");
  const [situacoes, setSituacoes] = useState<Situacao[]>([]);
  const [showAddSituacao, setShowAddSituacao] = useState(false);
  const [placa, setPlaca] = useState("");
  const [mostrarPlaca, setMostrarPlaca] = useState(false);
  const [denunciasVisiveis, setDenunciasVisiveis] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapType, setMapType] = useState<'street' | 'satellite' | 'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = document.cookie.split('; ').find(row => row.startsWith('mapType='));
      return (saved?.split('=')[1] as any) || 'street';
    }
    return 'street';
  });
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [anoFiltro, setAnoFiltro] = useState<number | 'todos'>('todos');
  const [showAnoDropdown, setShowAnoDropdown] = useState(false);

  const [savePreferences, setSavePreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.cookie.includes('mapType=');
    }
    return false;
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const [errorModal, setErrorModal] = useState<string>("");
  const situacaoRef = useRef<HTMLDivElement>(null);
  const inputOutroRef = useRef<HTMLInputElement>(null);
  const inputPlacaRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation('mapa');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tipos = [
    { value: "fina", label: t('tipos.fina', { ns: 'denunciar' }), icon: Wind, color: "#dc2626" },
    { value: "ameaca", label: t('tipos.ameaca', { ns: 'denunciar' }), icon: Megaphone, color: "#dc2626" },
    { value: "assedio", label: t('tipos.assedio', { ns: 'denunciar' }), icon: Hand, color: "#dc2626" },
    { value: "agressao-verbal", label: "Agressão Verbal", icon: MessageSquareWarning, color: "#dc2626" },
    { value: "agressao-fisica", label: t('tipos.atropelamento', { ns: 'denunciar' }), icon: Car, color: "#dc2626" },
    { value: "invasao-ciclovia", label: t('tipos.estacionamento.ciclovia', { ns: 'denunciar' }), icon: Construction, color: "#dc2626" },
    { value: "buraco-via", label: "Buraco na Via", icon: AlertTriangle, color: "#dc2626" },
    { value: "falta-sinalizacao", label: "Falta de Sinalização", icon: CircleSlash, color: "#dc2626" },
    { value: "trecho-perigoso", label: "Trecho Perigoso", icon: AlertTriangle, color: "#dc2626" },
    { value: "ciclovia-obstruida", label: "Ciclovia Obstruída", icon: Construction, color: "#dc2626" },
    { value: "falta-iluminacao", label: "Falta de Iluminação", icon: Lightbulb, color: "#dc2626" },
    { value: "veiculo-estacionado", label: "Veículo Estacionado na Ciclovia", icon: Car, color: "#dc2626" },
    { value: "ma-conservacao", label: "Má Conservação da Via", icon: Wrench, color: "#dc2626" },
    { value: "falta-ciclovia", label: t('tipos.faltaCiclovia', { ns: 'denunciar' }), icon: Bike, color: "#dc2626" },
    { value: "bicicleta-branca", label: t('tipos.bicicletaBranca', { ns: 'denunciar' }), icon: TeardropBikeIcon, color: "#6b7280" },
    { value: "outro", label: t('tipos.outro', { ns: 'denunciar' }), icon: MoreHorizontal, color: "#dc2626" },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && savePreferences) {
      document.cookie = `mapType=${mapType}; path=/; max-age=31536000`;
    } else if (typeof window !== 'undefined' && !savePreferences) {
      document.cookie = `mapType=; path=/; max-age=0`;
    }
  }, [mapType, savePreferences]);



  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showOptionsMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest('.options-menu') && !target.closest('.options-button')) {
          setShowOptionsMenu(false);
        }
      }
      if (showAnoDropdown) {
        const target = e.target as HTMLElement;
        if (!target.closest('.ano-dropdown') && !target.closest('.ano-button')) {
          setShowAnoDropdown(false);
        }
      }
    };
    
    if (showOptionsMenu || showAnoDropdown) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptionsMenu, showAnoDropdown]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    import('react-countup').then(module => {
      setCountUpComponent(() => module.default);
    });
  }, []);

  function buscarCidades(termo: string) {
    if (!termo || termo.length < 2) {
      setSugestoes([]);
      setSelectedIndex(-1);
      return;
    }
    const filtradas = loaderData.cidades
      .filter((nome: string) => nome.toLowerCase().includes(termo.toLowerCase()))
      .slice(0, 5);
    setSugestoes(filtradas);
    setSelectedIndex(-1);
  }

  function iniciarRastreamento() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const ponto = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        setRoute(prev => {
          const novaRota = [...prev, ponto];
          localStorage.setItem('rota_cache', JSON.stringify(novaRota));
          return novaRota;
        });
        setCenter([ponto.lat, ponto.lng]);
        setZoom(16);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    setWatchId(id);
    setTracking(true);
  }

  function pararRastreamento() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setTracking(false);
  }

  async function salvarRota() {
    if (route.length === 0) {
      alert("Nenhuma rota para salvar");
      return;
    }

    const rotaId = Date.now().toString();
    const agora = new Date();
    const horarioBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    const rotaData = {
      id: rotaId,
      pontos: route.map(p => ({ lat: p.lat, lng: p.lng, timestamp: p.timestamp })),
      createdAt: horarioBrasilia.toISOString(),
      distancia: parseFloat(calcularDistancia(route)),
      totalPontos: route.length
    };

    // Salvar localmente
    const rotasSalvas = JSON.parse(localStorage.getItem('rotas_salvas') || '[]');
    rotasSalvas.push(rotaData);
    localStorage.setItem('rotas_salvas', JSON.stringify(rotasSalvas));
    localStorage.removeItem('rota_cache');
    setRoute([]);
    
    // Tentar enviar ao Firebase
    try {
      await set(ref(db, `rotas/${rotaId}`), rotaData);
      alert(`Rota salva! ${rotaData.totalPontos} pontos, ${rotaData.distancia} km`);
    } catch (error: any) {
      console.log('Firebase indisponível, rota salva localmente');
      alert(`Rota salva localmente! ${rotaData.totalPontos} pontos, ${rotaData.distancia} km\n(Será enviada ao servidor quando possível)`);
    }
  }

  function calcularDistancia(pontos: {lat: number, lng: number}[]) {
    let dist = 0;
    for (let i = 1; i < pontos.length; i++) {
      const R = 6371;
      const dLat = (pontos[i].lat - pontos[i-1].lat) * Math.PI / 180;
      const dLon = (pontos[i].lng - pontos[i-1].lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pontos[i-1].lat * Math.PI / 180) * Math.cos(pontos[i].lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      dist += R * c;
    }
    return dist.toFixed(2);
  }

  useEffect(() => {
    const rotaCache = localStorage.getItem('rota_cache');
    if (rotaCache) {
      setRoute(JSON.parse(rotaCache));
    }

    // Solicitar localização apenas no mobile
    if (isMobile && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(13);
        },
        (error) => console.log('Localização não permitida:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [isMobile]);

  useEffect(() => {
    const denunciasRef = ref(db, "denuncias");
    const unsubscribe = onValue(denunciasRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDenuncias(data);
      
      // Definir ano inicial como o último ano disponível
      const anos = Object.values(data)
        .filter((d: any) => d.localizacao)
        .map((d: any) => new Date(d.createdAt).getFullYear());
      if (anos.length > 0) {
        setAnoFiltro(Math.max(...anos));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const iniciativasRef = ref(db, "iniciativas");
    const unsubscribe = onValue(iniciativasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            nome: value.nome || "",
            url: value.url || "",
            descricao: value.descricao || "",
            endereco: value.endereco || "",
            localizacao: value.lat && value.lng ? { lat: value.lat, lng: value.lng } : undefined,
            criadoPor: value.criadoPor || "",
            createdAt: value.createdAt || "",
          }))
          .filter(i => i.localizacao);
        setIniciativas(lista);
      } else {
        setIniciativas([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Apoiadores listener
  useEffect(() => {
    const apoiadoresRef = ref(db, "apoiadores");
    const unsubscribe = onValue(apoiadoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            nome: value.nome || "",
            url: value.url || "",
            descricao: value.descricao || "",
            endereco: value.endereco || "",
            localizacao: value.lat && value.lng ? { lat: value.lat, lng: value.lng } : undefined,
            criadoPor: value.criadoPor || "",
            createdAt: value.createdAt || "",
          }))
          .filter(i => i.localizacao);
        setApoiadores(lista);
      } else {
        setApoiadores([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Remove tabindex from leaflet attribution
  useEffect(() => {
    const removeTabIndex = () => {
      const links = document.querySelectorAll('.leaflet-control-attribution a');
      links.forEach(link => {
        link.setAttribute('tabindex', '-1');
      });
    };
    
    const timer = setInterval(removeTabIndex, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showModal && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [showModal]);

  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([reactLeaflet, L]) => {
      const { MapContainer, TileLayer, Marker, Popup, Tooltip } = reactLeaflet;
      
      const icon = L.default.divIcon({
        html: `<div style="background-color: #dc2626; width: 21px; height: 21px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [21, 21],
        iconAnchor: [10.5, 10.5],
      });

      const createColoredIcon = (color: string, IconComponent: any) => {
        return L.default.divIcon({
          html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${renderToString(<IconComponent size={11} color="white" />)}</div>`,
          className: 'custom-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
      };

      const tempIcon = L.default.divIcon({
        html: renderToString(<MapPin color="#dc2626" fill="#dc2626" size={40} />),
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const iniciativaIcon = L.default.divIcon({
        html: `<div style="background-color: #15803d; width: 38px; height: 38px; border-radius: 6px; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">${renderToString(<Bike size={22} color="white" />)}</div>`,
        className: 'custom-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const apoiadorIcon = L.default.divIcon({
        html: `<div style="background-color: #e11d48; width: 38px; height: 38px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">${renderToString(<Heart size={22} color="white" />)}</div>`,
        className: 'custom-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const createClusterIcon = (count: number) => {
        const fontSize = count >= 100 ? '0.9rem' : count >= 10 ? '1.1rem' : '1.4rem';
        return L.default.divIcon({
          html: `<div class="cluster-marker-pin" style="filter: drop-shadow(0 2px 7px rgba(220,38,38,0.4));">
            <div class="pulse-ring d1"></div>
            <div class="pulse-ring d2"></div>
            <div class="pulse-ring d3"></div>
            <div class="pulse-ring d4"></div>
            <div class="pulse-ring d5"></div>
            <div class="pin-shadow"></div>
            <div class="pin-icon">
              <div class="pin-icon-inner">
                <span class="badge-number" style="font-size:${fontSize}">${count}</span>
              </div>
            </div>
          </div>`,
          className: 'custom-marker',
          iconSize: [34, 36],
          iconAnchor: [17, 35],
        });
      };

      const getSituacaoIconHtml = (tipo: string) => {
        const iconMap: Record<string, string> = {
          fina: '🌬',
          ameaca: '📣',
          assedio: '✋',
          'agressao-verbal': '💬',
          'agressao-fisica': '🚗',
          'invasao-ciclovia': '🚧',
          'buraco-via': '⚠',
          'falta-sinalizacao': '🚫',
          'trecho-perigoso': '⚠',
          'ciclovia-obstruida': '🚧',
          'falta-iluminacao': '💡',
          'veiculo-estacionado': '🚗',
          'ma-conservacao': '🔧',
          'falta-ciclovia': '🚲',
          'bicicleta-branca': '🚲',
          outro: '⋯',
        };
        return iconMap[tipo] || '📌';
      };

      const getSituacaoColor = (tipo: string): string => {
        const colorMap: Record<string, string> = {
          fina: 'rgba(220,38,38,0.15)',
          ameaca: 'rgba(249,115,22,0.15)',
          assedio: 'rgba(168,85,247,0.15)',
          'agressao-fisica': 'rgba(239,68,68,0.15)',
          'invasao-ciclovia': 'rgba(234,179,8,0.15)',
          'buraco-via': 'rgba(59,130,246,0.15)',
        };
        return colorMap[tipo] || 'rgba(100,116,139,0.15)';
      };

      const MouseFollower = ({ isMarking }: { isMarking: boolean }) => {
        const map = reactLeaflet.useMap();
        
        useEffect(() => {
          if (!isMarking) return;
          
          const container = map.getContainer();
          const follower = L.default.marker([0, 0], { 
            icon: tempIcon,
            interactive: false,
            keyboard: false
          }).addTo(map);
          
          const onMouseMove = (e: any) => {
            const latlng = map.mouseEventToLatLng(e);
            follower.setLatLng(latlng);
          };
          
          container.addEventListener('mousemove', onMouseMove);
          
          return () => {
            container.removeEventListener('mousemove', onMouseMove);
            map.removeLayer(follower);
          };
        }, [map, isMarking]);
        
        return null;
      };

      const MapClickHandler = ({ isMarking, denuncias }: { isMarking: boolean, denuncias: [string, Denuncia][] }) => {
        const map = reactLeaflet.useMap();
        
        useEffect(() => {
          const updateVisible = () => {
            const bounds = map.getBounds();
            const visible = denuncias.filter(([_, d]) => {
              const lat = d.localizacao!.lat;
              const lng = d.localizacao!.lng;
              return bounds.contains([lat, lng]);
            });
            setDenunciasVisiveis(visible.length);
          };
          
          setTimeout(updateVisible, 100);
        }, [map, denuncias]);
        
        reactLeaflet.useMapEvents({
          moveend: () => {
            const bounds = map.getBounds();
            const visible = denuncias.filter(([_, d]) => {
              const lat = d.localizacao!.lat;
              const lng = d.localizacao!.lng;
              return bounds.contains([lat, lng]);
            });
            setDenunciasVisiveis(visible.length);
          },
          zoomend: () => {
            const bounds = map.getBounds();
            const visible = denuncias.filter(([_, d]) => {
              const lat = d.localizacao!.lat;
              const lng = d.localizacao!.lng;
              return bounds.contains([lat, lng]);
            });
            setDenunciasVisiveis(visible.length);
          },
          click: async (e: any) => {
            if (isMarking) {
              const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
              setTempMarker(pos);
              
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json&addressdetails=1`
                );
                const data = await response.json();
                const addr = data.address;
                const rua = addr.road || addr.pedestrian || addr.footway || '';
                const numero = addr.house_number || '';
                const bairro = addr.suburb || addr.neighbourhood || '';
                const cidade = addr.city || addr.town || addr.municipality || '';
                const estado = addr.state || '';
                
                const partes = [];
                if (rua) partes.push(numero ? `${rua}, ${numero}` : rua);
                if (bairro) partes.push(bairro);
                if (cidade) partes.push(cidade);
                if (estado) partes.push(estado);
                
                const enderecoCompleto = partes.join(' - ');
                setEndereco(enderecoCompleto || `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
              } catch {
                setEndereco(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
              }
              
              setShowModal(true);
              setMarkingMode(false);
            }
          }
        });
        return null;
      };

      const LocationControl = () => {
        const map = reactLeaflet.useMap();
        
        useEffect(() => {
          const LocationButton = L.default.Control.extend({
            onAdd: function() {
              const btn = L.default.DomUtil.create('div', 'leaflet-bar');
              btn.style.zIndex = '2000';
              btn.innerHTML = `<a href="#" title="Minha localização" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: white; text-decoration: none;">${renderToString(<MapPin size={18} />)}</a>`;
              btn.onclick = (e: any) => {
                e.preventDefault();
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setCenter([position.coords.latitude, position.coords.longitude]);
                      setZoom(16);
                    },
                    () => alert('Não foi possível obter sua localização')
                  );
                }
              };
              return btn;
            }
          });
          
          const BrazilButton = L.default.Control.extend({
            onAdd: function() {
              const btn = L.default.DomUtil.create('div', 'leaflet-bar');
              btn.style.marginTop = '10px';
              btn.style.zIndex = '2000';
              btn.innerHTML = `<a href="#" title="Voltar ao Brasil" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: white; text-decoration: none;">${renderToString(<Maximize2 size={18} />)}</a>`;
              btn.onclick = (e: any) => {
                e.preventDefault();
                setCenter([-14.235, -51.925]);
                setZoom(4);
              };
              return btn;
            }
          });

          const MapTypeButton = L.default.Control.extend({
            onAdd: function() {
              const btn = L.default.DomUtil.create('div', 'leaflet-bar options-button');
              btn.style.marginTop = '10px';
              btn.style.zIndex = '2000';
              btn.innerHTML = `<a href="#" title="Opções" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: white; text-decoration: none;">${renderToString(<Layers size={18} />)}</a>`;
              btn.onclick = (e: any) => {
                e.preventDefault();
                setShowOptionsMenu(prev => !prev);
              };
              return btn;
            }
          });
          
          const locationControl = new LocationButton({ position: 'topright' });
          const brazilControl = new BrazilButton({ position: 'topright' });
          const mapTypeControl = new MapTypeButton({ position: 'topright' });
          
          map.addControl(locationControl);
          map.addControl(brazilControl);
          map.addControl(mapTypeControl);
          
          return () => {
            map.removeControl(locationControl);
            map.removeControl(brazilControl);
            map.removeControl(mapTypeControl);
          };
        }, [map]);
        
        return null;
      };



      setMapComponent(() => ({ denuncias, iniciativas, apoiadores, center, zoom, isMarking, tempMarker, mapType }: { denuncias: [string, Denuncia][], iniciativas: Iniciativa[], apoiadores: ApoiadorMapa[], center: [number, number], zoom: number, isMarking: boolean, tempMarker: {lat: number, lng: number} | null, mapType: 'street' | 'satellite' | 'light' | 'dark' }) => (
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', cursor: isMarking ? 'none' : 'grab' }} 
          key={`${center[0]}-${center[1]}-${zoom}`} 
          zoomControl={false}
          dragging={!isMarking}
          className={isMarking ? 'marking-mode' : ''}
        >
          {mapType === 'street' && (
            <TileLayer
              url={TILE_LAYERS.STREET}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          )}
          {mapType === 'satellite' && (
            <TileLayer
              url={TILE_LAYERS.SATELLITE}
              attribution='&copy; Esri'
            />
          )}
          {mapType === 'light' && (
            <TileLayer
              url={TILE_LAYERS.LIGHT}
              attribution='&copy; CartoDB'
            />
          )}
          {mapType === 'dark' && (
            <TileLayer
              url={TILE_LAYERS.DARK}
              attribution='&copy; CartoDB'
            />
          )}
          <reactLeaflet.ZoomControl position="topright" zoomInTitle="Aumentar zoom" zoomOutTitle="Diminuir zoom" />
          <LocationControl />
          <MouseFollower isMarking={isMarking} />
          <MapClickHandler isMarking={isMarking} denuncias={denuncias} />
          {tempMarker && (
            <Marker
              position={[tempMarker.lat, tempMarker.lng]}
              icon={tempIcon}
            />
          )}
          {denuncias.map(([id, denuncia]) => {
              const temMultiplasSituacoes = denuncia.situacoes && denuncia.situacoes.length >= 2;
              const numSituacoes = denuncia.situacoes?.length || 1;

              let markerIcon: any;
              if (temMultiplasSituacoes) {
                markerIcon = createClusterIcon(numSituacoes);
              } else {
                const tipoInfo = denuncia.situacoes?.[0]?.tipo || denuncia.tipo;
                const tipoEncontrado = tipos.find(t => t.value === tipoInfo);
                markerIcon = tipoEncontrado ? createColoredIcon(tipoEncontrado.color, tipoEncontrado.icon) : icon;
              }
              
              return (
              <Marker
                key={id}
                position={[denuncia.localizacao!.lat, denuncia.localizacao!.lng]}
                icon={markerIcon}
                eventHandlers={{
                  mouseover: (e: any) => {
                    if (!isMarking) {
                      e.target.openPopup();
                    }
                  },
                  mouseout: (e: any) => {
                    if (!isMarking) {
                      e.target.closePopup();
                    }
                  },
                  click: async (e: any) => {
                    if (!isMarking) {
                      e.target.openPopup();
                      return;
                    }
                    if (isMarking) {
                      const pos = { lat: denuncia.localizacao!.lat, lng: denuncia.localizacao!.lng };
                      setTempMarker(pos);
                      
                      try {
                        const response = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json&addressdetails=1`
                        );
                        const data = await response.json();
                        const addr = data.address;
                        const rua = addr.road || addr.pedestrian || addr.footway || '';
                        const numero = addr.house_number || '';
                        const bairro = addr.suburb || addr.neighbourhood || '';
                        const cidade = addr.city || addr.town || addr.municipality || '';
                        const estado = addr.state || '';
                        
                        const partes = [];
                        if (rua) partes.push(numero ? `${rua}, ${numero}` : rua);
                        if (bairro) partes.push(bairro);
                        if (cidade) partes.push(cidade);
                        if (estado) partes.push(estado);
                        
                        const enderecoCompleto = partes.join(' - ');
                        setEndereco(enderecoCompleto || `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
                      } catch {
                        setEndereco(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
                      }
                      
                      setShowModal(true);
                      setMarkingMode(false);
                      e.originalEvent.stopPropagation();
                    } else {
                      e.originalEvent.stopPropagation();
                    }
                  }
                }}
              >
                {!isMarking && (
                    <Popup className="custom-popup">
                      <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                          {new Date(denuncia.createdAt).toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                          {denuncia.endereco}
                        </div>
                        {temMultiplasSituacoes ? (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#dc2626' }}>
                              🔴 {numSituacoes} {t('denuncia.situacoes')} {t('denuncia.cluster')}
                            </div>
                            {denuncia.placa && (
                              <div style={{ fontSize: '12px', color: '#d97706', fontFamily: 'monospace', marginBottom: '6px', padding: '4px 8px', background: 'rgba(217,119,6,0.1)', borderRadius: '4px' }}>
                                🏷 {t('denuncia.placa')}: {denuncia.placa}
                              </div>
                            )}
                            {denuncia.situacoes!.map((sit, idx) => {
                              const tipoNome = tipos.find(t => t.value === sit.tipo)?.label || sit.tipo;
                              return (
                                <div key={idx} style={{
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  background: getSituacaoColor(sit.tipo),
                                  marginBottom: '4px',
                                }}>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{getSituacaoIconHtml(sit.tipo)}</span>
                                    {tipoNome}
                                  </div>
                                  {sit.relato && (
                                    <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.3', marginTop: '2px' }}>
                                      {sit.relato}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <>
                            {denuncia.tipo && (
                              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                                {tipos.find(t => t.value === denuncia.tipo)?.label || denuncia.tipo}
                              </div>
                            )}
                            {denuncia.relato && (
                              <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                                {getRelatoTexto(denuncia.relato)}
                              </div>
                            )}
                            {denuncia.placa && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontFamily: 'monospace' }}>
                                {t('denuncia.placa')}: {denuncia.placa}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </Popup>
                )}
              </Marker>
            )})}
          {iniciativas.length > 0 && (
            <>
              {iniciativas.map((iniciativa) => (
                <Marker
                  key={iniciativa.id}
                  position={[iniciativa.localizacao!.lat, iniciativa.localizacao!.lng]}
                  icon={iniciativaIcon}
                  eventHandlers={{
                    mouseover: (e: any) => {
                      if (!isMarking) e.target.openPopup();
                    },
                    mouseout: (e: any) => {
                      if (!isMarking) e.target.closePopup();
                    },
                    click: (e: any) => {
                      if (!isMarking) e.target.openPopup();
                    }
                  }}
                >
                  {!isMarking && (
                    <Popup className="custom-popup">
                      <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <div style={{ backgroundColor: '#16a34a', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>i</span>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                            Iniciativa Cicloativista
                          </span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                          {iniciativa.nome}
                        </h3>
                        {iniciativa.descricao && (
                          <p style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>
                            {iniciativa.descricao}
                          </p>
                        )}
                        {iniciativa.endereco && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                            📍 {iniciativa.endereco}
                          </div>
                        )}
                        <a
                          href={iniciativa.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          🌐 {iniciativa.url}
                        </a>
                      </div>
                    </Popup>
                  )}
                </Marker>
              ))}
            </>
          )}

          {apoiadores.length > 0 && (
            <>
              {apoiadores.map((apoiador) => (
                <Marker
                  key={apoiador.id}
                  position={[apoiador.localizacao!.lat, apoiador.localizacao!.lng]}
                  icon={apoiadorIcon}
                  eventHandlers={{
                    mouseover: (e: any) => {
                      if (!isMarking) e.target.openPopup();
                    },
                    mouseout: (e: any) => {
                      if (!isMarking) e.target.closePopup();
                    },
                    click: (e: any) => {
                      if (!isMarking) e.target.openPopup();
                    }
                  }}
                >
                  {!isMarking && (
                    <Popup className="custom-popup">
                      <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <div style={{ backgroundColor: '#e11d48', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart size={10} color="white" />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#be123c' }}>
                            Apoiador
                          </span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                          {apoiador.nome}
                        </h3>
                        {apoiador.descricao && (
                          <p style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>
                            {apoiador.descricao}
                          </p>
                        )}
                        {apoiador.endereco && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                            📍 {apoiador.endereco}
                          </div>
                        )}
                        <a
                          href={apoiador.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          🌐 {apoiador.url}
                        </a>
                      </div>
                    </Popup>
                  )}
                </Marker>
              ))}
            </>
          )}
          </MapContainer>
      ));
    });
  }, []);

  const denunciasComLocalizacao = Object.entries(denuncias).filter(
    ([_, d]) => {
      if (!d.localizacao) return false;
      if (tipoFiltro !== 'todos') {
        if (d.situacoes) {
          // Denúncia com múltiplas situações — aparece se ALGUMA corresponder
          if (!d.situacoes.some(s => s.tipo === tipoFiltro)) return false;
        } else {
          // Denúncia antiga com tipo único
          if (d.tipo !== tipoFiltro) return false;
        }
      }
      if (anoFiltro !== 'todos') {
        const ano = new Date(d.createdAt).getFullYear();
        if (ano !== anoFiltro) return false;
      }
      return true;
    }
  );

  const getRelatoTexto = (relato: string | Array<{ texto: string; editadoEm: string }> | Array<string>): string => {
    if (typeof relato === 'string') return relato;
    if (Array.isArray(relato) && relato.length > 0) {
      const ultimo = relato[relato.length - 1];
      return typeof ultimo === 'string' ? ultimo : ultimo?.texto || '';
    }
    return '';
  };

  const anosDisponiveis = Array.from(
    new Set(
      Object.values(denuncias)
        .filter(d => d.localizacao)
        .map(d => new Date(d.createdAt).getFullYear())
    )
  ).sort((a, b) => b - a);

  async function buscarCidade() {
    if (!cidade.trim()) return;
    const nomeCidade = cidade.split(' - ')[0];
    try {
      const data = await buscarCidadePorNome(nomeCidade);
      if (data.length > 0) {
        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setZoom(12);
      } else {
        alert("Cidade não encontrada");
      }
    } catch (error) {
      alert("Erro ao buscar cidade");
    }
  }

  function adicionarSituacao(tipoValue: string) {
    if (situacoes.some(s => s.tipo === tipoValue)) return;
    const novas = [...situacoes, { tipo: tipoValue, relato: "" }];
    setSituacoes(novas);
    setShowAddSituacao(false);
  }

  function removerSituacao(index: number) {
    setSituacoes(situacoes.filter((_, i) => i !== index));
  }

  function atualizarOutroRelato(valor: string) {
    setSituacoes(situacoes.map(s =>
      s.tipo === "outro" ? { ...s, relato: valor } : s
    ));
  }

  const tiposDisponiveis = tipos.filter(t => !situacoes.some(s => s.tipo === t.value));

  async function salvarDenunciaModal() {
    if (!tempMarker || situacoes.length === 0) {
      setErrorModal("Selecione pelo menos uma situação");
      setTimeout(() => {
        situacaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const outroSituacao = situacoes.find(s => s.tipo === "outro");
    if (outroSituacao && !outroSituacao.relato?.trim()) {
      setErrorModal("Descreva o tipo");
      setTimeout(() => {
        inputOutroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputOutroRef.current?.focus();
      }, 100);
      return;
    }

    if (mostrarPlaca && placa && placa.length !== 7) {
      setErrorModal("A placa deve ter exatamente 7 caracteres");
      setTimeout(() => {
        inputPlacaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputPlacaRef.current?.focus();
      }, 100);
      return;
    }

    setErrorModal("");
    try {
      await salvarDenuncia({
        endereco: endereco,
        relato,
        situacoes: situacoes.map(s => ({
          tipo: s.tipo === "outro" ? (s.relato || "outro") : s.tipo,
          relato: s.relato || undefined,
        })),
        placa: mostrarPlaca && placa ? placa : undefined,
        localizacao: tempMarker,
        userId: user?.uid,
        username: user?.username,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Erro completo:', error);
      setErrorModal("Erro ao salvar denúncia. Tente novamente.");
    }
  }

  return (
    <div className="h-screen relative">
      {/* Link Bem-vindo no topo centro */}
      {user ? (
        <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-[500]">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-gray-700 hover:text-gray-900 underline text-[10px] md:text-xs bg-white/95 md:bg-transparent px-2 py-1 md:px-0 md:py-0 rounded-lg md:rounded-none shadow-lg md:shadow-none flex items-center gap-1 font-medium whitespace-nowrap md:text-black dark:md:text-black"
            >
              {t('user.welcome', { ns: 'translation' })} <span className="text-red-600 dark:text-red-500">{user.username}</span>!
              <ChevronDown size={10} className="md:w-3 md:h-3" />
            </button>
            {showUserMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-w-[180px] overflow-hidden">
                <Link
                  to={`/usuario/${user.username}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <BarChart3 size={16} /> {t('user.contributions', { ns: 'translation' })}
                </Link>
                {(user.role === 'administrador' || user.role === 'moderador') && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Shield size={16} /> {t('user.adminPanel', { ns: 'translation' })}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut size={16} /> {t('user.logout', { ns: 'translation' })}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-[500]">
          <Link
            to="/login"
            className="text-gray-700 hover:text-gray-900 underline text-xs md:text-sm bg-white/95 md:bg-transparent px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none shadow-lg md:shadow-none font-medium md:text-black dark:md:text-black"
          >
            {t('user.signIn', { ns: 'translation' })}
          </Link>
        </div>
      )}
      
      <style>{`
        .marking-mode * {
          cursor: none !important;
        }
        .leaflet-control-attribution,
        .leaflet-control-attribution a {
          pointer-events: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          opacity: 0.1 !important;
        }
        .leaflet-control-attribution a {
          tabindex: -1 !important;
        }

        /* Cluster marker animations - bomb explosion */
        .cluster-marker-pin {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cluster-marker-pin .pin-shadow {
          position: absolute;
          width: 29px;
          height: 5px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
        }
        .cluster-marker-pin .pin-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fca5a5;
          position: relative;
          box-shadow: 0 2px 10px rgba(220,38,38,0.5);
          animation: bomb-flash 3s ease-in-out infinite;
        }
        .cluster-marker-pin .pin-icon-inner {
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cluster-marker-pin .badge-number {
          font-weight: 700;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
          line-height: 1;
        }
        .cluster-marker-pin .pulse-ring {
          position: absolute;
          width: 29px;
          height: 29px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          animation: bomb-shockwave 3s ease-out infinite;
          pointer-events: none;
        }
        .pulse-ring.d1 { animation-delay: 0s; }
        .pulse-ring.d2 { animation-delay: 0.6s; }
        .pulse-ring.d3 { animation-delay: 1.2s; }
        .pulse-ring.d4 { animation-delay: 1.8s; }
        .pulse-ring.d5 { animation-delay: 2.4s; }
        @keyframes bomb-shockwave {
          0% { transform: scale(0.6); opacity: 0.9; border: 3px solid rgba(255,200,50,0.9); box-shadow: 0 0 20px rgba(255,200,50,0.6); }
          15% { transform: scale(1.2); opacity: 0.7; border: 3px solid rgba(255,150,0,0.7); box-shadow: 0 0 40px rgba(255,150,0,0.4); }
          30% { transform: scale(2); opacity: 0.4; border: 2px solid rgba(255,100,0,0.3); box-shadow: 0 0 60px rgba(255,100,0,0.15); }
          50% { transform: scale(3); opacity: 0.15; border: 1px solid rgba(255,50,0,0.1); box-shadow: none; }
          100% { transform: scale(4.5); opacity: 0; border: 1px solid transparent; box-shadow: none; }
        }
        @keyframes bomb-flash {
          0%, 85%, 100% { box-shadow: 0 2px 10px rgba(220,38,38,0.5); filter: brightness(1); }
          5% { box-shadow: 0 0 20px rgba(255,200,50,0.9), 0 0 40px rgba(255,100,0,0.6), 0 0 60px rgba(255,50,0,0.3); filter: brightness(1.8) saturate(1.5); border-color: #fff; }
          15% { box-shadow: 0 0 12px rgba(255,150,0,0.5), 0 0 30px rgba(255,80,0,0.3); filter: brightness(1.3); border-color: #fca5a5; }
          25% { box-shadow: 0 2px 10px rgba(220,38,38,0.5); filter: brightness(1); border-color: #fca5a5; }
        }
      `}</style>
      {MapComponent ? (
        <div className="absolute inset-0">
          <MapComponent 
            denuncias={denunciasComLocalizacao} 
            iniciativas={mostrarIniciativas ? iniciativas : []}
            apoiadores={mostrarApoiadores ? apoiadores : []}
            center={center} 
            zoom={zoom} 
            isMarking={markingMode} 
            tempMarker={tempMarker} 
            mapType={mapType} 
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p>{t('loading', { ns: 'translation' })}</p>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-[400] hidden md:block">
        <button
          onClick={() => navigate('/')}
          className="text-white dark:text-black text-xs underline hover:opacity-70 transition-opacity mb-1 flex items-center gap-1"
        >
          <ArrowLeft size={12} /> {t('back', { ns: 'translation' })}
        </button>
        <div className="bg-black/80 dark:bg-white/80 backdrop-blur-sm text-white dark:text-black px-4 py-2 rounded-lg mb-2 relative z-[500]">
          <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2"><Map /> CICLISTA DENUNCIE - MAPA</h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs md:text-sm">
              {denunciasVisiveis !== null ? (
                CountUpComponent ? (
                  <CountUpComponent 
                    start={0}
                    end={denunciasVisiveis} 
                    duration={2.5}
                    useEasing={true}
                  />
                ) : denunciasVisiveis
                ) : denunciasComLocalizacao.length} {t('denuncias.visiveis')}
            </p>
            <div className="relative z-[600]">
              <button
                onClick={() => setShowAnoDropdown(!showAnoDropdown)}
                className="text-xs md:text-sm flex items-center gap-1 hover:opacity-70 transition-opacity ano-button"
              >
                <Calendar size={14} />
                {anoFiltro === 'todos' ? t('all', { ns: 'translation' }) : anoFiltro}
              </button>
              {showAnoDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl min-w-[120px] overflow-hidden z-[700] ano-dropdown">
                  <button
                    onClick={() => {
                      setAnoFiltro('todos');
                      setShowAnoDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-black ${
                      anoFiltro === 'todos' ? 'bg-gray-200 font-semibold' : ''
                    }`}
                  >
                    {t('all', { ns: 'translation' })}
                  </button>
                  {anosDisponiveis.map(ano => (
                    <button
                      key={ano}
                      onClick={() => {
                        setAnoFiltro(ano);
                        setShowAnoDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-black ${
                        anoFiltro === ano ? 'bg-gray-200 font-semibold' : ''
                      }`}
                    >
                      {ano}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative w-80 mb-2">
          <input
            type="text"
            placeholder={t('filtro.cidade')}
            value={cidade}
            autoFocus
            onChange={(e) => {
              const valor = e.target.value;
              setCidade(valor);
              buscarCidades(valor);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => prev < sugestoes.length - 1 ? prev + 1 : prev);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (selectedIndex >= 0 && sugestoes[selectedIndex]) {
                  const cidadeSelecionada = sugestoes[selectedIndex];
                  setCidade(cidadeSelecionada);
                  setSugestoes([]);
                  const nomeCidade = cidadeSelecionada.split(' - ')[0];
                  fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(nomeCidade)}&country=Brazil&format=json&limit=1`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.length > 0) {
                        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        setZoom(12);
                      }
                    });
                }
              } else if (e.key === "Escape") {
                setSugestoes([]);
              }
            }}
            onBlur={() => setTimeout(() => setSugestoes([]), 200)}
            className="w-full p-3 border-2 border-white/50 rounded-lg text-black bg-white/90 backdrop-blur-sm shadow-lg focus:border-black focus:outline-none"
          />
          {sugestoes.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-[1000] bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {sugestoes.map((s, i) => (
                <li
                  key={s}
                  onClick={() => {
                    setCidade(s);
                    setSugestoes([]);
                    const nomeCidade = s.split(' - ')[0];
                    fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(nomeCidade)}&country=Brazil&format=json&limit=1`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.length > 0) {
                          setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                          setZoom(12);
                        }
                      });
                  }}
                  className={`p-3 hover:bg-gray-100 cursor-pointer text-black ${i === selectedIndex ? 'bg-gray-200' : ''}`}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative w-80">
          <button
            type="button"
            onClick={() => setShowTipoDropdown(!showTipoDropdown)}
            className="w-full p-3 border-2 border-white/50 rounded-lg text-black bg-white/90 backdrop-blur-sm shadow-lg focus:border-black focus:outline-none text-left flex items-center gap-2"
          >
            {tipoFiltro === 'todos' ? (
              t('filtro.todas')
            ) : (
              <>
                {tipos.find(t => t.value === tipoFiltro)?.icon && (() => {
                  const Icon = tipos.find(t => t.value === tipoFiltro)!.icon;
                  return <Icon size={18} />;
                })()}
                {tipos.find(t => t.value === tipoFiltro)?.label}
              </>
            )}
          </button>
          {showTipoDropdown && (
            <div className="absolute z-[1100] w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setTipoFiltro('todos');
                  setShowTipoDropdown(false);
                }}
                className="w-full p-3 hover:bg-gray-100 text-left text-black"
              >
                {t('filtro.todas')}
              </button>
              {tipos.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTipoFiltro(t.value);
                    setShowTipoDropdown(false);
                  }}
                  className="w-full p-3 hover:bg-gray-100 text-left flex items-center gap-2 text-black"
                >
                  <t.icon size={18} />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-10 left-4 z-[400] flex flex-col items-start gap-2 md:hidden">
        <button
          onClick={() => navigate('/')}
          className="text-white dark:text-black text-xs underline hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          <ArrowLeft size={12} /> {t('back', { ns: 'translation' })}
        </button>
        <div className="bg-black/80 dark:bg-white/80 backdrop-blur-sm text-white dark:text-black px-3 py-1.5 rounded-lg relative z-[500]">
          <h1 className="text-sm font-bold flex items-center gap-1.5"><Map size={16} /> CICLISTA DENUNCIE - MAPA</h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs">
              {denunciasVisiveis !== null ? (
                CountUpComponent ? (
                  <CountUpComponent 
                    start={0}
                    end={denunciasVisiveis} 
                    duration={2.5}
                    useEasing={true}
                  />
                ) : denunciasVisiveis
                ) : denunciasComLocalizacao.length} {t('denuncias.visiveis')}
            </p>
            <div className="relative z-[600]">
              <button
                onClick={() => setShowAnoDropdown(!showAnoDropdown)}
                className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity ano-button"
              >
                <Calendar size={12} />
                {anoFiltro === 'todos' ? t('all', { ns: 'translation' }) : anoFiltro}
              </button>
              {showAnoDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl min-w-[100px] overflow-hidden z-[700] ano-dropdown">
                  <button
                    onClick={() => {
                      setAnoFiltro('todos');
                      setShowAnoDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 text-black text-sm ${
                      anoFiltro === 'todos' ? 'bg-gray-200 font-semibold' : ''
                    }`}
                  >
                    {t('all', { ns: 'translation' })}
                  </button>
                  {anosDisponiveis.map(ano => (
                    <button
                      key={ano}
                      onClick={() => {
                        setAnoFiltro(ano);
                        setShowAnoDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 text-black text-sm ${
                        anoFiltro === ano ? 'bg-gray-200 font-semibold' : ''
                      }`}
                    >
                      {ano}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative w-80">
          <input
            type="text"
            placeholder={t('filtro.cidade')}
            value={cidade}
            onChange={(e) => {
              const valor = e.target.value;
              setCidade(valor);
              buscarCidades(valor);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => prev < sugestoes.length - 1 ? prev + 1 : prev);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (selectedIndex >= 0 && sugestoes[selectedIndex]) {
                  const cidadeSelecionada = sugestoes[selectedIndex];
                  setCidade(cidadeSelecionada);
                  setSugestoes([]);
                  const nomeCidade = cidadeSelecionada.split(' - ')[0];
                  fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(nomeCidade)}&country=Brazil&format=json&limit=1`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.length > 0) {
                        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        setZoom(12);
                      }
                    });
                }
              } else if (e.key === "Escape") {
                setSugestoes([]);
              }
            }}
            onBlur={() => setTimeout(() => setSugestoes([]), 200)}
            className="w-full p-3 border-2 border-white/50 rounded-lg text-black bg-white/90 backdrop-blur-sm shadow-lg focus:border-black focus:outline-none"
          />
          {sugestoes.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-[1000] bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {sugestoes.map((s, i) => (
                <li
                  key={s}
                  onClick={() => {
                    setCidade(s);
                    setSugestoes([]);
                    const nomeCidade = s.split(' - ')[0];
                    fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(nomeCidade)}&country=Brazil&format=json&limit=1`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.length > 0) {
                          setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                          setZoom(12);
                        }
                      });
                  }}
                  className={`p-3 hover:bg-gray-100 cursor-pointer text-black ${i === selectedIndex ? 'bg-gray-200' : ''}`}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative w-80">
          <button
            type="button"
            onClick={() => setShowTipoDropdown(!showTipoDropdown)}
            className="w-full p-3 border-2 border-white/50 rounded-lg text-black bg-white/90 backdrop-blur-sm shadow-lg focus:border-black focus:outline-none text-left flex items-center gap-2"
          >
            {tipoFiltro === 'todos' ? (
              t('filtro.todas')
            ) : (
              <>
                {tipos.find(t => t.value === tipoFiltro)?.icon && (() => {
                  const Icon = tipos.find(t => t.value === tipoFiltro)!.icon;
                  return <Icon size={18} />;
                })()}
                {tipos.find(t => t.value === tipoFiltro)?.label}
              </>
            )}
          </button>
          {showTipoDropdown && (
            <div className="absolute z-[1100] w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setTipoFiltro('todos');
                  setShowTipoDropdown(false);
                }}
                className="w-full p-3 hover:bg-gray-100 text-left text-black"
              >
                {t('filtro.todas')}
              </button>
              {tipos.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTipoFiltro(t.value);
                    setShowTipoDropdown(false);
                  }}
                  className="w-full p-3 hover:bg-gray-100 text-left flex items-center gap-2 text-black"
                >
                  <t.icon size={18} />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-4 left-0 right-0 z-[400] justify-center px-4 hidden md:flex flex-col items-center gap-2">
      </div>

      {showOptionsMenu && (
        <div className="absolute top-32 right-4 z-[2100] bg-white rounded-xl shadow-2xl p-3 space-y-2 min-w-[180px] options-menu"
             style={{
               boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
             }}>
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">{t('filtro.tipo')}</div>
          <button
            onClick={() => { setMapType('street'); setShowOptionsMenu(false); }}
            className={`w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center gap-2 text-black transition ${mapType === 'street' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <Map size={18} /> {t('filtro.todas')}
          </button>
          <button
            onClick={() => { setMapType('satellite'); setShowOptionsMenu(false); }}
            className={`w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center gap-2 text-black transition ${mapType === 'satellite' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <Satellite size={18} /> Satélite
          </button>
          <button
            onClick={() => { setMapType('light'); setShowOptionsMenu(false); }}
            className={`w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center gap-2 text-black transition ${mapType === 'light' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <Snowflake size={18} /> Neutro
          </button>
          <button
            onClick={() => { setMapType('dark'); setShowOptionsMenu(false); }}
            className={`w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center gap-2 text-black transition ${mapType === 'dark' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <Moon size={18} /> Escuro
          </button>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Iniciativas</div>
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 cursor-pointer text-black transition">
            <input
              type="checkbox"
              checked={mostrarIniciativas}
              onChange={(e) => setMostrarIniciativas(e.target.checked)}
              className="w-4 h-4"
            />
            <Globe size={16} className="text-green-600" />
            <span className="text-sm">Mostrar Iniciativas Cicloativistas</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 cursor-pointer text-black transition">
            <input
              type="checkbox"
              checked={mostrarApoiadores}
              onChange={(e) => setMostrarApoiadores(e.target.checked)}
              className="w-4 h-4"
            />
            <Heart size={16} className="text-red-500" />
            <span className="text-sm">Mostrar Apoiadores</span>
          </label>
          <div className="border-t border-gray-200 my-2"></div>
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 cursor-pointer text-black transition">
            <input
              type="checkbox"
              checked={savePreferences}
              onChange={(e) => setSavePreferences(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Salvar preferências em Cookies</span>
          </label>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 z-[1000] flex justify-center gap-2">
        {!markingMode ? (
          <button
            onClick={() => setMarkingMode(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:bg-red-700"
          >
            Denunciar Ponto
          </button>
        ) : (
          <button
            onClick={() => {
              setMarkingMode(false);
              setTempMarker(null);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
            setTempMarker(null);
            setRelato("");
            setSituacoes([]);
            setShowAddSituacao(false);
            setPlaca("");
            setMostrarPlaca(false);
            setEndereco("");
          }
        }}>
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {!showSuccess ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-black">{t('modal.titulo')}</h2>
                <div className="text-sm text-gray-700 mb-4 space-y-1">
                  <p><strong>Localização:</strong> {endereco}</p>
                  <p><strong>Coordenadas:</strong> {tempMarker?.lat.toFixed(6)}, {tempMarker?.lng.toFixed(6)}</p>
                </div>

                {/* Situações selecionadas */}
                <div ref={situacaoRef} className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Situações:</p>
                  {situacoes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {situacoes.map((sit, index) => {
                        const tipoInfo = tipos.find(t => t.value === sit.tipo);
                        const Icon = tipoInfo?.icon || MoreHorizontal;
                        const label = sit.tipo === "outro" && sit.relato ? sit.relato : (tipoInfo?.label || sit.tipo);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-full text-xs font-medium"
                          >
                            {Icon && typeof Icon === 'function' && <Icon size={14} />}
                            <span>{label}</span>
                            <button
                              type="button"
                              onClick={() => removerSituacao(index)}
                              className="ml-1 text-white/80 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">{t('vazio.title')}</p>
                  )}
                </div>

                {/* Add situação button */}
                {!showAddSituacao && tiposDisponiveis.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddSituacao(true)}
                    className="w-full p-2 mb-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                  >
                    {t('modal.selecione')}
                  </button>
                )}

                {/* Dropdown para adicionar situação */}
                {showAddSituacao && tiposDisponiveis.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">{t('modal.selecione')}:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {tiposDisponiveis.map(t => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => adicionarSituacao(t.value)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            {Icon && typeof Icon === 'function' && <Icon size={12} />}
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSituacao(false)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      {t('cancel', { ns: 'translation' })}
                    </button>
                  </div>
                )}

                {/* Todos os tipos já adicionados */}
                {tiposDisponiveis.length === 0 && (
                  <p className="text-xs text-gray-400 mb-3 italic">{t('modal.selecione')}</p>
                )}

                {/* Input "Outro" */}
                {situacoes.some(s => s.tipo === "outro") && (
                  <input
                    ref={inputOutroRef}
                    type="text"
                    placeholder="Descreva o tipo *"
                    value={situacoes.find(s => s.tipo === "outro")?.relato || ""}
                    onChange={(e) => atualizarOutroRelato(e.target.value)}
                    className={`w-full p-3 border rounded-lg mb-4 text-black ${errorModal && situacoes.some(s => s.tipo === "outro") && !situacoes.find(s => s.tipo === "outro")?.relato?.trim() ? 'border-red-500' : ''}`}
                    required
                  />
                )}
                <textarea
                  placeholder={t('denuncia.semRelato')}
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4 h-32 text-black"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPlaca(!mostrarPlaca)}
                  className="text-sm text-gray-600 hover:text-black mb-4 underline"
                >
                  {t('modal.placa')}
                </button>
                {mostrarPlaca && (
                  <input
                    ref={inputPlacaRef}
                    type="text"
                    placeholder={t('modal.placa')}
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className={`w-full p-3 border rounded-lg mb-4 text-black ${errorModal && placa && placa.length !== 7 ? 'border-red-500' : ''}`}
                    maxLength={7}
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={salvarDenunciaModal}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                  >
                    {t('modal.enviar')}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTempMarker(null);
                      setRelato("");
                      setSituacoes([]);
                      setShowAddSituacao(false);
                      setPlaca("");
                      setMostrarPlaca(false);
                      setEndereco("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
                  >
                    {t('cancel', { ns: 'translation' })}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold mb-2 text-black">{t('modal.sucesso')}</h2>
                  <p className="text-gray-600 mb-6">Sua denúncia foi registrada com sucesso.</p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowSuccess(false);
                      setTempMarker(null);
                      setRelato("");
                      setSituacoes([]);
                      setShowAddSituacao(false);
                      setPlaca("");
                      setMostrarPlaca(false);
                      setEndereco("");
                    }}
                    className="w-full px-4 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                  >
                    {t('close', { ns: 'translation' })}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
