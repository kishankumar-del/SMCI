export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  fees: string;
  mode: "Online" | "Offline";
  eligibility: string;
  image: string;
  createdAt?: any;
}

export interface Certificate {
  id: string;
  studentName: string;
  registrationNumber: string;
  certificateNumber: string;
  course: string;
  issueDate: string;
  status: string;
  certificateFile: string;
  studentPhoto?: string;
  createdAt?: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt?: any;
}

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: string;
}
