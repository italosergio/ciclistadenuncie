import { ref, set, get, remove } from "firebase/database";
import { db } from "./firebase";
import { registrarEvento } from "./historico";

export interface DenunciaData {
  endereco: string;
  relato: string | string[];
  tipo: string;
  placa?: string;
  localizacao: { lat: number; lng: number } | null;
  userId?: string;
  username?: string;
}

export async function salvarDenuncia(data: DenunciaData) {
  const agora = new Date();
  const createdAt = agora.toISOString();
  // Converte para horário de Brasília (UTC-3)
  const brasiliaTime = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const ano = brasiliaTime.getFullYear();
  const mes = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const dia = String(brasiliaTime.getDate()).padStart(2, '0');
  const hora = String(brasiliaTime.getHours()).padStart(2, '0');
  const min = String(brasiliaTime.getMinutes()).padStart(2, '0');
  const seg = String(brasiliaTime.getSeconds()).padStart(2, '0');
  const ms = String(brasiliaTime.getMilliseconds()).padStart(3, '0');
  const id = `${ano}-${mes}-${dia}T${hora}-${min}-${seg}-${ms}Z`;

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

  if (data.userId) {
    denunciaData.userId = data.userId;
  }

  if (data.username) {
    denunciaData.username = data.username;
  }

  await set(ref(db, `denuncias/${id}`), denunciaData);
  
  // Registra evento
  const eventoDetalhes: any = {
    tipo: data.tipo,
    endereco: data.endereco,
    relato: typeof data.relato === 'string' ? data.relato : '',
    id,
  };
  
  if (data.placa) {
    eventoDetalhes.placa = data.placa;
  }
  
  await registrarEvento({
    tipo: 'adicionar_denuncia',
    usuario: data.username || 'Anônimo',
    detalhes: eventoDetalhes,
  });
}

export async function editarDenuncia(id: string, novoRelato: string, username: string) {
  const denunciaRef = ref(db, `denuncias/${id}`);
  const snapshot = await get(denunciaRef);
  
  if (!snapshot.exists()) {
    throw new Error('Denúncia não encontrada');
  }
  
  const denuncia = snapshot.val();
  const relatoAtual = denuncia.relato;
  
  const relatoAnterior = Array.isArray(relatoAtual) 
    ? (typeof relatoAtual[relatoAtual.length - 1] === 'string' 
        ? relatoAtual[relatoAtual.length - 1] 
        : relatoAtual[relatoAtual.length - 1].texto)
    : relatoAtual;
  
  const relatoArray = Array.isArray(relatoAtual) ? relatoAtual : [relatoAtual];
  const timestamp = new Date().toISOString();
  
  relatoArray.push({
    texto: novoRelato,
    editadoEm: timestamp
  });
  
  await set(denunciaRef, {
    ...denuncia,
    relato: relatoArray
  });
  
  await registrarEvento({
    tipo: 'editar_denuncia',
    usuario: username,
    detalhes: {
      id,
      relatoAnterior,
      relatoNovo: novoRelato,
      timestamp
    },
  });
}

export async function excluirDenuncia(id: string, username: string, motivo: string) {
  const denunciaRef = ref(db, `denuncias/${id}`);
  const snapshot = await get(denunciaRef);
  const denunciaData = snapshot.exists() ? snapshot.val() : null;
  
  await remove(denunciaRef);
  
  await registrarEvento({
    tipo: 'excluir_denuncia',
    usuario: username,
    detalhes: {
      id,
      motivo,
      denuncia: denunciaData
    },
  });
}
