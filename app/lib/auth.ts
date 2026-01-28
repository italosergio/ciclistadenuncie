import { ref, set, get } from "firebase/database";
import { db, auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import bcrypt from "bcryptjs";
import { registrarEvento } from "./historico";

export async function registerUser(username: string, password: string) {
  // Cria usuário no Firebase Auth (email fake baseado no username)
  const email = `${username}@ciclistadenuncie.local`;
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  
  // Salva dados adicionais no Realtime Database
  const userRef = ref(db, `usuarios/${uid}`);
  await set(userRef, {
    username,
    email,
    role: "usuario",
    createdAt: new Date().toISOString(),
  });
  
  // Registra evento
  await registrarEvento({
    tipo: 'criar_conta',
    usuario: username,
  });
  
  // Faz logout após criar conta para forçar novo login
  await signOut(auth);
  
  return { uid, username, role: "usuario" };
}

export async function loginUser(username: string, password: string) {
  // Login com Firebase Auth
  const email = `${username}@ciclistadenuncie.local`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  
  // Busca role do usuário
  const userRef = ref(db, `usuarios/${uid}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) {
    throw new Error("Dados do usuário não encontrados");
  }
  
  const userData = snapshot.val();
  
  // Registra evento
  await registrarEvento({
    tipo: 'login',
    usuario: userData.username,
  });
  
  // Retorna token JWT (gerado automaticamente pelo Firebase)
  const token = await userCredential.user.getIdToken();
  
  return { 
    uid,
    username: userData.username, 
    role: userData.role || "usuario",
    token 
  };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    throw new Error("Usuário não autenticado");
  }
  
  try {
    // Reautentica antes de mudar senha
    const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
    await reauthenticateWithCredential(currentUser, credential);
    
    // Muda a senha
    await updatePassword(currentUser, newPassword);
    
    // Busca username para registrar evento
    const userRef = ref(db, `usuarios/${currentUser.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      await registrarEvento({
        tipo: 'alterar_senha',
        usuario: userData.username,
      });
    }
  } catch (error: any) {
    // Propaga o erro com código para tratamento no componente
    throw error;
  }
}

export async function getCurrentUser() {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  
  const userRef = ref(db, `usuarios/${currentUser.uid}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) return null;
  
  const userData = snapshot.val();
  const token = await currentUser.getIdToken();
  
  return {
    uid: currentUser.uid,
    username: userData.username,
    role: userData.role || "usuario",
    token
  };
}

export async function getUserData(uid: string) {
  const userRef = ref(db, `usuarios/${uid}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const userData = snapshot.val();
  return {
    uid,
    username: userData.username,
    role: userData.role || "usuario",
    createdAt: userData.createdAt,
  };
}
