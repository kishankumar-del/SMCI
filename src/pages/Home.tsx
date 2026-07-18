import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Code, 
  Cpu, 
  Award, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Briefcase
} from "lucide-react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { Course } from "../types";

export const Home: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "courses"), limit(3));
        const snap = await getDocs(q);
        const list: Course[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Course);
        });
        setFeaturedCourses(list);
      } catch (err) {
        console.error("Error fetching featured courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Experienced Faculty",
      desc: "Learn from top engineers and certified database and systems administrators with 10+ years of teaching experience."
    },
    {
      icon: <Code className="w-6 h-6 text-blue-600" />,
      title: "Practical, Project-Based Training",
      desc: "Apply concepts immediately in real-world programming labs and build a high-caliber professional GitHub portfolio."
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: "Affordable Fees & EMI Plans",
      desc: "Get premium quality coaching at accessible cost structures with transparent, flexible payment plans."
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: "Government-Aligned Certification",
      desc: "Acquire standard course-completion credentials instantly verifiable online via our global digital database."
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      title: "Flexible Scheduling",
      desc: "Pick from multiple morning, afternoon, or evening batches designed to fit student and professional routines."
    },
    {
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      title: "Placement Assistance",
      desc: "Gain resume workshops, LinkedIn branding, mock interview training, and continuous updates on top IT vacancies."
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-radial from-blue-50/40 via-white to-white py-12 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Texts */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-xs font-semibold mb-2 w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              ADMISSIONS OPEN 2026
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-6"
            >
              Master the <br/><span className="text-[#2563EB]">Digital Skills</span> <br/>for Your Career.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-500 mb-8 max-w-md leading-relaxed"
            >
              Learn Python, C++, Java, and Tally Prime with GST from industry veterans. Certified computer coaching for the next generation of engineers and professionals.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 pt-2"
            >
              <Link
                to="/courses"
                className="px-8 py-4 bg-[#2563EB] text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all inline-flex items-center gap-2 group"
              >
                Explore Courses
                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/verify"
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
              >
                Verify Credentials
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-[#111827]">12k+</div>
                <div className="text-sm text-gray-400">Students Certified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827]">15+</div>
                <div className="text-sm text-gray-400">Expert Faculty</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827]">98%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Hero Programming Mock Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 relative w-full flex justify-center"
          >
            <div className="relative w-full max-w-md bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-6 overflow-hidden">
              {/* Header Circles */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-rose-500 block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                <span className="text-xs text-gray-500 font-mono ml-2">student_dashboard.py</span>
              </div>
              
              {/* Fake Terminal Editor */}
              <div className="font-mono text-xs text-gray-300 space-y-3 leading-relaxed">
                <p className="text-gray-500"># Initializing Computer Coaching Center Platform</p>
                <p><span className="text-blue-400">import</span> edutech_coaching</p>
                <p><span className="text-blue-400">class</span> <span className="text-amber-300">SoftwareEngineer</span>:</p>
                <p className="pl-4"><span className="text-blue-400">def</span> <span className="text-emerald-400">__init__</span>(self, student):</p>
                <p className="pl-8">self.student = student</p>
                <p className="pl-8">self.skills = [<span className="text-emerald-300">"Python"</span>, <span className="text-emerald-300">"Java"</span>, <span className="text-emerald-300">"GST"</span>]</p>
                <p className="pl-8">self.status = <span className="text-emerald-300">"Career Ready"</span></p>
                <br />
                <p className="text-gray-500"># Output status update</p>
                <p className="text-emerald-400">&gt;&gt;&gt; student.is_certified()</p>
                <p className="text-amber-400">True - Verification: Active</p>
              </div>

              {/* Decorative Blur Background circles */}
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
              <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-amber-500/10 rounded-full blur-xl" />
            </div>

            {/* Float Badge */}
            <div className="absolute -bottom-4 right-10 md:right-16 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Award className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">Verified Graduates</span>
                <span className="text-sm text-gray-900 font-extrabold font-display leading-none">1,200+ Students</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Feature & Why Choose Us Section */}
      <section className="py-20 md:py-28 bg-[#F9FAFB] border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
              An Industry-Leading Training Environment
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              We design our lectures to build solid problem-solving algorithms, enabling students to conquer tech domains, digital systems, or accounting effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 text-left space-y-5"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-[#111827]">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Highlights */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Programs Catalog</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                Our Popular Training Courses
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Step-by-step guidance tailored for all proficiency tiers. Register to reserve physical workspace batches.
              </p>
            </div>
            <Link
              to="/courses"
              className="text-sm font-semibold text-[#2563EB] hover:text-[#2563EB]/80 inline-flex items-center gap-1 shrink-0 group py-1.5"
            >
              View All Courses
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-gray-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={course.image || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"}
                      alt={course.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6 space-y-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                        <span>{course.duration}</span>
                        <span className="bg-blue-50/50 text-[#2563EB] px-2.5 py-1 rounded-full">{course.mode}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#111827] tracking-tight">{course.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{course.description}</p>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-4">
                    <span className="text-lg font-extrabold text-[#2563EB]">{course.fees}</span>
                    <Link
                      to="/courses"
                      className="text-xs font-semibold px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Sample courses will be auto-generated shortly on your database setup.</p>
          )}
        </div>
      </section>

      {/* Call to Action: Online Certificate Verification */}
      <section className="bg-[#2563EB] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <Award className="w-12 h-12 text-[#F59E0B] mx-auto stroke-[1.5]" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Already Completed a Course with Us?
          </h2>
          <p className="text-blue-50 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Students can instantly verify and download their official digital course certificates via our secure registry. Employers can confirm registration credentials.
          </p>
          <div className="pt-2">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2563EB] rounded-2xl font-semibold shadow-md hover:bg-gray-50 transition-all"
            >
              Verify Certificate
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
