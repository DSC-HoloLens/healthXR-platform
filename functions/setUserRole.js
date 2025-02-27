const admin = require("firebase-admin");

// 🔹 Force Firebase Admin SDK to use the Authentication Emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.GCLOUD_PROJECT = "healthxr-platform"; // Replace with your actual project ID

// 🔹 Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT // Explicitly set project ID
});

async function setUserRole(uid, role, officeId = null) {
    const customClaims = { role: role };
    if (officeId) customClaims.officeId = officeId;

    try {
        await admin.auth().setCustomUserClaims(uid, customClaims);
        console.log(`✅ Role "${role}" assigned to user: ${uid}`);
    } catch (error) {
        console.error("❌ Error setting custom claims:", error);
    }
}

// 🔹 Set roles for test users (Replace UIDs with real ones from Emulator UI)
setUserRole("eH2RNp3c3tVbuQRbVE5ShkDUUlct", "superadmin");  // Full Access
setUserRole("wWnWgFnTinlDypv8k1iBiDQrbkAf", "officeadmin", "office123"); // Office Admin
setUserRole("Ocw6ApHI0CvW1soPcXd5PdlvkWgD", "user", "office123"); // Regular User
