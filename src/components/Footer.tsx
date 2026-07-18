import React from "react";
import { Link } from "react-router-dom";
import { Terminal, Github, Linkedin, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827]">
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
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Modern computer coaching center committed to delivering hands-on coding and tech skills for future-ready careers.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-colors shadow-sm">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-colors shadow-sm">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-colors shadow-sm">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-colors shadow-sm">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wider mb-5">
              Coaching Center
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Our Courses
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Verify Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Contact info */}
          <div>
            <h4 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wider mb-5">
              Contact Details
            </h4>
            <ul className="space-y-3.5">
              <li className="flex gap-2.5 items-start text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-2.5 items-center text-sm text-gray-500">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex gap-2.5 items-center text-sm text-gray-500">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-200/60 my-10" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} {settings.centerName}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
