import { google } from "googleapis";
import admin from "../firebaseAdmin";

const OAuth2Client = google.auth.OAuth2Client;

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback"
);

// Scopes required for Calendar, Tasks, and Gmail
export const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/gmail.send",
];

/**
 * Get authorization URL for OAuth2 flow
 */
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.refresh_token) {
    throw new Error("No refresh token received. User may need to re-authorize.");
  }

  return {
    access_token: tokens.access_token || "",
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date || Date.now(),
  };
}

/**
 * Store tokens in Firestore for a user
 */
export async function storeUserTokens(
  userId: string,
  tokens: { access_token: string; refresh_token: string; expiry_date: number }
): Promise<void> {
  const db = admin.firestore();
  await db.collection("userTokens").doc(userId).set({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Get stored tokens for a user
 */
export async function getUserTokens(userId: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
} | null> {
  const db = admin.firestore();
  const doc = await db.collection("userTokens").doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  return {
    access_token: data?.access_token || "",
    refresh_token: data?.refresh_token || "",
    expiry_date: data?.expiry_date || 0,
  };
}

/**
 * Get a valid access token for a user (refresh if needed)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const tokens = await getUserTokens(userId);
  
  if (!tokens) {
    throw new Error("User not authenticated with Google. Please complete OAuth flow.");
  }

  // Check if token is expired (with 5 minute buffer)
  const now = Date.now();
  const expiryBuffer = 5 * 60 * 1000; // 5 minutes

  if (tokens.expiry_date - now < expiryBuffer) {
    // Token expired or about to expire, refresh it
    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    // Update stored tokens
    await storeUserTokens(userId, {
      access_token: credentials.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
    });

    return credentials.access_token;
  }

  return tokens.access_token;
}

/**
 * Get authenticated OAuth2 client for a user
 */
export async function getAuthenticatedClient(userId: string): Promise<typeof oauth2Client> {
  const accessToken = await getValidAccessToken(userId);
  const tokens = await getUserTokens(userId);
  
  if (!tokens) {
    throw new Error("Failed to get user tokens");
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: tokens.refresh_token,
  });

  return oauth2Client;
}

