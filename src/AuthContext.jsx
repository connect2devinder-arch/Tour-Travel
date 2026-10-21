import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { firebaseAuth, googleProvider } from "./firebase.js";
import { isAdminUser } from "./blog.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setChecking(false);
      return undefined;
    }
    return onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      setAdmin(await isAdminUser(currentUser));
      setChecking(false);
    });
  }, []);

  const value = useMemo(() => ({
    user,
    isAdmin: admin,
    checking,
    signOut: firebaseSignOut,
    signInWithGoogle: async () => {
      if (!firebaseAuth) throw new Error("Firebase sign-in is not configured for this build.");
      await signInWithPopup(firebaseAuth, googleProvider);
    },
  }), [user, admin, checking]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext) ?? { user: null, isAdmin: false, checking: true, signOut: firebaseSignOut };
}
