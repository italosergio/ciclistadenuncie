import { useState, useEffect, useRef } from "react";
import { ref, onValue, push, remove, set } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";
import { Plus, Trash2, ExternalLink, MapPin, Search, Edit3, Heart, GripVertical } from "lucide-react";

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
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Apoiadores</h2>
        <p className="text-gray-400">Carregando apoiadores...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          Apoiadores ({apoiadores.length})
        </h2>
        <button
          onClick={() => { if (editandoId) { handleCancelarEdicao(); } else { setShowForm(!showForm); } }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
        >
          <Plus size={18} />
          {showForm ? (editandoId ? "Cancelar Edição" : "Cancelar") : "Novo Apoiador"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">{editandoId ? "Editar Apoiador" : "Novo Apoiador"}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Nome do apoiador *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Massa Crítica São Paulo"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                URL (Instagram, site...) *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/..."
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Caminho da imagem (opcional)
              </label>
              <input
                type="text"
                value={img}
                onChange={(e) => setImg(e.target.value)}
                placeholder="/apoiadores/nomedoapoioador.png"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para definir automaticamente com base no nome
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição do apoiador..."
                rows={3}
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Endereço / Local (para aparecer no mapa)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Porto Alegre, RS"
                  className="flex-1 p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
                />
                <button
                  onClick={buscarEndereco}
                  disabled={!endereco.trim() || buscando}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 flex items-center gap-1"
                >
                  <Search size={16} />
                  {buscando ? "..." : "Buscar"}
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Localização no mapa</label>
              <p className="text-xs text-gray-500 mb-2">Clique no mapa para marcar o ponto ou arraste o marcador para ajustar</p>
              <div
                ref={mapRef}
                className="w-full h-56 rounded-lg border border-gray-600 z-0"
                style={{ cursor: 'crosshair' }}
              />
            </div>
            <button
              onClick={handleSalvar}
              disabled={!nome.trim() || !url.trim() || salvando}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando..." : (editandoId ? "Atualizar Apoiador" : "Salvar Apoiador")}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {apoiadores.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <Heart size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nenhum apoiador cadastrado ainda</p>
          <p className="text-gray-500 text-sm mt-2">
            Clique em "Novo Apoiador" para adicionar o primeiro
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apoiadores.map((apoiador, index) => (
            <div
              key={apoiador.id}
              className={`bg-gray-800 p-6 rounded-xl shadow-lg border ${reordenando ? 'border-blue-500' : 'border-gray-700'}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDrop}
              onDragOver={(e) => e.preventDefault()}
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
                    <h3 className="text-xl font-bold text-white break-words">
                      {apoiador.nome}
                    </h3>
                  </div>
                  {apoiador.descricao && (
                    <p className="text-gray-400 text-sm mb-3">{apoiador.descricao}</p>
                  )}
                  <a
                    href={apoiador.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <ExternalLink size={14} />
                    {apoiador.url}
                  </a>
                  {apoiador.endereco && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      {apoiador.endereco}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Adicionado por {apoiador.criadoPor} em{" "}
                    {apoiador.createdAt
                      ? new Date(apoiador.createdAt).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditar(apoiador)}
                    className="text-blue-400 hover:text-blue-300 p-2 flex-shrink-0"
                    title="Editar apoiador"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setExcluindoId(excluindoId === apoiador.id ? null : apoiador.id)
                    }
                    className="text-red-400 hover:text-red-300 p-2 flex-shrink-0"
                    title="Excluir apoiador"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {excluindoId === apoiador.id && (
                <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-400 mb-3">
                    Tem certeza que deseja excluir o apoiador "{apoiador.nome}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExcluir(apoiador.id, apoiador.nome)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                    >
                      Confirmar Exclusão
                    </button>
                    <button
                      onClick={() => setExcluindoId(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
