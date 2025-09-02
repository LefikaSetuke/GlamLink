import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhyUQjSgNtmaLF5aWvVtCcFV136PnUMcA",
  authDomain: "glam-link-35370.firebaseapp.com",
  projectId: "glam-link-35370",
  storageBucket: "glam-link-35370.firebasestorage.app",
  messagingSenderId: "498158246637",
  appId: "1:498158246637:web:0efc755df1ac8ce2194ae4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//const auth = getAuth(app);

// Create user profile with phone number only
export async function createUserProfile(PhoneNumber) {
  const docRef = await addDoc(collection(db, "Clients"), { PhoneNumber });
  await setDoc(doc(db, "Clients", docRef.id), { id: docRef.id }, { merge: true });
  return docRef.id;
}
