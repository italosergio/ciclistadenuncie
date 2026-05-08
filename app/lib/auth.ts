import { ref, set, get } from "firebase/database";
import { db, auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { registrarEvento } from "./historico";

export async function registerUser(username: string, password: string, email: string) {
  // Verifica se email já está em uso
  const methods = await fetchSignInMethodsForEmail(auth, email);
  if (methods.length > 0) throw { code: 'auth/email-already-in-use' };

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  
  const userRef = ref(db, `usuarios/${uid}`);
  await set(userRef, {
    username,
    email,
    role: "usuario",
    createdAt: new Date().toISOString(),
  });
  
  await registrarEvento({ tipo: 'criar_conta', usuario: username });
  await signOut(auth);
  
  return { uid, username, role: "usuario" };
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function loginUser(username: string, password: string) {
  // Busca email real pelo username
  const usuariosRef = ref(db, 'usuarios');
  const snapshot = await get(usuariosRef);
  
  if (!snapshot.exists()) throw { code: 'auth/user-not-found' };
  
  let email: string | null = null;
  let userData: any = null;
  let uid: string | null = null;

  snapshot.forEach((child) => {
    const data = child.val();
    if (data.username === username) {
      email = data.email;
      userData = data;
      uid = child.key;
    }
  });

  if (!email) throw { code: 'auth/user-not-found' };

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  await registrarEvento({ tipo: 'login', usuario: userData.username });
  
  const token = await userCredential.user.getIdToken();
  
  return { 
    uid: userCredential.user.uid,
    username: userData.username, 
    role: userData.role || "usuario",
    email,
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
    email: userData.email || null,
    token
  };
}

export async function updateUserEmail(newEmail: string, password: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Usuário não autenticado");

  // Reautentica com email atual
  const { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } = await import('firebase/auth');
  const credential = EmailAuthProvider.credential(currentUser.email!, password);
  await reauthenticateWithCredential(currentUser, credential);

  // Atualiza email no Firebase Auth (envia verificação)
  await verifyBeforeUpdateEmail(currentUser, newEmail);

  // Atualiza no banco
  const userRef = ref(db, `usuarios/${currentUser.uid}`);
  await import('firebase/database').then(({ update }) => update(userRef, { email: newEmail }));
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
