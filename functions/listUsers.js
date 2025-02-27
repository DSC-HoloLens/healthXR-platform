const admin = require("firebase-admin");

// 🔹 Manually set the Firebase project ID (same as your emulator project)
process.env.GCLOUD_PROJECT = "healthxr-platform"; // Replace with your actual project ID
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"; // Use emulator for Auth

// 🔹 Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT, // Explicitly set project ID
});

async function listAllUsers(nextPageToken) {
    try {
        const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
        listUsersResult.users.forEach((userRecord) => {
            console.log("User:", userRecord.toJSON());
        });

        if (listUsersResult.pageToken) {
            await listAllUsers(listUsersResult.pageToken);
        }
    } catch (error) {
        console.error("Error listing users:", error);
    }
}

listAllUsers();

