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
import type { AuthUser, AuthContextType } from "../types/entities/account.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funciones para manejar cookies de autenticación
const setAuthCookies = (
  token: string,
  userType: string,
  rememberMe: boolean = false
) => {
  const maxAge = rememberMe ? 2592000 : 86400; // 30 días si rememberMe, 1 día si no
  // Configurar cookies para el middleware
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user-type=${userType}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const clearAuthCookies = () => {
  document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `user-type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Primero obtener el token para acceder a custom claims
          const tokenResult = await firebaseUser.getIdTokenResult();
          const customClaims = tokenResult.claims;

          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "cuentas", firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Priorizar custom claims sobre datos de Firestore
            const userType =
              customClaims.userType || customClaims.role || userData.type;

            const userInfo = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              type: userType,
              companyName: customClaims.companyName || userData.companyName,
              adminId: customClaims.adminId || userData.adminId,
            };

            setUser(userInfo);

            // Configurar cookies para el middleware — force refresh garantiza
            // un token fresco con ~1h de vida, evitando loops de 401 por JWT expirado
            const freshToken = await firebaseUser.getIdToken(true);
            setAuthCookies(freshToken, userType, false); // Default no remember

            // Si el usuario no tiene custom claims pero tiene tipo en Firestore,
            // configurar los claims automáticamente
            if (!customClaims.userType && userData.type) {
              try {
                const rawToken = tokenResult.token;
                await fetch("/api/auth/setup-user-claims", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${rawToken}`,
                  },
                  body: JSON.stringify({
                    userId: firebaseUser.uid,
                    userData: {
                      name: userData.name || "Usuario",
                      email: userData.email,
                      type: userData.type,
                      companyName: userData.companyName,
                      adminId: userData.adminId,
                    },
                  }),
                  credentials: "include",
                });
              } catch (claimsError) {
                console.warn("⚠️ Could not set custom claims:", claimsError);
                // No bloquear el login si no se pueden establecer los claims
              }
            }
          } else {
            console.warn("⚠️ User document not found for:", firebaseUser.uid);
            // Si no existe el documento del usuario, crear uno básico
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              type:
                (customClaims.userType as "borrower" | "companyAdmin" | "lender" | "superAdmin") ||
                "borrower",
              companyName: undefined,
              adminId: undefined,
            });
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

  // Función para obtener mensaje de error específico
  const getErrorMessage = (error: any) => {
    switch (error?.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email o contraseña incorrectos";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Intenta más tarde";
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada";
      case "auth/invalid-email":
        return "Email inválido";
      case "auth/network-request-failed":
        return "Error de conexión. Verifica tu internet";
      case "auth/timeout":
        return "Tiempo de espera agotado. Intenta nuevamente";
      default:
        return "Error al iniciar sesión. Intenta nuevamente";
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 10000);
      });

      const loginPromise = signInWithEmailAndPassword(auth, email, password);
      const userCredential = (await Promise.race([
        loginPromise,
        timeoutPromise,
      ])) as any;
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "cuentas", userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Configurar cookies con la opción rememberMe
        const token = await userCredential.user.getIdToken();
        setAuthCookies(token, userData.type, rememberMe);

        // Redirección basada en el tipo de usuario
        switch (userData.type) {
          case "superAdmin":
            router.push("/super_admin_dashboard");
            break;
          case "companyAdmin":
            if (!userData.companyName) {
              throw new Error("Cuenta de administrador no válida");
            }
            router.push("/admin_dashboard");
            break;
          case "lender":
            if (!userData.adminId) {
              throw new Error("Cuenta de prestamista no válida");
            }
            router.push("/lender");
            break;
          case "borrower":
            router.push("/user_dashboard");
            break;
          default:
            throw new Error("Tipo de cuenta no válido");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      await firebaseSignOut(auth);
      setError(getErrorMessage(error));
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

      // Configuración personalizada para el email
      const actionCodeSettings = {
        url: `${window.location.origin}/login?message=password-reset`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido");
      } else if (error.code === "auth/too-many-requests") {
        setError("Demasiadas solicitudes. Intenta más tarde");
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
