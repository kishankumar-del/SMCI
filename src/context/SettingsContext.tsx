import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export interface CoachingCenterSettings {
  centerName: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
}

interface SettingsContextType {
  settings: CoachingCenterSettings;
  updateSettings: (newSettings: CoachingCenterSettings) => Promise<void>;
  loading: boolean;
}

const defaultSettings: CoachingCenterSettings = {
  centerName: "EduTech Coaching",
  address: "102 Tech Plaza, IT Hub sector, Near Metro Station, NY 10001",
  phone: "+1 (555) 234-5678",
  email: "contact@edutechcoaching.com",
  workingHours: "Monday - Friday: 8:00 AM - 8:00 PM | Saturday: 9:00 AM - 5:00 PM (Sunday Closed)",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CoachingCenterSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "coaching_center");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          centerName: data.centerName || defaultSettings.centerName,
          address: data.address || defaultSettings.address,
          phone: data.phone || defaultSettings.phone,
          email: data.email || defaultSettings.email,
          workingHours: data.workingHours || defaultSettings.workingHours,
        });
      } else {
        // Automatically bootstrap settings in Firestore if it doesn't exist
        setDoc(docRef, defaultSettings).catch((err) => {
          console.warn("Bootstrap settings error (non-fatal):", err);
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error subscribing to coaching center settings:", err);
      // Fallback if permission error or offline
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: CoachingCenterSettings) => {
    const docRef = doc(db, "settings", "coaching_center");
    await setDoc(docRef, newSettings);
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
