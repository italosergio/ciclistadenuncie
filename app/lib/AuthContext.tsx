import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUser } from "./auth";
import { ref, onValue } from "firebase/database";
import { registrarEvento } from "./historico";

interface AuthContextType {
  user: { uid: string; username: string; role: string; token: string } | null;
  loading: boolean;
  login: (userData: { uid: string; username: string; role: string; token: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  banido: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; username: string; role: string; token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [banido, setBanido] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
            
            // Monitora se o usuário foi banido
            const userRef = ref(db, `usuarios/${userData.uid}`);
            onValue(userRef, (snapshot) => {
              const data = snapshot.val();
              if (data?.banido) {
                setBanido(true);
                setUser(null);
                auth.signOut();
              }
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: { uid: string; username: string; role: string; token: string }) => {
    setUser(userData);
  };

  const logout = async () => {
    if (user) {
      try {
        await registrarEvento({
          tipo: 'logout',
          usuario: user.username,
        });
      } catch (error) {
        console.error('Erro ao registrar logout:', error);
      }
    }
    setUser(null);
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "administrador",
        banido,
      }}
    >
      {banido && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-red-600 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Conta Banida</h2>
            <p className="text-gray-300 mb-6">
              Sua conta foi banida. Entre em contato com o administrador para mais informações.
            </p>
            <button
              onClick={() => {
                setBanido(false);
                window.location.href = "/";
              }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
