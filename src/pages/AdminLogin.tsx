import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, getDocs, limit, query, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Terminal, Lock, Mail, User, AlertCircle, KeyRound, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export const AdminLogin: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstAdmin, setIsFirstAdmin] = useState<boolean>(false);

  const { user, isAdmin, loading, loginLocally } = useAuth();
  const navigate = useNavigate();

  const handleLocalBypass = () => {
    if (loginLocally) {
      loginLocally(name || "Coordinator Admin", email || "admin@edutech.com");
      navigate("/admin/dashboard");
    }
  };

  // Check if first admin needs bootstrapping
  useEffect(() => {
    const checkFirstAdmin = async () => {
      try {
        const q = query(collection(db, "admins"), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          setIsFirstAdmin(true);
          setIsSignUp(true); // Default to sign up for first admin
        } else {
          setIsFirstAdmin(false);
        }
      } catch (err) {
        console.error("Error checking first admin:", err);
      }
    };
    checkFirstAdmin();
  }, [user]);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        // Registering a new admin
        if (!name.trim()) {
          throw new Error("Display Name is required.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const currentUser = userCredential.user;
        
        // Update auth profile
        await updateProfile(currentUser, { displayName: name });

        // Add to admins collection in Firestore
        await setDoc(doc(db, "admins", currentUser.uid), {
          name: name,
          email: email,
          role: "admin",
          createdAt: new Date().toISOString()
        });

        navigate("/admin/dashboard");
      } else {
        // Sign In
        const credential = await signInWithEmailAndPassword(auth, email, password);
        
        // Force checking if they are indeed an admin
        const adminDocRef = doc(db, "admins", credential.user.uid);
        const adminSnap = await getDoc(adminDocRef);
        const userIsAdmin = adminSnap.exists();
        
        if (!userIsAdmin) {
          setError("Access Denied: You do not possess structural administrator clearance.");
          await auth.signOut();
        } else {
          navigate("/admin/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/user-not-found") {
        setError("Invalid credentials. If this is your first load, please toggle Register.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password sign-in provider is disabled in Firebase. Go to Firebase Console -> Authentication -> Sign-in Method to enable it, OR use the 'Bypass with Local Sandbox Session' button below to continue testing immediately.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-6 bg-white">
      <div className="max-w-md w-full bg-white border border-gray-100 p-8 sm:p-10 rounded-[24px] shadow-sm relative">
        
        {/* Brand */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
            <Terminal className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isSignUp ? "Create Admin Credentials" : "Admin Security Access"}
            </h1>
            <p className="text-xs text-gray-500">
              {isFirstAdmin 
                ? "No admins registered yet. Bootstrap yourself as the lead coordinator!" 
                : "Enter your secure credentials to manage courses and certificates."
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2 items-start">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Administrator Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="E.g., Prof. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="admin@edutech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? "Processing..." : isSignUp ? "Bootstrap Admin Account" : "Secure Log In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {!isFirstAdmin && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              {isSignUp ? "Possess an account? Log In" : "Need to register? Create Admin"}
            </button>
          </div>
        )}

        {/* Local Bypass Option */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-3">
            Having trouble with Firebase Auth configuration?
          </p>
          <button
            type="button"
            onClick={handleLocalBypass}
            className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-all border border-gray-200 flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-gray-500" />
            Bypass with Local Sandbox Session
          </button>
        </div>

      </div>
    </div>
  );
};
