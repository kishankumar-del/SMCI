import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Courses } from "./pages/Courses";
import { CertificateVerification } from "./pages/CertificateVerification";
import { Contact } from "./pages/Contact";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { seedInitialData } from "./utils/seed";

export default function App() {
  // Seed the initial data on mount if collections are empty
  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Website Layout Pages */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="courses" element={<Courses />} />
              <Route path="verify" element={<CertificateVerification />} />
              <Route path="contact" element={<Contact />} />
              
              {/* Admin Authentication Gate */}
              <Route path="admin" element={<AdminLogin />} />
            </Route>

            {/* Separate Admin Dashboard Panel (Route-protected internally) */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Analytics />
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}
