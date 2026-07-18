import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Course } from "../types";
import { BookOpen, Calendar, DollarSign, Award, Laptop, MapPin, Search, Filter, X, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<string>("All");
  
  // Enrollment modal state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollForm, setEnrollForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [submittingEnroll, setSubmittingEnroll] = useState<boolean>(false);
  const [enrollSuccess, setEnrollSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const courseList: Course[] = [];
        querySnapshot.forEach((doc) => {
          courseList.push({ id: doc.id, ...doc.data() } as Course);
        });
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    window.scrollTo(0, 0);
  }, []);

  // Filter logic
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.eligibility.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = modeFilter === "All" || course.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setSubmittingEnroll(true);

    try {
      // Add enrollment inquiry to Firestore contacts collection
      await addDoc(collection(db, "contacts"), {
        name: enrollForm.name,
        phone: enrollForm.phone,
        message: `Course Enrollment Request: ${selectedCourse.name}. Student Email: ${enrollForm.email}. Custom notes: ${enrollForm.notes || "None"}`,
        createdAt: new Date().toISOString()
      });

      setEnrollSuccess(true);
      setTimeout(() => {
        setEnrollSuccess(false);
        setSelectedCourse(null);
        setEnrollForm({ name: "", phone: "", email: "", notes: "" });
      }, 3000);
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmittingEnroll(false);
    }
  };

  return (
    <div className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
        
        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Offered Programs</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111827]">
            Expand Your Career Horizons
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Explore our state-of-the-art syllabus designed specifically for students and corporate personnel. All courses are ledger-optimized, code-active, and project-backed.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm max-w-4xl mx-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, skills, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:block mr-2">Mode:</span>
            {["All", "Online", "Offline"].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors shrink-0 ${
                  modeFilter === m
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                }`}
              >
                {m} Courses
              </button>
            ))}
          </div>
        </div>

        {/* Courses Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-96 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[24px] overflow-hidden border border-gray-100 flex flex-col justify-between group hover:shadow-md hover:border-gray-200/60 transition-all shadow-sm"
              >
                <div>
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={course.image || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"}
                      alt={course.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-white text-[#2563EB] px-3 py-1 rounded-full shadow-sm border border-blue-50/50">
                      {course.mode}
                    </span>
                  </div>

                  {/* Course Body */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] tracking-wide uppercase">
                      <Calendar className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#111827] tracking-tight leading-snug">
                      {course.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    {/* Eligibility criteria */}
                    <div className="pt-2 flex gap-2 items-start text-xs text-gray-500 bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                      <Award className="w-4.5 h-4.5 text-[#F59E0B] shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-700 block">Eligibility:</span>
                        <span className="line-clamp-1">{course.eligibility}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Footer & Enrollment trigger */}
                <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tuition Fees</span>
                    <span className="text-xl font-extrabold text-[#2563EB] leading-none mt-1">{course.fees}</span>
                  </div>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-all shadow-sm shadow-blue-100"
                  >
                    Enroll Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-400 text-sm italic">No courses found matching your filtering parameters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setModeFilter("All");
              }}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

      </div>

      {/* Enrollment Modal Overlay */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[24px] max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute right-4 top-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {enrollSuccess ? (
                <div className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Enrollment Submitted!</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Thank you for enrolling in <strong>{selectedCourse.name}</strong>. Our student counselor will reach out to your phone number shortly to confirm batch timings.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnrollSubmit} className="p-8 space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-[#2563EB] tracking-widest block font-sans">Reserve Your Batch</span>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{selectedCourse.name}</h3>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      Complete this rapid form. No immediate payment is required. We will finalize your admissions details over the phone.
                    </p>
                  </div>

                  <div className="space-y-4.5">
                    {/* Name input */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-600">Full Student Name</label>
                      <input
                        type="text"
                        required
                        value={enrollForm.name}
                        onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone input */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-gray-600">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={enrollForm.phone}
                          onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>
                      {/* Email input */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-gray-600">Email Address</label>
                        <input
                          type="email"
                          required
                          value={enrollForm.email}
                          onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>
                    </div>

                    {/* Special requests/notes */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-600">Custom Notes / Timing Preference (Optional)</label>
                      <textarea
                        rows={2}
                        value={enrollForm.notes}
                        onChange={(e) => setEnrollForm({ ...enrollForm, notes: e.target.value })}
                        placeholder="E.g., Morning batch only, offline laboratory preferences..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Estimated Tuition</span>
                      <span className="text-lg font-extrabold text-[#2563EB]">{selectedCourse.fees}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingEnroll}
                      className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-md flex items-center gap-1.5"
                    >
                      {submittingEnroll ? "Submitting..." : "Submit Application"}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
