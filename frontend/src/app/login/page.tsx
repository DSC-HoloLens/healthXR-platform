"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    // ✅ Prevent hydration issues by checking the window object
    if (typeof window !== "undefined") {
      setLoading(false); // ✅ Ensure client-side rendering
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("🟡 Attempting login with:", email);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Logged in as:", userCredential.user.email);

      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.error("❌ User not found in Firestore. Login denied.");
        setError("User does not exist in Firestore. Contact an admin.");
        return;
      }

      // Fetch user role and office ID from Firestore
      const userData = userDoc.data();
      setRole(userData.role || "unknown");
      setOfficeId(userData.officeId || null);

      // 🚨 Reject login if officeId is missing
      if (!userData.officeId) {
        console.error("❌ User does not have an assigned office. Login denied.");
        setError("You must be assigned to an office to log in. Contact an admin.");
        return;
      }

      console.log("🔹 User Role:", userData.role);
      console.log("🔹 Office ID:", userData.officeId);

    } catch (err: any) {
      console.error("❌ Login Error:", err.message);
      setError(err.message);
    }
  };

  // ✅ Show loading message to prevent hydration mismatch
  if (loading) {
    return <p className="text-center text-gray-500">🔄 Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input 
          type="email" 
          placeholder="Email" 
          className="border p-2 rounded" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-2 rounded" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
      
      {role && (
        <p className="mt-4 text-lg">🔹 Your Role: <b>{role}</b></p>
      )}

      {officeId && (
        <p className="mt-4 text-lg">🏢 Office ID: <b>{officeId}</b></p>
      )}
    </div>
  );
}
