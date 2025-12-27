import { Router, Request, Response } from "express";
import { verifyFirebaseToken, AuthenticatedRequest } from "../middlewares/firebaseAuth";
import {
  getAuthUrl,
  getTokensFromCode,
  storeUserTokens,
} from "../services/googleOAuth.service";

const router = Router();

/**
 * GET /api/auth/google/url
 * Get Google OAuth2 authorization URL
 */
router.get(
  "/google/url",
  verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          message: "User authentication failed",
        });
      }

      const authUrl = getAuthUrl();
      res.json({
        success: true,
        authUrl,
      });
    } catch (error: any) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate authorization URL",
      });
    }
  }
);

/**
 * GET /api/auth/google/callback
 * Handle OAuth2 callback and store tokens
 */
router.get(
  "/google/callback",
  async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;

      if (!code || typeof code !== "string") {
        return res.status(400).json({
          success: false,
          message: "Authorization code is required",
        });
      }

      // Exchange code for tokens
      const tokens = await getTokensFromCode(code);

      // TODO: Extract userId from state parameter (should be passed from frontend)
      // For now, this endpoint should be called after user is authenticated
      // You may want to modify this to accept userId in the state or as a query param
      const userId = state as string;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Store tokens in Firestore
      await storeUserTokens(userId, tokens);

      res.json({
        success: true,
        message: "Google account connected successfully",
      });
    } catch (error: any) {
      console.error("Error in OAuth callback:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to complete authorization",
      });
    }
  }
);

export default router;



