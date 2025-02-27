"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import EncryptedVideoUpload from "@/components/EncryptedVideoUpload";
import EncryptedVideoPlayer from "@/components/EncryptedVideoPlayer";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [error, setError] = useState<string>("Not logged in.");
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoOfficeId, setActiveVideoOfficeId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const role =
            typeof idTokenResult.claims.role === "string"
              ? idTokenResult.claims.role
              : "unknown";
          const office =
            typeof idTokenResult.claims.officeId === "string"
              ? idTokenResult.claims.officeId
              : null;
          setUserRole(role);
          setOfficeId(office);
          setError("");
          console.log("✅ Logged-in user:", user.email);
          console.log("🔹 Role:", role);
          console.log("🔹 Office ID:", office);
          fetchVideos();
        } catch (err: any) {
          setError("Error retrieving user role.");
          console.error("❌ Error retrieving user role:", err);
        }
      } else {
        setUserRole(null);
        setError("Not logged in.");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch videos from Firestore's "videos" collection, ordered by timestamp
  const fetchVideos = async () => {
    try {
      const q = query(collection(db, "videos"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const vids = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideos(vids);
    } catch (err: any) {
      console.error("Error fetching videos:", err);
    }
  };

  // When a user clicks the "Decrypt Video" button
  const handleDecrypt = (video: any) => {
    // Check permission: Super Admins can decrypt all videos;
    // Office Admins can decrypt videos only if their office matches.
    if (
      userRole === "superadmin" ||
      (userRole === "officeadmin" && officeId === video.officeId)
    ) {
      setActiveVideoId(video.id);
      setActiveVideoOfficeId(video.officeId);
      setError("");
    } else {
      setError("❌ You do not have permission to decrypt this video.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      <p className="mb-4">
        Your Role: <b>{userRole || "Unknown"}</b>
      </p>
      <p className="mb-4">
        Your Office ID: <b>{officeId || "Unknown"}</b>
      </p>

      {/* Video List */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Videos</h2>
        {videos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          <ul>
            {videos.map((video) => (
              <li key={video.id} className="border p-2 my-2">
                <p>
                  <strong>File Name:</strong> {video.fileName}
                </p>
                <p>
                  <strong>Uploaded By:</strong> {video.uploadedBy}
                </p>
                <p>
                  <strong>Office ID:</strong> {video.officeId}
                </p>
                <button
                  onClick={() => handleDecrypt(video)}
                  className="bg-blue-500 text-white p-2 rounded mt-2"
                >
                  Decrypt Video
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Conditionally render the Encrypted Video Player for the selected video */}
      {activeVideoId && activeVideoOfficeId && (
        <div className="mb-6">
          <EncryptedVideoPlayer
            videoId={activeVideoId}
            videoOfficeId={activeVideoOfficeId}
          />
        </div>
      )}

      {/* Encrypted Video Upload Section */}
      <div className="mb-6">
        <EncryptedVideoUpload />
      </div>

      {/* Logout Button */}
      <button
        className="bg-red-500 text-white p-2 rounded mt-4"
        onClick={() => signOut(auth).then(() => window.location.reload())}
      >
        Logout
      </button>
    </div>
  );
}
