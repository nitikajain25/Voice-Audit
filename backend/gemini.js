// gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTasks(transcript) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
You are an AI meeting assistant.
Extract action items from the transcript.

Return JSON only:
[
  {
    "assignee": "Name",
    "task": "Description",
    "due_date": "YYYY-MM-DD or null"
  }
]

Transcript:
"""${transcript}"""
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

module.exports = extractTasks;
