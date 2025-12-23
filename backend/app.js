const express = require("express");
const upload = require("./upload");
const extractTasks = require("./gemini");
const createGoogleTask = require("./tasks");
const firestore = require("./firebase");

const app = express();

app.post("/listen", upload.single("audio"), async (req, res) => {
  try {
    const transcript = req.body.transcript; // or from speech API
    const oauthClient = req.oauthClient;

    const tasks = await extractTasks(transcript);

    for (const task of tasks) {
      await createGoogleTask(oauthClient, task);
    }

    await firestore.collection("audits").add({
      transcript,
      tasks,
      createdAt: new Date(),
    });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
