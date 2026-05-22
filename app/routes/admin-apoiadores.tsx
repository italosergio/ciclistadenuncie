import { useState, useEffect, useRef } from "react";
import { ref, onValue, push, remove, set } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";
import { Plus, Trash2, ExternalLink, MapPin, Search, Edit3, Heart, GripVertical, MoreVertical, X } from "lucide-react";

interface Apoiador {
  id: string;
  nome: string;
  url: string;
  img: string;
  alt: string;
  descricao?: string;
  endereco?: string;
  lat?: number;
  lng?: number;
  ordem: number;
  criadoPor: string;
  createdAt: string;
}

export default function ApoiadoresTab() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [img, setImg] = useState("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [reordenando, setReordenando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [modalApoiador, setModalApoiador] = useState<Apoiador | null>(null);
  const [menuApoiadorAberto, setMenuApoiadorAberto] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const { user } = useAuth();

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
            img: value.img || "",
            alt: value.alt || value.nome || "",
            descricao: value.descricao || "",
            endereco: value.endereco || "",
            lat: value.lat || undefined,
            lng: value.lng || undefined,
            criadoPor: value.criadoPor || "Desconhecido",
            createdAt: value.createdAt || "",
            ordem: typeof value.ordem === "number" ? value.ordem : 999,
          }))
          .sort((a, b) => a.ordem - b.ordem);
        setApoiadores(lista);
      } else {
        setApoiadores([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Mini-mapa Leaflet para selecionar localização
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    let destroyed = false;

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css")
    ]).then(([L]) => {
      if (destroyed || !mapRef.current) return;

      const hasCoords = lat && lng;
      const center: [number, number] = hasCoords
        ? [parseFloat(lat), parseFloat(lng)]
        : [-14.235, -51.925];
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
  }, []);

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
        alert("Endereço não encontrado. Tente ser mais específico.");
      }
    } catch {
      alert("Erro ao buscar endereço. Tente novamente.");
    } finally {
      setBuscando(false);
    }
  }

  function handleEditar(apoiador: Apoiador) {
    setEditandoId(apoiador.id);
    setNome(apoiador.nome);
    setUrl(apoiador.url);
    setImg(apoiador.img);
    setDescricao(apoiador.descricao || "");
    setEndereco(apoiador.endereco || "");
    setLat(apoiador.lat?.toString() || "");
    setLng(apoiador.lng?.toString() || "");
    setShowForm(true);
    setExcluindoId(null);
  }

  // Drag & drop reorder
  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  async function handleDrop() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    if (!user?.username) return;

    const novaLista = [...apoiadores];
    const [movido] = novaLista.splice(dragItem.current, 1);
    novaLista.splice(dragOverItem.current, 0, movido);

    // Atualiza ordem no Firebase
    setReordenando(true);
    try {
      for (let i = 0; i < novaLista.length; i++) {
        if (novaLista[i].ordem !== i) {
          await set(ref(db, `apoiadores/${novaLista[i].id}/ordem`), i);
        }
      }
      await registrarEvento({
        tipo: "editar_apoiador",
        usuario: user.username,
        detalhes: {
          apoiadorId: movido.id,
          nome: movido.nome,
          acao: "reordenar",
        },
      });
    } catch (error: any) {
      alert("Erro ao reordenar: " + error.message);
    } finally {
      setReordenando(false);
      dragItem.current = null;
      dragOverItem.current = null;
    }
  }

  function handleCancelarEdicao() {
    setEditandoId(null);
    setNome("");
    setUrl("");
    setImg("");
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
      const alt = nome.trim();
      const dados = {
        nome: nome.trim(),
        url: url.trim(),
        img: img.trim() || `/apoiadores/${nome.trim().toLowerCase().replace(/\s+/g, '')}.jpg`,
        alt,
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
        const apoiadorOriginal = apoiadores.find(a => a.id === editandoId);
        await set(ref(db, `apoiadores/${editandoId}`), {
          ...dados,
          ordem: apoiadorOriginal?.ordem ?? 999,
          criadoPor: apoiadorOriginal?.criadoPor || user.username,
          createdAt: apoiadorOriginal?.createdAt || new Date().toISOString(),
        });

        await registrarEvento({
          tipo: "editar_apoiador",
          usuario: user.username,
          detalhes: {
            apoiadorId: editandoId,
            nome: nome.trim(),
            url: url.trim(),
          },
        });
      } else {
        const apoiadoresRef = ref(db, "apoiadores");
        const novoRef = await push(apoiadoresRef, {
          ...dados,
          ordem: apoiadores.length,
          criadoPor: user.username,
          createdAt: new Date().toISOString(),
        });

        await registrarEvento({
          tipo: "adicionar_apoiador",
          usuario: user.username,
          detalhes: {
            apoiadorId: novoRef.key,
            nome: nome.trim(),
            url: url.trim(),
          },
        });
      }

      setEditandoId(null);
      setNome("");
      setUrl("");
      setImg("");
      setDescricao("");
      setEndereco("");
      setLat("");
      setLng("");
      setShowForm(false);
    } catch (error: any) {
      alert("Erro ao salvar apoiador: " + error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: string, nomeApoiador: string) {
    if (!user?.username) return;

    try {
      await remove(ref(db, `apoiadores/${id}`));

      await registrarEvento({
        tipo: "excluir_apoiador",
        usuario: user.username,
        detalhes: {
          apoiadorId: id,
          nome: nomeApoiador,
        },
      });

      setExcluindoId(null);
    } catch (error: any) {
      alert("Erro ao excluir apoiador: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur">
          <p className="text-sm text-slate-400">Carregando apoiadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Administração</p>
          <h2 className="font-bungee text-xl md:text-2xl tracking-wide text-white">Apoiadores</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Gerencie parceiros, patrocinadores e organizações apoiadoras.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{apoiadores.length} itens</span>
          <button
            onClick={() => { if (editandoId) { handleCancelarEdicao(); } else { setShowForm(!showForm); } }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-700"
          >
            <Plus size={14} />
            {showForm ? (editandoId ? "Cancelar Edição" : "Cancelar") : "Novo Apoiador"}
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur mb-5">
          <h3 className="text-sm font-semibold text-white mb-4">{editandoId ? "Editar Apoiador" : "Novo Apoiador"}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                Nome do apoiador *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Massa Crítica São Paulo"
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                URL (Instagram, site...) *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                Caminho da imagem (opcional)
              </label>
              <input
                type="text"
                value={img}
                onChange={(e) => setImg(e.target.value)}
                placeholder="/apoiadores/nomedoapoioador.png"
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500 mt-1">
                Deixe vazio para definir automaticamente com base no nome
              </p>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição do apoiador..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">
                Endereço / Local (para aparecer no mapa)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Porto Alegre, RS"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={buscarEndereco}
                  disabled={!endereco.trim() || buscando}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Search size={16} />
                  {buscando ? "..." : "Buscar"}
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Longitude</label>
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
              <label className="block text-[11px] uppercase tracking-wide font-semibold mb-1 text-slate-400">Localização no mapa</label>
              <p className="text-xs text-slate-500 mb-2">Clique no mapa para marcar o ponto ou arraste o marcador para ajustar</p>
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
              {salvando ? "Salvando..." : (editandoId ? "Atualizar Apoiador" : "Salvar Apoiador")}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {apoiadores.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20 backdrop-blur text-center">
          <Heart size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">Nenhum apoiador cadastrado ainda</p>
          <p className="text-xs text-slate-500 mt-2">
            Clique em "Novo Apoiador" para adicionar o primeiro
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apoiadores.map((apoiador, index) => (
            <div
              key={apoiador.id}
              className={`rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur cursor-pointer transition hover:border-blue-500/30 hover:bg-slate-900 ${reordenando ? 'border-blue-500' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => { if (!reordenando) { setModalApoiador(apoiador); setMenuApoiadorAberto(false); } }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-gray-500 hover:text-white cursor-grab active:cursor-grabbing flex-shrink-0 inline-flex"
                      title="Arrastar para reordenar"
                    >
                      <GripVertical size={20} />
                    </span>
                    <span className="text-xs font-mono text-gray-500 min-w-[2rem]">#{index + 1}</span>
                    {apoiador.img && (
                      <img
                        src={apoiador.img}
                        alt={apoiador.nome}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-700"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <h3 className="text-sm font-semibold text-white break-words">
                      {apoiador.nome}
                    </h3>
                  </div>
                  {apoiador.descricao && (
                    <p className="text-xs text-slate-400 mb-2">{apoiador.descricao}</p>
                  )}
                  <a
                    href={apoiador.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                  >
                    <ExternalLink size={14} />
                    {apoiador.url}
                  </a>
                  {apoiador.endereco && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {apoiador.endereco}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500">
                    Adicionado por {apoiador.criadoPor} em{" "}
                    {apoiador.createdAt
                      ? new Date(apoiador.createdAt).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalApoiador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setModalApoiador(null); setMenuApoiadorAberto(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-white/10">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-sm font-semibold text-white">{modalApoiador.nome}</h3>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setMenuApoiadorAberto(!menuApoiadorAberto)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                    <MoreVertical size={16} />
                  </button>
                  {menuApoiadorAberto && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-10">
                      <button onClick={() => { handleEditar(modalApoiador); setModalApoiador(null); }} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2">
                        <Edit3 size={14} /> Editar
                      </button>
                      <button onClick={() => { handleExcluir(modalApoiador.id, modalApoiador.nome); setModalApoiador(null); }} className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 flex items-center gap-2">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => { setModalApoiador(null); setMenuApoiadorAberto(false); }} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {modalApoiador.img && (
                <div className="flex justify-center mb-2">
                  <img src={modalApoiador.img} alt={modalApoiador.nome} className="w-20 h-20 object-contain rounded-xl bg-slate-800" />
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Nome</p>
                <p className="text-sm text-white">{modalApoiador.nome}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">URL</p>
                <a href={modalApoiador.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <ExternalLink size={14} /> {modalApoiador.url}
                </a>
              </div>
              {modalApoiador.descricao && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Descrição</p>
                  <p className="text-sm text-slate-200">{modalApoiador.descricao}</p>
                </div>
              )}
              {modalApoiador.endereco && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Endereço</p>
                  <p className="text-sm text-white flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {modalApoiador.endereco}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Ordem</p>
                <p className="text-sm text-white">#{modalApoiador.ordem + 1}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Criado por</p>
                <p className="text-sm text-white">{modalApoiador.criadoPor}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Data</p>
                <p className="text-sm text-white">{modalApoiador.createdAt ? new Date(modalApoiador.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
