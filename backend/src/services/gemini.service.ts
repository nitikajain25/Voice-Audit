import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeminiResponse {
  action: "calendar" | "task" | "email" | "unknown";
  title?: string;
  description?: string;
  date?: string; // ISO date string or relative date
  time?: string; // Time in HH:MM format
  duration?: number; // Duration in minutes (for calendar events)
  location?: string; // For calendar events
  recipient?: string; // Email address for email action
  subject?: string; // Email subject
  body?: string; // Email body
  dueDate?: string; // For tasks
  priority?: "low" | "medium" | "high"; // For tasks
}

export async function analyzeText(text: string): Promise<GeminiResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Analyze the following user input and extract structured information. Determine the action type (calendar, task, or email) and extract relevant details.

User input: "${text}"

Return a JSON object with the following structure based on the action type:

For CALENDAR events:
{
  "action": "calendar",
  "title": "Event title",
  "description": "Event description",
  "date": "YYYY-MM-DD or relative date like 'tomorrow', 'next Monday'",
  "time": "HH:MM in 24-hour format",
  "duration": number in minutes,
  "location": "Event location if mentioned"
}

For TASKS:
{
  "action": "task",
  "title": "Task title",
  "description": "Task description",
  "dueDate": "YYYY-MM-DD or relative date",
  "priority": "low" | "medium" | "high"
}

For EMAIL:
{
  "action": "email",
  "recipient": "email@example.com",
  "subject": "Email subject",
  "body": "Email body content"
}

If the action cannot be determined, return:
{
  "action": "unknown",
  "title": "Extracted title if any"
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean the response - remove markdown code blocks if present
    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    const parsed = JSON.parse(cleanedText) as GeminiResponse;
    return parsed;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse Gemini response");
  }
}
