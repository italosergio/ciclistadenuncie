import { ref, push } from "firebase/database";
import { db } from "./firebase";

export async function registrarEvento(evento: {
  tipo: 'criar_conta' | 'login' | 'logout' | 'excluir_denuncia' | 'adicionar_denuncia' | 'modificar_role';
  usuario: string;
  detalhes?: any;
}) {
  const historicoRef = ref(db, 'historico');
  await push(historicoRef, {
    ...evento,
    timestamp: new Date().toISOString(),
  });
}
