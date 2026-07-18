import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Terminal, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { settings } = useSettings();

  // Handle scroll to add backdrop-blur and border
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Certificate Verification", path: "/verify" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100/80 shadow-sm"
          : "bg-white/50 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group min-w-0 shrink mr-4">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105 shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] truncate">
              {(() => {
                const parts = settings.centerName.split(" ");
                if (parts.length > 1) {
                  return (
                    <>
                      {parts[0]}<span className="text-[#2563EB]"> {parts.slice(1).join(" ")}</span>
                    </>
                  );
                }
                return settings.centerName;
              })()}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors relative py-2 whitespace-nowrap ${
                  isActive(link.path)
                    ? "text-[#2563EB]"
                    : "text-gray-500 hover:text-[#2563EB]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions: Portal / Admin link */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <Link
              to="/verify"
              className="px-5 py-2 bg-[#111827] text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
            >
              Verify Portal
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-xl py-6 px-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-50/50 text-[#2563EB]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            <Link
              to="/verify"
              className="flex items-center justify-center gap-1.5 w-full px-5 py-3 rounded-xl bg-[#111827] text-white text-sm font-medium hover:bg-gray-800 transition-all shadow-sm"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
