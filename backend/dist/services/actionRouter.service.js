"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeAction = routeAction;
exports.routeMultipleActions = routeMultipleActions;
const googleCalendar_service_1 = require("./googleCalendar.service");
const googleTasks_service_1 = require("./googleTasks.service");
const googleGmail_service_1 = require("./googleGmail.service");
/**
 * Route Gemini response to appropriate Google service
 */
async function routeAction(userId, geminiResponse) {
    try {
        switch (geminiResponse.action) {
            case "calendar":
                const event = await (0, googleCalendar_service_1.createCalendarEvent)(userId, geminiResponse);
                const startDate = event.start?.dateTime ? new Date(event.start.dateTime) : null;
                const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : null;
                return {
                    success: true,
                    action: "calendar",
                    message: "📅 Calendar event created successfully",
                    data: {
                        id: event.id,
                        title: event.summary,
                        description: event.description || "",
                        location: event.location || "",
                        start: startDate ? startDate.toLocaleString() : "Not specified",
                        end: endDate ? endDate.toLocaleString() : "Not specified",
                        startISO: event.start?.dateTime,
                        endISO: event.end?.dateTime,
                    },
                };
            case "task":
                const task = await (0, googleTasks_service_1.createTask)(userId, geminiResponse);
                const dueDate = task.due ? new Date(task.due) : null;
                return {
                    success: true,
                    action: "task",
                    message: "✅ Task created successfully",
                    data: {
                        id: task.id,
                        title: task.title,
                        notes: task.notes || "",
                        due: dueDate ? dueDate.toLocaleDateString() : "No due date",
                        dueISO: task.due,
                        status: task.status || "needsAction",
                    },
                };
            case "email":
                const email = await (0, googleGmail_service_1.sendEmail)(userId, geminiResponse);
                return {
                    success: true,
                    action: "email",
                    message: "📧 Email sent successfully",
                    data: {
                        id: email.id,
                        threadId: email.threadId,
                        recipient: geminiResponse.recipient || "",
                        subject: geminiResponse.subject || "",
                        body: geminiResponse.body || "",
                    },
                };
            case "unknown":
                return {
                    success: false,
                    action: "unknown",
                    message: "Could not determine the action from the input. Please be more specific.",
                };
            default:
                return {
                    success: false,
                    action: geminiResponse.action || "unknown",
                    message: `Unknown action type: ${geminiResponse.action}`,
                };
        }
    }
    catch (error) {
        console.error("Error routing action:", error);
        // Check if it's an OAuth error
        if (error.message?.includes("not authenticated") || error.message?.includes("OAuth") || error.message?.includes("connect")) {
            const actionType = geminiResponse.action === "calendar" ? "Calendar" :
                geminiResponse.action === "task" ? "Tasks" :
                    geminiResponse.action === "email" ? "Gmail" : "Google services";
            return {
                success: false,
                action: geminiResponse.action || "unknown",
                message: `🔗 Google account not connected. To use ${actionType}, please click the "🔗 Connect Google" button in the sidebar (bottom left) and complete the authorization.`,
                requiresAuth: true,
            };
        }
        return {
            success: false,
            action: geminiResponse.action || "unknown",
            message: error.message || "An error occurred while processing the action",
        };
    }
}
/**
 * Route multiple actions sequentially
 * Executes all actions and returns combined results
 */
async function routeMultipleActions(userId, geminiResponses) {
    const results = [];
    let successfulActions = 0;
    let failedActions = 0;
    // Execute all actions sequentially
    for (const geminiResponse of geminiResponses) {
        try {
            const result = await routeAction(userId, geminiResponse);
            results.push(result);
            if (result.success) {
                successfulActions++;
            }
            else {
                failedActions++;
            }
        }
        catch (error) {
            console.error(`Error executing action ${geminiResponse.action}:`, error);
            results.push({
                success: false,
                action: geminiResponse.action || "unknown",
                message: error.message || "An error occurred while processing the action",
            });
            failedActions++;
        }
    }
    const allSuccessful = failedActions === 0;
    const totalActions = geminiResponses.length;
    let summaryMessage = "";
    if (allSuccessful) {
        summaryMessage = `✅ Successfully completed all ${totalActions} action${totalActions > 1 ? 's' : ''}`;
    }
    else if (successfulActions > 0) {
        summaryMessage = `⚠️ Completed ${successfulActions} of ${totalActions} action${totalActions > 1 ? 's' : ''}`;
    }
    else {
        summaryMessage = `❌ Failed to complete any of the ${totalActions} action${totalActions > 1 ? 's' : ''}`;
    }
    return {
        success: allSuccessful,
        message: summaryMessage,
        results,
        totalActions,
        successfulActions,
        failedActions,
    };
}
//# sourceMappingURL=actionRouter.service.js.map