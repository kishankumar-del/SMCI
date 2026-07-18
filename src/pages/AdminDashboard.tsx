import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Course, Certificate, ContactMessage } from "../types";
import { uploadFile } from "../utils/storage";
import { seedInitialData } from "../utils/seed";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Mail, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  User, 
  FileText, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase,
  Settings
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

type TabType = "overview" | "courses" | "certificates" | "inquiries" | "settings";

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, adminName, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Collections State
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [fetchingData, setFetchingData] = useState<boolean>(true);

  // Form Modals / Loading state
  const [courseModal, setCourseModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: Course }>({ open: false, mode: "add" });
  const [certModal, setCertModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: Certificate }>({ open: false, mode: "add" });

  // Form Submitting states
  const [submittingCourse, setSubmittingCourse] = useState<boolean>(false);
  const [submittingCert, setSubmittingCert] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Coaching Center Settings State
  const { settings, updateSettings } = useSettings();
  const [settingsForm, setSettingsForm] = useState({
    centerName: settings.centerName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    workingHours: settings.workingHours,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Sync with Firestore settings if changed
  useEffect(() => {
    setSettingsForm({
      centerName: settings.centerName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      workingHours: settings.workingHours,
    });
  }, [settings]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await updateSettings(settingsForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      console.error("Settings save error:", err);
      setDashboardError("Failed to update coaching center settings. Please check credentials or permissions.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Route protection
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch all collections
  const loadDashboardData = async () => {
    setFetchingData(true);
    try {
      // Fetch Courses
      const coursesSnap = await getDocs(collection(db, "courses"));
      const courseList: Course[] = [];
      coursesSnap.forEach((doc) => {
        courseList.push({ id: doc.id, ...doc.data() } as Course);
      });
      setCourses(courseList);

      // Fetch Certificates
      const certsSnap = await getDocs(collection(db, "certificates"));
      const certList: Certificate[] = [];
      certsSnap.forEach((doc) => {
        certList.push({ id: doc.id, ...doc.data() } as Certificate);
      });
      setCertificates(certList);

      // Fetch Contact Inquiries (ordered by newest)
      const contactsSnap = await getDocs(query(collection(db, "contacts"), orderBy("createdAt", "desc")));
      const inquiryList: ContactMessage[] = [];
      contactsSnap.forEach((doc) => {
        inquiryList.push({ id: doc.id, ...doc.data() } as ContactMessage);
      });
      setInquiries(inquiryList);
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      setDashboardError("Failed to fetch Firestore collections.");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      const initDashboard = async () => {
        await seedInitialData();
        await loadDashboardData();
      };
      initDashboard();
    }
  }, [user, isAdmin]);

  // Course Add/Edit form state
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    duration: "",
    fees: "",
    mode: "Online" as "Online" | "Offline",
    eligibility: "",
    imageFile: null as File | null,
    imageUrl: ""
  });

  // Open course editor
  const handleOpenCourseModal = (mode: "add" | "edit", data?: Course) => {
    if (mode === "edit" && data) {
      setCourseForm({
        name: data.name,
        description: data.description,
        duration: data.duration,
        fees: data.fees,
        mode: data.mode,
        eligibility: data.eligibility,
        imageFile: null,
        imageUrl: data.image || ""
      });
      setCourseModal({ open: true, mode: "edit", data });
    } else {
      setCourseForm({
        name: "",
        description: "",
        duration: "8 Weeks",
        fees: "$149",
        mode: "Online",
        eligibility: "Basic computer literacy",
        imageFile: null,
        imageUrl: ""
      });
      setCourseModal({ open: true, mode: "add" });
    }
  };

  // Course CRUD submit handler
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCourse(true);
    setDashboardError(null);

    try {
      let finalImageUrl = courseForm.imageUrl;
      
      // Upload image to storage if selected
      if (courseForm.imageFile) {
        finalImageUrl = await uploadFile(courseForm.imageFile, "course-images");
      }

      const payload = {
        name: courseForm.name,
        description: courseForm.description,
        duration: courseForm.duration,
        fees: courseForm.fees,
        mode: courseForm.mode,
        eligibility: courseForm.eligibility,
        image: finalImageUrl,
        createdAt: courseModal.mode === "add" ? new Date().toISOString() : (courseModal.data?.createdAt || new Date().toISOString())
      };

      if (courseModal.mode === "add") {
        const docRef = doc(collection(db, "courses"));
        await setDoc(docRef, { ...payload, courseId: docRef.id });
      } else if (courseModal.mode === "edit" && courseModal.data?.id) {
        await updateDoc(doc(db, "courses", courseModal.data.id), payload);
      }

      setCourseModal({ open: false, mode: "add" });
      loadDashboardData();
    } catch (err: any) {
      console.error("Course submit error:", err);
      setDashboardError("Failed to save course details.");
    } finally {
      setSubmittingCourse(false);
    }
  };

  // Course Delete
  const handleCourseDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      loadDashboardData();
    } catch (err) {
      console.error("Course delete error:", err);
      setDashboardError("Failed to delete course.");
    }
  };

  // Certificate Add/Edit state
  const [certForm, setCertForm] = useState({
    studentName: "",
    registrationNumber: "",
    certificateNumber: "",
    course: "",
    issueDate: "",
    status: "Completed",
    studentPhotoFile: null as File | null,
    studentPhotoUrl: "",
    certificateFile: null as File | null,
    certificateFileUrl: ""
  });

  // Open Certificate modal
  const handleOpenCertModal = (mode: "add" | "edit", data?: Certificate) => {
    if (mode === "edit" && data) {
      setCertForm({
        studentName: data.studentName,
        registrationNumber: data.registrationNumber,
        certificateNumber: data.certificateNumber,
        course: data.course,
        issueDate: data.issueDate,
        status: data.status,
        studentPhotoFile: null,
        studentPhotoUrl: data.studentPhoto || "",
        certificateFile: null,
        certificateFileUrl: data.certificateFile || ""
      });
      setCertModal({ open: true, mode: "edit", data });
    } else {
      setCertForm({
        studentName: "",
        registrationNumber: `REG-${new Date().getFullYear()}-00${certificates.length + 1}`,
        certificateNumber: `CERT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        course: courses.length > 0 ? courses[0].name : "",
        issueDate: new Date().toISOString().split("T")[0],
        status: "Completed with Distinction",
        studentPhotoFile: null,
        studentPhotoUrl: "",
        certificateFile: null,
        certificateFileUrl: ""
      });
      setCertModal({ open: true, mode: "add" });
    }
  };

  // Certificate submit handler
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCert(true);
    setDashboardError(null);

    try {
      let finalPhotoUrl = certForm.studentPhotoUrl;
      let finalCertFileUrl = certForm.certificateFileUrl;

      // Upload photo and certificate image if selected
      if (certForm.studentPhotoFile) {
        finalPhotoUrl = await uploadFile(certForm.studentPhotoFile, "student-photos");
      }
      if (certForm.certificateFile) {
        finalCertFileUrl = await uploadFile(certForm.certificateFile, "certificate-files");
      }

      const payload = {
        studentName: certForm.studentName,
        registrationNumber: certForm.registrationNumber,
        certificateNumber: certForm.certificateNumber,
        course: certForm.course,
        issueDate: certForm.issueDate,
        status: certForm.status,
        studentPhoto: finalPhotoUrl,
        certificateFile: finalCertFileUrl,
        createdAt: certModal.mode === "add" ? new Date().toISOString() : (certModal.data?.createdAt || new Date().toISOString())
      };

      if (certModal.mode === "add") {
        const docRef = doc(collection(db, "certificates"));
        await setDoc(docRef, { ...payload, certificateId: docRef.id });
      } else if (certModal.mode === "edit" && certModal.data?.id) {
        await updateDoc(doc(db, "certificates", certModal.data.id), payload);
      }

      setCertModal({ open: false, mode: "add" });
      loadDashboardData();
    } catch (err: any) {
      console.error("Certificate submit error:", err);
      setDashboardError("Failed to save certificate records.");
    } finally {
      setSubmittingCert(false);
    }
  };

  // Certificate Delete
  const handleCertDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this certificate?")) return;
    try {
      await deleteDoc(doc(db, "certificates", id));
      loadDashboardData();
    } catch (err) {
      console.error("Certificate delete error:", err);
      setDashboardError("Failed to delete certificate.");
    }
  };

  // Inquiry Delete
  const handleInquiryDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to resolve and delete this inquiry?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      loadDashboardData();
    } catch (err) {
      console.error("Inquiry delete error:", err);
      setDashboardError("Failed to delete inquiry.");
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm("Do you wish to log out of the dashboard?")) {
      await logout();
      navigate("/");
    }
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading administrator databases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0 flex flex-col justify-between py-8 px-5">
        <div className="space-y-8">
          {/* Admin title */}
          <div>
            <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block">ADMIN GATEWAY</span>
            <h2 className="text-lg font-bold text-gray-900 font-display mt-1 leading-tight">{adminName || "Sarah Jenkins"}</h2>
            <code className="text-[10px] text-gray-400 font-mono mt-0.5 block">{user?.email}</code>
          </div>

          {/* Nav buttons */}
          <nav className="space-y-2 flex flex-col">
            {[
              { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
              { id: "courses", label: "Manage Courses", icon: <BookOpen className="w-4.5 h-4.5" /> },
              { id: "certificates", label: "Manage Certificates", icon: <Award className="w-4.5 h-4.5" /> },
              { id: "inquiries", label: "Contact Messages", icon: <Mail className="w-4.5 h-4.5" /> },
              { id: "settings", label: "Center Settings", icon: <Settings className="w-4.5 h-4.5" /> }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveTab(btn.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide text-left transition-all ${
                  activeTab === btn.id
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-200/20"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {btn.icon}
                {btn.label}
                {btn.id === "inquiries" && inquiries.length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center font-bold">
                    {inquiries.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-8 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all text-left"
          >
            <ArrowRight className="w-4.5 h-4.5 text-gray-400 rotate-180" />
            Exit Dashboard
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
          >
            <LogOut className="w-4.5 h-4.5" />
            Secure Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow p-6 sm:p-10 lg:p-12 space-y-10 overflow-y-auto max-w-7xl">
        
        {dashboardError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2 items-start">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 mt-0.5 shrink-0" />
            <span>{dashboardError}</span>
          </div>
        )}

        {/* Tab Content Router */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Header titles */}
            <div>
              <h1 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Center Metrics Overview</h1>
              <p className="text-gray-400 text-xs mt-1">Real-time statistics fetched instantly from live Firestore collections.</p>
            </div>

            {/* Numeric counters list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Active Courses", count: courses.length, desc: "Syllabi offered to applicants", icon: <BookOpen className="w-5 h-5 text-[#2563EB]" /> },
                { label: "Verified Certificates", count: certificates.length, desc: "Issued student credentials", icon: <Award className="w-5 h-5 text-amber-500" /> },
                { label: "Pending Inquiries", count: inquiries.length, desc: "Incoming advisor call-backs", icon: <Mail className="w-5 h-5 text-[#2563EB]" /> }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">{stat.label}</span>
                    <span className="text-3xl font-extrabold text-gray-900 block">{stat.count}</span>
                    <span className="text-xs text-gray-500 block">{stat.desc}</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent inquiries card list */}
            <div className="bg-white p-6 rounded-[16px] border border-gray-200/50 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 font-display">Recent Contact Inquiries</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Please review student coordinates to schedule callbacks.</p>
                </div>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  View All Messages
                </button>
              </div>

              {inquiries.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {inquiries.slice(0, 3).map((inq) => (
                    <div key={inq.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between gap-4 text-left">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-gray-900 text-sm">{inq.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Phone: <strong>{inq.phone}</strong></p>
                        <p className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/60 leading-relaxed max-w-xl italic">
                          "{inq.message}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleInquiryDelete(inq.id)}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-9 px-4 rounded-xl border border-rose-100 self-start transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-6 text-center">No submitted contact forms yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h1 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Syllabus Courses</h1>
                <p className="text-gray-400 text-xs mt-1">Add, edit, or delete courses offered dynamically on the programs list.</p>
              </div>
              <button
                onClick={() => handleOpenCourseModal("add")}
                className="px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold tracking-wider hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add Course
              </button>
            </div>

            {/* Courses Table/Grid list */}
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-[16px] border border-gray-200/50 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="h-40 bg-gray-100 relative">
                        <img
                          src={course.image || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"}
                          alt={course.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase bg-white text-[#2563EB] border border-blue-50/50 px-2.5 py-0.5 rounded-full shadow-sm">
                          {course.mode}
                        </span>
                      </div>
                      <div className="p-5 text-left space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          <span>{course.duration}</span>
                          <span className="text-[#2563EB] text-xs font-extrabold">{course.fees}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base font-display line-clamp-1">{course.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{course.description}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-gray-100 mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenCourseModal("edit", course)}
                        className="p-2.5 text-gray-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit course"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleCourseDelete(course.id)}
                        className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete course"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">No courses registered yet. Please click Add Course.</p>
            )}
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h1 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Student Certificates</h1>
                <p className="text-gray-400 text-xs mt-1">Upload student photo and certificate image metadata to configure credential verification.</p>
              </div>
              <button
                onClick={() => handleOpenCertModal("add")}
                className="px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold tracking-wider hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add Certificate
              </button>
            </div>

            {/* Certificates Registry list */}
            {certificates.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="p-4 sm:p-5">Student</th>
                        <th className="p-4 sm:p-5">Course</th>
                        <th className="p-4 sm:p-5">Cert & Reg IDs</th>
                        <th className="p-4 sm:p-5">Issue Date</th>
                        <th className="p-4 sm:p-5">Status</th>
                        <th className="p-4 sm:p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-gray-50/50">
                          <td className="p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                              {cert.studentPhoto ? (
                                <img
                                  src={cert.studentPhoto}
                                  alt={cert.studentName}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                  {cert.studentName.slice(0, 2)}
                                </div>
                              )}
                              <span className="font-bold text-gray-900">{cert.studentName}</span>
                            </div>
                          </td>
                          <td className="p-4 sm:p-5 text-gray-600 font-medium">{cert.course}</td>
                          <td className="p-4 sm:p-5 text-xs font-mono space-y-0.5">
                            <p className="text-gray-900">Cert: <strong>{cert.certificateNumber}</strong></p>
                            <p className="text-gray-400">Reg: {cert.registrationNumber}</p>
                          </td>
                          <td className="p-4 sm:p-5 text-gray-500 font-medium">{cert.issueDate}</td>
                          <td className="p-4 sm:p-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                              {cert.status}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenCertModal("edit", cert)}
                                className="p-2 text-gray-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCertDelete(cert.id)}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">No student certificates registered yet.</p>
            )}
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="text-left">
              <h1 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Contact Messages</h1>
              <p className="text-gray-400 text-xs mt-1">Review call-backs, prospective enrollments, and support requests.</p>
            </div>

            {/* List of Inquiries table */}
            {inquiries.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100 text-left">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-6 hover:bg-gray-50/50 flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center flex-wrap gap-2.5">
                          <h4 className="font-bold text-gray-900 text-base">{inq.name}</h4>
                          <span className="text-[10px] bg-blue-50 text-[#2563EB] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "Recent"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Active Phone Number: <strong className="text-gray-800 font-mono">{inq.phone}</strong>
                        </p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed max-w-2xl italic font-medium">
                          "{inq.message}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleInquiryDelete(inq.id)}
                        className="px-5 py-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all self-start md:self-center"
                      >
                        Resolve Inquiry
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">No pending student inquiry messages.</p>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 max-w-3xl">
            <div className="text-left">
              <h1 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Coaching Center Settings</h1>
              <p className="text-gray-400 text-xs mt-1">Configure and manage the branding name, contact details, physical address, and hours of the Coaching Center across the portal.</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="bg-white rounded-[24px] border border-gray-200/50 shadow-sm p-6 sm:p-10 text-left space-y-6">
              
              {settingsSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
                  <span>Coaching center settings successfully saved and applied globally!</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Center Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Coaching Center Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.centerName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, centerName: e.target.value })}
                    placeholder="E.g., EduTech Coaching"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                  <p className="text-[10px] text-gray-400">Updates brand names displayed in the header, footer, and other portals.</p>
                </div>

                {/* Physical Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Physical Address / Location</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    placeholder="E.g., 102 Tech Plaza, Near Metro Station"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>

                {/* Grid for Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="E.g., +1 (555) 234-5678"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Support Email Address</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="E.g., contact@coaching.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Laboratory & Counselor Working Hours</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.workingHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                    placeholder="E.g., Monday - Saturday: 9:00 AM - 7:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3 bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
                >
                  {savingSettings ? "Saving Settings..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Course Edit/Add Modal Overlay */}
      {courseModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 overflow-hidden shadow-2xl border border-gray-100 relative">
            
            <button
              onClick={() => setCourseModal({ open: false, mode: "add" })}
              className="absolute right-4 top-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCourseSubmit} className="space-y-5 text-left">
              <div>
                <h3 className="text-xl font-bold font-display text-gray-900 tracking-tight">
                  {courseModal.mode === "add" ? "Create New Coaching Course" : "Modify Course Details"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Fill essential course descriptors. updates occur instantly.</p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Course Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Python Programming Masterclass"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="E.g., Complete backend developer track guiding database schemas and systems algorithms..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Duration</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., 12 Weeks"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                  {/* Tuition Fees */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Fees</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., $299"
                      value={courseForm.fees}
                      onChange={(e) => setCourseForm({ ...courseForm, fees: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mode */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Learning Mode</label>
                    <select
                      value={courseForm.mode}
                      onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value as "Online" | "Offline" })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    >
                      <option value="Online">Online Course</option>
                      <option value="Offline">Offline Batch</option>
                    </select>
                  </div>
                  {/* Eligibility */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Eligibility</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., High School completion"
                      value={courseForm.eligibility}
                      onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Course Poster Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600">Choose file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCourseForm({ ...courseForm, imageFile: e.target.files[0], imageUrl: "" });
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-gray-400 truncate">
                      {courseForm.imageFile ? courseForm.imageFile.name : (courseForm.imageUrl ? "Current poster active" : "No image selected")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCourseModal({ open: false, mode: "add" })}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold tracking-wider hover:bg-blue-700 transition-all shadow-sm"
                >
                  {submittingCourse ? "Saving..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Edit/Add Modal Overlay */}
      {certModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 overflow-hidden shadow-2xl border border-gray-100 relative">
            
            <button
              onClick={() => setCertModal({ open: false, mode: "add" })}
              className="absolute right-4 top-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCertSubmit} className="space-y-4 text-left">
              <div>
                <h3 className="text-xl font-bold font-display text-gray-900 tracking-tight">
                  {certModal.mode === "add" ? "Register Student Certificate" : "Modify Certificate Records"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Configure student photo, issue dates, and unique registration numbers.</p>
              </div>

              <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Emily Chen"
                    value={certForm.studentName}
                    onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Reg No */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Registration Number</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., REG-2026-002"
                      value={certForm.registrationNumber}
                      onChange={(e) => setCertForm({ ...certForm, registrationNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none font-mono"
                    />
                  </div>
                  {/* Certificate No */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Certificate Number</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., CERT-2026-888"
                      value={certForm.certificateNumber}
                      onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Selected Course */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Certified Course</label>
                    <select
                      value={certForm.course}
                      onChange={(e) => setCertForm({ ...certForm, course: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.name}>{course.name}</option>
                      ))}
                      {courses.length === 0 && <option value="">No courses available</option>}
                    </select>
                  </div>
                  {/* Issue Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Date of Issue</label>
                    <input
                      type="date"
                      required
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Completion Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Grade / Completion Status</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Completed with Distinction"
                      value={certForm.status}
                      onChange={(e) => setCertForm({ ...certForm, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Student Photo upload */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Student Photo</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-600">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setCertForm({ ...certForm, studentPhotoFile: e.target.files[0], studentPhotoUrl: "" });
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                        {certForm.studentPhotoFile ? certForm.studentPhotoFile.name : (certForm.studentPhotoUrl ? "Photo active" : "No photo")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate File upload */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Certificate Original PDF / Image file</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer shrink-0">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Choose credentials file</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCertForm({ ...certForm, certificateFile: e.target.files[0], certificateFileUrl: "" });
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-gray-400 truncate">
                      {certForm.certificateFile ? certForm.certificateFile.name : (certForm.certificateFileUrl ? "Original File active" : "Auto-generated template will be utilized")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCertModal({ open: false, mode: "add" })}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCert}
                  className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold tracking-wider hover:bg-blue-700 transition-all shadow-sm"
                >
                  {submittingCert ? "Saving Records..." : "Save Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
