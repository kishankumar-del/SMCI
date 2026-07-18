import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Certificate } from "../types";
import { Search, ShieldCheck, AlertCircle, Award, Calendar, User, FileText, Download, CheckCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../context/SettingsContext";
import { jsPDF } from "jspdf";

export const CertificateVerification: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setSearching(true);
    setErrorMessage(null);
    setVerifiedCertificate(null);
    setSearched(true);

    try {
      const term = searchValue.trim();
      const certificatesRef = collection(db, "certificates");
      
      // Query by Certificate Number
      const qCert = query(certificatesRef, where("certificateNumber", "==", term));
      const snapCert = await getDocs(qCert);
      
      let foundCert: Certificate | null = null;
      
      if (!snapCert.empty) {
        const doc = snapCert.docs[0];
        foundCert = { id: doc.id, ...doc.data() } as Certificate;
      } else {
        // Query by Registration Number
        const qReg = query(certificatesRef, where("registrationNumber", "==", term));
        const snapReg = await getDocs(qReg);
        if (!snapReg.empty) {
          const doc = snapReg.docs[0];
          foundCert = { id: doc.id, ...doc.data() } as Certificate;
        }
      }

      if (foundCert) {
        setVerifiedCertificate(foundCert);
      } else {
        setVerifiedCertificate(null);
      }
    } catch (err: any) {
      console.error("Verification query error:", err);
      setErrorMessage("An error occurred during verification. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const generateTemplatePdf = () => {
    if (!verifiedCertificate) return;

    const fileName = `Certificate_${verifiedCertificate.studentName.replace(/\s+/g, "_")}_${verifiedCertificate.certificateNumber}.pdf`;

    // Create dynamic high-resolution canvas to generate the certificate image
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1130; // Aspect ratio optimized for prints
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background fill (Cream luxury paper texture feel)
    ctx.fillStyle = "#FAF9F6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border design: Double dark navy border
    ctx.strokeStyle = "#111827"; // Gray-900 / Navy
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.strokeStyle = "#2563EB"; // Blue-600 gold/brand accent border
    ctx.lineWidth = 4;
    ctx.strokeRect(65, 65, canvas.width - 130, canvas.height - 130);

    // Decorative corner graphics
    const drawCorner = (x: number, y: number, xDir: number, yDir: number) => {
      ctx.fillStyle = "#2563EB";
      ctx.fillRect(x, y, xDir * 60, yDir * 8);
      ctx.fillRect(x, y, xDir * 8, yDir * 60);
    };
    drawCorner(85, 85, 1, 1);
    drawCorner(canvas.width - 85, 85, -1, 1);
    drawCorner(85, canvas.height - 85, 1, -1);
    drawCorner(canvas.width - 85, canvas.height - 85, -1, -1);

    // Center Name Header
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Header Title
    ctx.fillStyle = "#111827";
    ctx.font = "bold 34px serif";
    ctx.fillText(settings.centerName.toUpperCase(), canvas.width / 2, 180);

    // Subheader Line
    ctx.fillStyle = "#2563EB";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("CREDENTIALS LEDGER REGISTRY", canvas.width / 2, 230);

    // Certificate of Completion main heading
    ctx.fillStyle = "#111827";
    ctx.font = "extrabold 64px sans-serif";
    ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 340);

    // Presentation text
    ctx.fillStyle = "#6B7280";
    ctx.font = "italic 24px serif";
    ctx.fillText("This is proudly presented to", canvas.width / 2, 430);

    // Student Name
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(verifiedCertificate.studentName, canvas.width / 2, 510);

    // Underline for name
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 560);
    ctx.lineTo(canvas.width / 2 + 250, 560);
    ctx.stroke();

    // Satisfied criteria text
    ctx.fillStyle = "#4B5563";
    ctx.font = "20px sans-serif";
    ctx.fillText(
      "for successfully satisfying all practical parameters, programming labs,",
      canvas.width / 2,
      620
    );
    ctx.fillText(
      "and examinations required to earn official credentials in",
      canvas.width / 2,
      655
    );

    // Course Name
    ctx.fillStyle = "#111827";
    ctx.font = "extrabold 40px sans-serif";
    ctx.fillText(verifiedCertificate.course.toUpperCase(), canvas.width / 2, 740);

    // Grade status
    ctx.fillStyle = "#4B5563";
    ctx.font = "20px sans-serif";
    ctx.fillText(`with evaluated academic standing status of: ${verifiedCertificate.status}`, canvas.width / 2, 800);

    // Verification details (bottom left)
    ctx.textAlign = "left";
    ctx.fillStyle = "#6B7280";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("VERIFICATION PARAMETERS", 120, 910);
    ctx.font = "16px monospace";
    ctx.fillText(`Registration ID:  ${verifiedCertificate.registrationNumber}`, 120, 950);
    ctx.fillText(`Certificate ID:   ${verifiedCertificate.certificateNumber}`, 120, 980);
    ctx.fillText(`Issue Date:       ${verifiedCertificate.issueDate}`, 120, 1010);

    // Director signature and Official Seal (bottom right)
    ctx.textAlign = "center";
    
    // Seal Circle
    ctx.fillStyle = "#EFF6FF";
    ctx.beginPath();
    ctx.arc(1150, 950, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text inside seal
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("SECURED", 1150, 940);
    ctx.fillStyle = "#2563EB";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("VERIFIED", 1150, 960);

    // Signature line
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1300, 970);
    ctx.lineTo(1480, 970);
    ctx.stroke();

    ctx.fillStyle = "#6B7280";
    ctx.font = "14px sans-serif";
    ctx.fillText("DIRECTOR OF SYSTEMS", 1390, 995);

    // Trigger standard browser download of PDF
    const dataUrl = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1600, 1130]
    });
    pdf.addImage(dataUrl, "PNG", 0, 0, 1600, 1130);
    pdf.save(fileName);
  };

  const handleDownload = async () => {
    if (!verifiedCertificate) return;

    const fileName = `Certificate_${verifiedCertificate.studentName.replace(/\s+/g, "_")}_${verifiedCertificate.certificateNumber}.pdf`;

    // Scenario 1: Uploaded custom original certificate file is present
    if (verifiedCertificate.certificateFile && verifiedCertificate.certificateFile.startsWith("http")) {
      const fileUrl = verifiedCertificate.certificateFile;
      const cleanUrl = fileUrl.toLowerCase().split('?')[0];
      const isPdf = cleanUrl.endsWith('.pdf');

      if (isPdf) {
        // Just trigger standard download of the existing PDF
        const link = document.createElement("a");
        link.href = fileUrl;
        link.target = "_blank";
        link.download = fileName;
        link.click();
        return;
      } else {
        // Uploaded file is an Image (JPG/PNG). We must download it as a PDF!
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || 1600;
            canvas.height = img.naturalHeight || 1130;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
              const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? "landscape" : "portrait",
                unit: "px",
                format: [canvas.width, canvas.height]
              });
              pdf.addImage(dataUrl, "JPEG", 0, 0, canvas.width, canvas.height);
              pdf.save(fileName);
            }
          };
          img.onerror = (e) => {
            console.error("Error loading original certificate image for PDF generation, falling back:", e);
            generateTemplatePdf();
          };
          img.src = fileUrl;
          return;
        } catch (err) {
          console.error("CORS or image loading error, falling back to dynamic template PDF:", err);
          generateTemplatePdf();
          return;
        }
      }
    }

    // Scenario 2: No custom file attached. Generate beautiful template PDF directly.
    generateTemplatePdf();
  };

  return (
    <div className="py-16 md:py-24 bg-white min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            Certificate & Credentials Verification
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Verify academic transcripts, completion awards, and registration credentials issued by {settings.centerName}.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Certificate or Registration Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., CERT-2026-999"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-8 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider transition-all shadow-sm shrink-0"
                >
                  {searching ? "Verifying..." : "Verify Credentials"}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              * Verification codes are case-sensitive. Enter exactly as printed on the bottom left corner of your certificate.
            </p>
          </form>
        </div>

        {/* Results Section */}
        <div className="max-w-3xl mx-auto">
          {searching && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Querying secure student ledger...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!searching && searched && !verifiedCertificate && !errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center p-12 bg-rose-50/40 border border-rose-100/50 rounded-[24px] space-y-4"
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900">Certificate Not Found</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  We could not locate any active registry matching credentials <strong>"{searchValue}"</strong>. Please verify typo configurations.
                </p>
              </div>
            </motion.div>
          )}

          {/* Certificate verified UI */}
          <AnimatePresence>
            {!searching && verifiedCertificate && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-8"
              >
                {/* Status indicator banner */}
                <div className="flex items-center gap-3 p-4.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Credential Status Verified: Fully Authenticated Student Record</span>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Photo or seal display */}
                  <div className="md:col-span-4 flex flex-col items-center gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center">
                    {verifiedCertificate.studentPhoto ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200">
                        <img
                          src={verifiedCertificate.studentPhoto}
                          alt={verifiedCertificate.studentName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{verifiedCertificate.studentName}</h4>
                      <p className="text-xs text-gray-400 mt-1">Student ID/Registration</p>
                      <code className="text-xs font-bold text-[#2563EB] bg-blue-50/50 px-2.5 py-1 rounded-md mt-1 inline-block font-mono">
                        {verifiedCertificate.registrationNumber}
                      </code>
                    </div>
                  </div>

                  {/* Ledger detail variables */}
                  <div className="md:col-span-8 bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Academic Transcript Ledger</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 block font-medium">Certified Program</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#F59E0B]" />
                          {verifiedCertificate.course}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 block font-medium">Certificate Identifier</span>
                        <span className="font-mono font-bold text-gray-800 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#2563EB]" />
                          {verifiedCertificate.certificateNumber}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 block font-medium">Date of Issue</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#2563EB]" />
                          {verifiedCertificate.issueDate}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 block font-medium">Completion Grade/Status</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          {verifiedCertificate.status}
                        </span>
                      </div>
                    </div>

                    {/* Download Certificate CTA */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                      <button
                        onClick={handleDownload}
                        className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-sm inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Certificate (PDF)
                      </button>
                      
                      {verifiedCertificate.certificateFile && verifiedCertificate.certificateFile.startsWith("http") && (
                        <a
                          href={verifiedCertificate.certificateFile}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-full text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          View Original PDF/Image
                        </a>
                      )}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
