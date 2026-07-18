# EduTech Computer Coaching Center Website

A production-ready, minimalistic, and fully responsive website for a modern Computer Coaching Center. Built with **React (Vite)**, **Tailwind CSS**, **Framer Motion**, and **Firebase** (Authentication & Firestore).

## Features

1. **Modern Minimal Landing Page**: Apple-inspired clean typography, plenty of white space, interactive coding visualizer, and highlighted courses.
2. **Programs & Courses Catalog**: Fetched dynamically from Firestore. Filter courses by mode (Online/Offline) and search. Students can click "Enroll Now" to submit an inquiry.
3. **Contact & Inquiries Form**: prospective students submit inquiry requests stored instantly in the `contacts` collection in Firestore.
4. **Certificate & Credentials Verification**: A real-time, online student ledger. Enter Registration or Certificate IDs to instantly verify students, display dynamic grades, and print high-fidelity certificates.
5. **Secure Admin Dashboard**: Excluded from main navigation, secured with Firebase Email & Password Authentication.
    - **Dashboard Metrics**: Real-time counter of total courses, verified credentials, and incoming inquiries.
    - **Course CRUD**: Create, read, update, or delete center courses. Supports file upload for course posters.
    - **Certificate CRUD**: Track student directories, upload original file credentials and student avatars, and customize grades and issue dates.
    - **Resolve Inquiries**: Read and archive submitted student contact inquiries.

---

## Technical Stack & Configuration

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router DOM, Lucide Icons.
- **Backend & Cloud Database**: Firebase Firestore, Firebase Authentication, Firebase Storage.
- **Auto-Bootstrapping Admin**: On the very first load, if the Firestore `admins` collection is empty, the first user who registers on the Admin Gateway (`/admin`) will automatically be bootstrapped as the Lead Administrator!

---

## Local Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## Firebase Structure

### Collections:
- `courses`: Core registry of computer subjects.
- `certificates`: Verified credentials matching registration codes.
- `contacts`: Inbound student callback entries.
- `admins`: Authorized administrative clearance document keys.
