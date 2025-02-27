"use client";

import { useState, useEffect } from "react";
import { ref, getBlob, getMetadata } from "firebase/storage";
import { storage, auth, db } from "@/firebase/firebaseConfig";
import CryptoJS from "crypto-js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface EncryptedVideoPlayerProps {
  videoId: string;
  videoOfficeId: string | null;
}

export default function EncryptedVideoPlayer({ videoId, videoOfficeId }: EncryptedVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Use your encryption key from environment or hard-code for testing
  const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "my-strong-secret-key";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "unknown");
          }
        } catch (err) {
          console.error("❌ Error fetching user data:", err);
          setError("❌ Error fetching user data.");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const decryptVideo = async () => {
    setLoading(true);
    setError(null);

    // Check permission (this example assumes the caller already checked permissions)
    if (!videoId) {
      setError("Invalid video ID.");
      setLoading(false);
      return;
    }

    try {
      // Use the passed videoId to build the Storage reference
      const storageRef = ref(storage, `videos/${videoId}.enc`);

      // Ensure the file exists
      await getMetadata(storageRef);

      // Fetch the encrypted video as a Blob and read it as text
      const encryptedBlob = await getBlob(storageRef);
      const encryptedText = await encryptedBlob.text();

      // Decrypt the text using AES and decode as UTF-8 (assumes encryption produced a data URL)
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
      const decryptedDataUrl = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedDataUrl) throw new Error("❌ Decryption failed. The output is empty.");

      // Set the video URL (assumes the decrypted data is a valid Data URL)
      setVideoUrl(decryptedDataUrl);
    } catch (error: any) {
      console.error("❌ Error decrypting video:", error);
      setError(error.message || "❌ Error decrypting video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Secure Video Player</h2>
      {userRole === "superadmin" || userRole === "officeadmin" ? (
        <button 
          onClick={decryptVideo} 
          disabled={loading} 
          className="bg-green-500 text-white p-2 rounded mt-2"
        >
          {loading ? "Decrypting..." : "Decrypt Video"}
        </button>
      ) : (
        <p className="text-red-500">❌ You do not have permission to decrypt videos.</p>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {videoUrl && (
        <video controls className="mt-4 w-full max-w-2xl">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
