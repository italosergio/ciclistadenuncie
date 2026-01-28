import { useEffect, useState, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../lib/firebase";
import { salvarDenuncia } from "../lib/denuncias";
import type { Route } from "./+types/mapa";
import { Maximize2, MapPin, Map, Satellite, Layers, Moon, Wind, Megaphone, Hand, MessageSquareWarning, Car, Construction, MoreHorizontal, AlertTriangle, Lightbulb, CircleSlash, Wrench, Bike, Snowflake, Calendar, ArrowLeft, ChevronDown, BarChart3, LogOut, Shield } from "lucide-react";
import { renderToString } from "react-dom/server";
import { useNavigate, Link, useLocation } from "react-router";
import { buscarCidadesIBGE } from "../services/ibge.service";
import { buscarEnderecoPorCoordenadas, buscarCidadePorNome } from "../services/geocoding.service";
import { TILE_LAYERS } from "../config/API_ENDPOINTS";
import { useAuth } from "../lib/AuthContext";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mapa de Denúncias - Ciclista Denuncie" }];
}

export async function loader() {
  const cidades = await buscarCidadesIBGE();
  return { cidades };
}

interface Denuncia {
  endereco: string;
  relato: string | Array<{ texto: string; editadoEm: string }> | Array<string>;
  tipo?: string;
  placa?: string;
  localizacao?: { lat: number; lng: number };
  createdAt: string;
}

export default function Mapa({ loaderData }: Route.ComponentProps) {
  const [denuncias, setDenuncias] = useState<Record<string, Denuncia>>({});
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
  const [tipo, setTipo] = useState("");
  const [placa, setPlaca] = useState("");
  const [mostrarPlaca, setMostrarPlaca] = useState(false);
  const [descricaoOutro, setDescricaoOutro] = useState("");
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
  const [useClusters, setUseClusters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = document.cookie.split('; ').find(row => row.startsWith('useClusters='));
      return saved ? saved.split('=')[1] === 'true' : true;
    }
    return true;
  });
  const [savePreferences, setSavePreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.cookie.includes('mapType=') || document.cookie.includes('useClusters=');
    }
    return false;
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const [errorModal, setErrorModal] = useState<string>("");
  const selectTipoRef = useRef<HTMLSelectElement>(null);
  const inputOutroRef = useRef<HTMLInputElement>(null);
  const inputPlacaRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tipos = [
    { value: "fina", label: "Fina", icon: Wind, color: "#dc2626" },
    { value: "ameaca", label: "Ameaça", icon: Megaphone, color: "#dc2626" },
    { value: "assedio", label: "Assédio", icon: Hand, color: "#dc2626" },
    { value: "agressao-verbal", label: "Agressão Verbal", icon: MessageSquareWarning, color: "#dc2626" },
    { value: "agressao-fisica", label: "Atropelamento", icon: Car, color: "#dc2626" },
    { value: "invasao-ciclovia", label: "Invasão de Ciclovia/Ciclofaixa", icon: Construction, color: "#dc2626" },
    { value: "buraco-via", label: "Buraco na Via", icon: AlertTriangle, color: "#dc2626" },
    { value: "falta-sinalizacao", label: "Falta de Sinalização", icon: CircleSlash, color: "#dc2626" },
    { value: "trecho-perigoso", label: "Trecho Perigoso", icon: AlertTriangle, color: "#dc2626" },
    { value: "ciclovia-obstruida", label: "Ciclovia Obstruída", icon: Construction, color: "#dc2626" },
    { value: "falta-iluminacao", label: "Falta de Iluminação", icon: Lightbulb, color: "#dc2626" },
    { value: "veiculo-estacionado", label: "Veículo Estacionado na Ciclovia", icon: Car, color: "#dc2626" },
    { value: "ma-conservacao", label: "Má Conservação da Via", icon: Wrench, color: "#dc2626" },
    { value: "falta-ciclovia", label: "Falta de Ciclovia", icon: Bike, color: "#dc2626" },
    { value: "outro", label: "Outro", icon: MoreHorizontal, color: "#dc2626" },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && savePreferences) {
      document.cookie = `mapType=${mapType}; path=/; max-age=31536000`;
    } else if (typeof window !== 'undefined' && !savePreferences) {
      document.cookie = `mapType=; path=/; max-age=0`;
    }
  }, [mapType, savePreferences]);

  useEffect(() => {
    if (typeof window !== 'undefined' && savePreferences) {
      document.cookie = `useClusters=${useClusters}; path=/; max-age=31536000`;
    } else if (typeof window !== 'undefined' && !savePreferences) {
      document.cookie = `useClusters=; path=/; max-age=0`;
    }
  }, [useClusters, savePreferences]);

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
    import("react-leaflet-cluster/dist/assets/MarkerCluster.css");
    import("react-leaflet-cluster/dist/assets/MarkerCluster.Default.css");
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      import("react-leaflet-cluster")
    ]).then(([reactLeaflet, L, cluster]) => {
      const { MapContainer, TileLayer, Marker, Popup, Tooltip } = reactLeaflet;
      const MarkerClusterGroup = cluster.default;
      
      const icon = L.default.divIcon({
        html: `<div style="background-color: #dc2626; width: 21px; height: 21px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [21, 21],
        iconAnchor: [10.5, 10.5],
      });

      const createColoredIcon = (color: string, IconComponent: any) => {
        return L.default.divIcon({
          html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${renderToString(<IconComponent size={16} color="white" />)}</div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      const tempIcon = L.default.divIcon({
        html: renderToString(<MapPin color="#dc2626" fill="#dc2626" size={40} />),
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

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



      setMapComponent(() => ({ denuncias, center, zoom, isMarking, tempMarker, mapType, useClusters }: { denuncias: [string, Denuncia][], center: [number, number], zoom: number, isMarking: boolean, tempMarker: {lat: number, lng: number} | null, mapType: 'street' | 'satellite', useClusters: boolean }) => (
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
          {useClusters ? (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={20}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={!isMarking}
              disableClusteringAtZoom={15}
            eventHandlers={{
              click: async (e: any) => {
                if (isMarking) {
                  const latlng = e.layer.getLatLng();
                  const pos = { lat: latlng.lat, lng: latlng.lng };
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
            iconCreateFunction={(cluster: any) => {
              return L.default.divIcon({
                html: `<div style="background-color: #dc2626; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${cluster.getChildCount()}</div>`,
                className: 'custom-cluster',
                iconSize: [32, 32],
              });
            }}
          >
            {denuncias.map(([id, denuncia]) => {
              const tipoInfo = tipos.find(t => t.value === denuncia.tipo);
              const markerIcon = tipoInfo ? createColoredIcon(tipoInfo.color, tipoInfo.icon) : icon;
              
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
                    if (!isMarking && !e.target.isPopupOpen()) {
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
                            Placa: {denuncia.placa}
                          </div>
                        )}
                      </div>
                    </Popup>
                )}
              </Marker>
            )})}
            </MarkerClusterGroup>
          ) : (
            <>
              {denuncias.map(([id, denuncia]) => {
                const tipoInfo = tipos.find(t => t.value === denuncia.tipo);
                const markerIcon = tipoInfo ? createColoredIcon(tipoInfo.color, tipoInfo.icon) : icon;
                
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
                      if (!isMarking && !e.target.isPopupOpen()) {
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
                              Placa: {denuncia.placa}
                            </div>
                          )}
                        </div>
                      </Popup>
                  )}
                </Marker>
              )})}
            </>
          )}
        </MapContainer>
      ));
    });
  }, []);

  const denunciasComLocalizacao = Object.entries(denuncias).filter(
    ([_, d]) => {
      if (!d.localizacao) return false;
      if (tipoFiltro !== 'todos' && d.tipo !== tipoFiltro) return false;
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

  async function salvarDenunciaModal() {
    if (!tempMarker || !tipo) {
      setErrorModal("Selecione o tipo");
      setTimeout(() => {
        selectTipoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectTipoRef.current?.focus();
      }, 100);
      return;
    }

    if (tipo === "outro" && !descricaoOutro.trim()) {
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
        tipo: tipo === "outro" ? descricaoOutro : tipo,
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500]">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white underline text-sm bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-lg shadow-lg flex items-center gap-1 font-medium"
            >
              Bem-vindo, <span className="text-red-600 dark:text-red-500">{user.username}</span>!
              <ChevronDown size={14} />
            </button>
            {showUserMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-w-[180px] overflow-hidden">
                <Link
                  to={`/usuario/${user.username}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <BarChart3 size={16} /> Minhas Contribuições
                </Link>
                {(user.role === 'administrador' || user.role === 'moderador') && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Shield size={16} /> Painel ADM
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500]">
          <Link
            to="/login"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white underline text-sm bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-lg shadow-lg font-medium"
          >
            Entrar ou Registrar
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
      `}</style>
      {MapComponent ? (
        <div className="absolute inset-0">
          <MapComponent denuncias={denunciasComLocalizacao} center={center} zoom={zoom} isMarking={markingMode} tempMarker={tempMarker} mapType={mapType} useClusters={useClusters} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p>Carregando mapa...</p>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-[400] hidden md:block">
        <button
          onClick={() => navigate('/')}
          className="text-white dark:text-black text-xs underline hover:opacity-70 transition-opacity mb-1 flex items-center gap-1"
        >
          <ArrowLeft size={12} /> voltar
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
              ) : denunciasComLocalizacao.length} denúncias
            </p>
            <div className="relative z-[600]">
              <button
                onClick={() => setShowAnoDropdown(!showAnoDropdown)}
                className="text-xs md:text-sm flex items-center gap-1 hover:opacity-70 transition-opacity ano-button"
              >
                <Calendar size={14} />
                {anoFiltro === 'todos' ? 'Todos' : anoFiltro}
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
                    Todos
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
            placeholder="Buscar cidade..."
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
              'Todos os tipos'
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
                Todos os tipos
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

      <div className="absolute top-4 left-4 z-[400] flex flex-col items-start gap-2 md:hidden">
        <button
          onClick={() => navigate('/')}
          className="text-white dark:text-black text-xs underline hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          <ArrowLeft size={12} /> voltar
        </button>
        <div className="bg-black/80 dark:bg-white/80 backdrop-blur-sm text-white dark:text-black px-4 py-2 rounded-lg relative z-[500]">
          <h1 className="text-lg font-bold flex items-center gap-2"><Map size={20} /> CICLISTA DENUNCIE - MAPA</h1>
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
              ) : denunciasComLocalizacao.length} denúncias
            </p>
            <div className="relative z-[600]">
              <button
                onClick={() => setShowAnoDropdown(!showAnoDropdown)}
                className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity ano-button"
              >
                <Calendar size={12} />
                {anoFiltro === 'todos' ? 'Todos' : anoFiltro}
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
                    Todos
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
            placeholder="Buscar cidade..."
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
              'Todos os tipos'
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
                Todos os tipos
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
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Tipo de Mapa</div>
          <button
            onClick={() => { setMapType('street'); setShowOptionsMenu(false); }}
            className={`w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center gap-2 text-black transition ${mapType === 'street' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <Map size={18} /> Mapa Padrão
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
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Visualização</div>
          <button
            onClick={() => { setUseClusters(!useClusters); setShowOptionsMenu(false); }}
            className={`w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center gap-2 text-black transition ${useClusters ? 'bg-gray-200 font-semibold' : ''}`}
          >
            <Layers size={18} /> {useClusters ? 'Clusters: ON' : 'Clusters: OFF'}
          </button>
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
            setTipo("");
            setPlaca("");
            setMostrarPlaca(false);
            setEndereco("");
            setDescricaoOutro("");
          }
        }}>
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {!showSuccess ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-black">Registrar Denúncia</h2>
                <div className="text-sm text-gray-700 mb-4 space-y-1">
                  <p><strong>Localização:</strong> {endereco}</p>
                  <p><strong>Coordenadas:</strong> {tempMarker?.lat.toFixed(6)}, {tempMarker?.lng.toFixed(6)}</p>
                </div>
                <select
                  ref={selectTipoRef}
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className={`w-full p-3 border rounded-lg mb-4 text-black ${errorModal && !tipo ? 'border-red-500' : ''}`}
                  size={6}
                  style={{ height: '165px' }}
                  required
                >
                  <option value="">Selecione o tipo *</option>
                  <option value="fina">Fina</option>
                  <option value="ameaca">Ameaça</option>
                  <option value="assedio">Assédio</option>
                  <option value="agressao-verbal">Agressão Verbal</option>
                  <option value="agressao-fisica">Atropelamento</option>
                  <option value="invasao-ciclovia">Invasão de Ciclovia/Ciclofaixa</option>
                  <option value="buraco-via">Buraco na Via</option>
                  <option value="falta-sinalizacao">Falta de Sinalização</option>
                  <option value="trecho-perigoso">Trecho Perigoso</option>
                  <option value="ciclovia-obstruida">Ciclovia Obstruída</option>
                  <option value="falta-iluminacao">Falta de Iluminação</option>
                  <option value="veiculo-estacionado">Veículo Estacionado na Ciclovia</option>
                  <option value="ma-conservacao">Má Conservação da Via</option>
                  <option value="falta-ciclovia">Falta de Ciclovia</option>
                  <option value="outro">Outro</option>
                </select>
                {errorModal && <p className="text-red-500 text-sm mt-2">{errorModal}</p>}
                {tipo === "outro" && (
                  <input
                    ref={inputOutroRef}
                    type="text"
                    placeholder="Descreva o tipo *"
                    value={descricaoOutro}
                    onChange={(e) => setDescricaoOutro(e.target.value)}
                    className={`w-full p-3 border rounded-lg mb-4 text-black ${errorModal && tipo === "outro" && !descricaoOutro.trim() ? 'border-red-500' : ''}`}
                    required
                  />
                )}
                <textarea
                  placeholder="Relato"
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4 h-32 text-black"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPlaca(!mostrarPlaca)}
                  className="text-sm text-gray-600 hover:text-black mb-4 underline"
                >
                  ~ pegou a placa? ~
                </button>
                {mostrarPlaca && (
                  <input
                    ref={inputPlacaRef}
                    type="text"
                    placeholder="Placa"
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
                    Enviar
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTempMarker(null);
                      setRelato("");
                      setTipo("");
                      setPlaca("");
                      setMostrarPlaca(false);
                      setEndereco("");
                      setDescricaoOutro("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold mb-2 text-black">Denúncia Registrada!</h2>
                  <p className="text-gray-600 mb-6">Sua denúncia foi registrada com sucesso.</p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowSuccess(false);
                      setTempMarker(null);
                      setRelato("");
                      setTipo("");
                      setPlaca("");
                      setMostrarPlaca(false);
                      setEndereco("");
                      setDescricaoOutro("");
                    }}
                    className="w-full px-4 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                  >
                    Fechar
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
