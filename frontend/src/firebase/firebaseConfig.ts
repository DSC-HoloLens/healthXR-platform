import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration (for emulator)
const firebaseConfig = {
    apiKey: "fake-api-key",
    authDomain: "localhost",
    projectId: "healthxr-platform",
    storageBucket: "healthxr-platform.appspot.com" // 🔹 Added storage bucket
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
connectAuthEmulator(auth, "http://localhost:9099");

const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8080);

const storage = getStorage(app);
connectStorageEmulator(storage, "localhost", 9199); // 🔹 Connect Storage Emulator

export { auth, db, storage };
