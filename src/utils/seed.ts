import { collection, getDocs, setDoc, doc, addDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Course } from "../types";

const DEFAULT_COURSES: Omit<Course, "id">[] = [
  {
    name: "Python Programming Masterclass",
    description: "Master Python from basics to advanced. Covers object-oriented programming, file handling, data structures, and introduces popular libraries like NumPy, Pandas, and Django.",
    duration: "12 Weeks",
    fees: "$299",
    mode: "Online",
    eligibility: "High School or Equivalent, basic computer literacy",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "C & C++ Systems Programming",
    description: "Deep dive into low-level systems programming. Learn memory management, pointers, arrays, OOP principles in C++, and core computer science fundamentals.",
    duration: "10 Weeks",
    fees: "$249",
    mode: "Offline",
    eligibility: "Prior logical skills or open mind",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Java Enterprise Edition",
    description: "Gain industry-level knowledge of Java, including multi-threading, databases, Hibernate, Spring Boot, and robust backend web development.",
    duration: "16 Weeks",
    fees: "$349",
    mode: "Online",
    eligibility: "Basic logical concepts",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tally with GST",
    description: "Learn professional accounting, inventory control, and financial operations. Includes complete hands-on Goods and Services Tax (GST) filing systems.",
    duration: "8 Weeks",
    fees: "$199",
    mode: "Offline",
    eligibility: "High School or commerce background is beneficial",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Basic Computer Course & Internet Skills",
    description: "Perfect for absolute beginners. Learn Windows operation, email etiquettes, safe web browsing, online applications, and modern digital productivity.",
    duration: "6 Weeks",
    fees: "$99",
    mode: "Offline",
    eligibility: "None - open to all",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "MS Office Suite Proficiency",
    description: "Become a master of office productivity. Get intensive practical hands-on tutoring in Word document styling, Excel dynamic macros, and PowerPoint design.",
    duration: "8 Weeks",
    fees: "$149",
    mode: "Online",
    eligibility: "Basic operating system knowledge",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Advanced Computer Course (ADCA)",
    description: "An intensive combo course covering graphic design concepts, advanced databases, networking basics, system optimization, and IT fundamentals.",
    duration: "24 Weeks",
    fees: "$499",
    mode: "Offline",
    eligibility: "High School completion",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Professional Touch Typing Course",
    description: "Boost your speed and accuracy up to 60+ WPM with proper scientific techniques, keyboard posture drills, and regular real-time mock testing.",
    duration: "4 Weeks",
    fees: "$79",
    mode: "Offline",
    eligibility: "Access to keyboard and computer",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
  }
];

export async function seedInitialData() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return;
  }

  try {
    const adminDocRef = doc(db, "admins", currentUser.uid);
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      return;
    }

    const coursesColRef = collection(db, "courses");
    const coursesSnap = await getDocs(coursesColRef);
    
    if (coursesSnap.empty) {
      console.log("No courses found in Firestore. Seeding default coaching courses...");
      for (const course of DEFAULT_COURSES) {
        const docRef = doc(coursesColRef); // Generate unique id
        await setDoc(docRef, {
          ...course,
          courseId: docRef.id,
          createdAt: new Date().toISOString()
        });
      }
      console.log("Course seeding complete!");
    }

    const certificatesColRef = collection(db, "certificates");
    const certsSnap = await getDocs(certificatesColRef);

    if (certsSnap.empty) {
      console.log("No certificates found. Seeding sample student certificates...");
      
      const sampleCertificates = [
        {
          studentName: "Alex Rivera",
          registrationNumber: "REG-2026-001",
          certificateNumber: "CERT-2026-999",
          course: "Python Programming Masterclass",
          issueDate: "2026-06-15",
          status: "Completed",
          studentPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
          certificateFile: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80",
          createdAt: new Date().toISOString()
        },
        {
          studentName: "Emily Chen",
          registrationNumber: "REG-2026-002",
          certificateNumber: "CERT-2026-888",
          course: "Tally with GST",
          issueDate: "2026-05-20",
          status: "Completed with Distinction",
          studentPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
          certificateFile: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80",
          createdAt: new Date().toISOString()
        }
      ];

      for (const cert of sampleCertificates) {
        const docRef = doc(certificatesColRef);
        await setDoc(docRef, {
          ...cert,
          certificateId: docRef.id
        });
      }
      console.log("Certificate seeding complete!");
    }
  } catch (err) {
    console.error("Error during initial data seeding:", err);
  }
}
