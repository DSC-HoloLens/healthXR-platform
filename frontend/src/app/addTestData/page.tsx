"use client";

import { db } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";

export default function AddTestData() {
  const addTestData = async () => {
    try {
      // 🔹 Create a Super Admin user
      await setDoc(doc(db, "users", "user123"), {
        email: "draarondeforest@gmail.com",
        role: "superadmin",
        officeId: "hq-office"
      });

      // 🔹 Create an Office
      await setDoc(doc(db, "offices", "office123"), {
        name: "Dental Office A",
        location: "New York"
      });

      alert("✅ Test data added!");
    } catch (err) {
      console.error("❌ Error adding data:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Add Firestore Test Data</h1>
      <button 
        onClick={addTestData} 
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Test Data
      </button>
    </div>
  );
}
