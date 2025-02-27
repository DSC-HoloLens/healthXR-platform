import admin from "firebase-admin";
import { initializeApp, applicationDefault } from "firebase-admin/app";

// ✅ Set Emulator Config
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

// ✅ Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
  projectId: "healthxr-platform", // ⬅️ Make sure this matches your Firebase project ID
});

async function setSuperAdminRole(userId) {
  try {
    await admin.auth().setCustomUserClaims(userId, {
      role: "superadmin",
      officeId: "hq-office", // ✅ Ensure this is set!
    });
    console.log(`✅ Super Admin role and officeId set for ${userId}`);
  } catch (error) {
    console.error("❌ Error setting claims:", error);
  }
}

// Replace with your Super Admin's UID from Firebase Emulator
setSuperAdminRole("eH2RNp3c3tVbuQRbVE5ShkDUUlct");
