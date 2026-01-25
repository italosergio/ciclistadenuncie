import { useState } from "react";
import { useNavigate } from "react-router";
import { ref, set } from "firebase/database";
import { db } from "../lib/firebase";
import type { Route } from "./+types/denunciar";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Registrar Denúncia - Ciclista Denuncie" }];
}

export default function Denunciar() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const createdAt = new Date().toISOString();
    const id = createdAt.replace(/[:.]/g, '-');
    const data = {
      cidade: formData.get("cidade"),
      rua: formData.get("rua"),
      relato: formData.get("relato"),
      localizacao: location,
      createdAt,
    };

    try {
      await set(ref(db, `denuncias/${id}`), data);
      navigate("/sucesso");
    } catch (error) {
      alert("Erro ao registrar denúncia");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Registrar Denúncia</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Cidade *</label>
            <input
              type="text"
              name="cidade"
              required
              className="w-full p-3 border rounded-lg dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Rua *</label>
            <input
              type="text"
              name="rua"
              required
              className="w-full p-3 border rounded-lg dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Relato *</label>
            <textarea
              name="relato"
              required
              rows={6}
              className="w-full p-3 border rounded-lg dark:bg-gray-800"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={getLocation}
              className="w-full p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {location ? `📍 Localização capturada (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : "📍 Capturar Localização"}
            </button>
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
