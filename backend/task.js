const { google } = require("googleapis");

async function createGoogleTask(oauthClient, task) {
  const tasks = google.tasks({ version: "v1", auth: oauthClient });

  await tasks.tasks.insert({
    tasklist: "@default",
    requestBody: {
      title: `${task.task} (${task.assignee})`,
      due: task.due_date ? new Date(task.due_date).toISOString() : undefined,
    },
  });
}

module.exports = createGoogleTask;
