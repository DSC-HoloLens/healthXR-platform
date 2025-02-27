"use client";

import { useState } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage, db, auth } from "@/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import CryptoJS from "crypto-js";

export default function EncryptedVideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(""); // ✅ Show messages to user
  const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string; // Use .env.local key

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("❌ No file selected.");
      return;
    }

    setLoading(true);
    setUploadMessage("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      // 🔹 Fetch the user's officeId from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User not found in Firestore.");
      }

      const userData = userDoc.data();
      const officeId = userData.officeId || null;

      if (!officeId) {
        throw new Error("❌ Missing officeId. Contact an admin.");
      }

      // 🔹 Create a new document in Firestore and get its unique ID
      const videoDocRef = await addDoc(collection(db, "videos"), {
        fileName: file.name,
        uploadedBy: user.email,
        userId: user.uid,
        officeId: officeId, // ✅ Store officeId
        timestamp: serverTimestamp(),
        encrypted: true, // ✅ Indicates encryption status
      });

      const videoId = videoDocRef.id; // Firestore-generated unique video ID

      // 🔹 Encrypt file before uploading
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const encryptedData = CryptoJS.AES.encrypt(reader.result as string, SECRET_KEY).toString();

        // 🔹 Upload encrypted file to Firebase Storage using Firestore ID as the filename
        const storageRef = ref(storage, `videos/${videoId}.enc`);
        await uploadBytes(storageRef, new Blob([encryptedData], { type: "text/plain" }));

        setFile(null);
        setUploadMessage("✅ Video uploaded successfully!");
      };
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      setUploadMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Upload Encrypted Video</h2>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="border p-2 rounded" 
      />
      <button 
        onClick={handleUpload} 
        disabled={loading || !file} 
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        {loading ? "Encrypting & Uploading..." : "Upload Video"}
      </button>

      {uploadMessage && <p className="mt-2 text-sm">{uploadMessage}</p>}
    </div>
  );
}
