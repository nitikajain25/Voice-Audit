import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Initialize Firebase Admin (may fail if serviceAccount.json is missing, but we'll handle it)
try {
  require("./firebaseAdmin");
  console.log("✅ Firebase Admin initialized");
} catch (error: any) {
  console.warn("⚠️  Firebase Admin initialization failed:", error.message);
  console.warn("⚠️  Some features may not work. Make sure serviceAccount.json exists.");
  console.warn("⚠️  Backend will still start, but authentication features won't work.");
}

import audioRoute from "./routes/audio.route";
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import geminiRoute from "./routes/gemini.route";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS configuration
const corsOptions = {
  origin: function (_origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // In production, you can restrict to specific origins
    // For now, allow all origins for easier deployment
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Diagnostic endpoint for OAuth configuration
app.get("/api/diagnostics/oauth", (_req: Request, res: Response) => {
  const diagnostics = {
    environment: process.env.NODE_ENV || "development",
    googleOAuth: {
      clientId: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "❌ Missing",
      redirectUriValid: process.env.GOOGLE_REDIRECT_URI 
        ? (process.env.GOOGLE_REDIRECT_URI.includes("localhost") && process.env.NODE_ENV === "production" ? "⚠️ Localhost in production" : "✅ Valid")
        : "❌ Not set",
    },
    firebase: {
      serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ? "✅ Set (JSON string)" : 
                     (process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? "✅ Set (file path)" : "❌ Missing"),
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing",
    },
    timestamp: new Date().toISOString(),
  };
  
  res.json(diagnostics);
});

// Routes
app.use("/api", audioRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/gemini", geminiRoute);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  
  // Validate required environment variables
  const requiredEnvVars = [
    "GEMINI_API_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];
  
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn("⚠️  Missing environment variables:", missingVars.join(", "));
    console.warn("Please check your .env file");
  }
});
