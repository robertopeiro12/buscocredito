import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../app/firebase";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { User, AuthContextType } from "../types/entities/user.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funciones para manejar cookies de autenticación
const setAuthCookies = (token: string, userType: string) => {
  // Configurar cookies para el middleware
  document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `user-type=${userType}; path=/; max-age=86400; SameSite=Lax`;
};

const clearAuthCookies = () => {
  document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `user-type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "cuentas", firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userInfo = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              type: userData.type,
              Empresa: userData.Empresa,
              Empresa_id: userData.Empresa_id,
            };
            
            setUser(userInfo);
            
            // Configurar cookies para el middleware
            const token = await firebaseUser.getIdToken();
            setAuthCookies(token, userData.type);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Error al cargar los datos del usuario");
        }
      } else {
        setUser(null);
        clearAuthCookies();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "cuentas", userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Redirección basada en el tipo de usuario
        switch (userData.type) {
          case "b_admin":
            if (!userData.Empresa) {
              throw new Error("Cuenta de administrador no válida");
            }
            router.push("/admin_dashboard");
            break;
          case "b_sale":
            if (!userData.Empresa_id) {
              throw new Error("Cuenta de vendedor no válida");
            }
            router.push("/lender");
            break;
          case "user":
            router.push("/user_dashboard");
            break;
          default:
            throw new Error("Tipo de cuenta no válido");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      await firebaseSignOut(auth);
      setError("Correo o contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      clearAuthCookies();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Error al cerrar sesión");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido");
      } else {
        setError("Ocurrió un error al enviar el correo de recuperación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
