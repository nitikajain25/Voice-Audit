"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminInitialized = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Initialize Firebase Admin
let serviceAccount = null;
let adminInitialized = false;
exports.adminInitialized = adminInitialized;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Use environment variable (JSON string) - REQUIRED for Railway/production
        console.log("📦 Using FIREBASE_SERVICE_ACCOUNT from environment variable");
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log("✅ Firebase service account parsed successfully");
        }
        catch (parseError) {
            console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", parseError.message);
            throw new Error("FIREBASE_SERVICE_ACCOUNT contains invalid JSON. Please check the format.");
        }
    }
    else {
        // Use service account file (for local development only)
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
            path.join(__dirname, "../serviceAccount.json");
        if (fs.existsSync(serviceAccountPath)) {
            console.log("📄 Using serviceAccount.json file from:", serviceAccountPath);
            try {
                serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
                console.log("✅ Firebase service account loaded from file");
            }
            catch (error) {
                console.error("❌ Error reading serviceAccount.json:", error);
                throw new Error("Invalid serviceAccount.json file");
            }
        }
        else {
            // In production (Railway), this is expected - user must set FIREBASE_SERVICE_ACCOUNT
            if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT) {
                console.error("❌ FIREBASE_SERVICE_ACCOUNT environment variable is required in production!");
                console.error("   Please set FIREBASE_SERVICE_ACCOUNT in Railway environment variables.");
                console.error("   Copy the entire contents of serviceAccount.json as a JSON string.");
                throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is required in production. " +
                    "Set it in Railway dashboard with the full JSON content from serviceAccount.json");
            }
            else {
                // Development mode - just warn
                console.warn("⚠️  serviceAccount.json not found at:", serviceAccountPath);
                console.warn("⚠️  For production, set FIREBASE_SERVICE_ACCOUNT environment variable");
                throw new Error("Firebase service account not found. Please set FIREBASE_SERVICE_ACCOUNT " +
                    "environment variable or place serviceAccount.json in the backend directory.");
            }
        }
    }
    if (serviceAccount && !firebase_admin_1.default.apps.length) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        exports.adminInitialized = adminInitialized = true;
        console.log("✅ Firebase Admin initialized successfully");
    }
}
catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT) {
        console.error("⚠️  CRITICAL: Authentication features will NOT work without Firebase Admin!");
        console.error("⚠️  Please set FIREBASE_SERVICE_ACCOUNT in Railway environment variables.");
    }
    else {
        console.warn("⚠️  Server will start but authentication features won't work.");
    }
    exports.adminInitialized = adminInitialized = false;
}
// Export admin (may be uninitialized, but won't crash imports)
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebaseAdmin.js.map