import { Request } from "express";
import { CorsOptionsDelegate } from "cors";

/* ================== ENV DOMAINS ================== */

// Vercel production domain (frontend)
// Can be set as full URL (https://voice-audit.vercel.app) or just domain (voice-audit.vercel.app)
const PROD_DOMAIN_RAW =
  process.env.VERCEL_PROD_DOMAIN ?? "https://voice-audit.vercel.app";
const PROD_DOMAIN = PROD_DOMAIN_RAW.startsWith("http")
  ? PROD_DOMAIN_RAW
  : `https://${PROD_DOMAIN_RAW}`;

// Optional custom frontend domain (e.g. app.yourco.com)
const CUSTOM_WEB_DOMAIN = process.env.WEB_APP_DOMAIN;

// Optional full URL override
const APP_BASE_URL = process.env.APP_BASE_URL;

/* ================== LOCAL DEV ================== */

const LOCAL_ORIGINS: string[] = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

/* ================== EXACT ORIGINS ================== */

const EXACT_ORIGINS = new Set<string>([
  ...LOCAL_ORIGINS,
  PROD_DOMAIN,
]);

if (CUSTOM_WEB_DOMAIN) {
  EXACT_ORIGINS.add(`https://${CUSTOM_WEB_DOMAIN}`);
}

if (APP_BASE_URL) {
  EXACT_ORIGINS.add(APP_BASE_URL);
}

/* ================== VERCEL PREVIEW REGEX ================== */

const VERCEL_REGEX = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/;

/* ================== CORS OPTIONS ================== */

export const corsOptions: CorsOptionsDelegate<Request> = (
  req,
  callback
) => {
  const origin = req.get("Origin"); // string | undefined

  // Allow non-browser requests (curl, Postman, Railway health checks)
  if (!origin) {
    return callback(null, { origin: true });
  }

  const isAllowed =
    EXACT_ORIGINS.has(origin) || VERCEL_REGEX.test(origin);

  callback(null, {
    origin: isAllowed,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Disposition"],
  });
};