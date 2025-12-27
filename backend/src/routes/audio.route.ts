import { Router, Request, Response } from "express";
import { verifyFirebaseToken, AuthenticatedRequest } from "../middlewares/firebaseAuth";
import { analyzeText } from "../services/gemini.service";
import { routeAction } from "../services/actionRouter.service";

const router = Router();

/**
 * POST /api/process
 * Process text input from frontend and execute action
 */
router.post(
  "/process",
  verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Text input is required",
        });
      }

      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          message: "User authentication failed",
        });
      }

      // Analyze text with Gemini
      const geminiResponse = await analyzeText(text.trim());

      // Route to appropriate Google service
      const result = await routeAction(req.user.uid, geminiResponse);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
);

export default router;



