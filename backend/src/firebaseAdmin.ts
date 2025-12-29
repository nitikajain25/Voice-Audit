import admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Initialize Firebase Admin
let serviceAccount: admin.ServiceAccount | null = null;
let adminInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Use environment variable (JSON string) - REQUIRED for Railway/production
    console.log("📦 Using FIREBASE_SERVICE_ACCOUNT from environment variable");
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log("✅ Firebase service account parsed successfully");
    } catch (parseError: any) {
      console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", parseError.message);
      throw new Error("FIREBASE_SERVICE_ACCOUNT contains invalid JSON. Please check the format.");
    }
  } else {
    // Use service account file (for local development only)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      path.join(__dirname, "../serviceAccount.json");
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log("📄 Using serviceAccount.json file from:", serviceAccountPath);
      try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        console.log("✅ Firebase service account loaded from file");
      } catch (error) {
        console.error("❌ Error reading serviceAccount.json:", error);
        throw new Error("Invalid serviceAccount.json file");
      }
    } else {
      // In production (Railway), this is expected - user must set FIREBASE_SERVICE_ACCOUNT
      if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT) {
        console.error("❌ FIREBASE_SERVICE_ACCOUNT environment variable is required in production!");
        console.error("   Please set FIREBASE_SERVICE_ACCOUNT in Railway environment variables.");
        console.error("   Copy the entire contents of serviceAccount.json as a JSON string.");
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT environment variable is required in production. " +
          "Set it in Railway dashboard with the full JSON content from serviceAccount.json"
        );
      } else {
        // Development mode - just warn
        console.warn("⚠️  serviceAccount.json not found at:", serviceAccountPath);
        console.warn("⚠️  For production, set FIREBASE_SERVICE_ACCOUNT environment variable");
        throw new Error(
          "Firebase service account not found. Please set FIREBASE_SERVICE_ACCOUNT " +
          "environment variable or place serviceAccount.json in the backend directory."
        );
      }
    }
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminInitialized = true;
    console.log("✅ Firebase Admin initialized successfully");
  }
} catch (error: any) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT) {
    console.error("⚠️  CRITICAL: Authentication features will NOT work without Firebase Admin!");
    console.error("⚠️  Please set FIREBASE_SERVICE_ACCOUNT in Railway environment variables.");
  } else {
    console.warn("⚠️  Server will start but authentication features won't work.");
  }
  adminInitialized = false;
}

// Export admin (may be uninitialized, but won't crash imports)
export default admin;
export { adminInitialized };
