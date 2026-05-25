import { ref, push } from "firebase/database";
import { db } from "./firebase";

export async function registrarEvento(evento: {
  tipo: 'criar_conta' | 'login' | 'logout' | 'excluir_denuncia' | 'adicionar_denuncia' | 'modificar_role' | 'adicionar_iniciativa' | 'excluir_iniciativa' | 'editar_iniciativa' | 'adicionar_apoiador' | 'excluir_apoiador' | 'editar_apoiador' | 'responder_contato' | 'resolver_contato' | 'marcar_pendente_contato' | 'ler_contato' | 'enviar_contato' | 'banir_usuario' | 'desbanir_usuario' | 'excluir_usuario' | 'editar_denuncia' | 'alterar_senha' | 'alterar_username' | 'excluir_conta' | 'excluir_contato' | 'adicionar_email';
  usuario: string;
  detalhes?: any;
}) {
  const historicoRef = ref(db, 'historico');
  await push(historicoRef, {
    ...evento,
    timestamp: new Date().toISOString(),
  });
}
