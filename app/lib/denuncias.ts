import { ref, set } from "firebase/database";
import { db } from "./firebase";

export interface DenunciaData {
  endereco: string;
  relato: string;
  tipo: string;
  placa?: string;
  localizacao: { lat: number; lng: number } | null;
}

export async function salvarDenuncia(data: DenunciaData) {
  const agora = new Date();
  const horarioBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const createdAt = horarioBrasilia.toISOString();
  const id = createdAt.replace(/[:.]/g, '-');

  const denunciaData: any = {
    endereco: data.endereco,
    relato: data.relato,
    tipo: data.tipo,
    localizacao: data.localizacao,
    createdAt,
  };

  if (data.placa) {
    denunciaData.placa = data.placa;
  }

  await set(ref(db, `denuncias/${id}`), denunciaData);
}
