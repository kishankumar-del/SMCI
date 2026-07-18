import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from "firebase/firestore";
import { auth, db } from "../firebase/config";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminName: string;
  loading: boolean;
  logout: () => Promise<void>;
  loginLocally?: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localAdmin, setLocalAdmin] = useState<{ uid: string; email: string; name: string } | null>(() => {
    const saved = localStorage.getItem("local_admin_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (localAdmin) {
      setUser({
        uid: localAdmin.uid,
        email: localAdmin.email,
        displayName: localAdmin.name,
        emailVerified: true,
      } as any);
      setIsAdmin(true);
      setAdminName(localAdmin.name);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if this user is in the admins collection
          const adminDocRef = doc(db, "admins", currentUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            setIsAdmin(true);
            setAdminName(adminDocSnap.data().name || currentUser.displayName || "Admin");
          } else {
            // Check if there are any admins at all. If the admin collection is empty,
            // bootstrap this first logged-in user as an admin to make setup painless.
            const adminsQuery = query(collection(db, "admins"), limit(1));
            const adminsSnap = await getDocs(adminsQuery);
            
            if (adminsSnap.empty) {
              // Create admin doc
              const newAdminData = {
                name: currentUser.displayName || currentUser.email?.split("@")[0] || "Admin",
                email: currentUser.email || "",
                role: "admin",
                createdAt: new Date().toISOString()
              };
              await setDoc(adminDocRef, newAdminData);
              setIsAdmin(true);
              setAdminName(newAdminData.name);
              console.log("No admins found. Bootstrapped first admin:", currentUser.email);
            } else {
              setIsAdmin(false);
              setAdminName("");
            }
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setIsAdmin(false);
          setAdminName("");
        }
      } else {
        setIsAdmin(false);
        setAdminName("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [localAdmin]);

  const loginLocally = (name: string, email: string) => {
    const adminObj = { uid: "local-admin-dev", email, name };
    localStorage.setItem("local_admin_session", JSON.stringify(adminObj));
    setLocalAdmin(adminObj);
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem("local_admin_session");
    setLocalAdmin(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error", e);
    }
    setUser(null);
    setIsAdmin(false);
    setAdminName("");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminName, loading, logout, loginLocally }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
