import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import type { Route } from "./+types/mapa";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mapa de Denúncias - Ciclista Denuncie" }];
}

interface Denuncia {
  cidade: string;
  rua: string;
  relato: string;
  localizacao?: { lat: number; lng: number };
  createdAt: string;
}

export default function Mapa() {
  const [denuncias, setDenuncias] = useState<Record<string, Denuncia>>({});
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [cidade, setCidade] = useState("");
  const [center, setCenter] = useState<[number, number]>([-14.235, -51.925]);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    const denunciasRef = ref(db, "denuncias");
    const unsubscribe = onValue(denunciasRef, (snapshot) => {
      setDenuncias(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    import("react-leaflet-cluster/dist/assets/MarkerCluster.css");
    import("react-leaflet-cluster/dist/assets/MarkerCluster.Default.css");
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      import("react-leaflet-cluster")
    ]).then(([reactLeaflet, L, cluster]) => {
      const { MapContainer, TileLayer, Marker, Popup } = reactLeaflet;
      const MarkerClusterGroup = cluster.default;
      
      const icon = L.default.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      setMapComponent(() => ({ denuncias, center, zoom }: { denuncias: [string, Denuncia][], center: [number, number], zoom: number }) => (
        <MapContainer center={center} zoom={zoom} style={{ flex: 1 }} key={`${center[0]}-${center[1]}-${zoom}`}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={80}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {denuncias.map(([id, denuncia]) => (
              <Marker
                key={id}
                position={[denuncia.localizacao!.lat, denuncia.localizacao!.lng]}
                icon={icon}
              >
                <Popup>
                  <strong>{denuncia.cidade}</strong><br />
                  {denuncia.rua}<br />
                  <small>{denuncia.relato}</small>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      ));
    });
  }, []);

  const denunciasComLocalizacao = Object.entries(denuncias).filter(
    ([_, d]) => d.localizacao
  );

  async function buscarCidade() {
    if (!cidade.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cidade)}&country=Brazil&format=json&limit=1`
      );
      const data = await response.json();
      
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

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-black dark:bg-white text-white dark:text-black space-y-3">
        <h1 className="text-2xl font-bold">Mapa de Denúncias</h1>
        <p className="text-sm">{denunciasComLocalizacao.length} denúncias com localização</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por cidade..."
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarCidade()}
            className="flex-1 p-2 rounded text-black"
          />
          <button
            onClick={buscarCidade}
            className="px-4 py-2 bg-white dark:bg-black text-black dark:text-white rounded font-semibold"
          >
            Procurar
          </button>
        </div>
      </div>
      
      {MapComponent ? (
        <MapComponent denuncias={denunciasComLocalizacao} center={center} zoom={zoom} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p>Carregando mapa...</p>
        </div>
      )}
    </div>
  );
}
