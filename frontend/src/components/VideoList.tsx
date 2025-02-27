"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import EncryptedVideoPlayer from "@/components/EncryptedVideoPlayer";
import { format } from "date-fns";

export default function VideoList() {
  const [videos, setVideos] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userOfficeId, setUserOfficeId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoOfficeId, setActiveVideoOfficeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState<string | null>(null);

  useEffect(() => {
    // 🔹 Listen for uploaded videos
    const q = query(collection(db, "videos"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 🔹 Get user role & office ID from token claims
    const user = auth.currentUser;
    if (user) {
      user.getIdTokenResult().then((idTokenResult) => {
        console.log("ID token claims:", idTokenResult.claims);
        setUserRole(
          typeof idTokenResult.claims.role === "string" ? idTokenResult.claims.role : "unknown"
        );
        setUserOfficeId(
          typeof idTokenResult.claims.officeId === "string" ? idTokenResult.claims.officeId : null
        );
      });
    }
    setIsLoading(false);

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* 🔹 Popup message for permission warnings */}
      {popup && (
        <div className="bg-red-500 text-white p-3 rounded">
          {popup}
          <button onClick={() => setPopup(null)} className="ml-2 font-bold">
            ✖
          </button>
        </div>
      )}

      {/* 🔹 Show loading state */}
      {isLoading && <p className="text-gray-500">🔄 Loading videos...</p>}

      {/* 🔹 Show message if no videos exist */}
      {videos.length === 0 && !isLoading && <p className="text-gray-500">No videos uploaded yet.</p>}

      {/* 🔹 Video List */}
      {videos.map((video) => (
        <div key={video.id} className="p-4 border rounded shadow bg-white">
          <p className="text-sm text-gray-500">
            <strong>File Name:</strong> {video.fileName || "Unknown"}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Uploaded By:</strong> {video.uploadedBy || "Unknown"}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Date Uploaded:</strong>{" "}
            {video.timestamp && video.timestamp.toDate
              ? format(video.timestamp.toDate(), "PPpp")
              : "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Office ID:</strong> {video.officeId || "❌ Missing"}
          </p>
          <p className={`font-bold ${video.encrypted ? "text-green-500" : "text-red-500"}`}>
            {video.encrypted ? "🔒 Encrypted" : "🔓 Not Encrypted"}
          </p>

          {/* 🔹 Decryption or Permission Message */}
          {activeVideoId === video.id ? (
            <EncryptedVideoPlayer videoId={video.id} videoOfficeId={video.officeId} />
          ) : (
            <button
              className="bg-blue-500 text-white p-2 rounded mt-2"
              onClick={() => {
                if (
                  userRole === "superadmin" ||
                  (userRole === "officeadmin" && userOfficeId === video.officeId)
                ) {
                  setActiveVideoId(video.id);
                  setActiveVideoOfficeId(video.officeId);
                } else {
                  setPopup("❌ You do not have permission to decrypt this video.");
                }
              }}
            >
              Decrypt Video
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
