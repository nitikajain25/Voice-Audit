"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config();
// Initialize Firebase Admin (may fail if serviceAccount.json is missing, but we'll handle it)
try {
    require("./firebaseAdmin");
    console.log("✅ Firebase Admin initialized");
}
catch (error) {
    console.warn("⚠️  Firebase Admin initialization failed:", error.message);
    console.warn("⚠️  Some features may not work. Make sure serviceAccount.json exists.");
    console.warn("⚠️  Backend will still start, but authentication features won't work.");
}
const audio_route_1 = __importDefault(require("./routes/audio.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const gemini_route_1 = __importDefault(require("./routes/gemini.route"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// CORS configuration
const corsOptions = {
    origin: function (_origin, callback) {
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}
// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
});
// Diagnostic endpoint for OAuth configuration
app.get("/api/diagnostics/oauth", (_req, res) => {
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
app.use("/api", audio_route_1.default);
app.use("/api/auth", auth_route_1.default);
app.use("/api/user", user_route_1.default);
app.use("/api/gemini", gemini_route_1.default);
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});
// 404 handler
app.use((_req, res) => {
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
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        console.warn("⚠️  Missing environment variables:", missingVars.join(", "));
        console.warn("Please check your .env file");
    }
});
//# sourceMappingURL=index.js.map