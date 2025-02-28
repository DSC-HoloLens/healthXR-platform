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
  const [activeTab, setActiveTab] = useState("videos");
  const [aiNotes, setAiNotes] = useState<string>("No AI analysis available for this video yet.");

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
      // In a real app, you might fetch AI analysis notes for this video
      setAiNotes(`AI analysis for video "${video.fileName}": This video shows a standard dental procedure with good technique.`);
    } else {
      setError("❌ You do not have permission to decrypt this video.");
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fcff]">
      {/* Sidebar */}
      <div className="w-64 bg-white p-5 overflow-y-auto border-r border-gray-200 shadow-md rounded-l-lg">
        <h1 className="text-2xl font-bold mb-6">Secure Video Portal</h1>
        
        <div className="mb-4">
          <div className="text-sm text-gray-500">Your Role</div>
          <div className="font-semibold">{userRole || "Unknown"}</div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-500">Office ID</div>
          <div className="font-semibold">{officeId || "Unknown"}</div>
        </div>
        
        <h3 className="font-bold text-gray-700 mb-2">Recent Videos</h3>
        <ul className="space-y-2">
          {videos.slice(0, 5).map((video) => (
            <li 
              key={video.id} 
              className="text-sm cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => handleDecrypt(video)}
            >
              {video.fileName}
            </li>
          ))}
        </ul>
        
        <button
          className="mt-auto w-full bg-red-500 text-white p-2 rounded mt-8"
          onClick={() => signOut(auth).then(() => window.location.reload())}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex justify-center bg-white p-3 shadow-sm">
          <div className="flex space-x-4">
            <button 
              className={`px-5 py-2 rounded-full transition-all ${activeTab === "videos" 
                ? "bg-[#DFF6FA] font-medium border-2 border-[#DFF6FA]" 
                : "bg-white border-2 border-[#e3f6f5] hover:bg-[#e3f6f5] hover:text-[#007b8f]"}`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button 
              className={`px-5 py-2 rounded-full transition-all ${activeTab === "notes" 
                ? "bg-[#DFF6FA] font-medium border-2 border-[#DFF6FA]" 
                : "bg-white border-2 border-[#e3f6f5] hover:bg-[#e3f6f5] hover:text-[#007b8f]"}`}
              onClick={() => setActiveTab("notes")}
            >
              AI Notes
            </button>
            <button 
              className={`px-5 py-2 rounded-full transition-all ${activeTab === "upload" 
                ? "bg-[#DFF6FA] font-medium border-2 border-[#DFF6FA]" 
                : "bg-white border-2 border-[#e3f6f5] hover:bg-[#e3f6f5] hover:text-[#007b8f]"}`}
              onClick={() => setActiveTab("upload")}
            >
              Upload
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 p-6 flex flex-col items-center">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {activeTab === "videos" && (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Video Library</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white p-4 rounded-lg shadow-md">
                    <p className="font-semibold truncate">{video.fileName}</p>
                    <p className="text-sm text-gray-600">Uploaded by: {video.uploadedBy}</p>
                    <p className="text-sm text-gray-600">Office: {video.officeId}</p>
                    <button
                      onClick={() => handleDecrypt(video)}
                      className="mt-3 bg-[#48D1CC] hover:bg-[#40bdb8] text-white px-4 py-2 rounded-lg w-full transition-colors"
                    >
                      View Video
                    </button>
                  </div>
                ))}
              </div>
              
              {videos.length === 0 && (
                <p className="text-center text-gray-500 py-8">No videos available</p>
              )}
            </div>
          )}
          
          {activeTab === "notes" && (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">AI Generated Notes</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 h-[350px] overflow-y-auto shadow-md">
                {activeVideoId ? (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Analysis for {videos.find(v => v.id === activeVideoId)?.fileName}</h3>
                    <p className="whitespace-pre-line">{aiNotes}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">Select a video to view AI analysis</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === "upload" && (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Secure Video Upload</h2>
              <EncryptedVideoUpload />
            </div>
          )}
          
          {/* Video Player (always visible when a video is selected) */}
          {activeVideoId && activeVideoOfficeId && (
            <div className="mt-8 w-full max-w-4xl">
              <EncryptedVideoPlayer
                videoId={activeVideoId}
                videoOfficeId={activeVideoOfficeId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}