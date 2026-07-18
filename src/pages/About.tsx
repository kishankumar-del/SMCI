import React from "react";
import { motion } from "motion/react";
import { Award, Compass, Eye, ShieldCheck, Cpu, Code, DollarSign, BookOpen } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export const About: React.FC = () => {
  const { settings } = useSettings();
  const whyChooseUs = [
    {
      icon: <Cpu className="w-5 h-5 text-[#2563EB]" />,
      title: "Experienced Faculty",
      desc: "Our trainers are certified software engineers and financial analysts passionate about computer education."
    },
    {
      icon: <Code className="w-5 h-5 text-[#2563EB]" />,
      title: "Practical Hands-on Training",
      desc: "We focus 80% of our instruction on lab hours, dynamic code editing, database queries, and GST filings."
    },
    {
      icon: <DollarSign className="w-5 h-5 text-[#2563EB]" />,
      title: "Affordable Course Fees",
      desc: "High quality curriculum should be accessible. We offer flexible payment plans and zero-interest EMIs."
    },
    {
      icon: <Award className="w-5 h-5 text-[#2563EB]" />,
      title: "Instant Digital Certificate",
      desc: "Earn high-reputation physical certificates carrying unique digital verification numbers searchable globally."
    }
  ];

  return (
    <div className="py-16 md:py-24 space-y-24 bg-white">
      {/* Intro Header */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Who We Are</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
            Nurturing Next-Generation Coding & IT Excellence
          </h1>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
            Founded in 2018, {settings.centerName} has grown into a leading academy for specialized computer applications, backend software development, accounting systems, and systems automation. 
          </p>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
            We provide a modern systems laboratory and customized learning tracks. Our courses are continually revised to mirror the latest technology stacks (like Python 3, Java Enterprise, and cloud databases) and standard regulatory compliance frameworks (like Goods & Services Tax systems in accounting).
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="aspect-video lg:aspect-square rounded-[24px] overflow-hidden shadow-lg border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
              alt="Coaching Center classroom"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[#F9FAFB] border-t border-b border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Our Dedicated Mission</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              To deliver premium-quality, practical computer and logical education at highly affordable structures. We strive to equip youth with deep foundational programming and digital literacy skills that open doors to high-paying jobs and successful digital careers.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Our Future Vision</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              To be recognized globally as the ultimate standard in computer skill acceleration. We envision a world where structural background or financial limits never dictate access to coding languages, dynamic accounting software, or corporate career elevation.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Icons */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Our Pillars</span>
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
            Why Hundreds of Students Choose {settings.centerName}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Our architectural formula combines elite human instruction with hands-on lab projects that guarantee a job-ready digital skillset.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUs.map((choice, idx) => (
            <div key={idx} className="space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {choice.icon}
              </div>
              <h3 className="text-base font-bold text-[#111827]">{choice.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{choice.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
