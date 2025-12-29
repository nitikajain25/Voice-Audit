import { GeminiResponse } from "./gemini.service";
export interface ActionResult {
    success: boolean;
    action: string;
    message: string;
    data?: any;
    requiresAuth?: boolean;
}
export interface MultiActionResult {
    success: boolean;
    message: string;
    results: ActionResult[];
    totalActions: number;
    successfulActions: number;
    failedActions: number;
}
/**
 * Route Gemini response to appropriate Google service
 */
export declare function routeAction(userId: string, geminiResponse: GeminiResponse): Promise<ActionResult>;
/**
 * Route multiple actions sequentially
 * Executes all actions and returns combined results
 */
export declare function routeMultipleActions(userId: string, geminiResponses: GeminiResponse[]): Promise<MultiActionResult>;
//# sourceMappingURL=actionRouter.service.d.ts.map