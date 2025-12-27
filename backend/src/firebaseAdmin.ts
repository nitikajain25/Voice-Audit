import admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Initialize Firebase Admin
let serviceAccount: admin.ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Use environment variable (JSON string)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Use service account file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    path.join(__dirname, "../serviceAccount.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  } else {
    throw new Error(
      "Firebase service account not found. Please set FIREBASE_SERVICE_ACCOUNT " +
      "environment variable or place serviceAccount.json in the backend directory."
    );
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
