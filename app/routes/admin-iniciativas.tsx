import { useState, useEffect } from "react";
import { ref, onValue, push, remove } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { registrarEvento } from "../lib/historico";
import { Plus, Trash2, ExternalLink, Globe, MapPin, Search } from "lucide-react";

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
            criadoPor: value.criadoPor || "Desconhecido",
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

  async function handleSalvar() {
    if (!nome.trim() || !url.trim() || !user?.username) return;

    setSalvando(true);
    try {
      const iniciativasRef = ref(db, "iniciativas");
      const novoRef = await push(iniciativasRef, {
        nome: nome.trim(),
        url: url.trim(),
        descricao: descricao.trim(),
        endereco: endereco.trim(),
        ...(lat && lng ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        } : {}),
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

      setNome("");
      setUrl("");
      setDescricao("");
      setEndereco("");
      setLat("");
      setLng("");
      setShowForm(false);
    } catch (error: any) {
      alert("Erro ao salvar iniciativa: " + error.message);
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
      alert("Erro ao excluir iniciativa: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Iniciativas Cicloativistas</h2>
        <p className="text-gray-400">Carregando iniciativas...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          Iniciativas Cicloativistas ({iniciativas.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
        >
          <Plus size={18} />
          {showForm ? "Cancelar" : "Nova Iniciativa"}
        </button>
      </div>

      {/* Formulário de nova iniciativa */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Nova Iniciativa Cicloativista</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Nome da iniciativa *
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
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição da iniciativa..."
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
                placeholder="Ex: São Paulo, SP"
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
          {(lat || lng) && (
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
          )}
          <button
            onClick={handleSalvar}
            disabled={!nome.trim() || !url.trim() || salvando}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando..." : "Salvar Iniciativa"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de iniciativas */}
      {iniciativas.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <Globe size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nenhuma iniciativa cicloativista cadastrada ainda</p>
          <p className="text-gray-500 text-sm mt-2">
            Clique em "Nova Iniciativa" para adicionar a primeira
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {iniciativas.map((iniciativa) => (
            <div
              key={iniciativa.id}
              className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 break-words">
                    {iniciativa.nome}
                  </h3>
                  {iniciativa.descricao && (
                    <p className="text-gray-400 text-sm mb-3">{iniciativa.descricao}</p>
                  )}
                  <a
                    href={iniciativa.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <ExternalLink size={14} />
                    {iniciativa.url}
                  </a>
                  {iniciativa.endereco && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      {iniciativa.endereco}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Adicionado por {iniciativa.criadoPor} em{" "}
                    {iniciativa.createdAt
                      ? new Date(iniciativa.createdAt).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExcluindoId(excluindoId === iniciativa.id ? null : iniciativa.id)
                  }
                  className="text-red-400 hover:text-red-300 p-2 flex-shrink-0"
                  title="Excluir iniciativa"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {excluindoId === iniciativa.id && (
                <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-400 mb-3">
                    Tem certeza que deseja excluir a iniciativa "{iniciativa.nome}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExcluir(iniciativa.id, iniciativa.nome)}
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
