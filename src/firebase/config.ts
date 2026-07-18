import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuOZClzYJF-x2sfeBdY5pLECNzDJxgyq8",
  authDomain: "gen-lang-client-0489423567.firebaseapp.com",
  projectId: "gen-lang-client-0489423567",
  storageBucket: "gen-lang-client-0489423567.firebasestorage.app",
  messagingSenderId: "848775701616",
  appId: "1:848775701616:web:7b5c1fd0266e45593600b5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-a68b4045-b562-4696-86df-d0a852377190");
export const storage = getStorage(app);

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firebase initialized and connection verified:", error.message || error);
    }
  }
}

testConnection();
