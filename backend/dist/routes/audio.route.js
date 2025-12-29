"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebaseAuth_1 = require("../middlewares/firebaseAuth");
const gemini_service_1 = require("../services/gemini.service");
const actionRouter_service_1 = require("../services/actionRouter.service");
const router = (0, express_1.Router)();
/**
 * POST /api/process
 * Process text input from frontend and execute action
 */
router.post("/process", firebaseAuth_1.verifyFirebaseToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== "string" || text.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Text input is required",
            });
            return;
        }
        if (!req.user?.uid) {
            res.status(401).json({
                success: false,
                message: "User authentication failed",
            });
            return;
        }
        // Analyze text with Gemini
        console.log("📝 Processing text with Gemini:", text.trim());
        let geminiResponse;
        try {
            geminiResponse = await (0, gemini_service_1.analyzeText)(text.trim());
            console.log("✅ Gemini response received:", geminiResponse);
        }
        catch (geminiError) {
            console.error("❌ Gemini API Error:", geminiError);
            res.status(500).json({
                success: false,
                message: `Gemini API Error: ${geminiError.message || "Failed to process text"}`,
                error: "GEMINI_ERROR",
            });
            return;
        }
        // Check if multiple actions are requested
        if (geminiResponse.actions && Array.isArray(geminiResponse.actions) && geminiResponse.actions.length > 0) {
            console.log(`🔄 Routing ${geminiResponse.actions.length} action(s)`);
            const multiResult = await (0, actionRouter_service_1.routeMultipleActions)(req.user.uid, geminiResponse.actions);
            console.log(`✅ Multi-action result: ${multiResult.successfulActions}/${multiResult.totalActions} successful`);
            if (multiResult.success) {
                res.status(200).json(multiResult);
            }
            else {
                res.status(400).json(multiResult);
            }
        }
        else {
            // Single action
            if (!geminiResponse.action) {
                res.status(400).json({
                    success: false,
                    message: "No action detected in the input. Please be more specific.",
                });
                return;
            }
            console.log("🔄 Routing action:", geminiResponse.action);
            const result = await (0, actionRouter_service_1.routeAction)(req.user.uid, geminiResponse);
            console.log("✅ Action result:", result.success ? "Success" : "Failed");
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
    }
    catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});
exports.default = router;
//# sourceMappingURL=audio.route.js.map