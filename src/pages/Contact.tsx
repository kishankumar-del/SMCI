import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useSettings } from "../context/SettingsContext";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "contacts"), {
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);
      setFormData({ name: "", phone: "", message: "" });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      console.error("Inquiry submit error:", err);
      setError("We encountered an error recording your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfos = [
    {
      icon: <MapPin className="w-5 h-5 text-[#2563EB]" />,
      title: "Our Physical Location",
      desc: settings.address
    },
    {
      icon: <Phone className="w-5 h-5 text-[#2563EB]" />,
      title: "Phone Support & Counselors",
      desc: settings.phone
    },
    {
      icon: <Mail className="w-5 h-5 text-[#2563EB]" />,
      title: "Direct Email Address",
      desc: settings.email
    },
    {
      icon: <Clock className="w-5 h-5 text-[#2563EB]" />,
      title: "Coaching Center Working Hours",
      desc: settings.workingHours
    }
  ];

  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Connect With Us</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Have questions about batches, fees, or course structures? Submit an inquiry and our coordinators will reach out in under 24 hours.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left contact card items */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Center Information</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Walk in anytime during laboratory working hours to inspect our systems configurations, meet our faculty, and attend a free trial programming session!
              </p>
            </div>

            <div className="space-y-6">
              {contactInfos.map((info, idx) => (
                <div key={idx} className="flex gap-4 items-start text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    {info.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#111827]">{info.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{info.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right inquiry form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[24px] border border-gray-100 shadow-sm">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Inquiry Recorded Successfully!</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Thank you for writing to us. Our admissions desk has received your request and will follow up with you on the telephone number provided.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#111827] tracking-tight">Submit an Inquiry</h3>
                  <p className="text-xs text-gray-400 mt-1">Please enter correct, active telephone details.</p>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-4.5 text-left">
                  {/* Name input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  {/* Phone input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Active Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  {/* Message input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Your Message / Inquiry Detail</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="I'm interested in the Python and MS Office courses starting next month. Please let me know batch timings and installment options..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? "Sending Inquiry..." : "Submit Inquiry"}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Google Map Section */}
        <div className="rounded-[24px] overflow-hidden border border-gray-150 bg-gray-50 h-96 relative shadow-sm">
          {/* We will load a premium looking Google Map embed that targets a general IT Hub region */}
          <iframe 
            title="Coaching Center Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617543598375!2d-73.98685168459392!3d40.74844047932824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1655381832938!5m2!1sen!2sus"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />
        </div>

      </div>
    </div>
  );
};
