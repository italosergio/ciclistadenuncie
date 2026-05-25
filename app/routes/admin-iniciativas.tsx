import { useState, useEffect, useRef } from "react";
import { ref, onValue, push, remove, set } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";
import { Plus, Trash2, ExternalLink, Globe, MapPin, Search, Edit3, MoreVertical, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Iniciativa {
  id: string;
  nome: string;
  url: string;
  descricao?: string;
  endereco?: string;
  lat?: number;
  lng?: number;
  criadoPor: string;
  createdAt: string;
}

export default function IniciativasTab() {
  const { t } = useTranslation('admin');
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [modalIniciativa, setModalIniciativa] = useState<Iniciativa | null>(null);
  const [menuIniciativaAberto, setMenuIniciativaAberto] = useState(false);
  const { user } = useAuth();

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
            lat: value.lat || undefined,
            lng: value.lng || undefined,
            criadoPor: value.criadoPor || t('iniciativas.desconhecido'),
            createdAt: value.createdAt || "",
          }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setIniciativas(lista);
      } else {
        setIniciativas([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Mini-mapa Leaflet para selecionar localização
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Inicializa o mapa sempre (sem depender de lat/lng)
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return; // já inicializado
    
    let destroyed = false;
    
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css")
    ]).then(([L]) => {
      if (destroyed || !mapRef.current) return;
      
      const hasCoords = lat && lng;
      const center: [number, number] = hasCoords
        ? [parseFloat(lat), parseFloat(lng)]
        : [-14.235, -51.925]; // centro do Brasil
      const zoom = hasCoords ? 13 : 4;
      
      const map = L.default.map(mapRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });
      
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      
      // Cria marcador se já tem coordenadas
      if (hasCoords) {
        const marker = L.default.marker([parseFloat(lat), parseFloat(lng)], {
          draggable: true,
        }).addTo(map);
        
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setLat(pos.lat.toFixed(6));
          setLng(pos.lng.toFixed(6));
        });
        
        markerRef.current = marker;
      }
      
      // Clique no mapa: cria/atualiza marcador
      map.on('click', (e: any) => {
        const newLat = e.latlng.lat.toFixed(6);
        const newLng = e.latlng.lng.toFixed(6);
        
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          const marker = L.default.marker(e.latlng, {
            draggable: true,
          }).addTo(map);
          
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setLat(pos.lat.toFixed(6));
            setLng(pos.lng.toFixed(6));
          });
          
          markerRef.current = marker;
          map.setZoom(13);
        }
        
        setLat(newLat);
        setLng(newLng);
      });
      
      mapInstanceRef.current = map;
    });
    
    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // só roda uma vez na montagem
  
  // Atualiza marcador se lat/lng mudarem externamente (ex: busca de endereço)
  useEffect(() => {
    if (!mapInstanceRef.current || !lat || !lng) return;
    
    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([parseFloat(lat), parseFloat(lng)]);
        mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lng)], 13);
      } else {
        const marker = L.default.marker([parseFloat(lat), parseFloat(lng)], {
          draggable: true,
        }).addTo(mapInstanceRef.current);
        
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setLat(pos.lat.toFixed(6));
          setLng(pos.lng.toFixed(6));
        });
        
        markerRef.current = marker;
        mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lng)], 13);
      }
    });
  }, [lat, lng]);

  async function buscarEndereco() {
    if (!endereco.trim()) return;
    setBuscando(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1&countrycodes=br`
      );
      const data = await response.json();
      if (data.length > 0) {
        setLat(data[0].lat);
        setLng(data[0].lon);
      } else {
        alert(t('iniciativas.enderecoNaoEncontrado'));
      }
    } catch {
      alert(t('iniciativas.erroBuscarEndereco'));
    } finally {
      setBuscando(false);
    }
  }

  function handleEditar(iniciativa: Iniciativa) {
    setEditandoId(iniciativa.id);
    setNome(iniciativa.nome);
    setUrl(iniciativa.url);
    setDescricao(iniciativa.descricao || "");
    setEndereco(iniciativa.endereco || "");
    setLat(iniciativa.lat?.toString() || "");
    setLng(iniciativa.lng?.toString() || "");
    setShowForm(true);
    setExcluindoId(null);
  }

  function handleCancelarEdicao() {
    setEditandoId(null);
    setNome("");
    setUrl("");
    setDescricao("");
    setEndereco("");
    setLat("");
    setLng("");
    setShowForm(false);
  }

  async function handleSalvar() {
    if (!nome.trim() || !url.trim() || !user?.username) return;

    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        url: url.trim(),
        descricao: descricao.trim(),
        endereco: endereco.trim(),
        ...(lat && lng ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        } : {}),
        editadoPor: user.username,
        editadoEm: new Date().toISOString(),
      };

      if (editandoId) {
        // Atualizar iniciativa existente
        const iniciativaOriginal = iniciativas.find(i => i.id === editandoId);
        await set(ref(db, `iniciativas/${editandoId}`), {
          ...dados,
          criadoPor: iniciativaOriginal?.criadoPor || user.username,
          createdAt: iniciativaOriginal?.createdAt || new Date().toISOString(),
        });

        await registrarEvento({
          tipo: "editar_iniciativa",
          usuario: user.username,
          detalhes: {
            iniciativaId: editandoId,
            nome: nome.trim(),
            url: url.trim(),
          },
        });
      } else {
        // Nova iniciativa
        const iniciativasRef = ref(db, "iniciativas");
        const novoRef = await push(iniciativasRef, {
          ...dados,
          criadoPor: user.username,
          createdAt: new Date().toISOString(),
        });

        await registrarEvento({
          tipo: "adicionar_iniciativa",
          usuario: user.username,
          detalhes: {
            iniciativaId: novoRef.key,
            nome: nome.trim(),
            url: url.trim(),
          },
        });
      }

      setEditandoId(null);
      setNome("");
      setUrl("");
      setDescricao("");
      setEndereco("");
      setLat("");
      setLng("");
      setShowForm(false);
    } catch (error: any) {
      alert(t('iniciativas.erroSalvar', { message: error.message }));
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: string, nomeIniciativa: string) {
    if (!user?.username) return;

    try {
      await remove(ref(db, `iniciativas/${id}`));

      await registrarEvento({
        tipo: "excluir_iniciativa",
        usuario: user.username,
        detalhes: {
          iniciativaId: id,
          nome: nomeIniciativa,
        },
      });

      setExcluindoId(null);
    } catch (error: any) {
      alert(t('iniciativas.erroExcluir', { message: error.message }));
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur">
          <p className="text-sm text-slate-400">{t('iniciativas.carregando')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">{t('title')}</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">{t('iniciativas.titulo')}</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">{t('iniciativas.descricao')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{t('iniciativas.qtdItens', { count: iniciativas.length })}</span>
          <button
            onClick={() => { if (editandoId) { handleCancelarEdicao(); } else { setShowForm(!showForm); } }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-700"
          >
            <Plus size={14} />
            {showForm ? (editandoId ? t('apoiadores.cancelarEdicao') : t('apoiadores.cancelar')) : t('iniciativas.novo')}
          </button>
        </div>
      </div>

      {/* Formulário de nova iniciativa */}
      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur mb-5">
          <h3 className="text-sm font-semibold text-white mb-4">{editandoId ? t('iniciativas.editar') : t('iniciativas.novoFormTitulo')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                {t('iniciativas.nomeLabel')}
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={t('iniciativas.nomePlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                {t('iniciativas.urlLabel')}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('iniciativas.urlPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                {t('iniciativas.descricaoLabel')}
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              placeholder={t('iniciativas.descricaoPlaceholder')}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
              {t('iniciativas.enderecoLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder={t('iniciativas.enderecoPlaceholder')}
                className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={buscarEndereco}
                disabled={!endereco.trim() || buscando}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Search size={16} />
                {buscando ? t('iniciativas.buscando') : t('iniciativas.buscar')}
              </button>
            </div>
          </div>
          <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('iniciativas.latitude')}</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('iniciativas.longitude')}</label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">{t('iniciativas.localizacaoMapa')}</label>
                <p className="text-xs text-slate-500 mb-2">{t('iniciativas.mapaInstrucao')}</p>
                <div
                  ref={mapRef}
                  className="w-full h-56 rounded-xl border border-white/10 z-0"
                  style={{ cursor: 'crosshair' }}
                />
              </div>
          <button
            onClick={handleSalvar}
            disabled={!nome.trim() || !url.trim() || salvando}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-950/40 transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? t('iniciativas.salvando') : (editandoId ? t('iniciativas.atualizar') : t('iniciativas.salvar'))}
            </button>
          </div>
        </div>
      )}

      {/* Lista de iniciativas */}
      {iniciativas.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20 backdrop-blur text-center">
          <Globe size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">{t('iniciativas.listaVazia')}</p>
          <p className="text-xs text-slate-500 mt-2">
            {t('iniciativas.listaVaziaDica')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {iniciativas.map((iniciativa) => (
            <div
              key={iniciativa.id}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur cursor-pointer transition hover:border-blue-500/30 hover:bg-slate-900"
              onClick={() => { setModalIniciativa(iniciativa); setMenuIniciativaAberto(false); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1.5 break-words">
                    {iniciativa.nome}
                  </h3>
                  {iniciativa.descricao && (
                    <p className="text-xs text-slate-400 mb-2">{iniciativa.descricao}</p>
                  )}
                  <a
                    href={iniciativa.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                  >
                    <ExternalLink size={14} />
                    {iniciativa.url}
                  </a>
                  {iniciativa.endereco && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {iniciativa.endereco}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500">
                    {t('iniciativas.adicionadoPor', { usuario: iniciativa.criadoPor, data: iniciativa.createdAt
                      ? new Date(iniciativa.createdAt).toLocaleDateString("pt-BR")
                      : t('iniciativas.na') })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalIniciativa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setModalIniciativa(null); setMenuIniciativaAberto(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-white/10">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-sm font-semibold text-white">{modalIniciativa.nome}</h3>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setMenuIniciativaAberto(!menuIniciativaAberto)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                    <MoreVertical size={16} />
                  </button>
                  {menuIniciativaAberto && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-10">
                      <button onClick={() => { handleEditar(modalIniciativa); setModalIniciativa(null); }} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2">
                        <Edit3 size={14} /> {t('apoiadores.editar')}
                      </button>
                      <button onClick={() => { handleExcluir(modalIniciativa.id, modalIniciativa.nome); setModalIniciativa(null); }} className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 flex items-center gap-2">
                        <Trash2 size={14} /> {t('apoiadores.excluir')}
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => { setModalIniciativa(null); setMenuIniciativaAberto(false); }} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('apoiadores.modal.nome')}</p>
                <p className="text-sm text-white">{modalIniciativa.nome}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('apoiadores.modal.url')}</p>
                <a href={modalIniciativa.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <ExternalLink size={14} /> {modalIniciativa.url}
                </a>
              </div>
              {modalIniciativa.descricao && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('apoiadores.modal.descricao')}</p>
                  <p className="text-sm text-slate-200">{modalIniciativa.descricao}</p>
                </div>
              )}
              {modalIniciativa.endereco && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('apoiadores.modal.endereco')}</p>
                  <p className="text-sm text-white flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {modalIniciativa.endereco}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('iniciativas.latitude')}</p>
                  <p className="text-sm text-white">{modalIniciativa.lat ?? t('iniciativas.na')}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('iniciativas.longitude')}</p>
                  <p className="text-sm text-white">{modalIniciativa.lng ?? t('iniciativas.na')}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('apoiadores.modal.criadoPor')}</p>
                <p className="text-sm text-white">{modalIniciativa.criadoPor}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{t('apoiadores.modal.data')}</p>
                <p className="text-sm text-white">{modalIniciativa.createdAt ? new Date(modalIniciativa.createdAt).toLocaleDateString('pt-BR') : t('iniciativas.na')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
