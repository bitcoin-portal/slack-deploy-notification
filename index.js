const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

try {
  const slackWebhook = core.getInput("slack-webhook");
  const jobStatus = core.getInput("job-status");
  const deployedProjectUrl = core.getInput("deployed-project-url");

  const githubUsername = github.context.actor;
  const repositoryName = github.context.repo.repo;
  const repositoryBranch = github.context.ref.split("/").pop();

  const successText = `Built and deployed successfully: ${deployedProjectUrl}`;
  const cancelledText = `Build cancelled.`;
  const failureText = `Build failed...`;

  let color = "good";
  let text = `*${repositoryName}* | ${repositoryBranch} | triggered by *${githubUsername}*\n`;

  if (jobStatus === "failure") {
    color = "danger";
    text += failureText;
  } else if (jobStatus === "cancelled") {
    color = "warning";
    text += cancelledText;
  } else {
    text += successText;
  }

  const body = {
    attachments: [
      {
        color,
        text
      }
    ]
  };

  axios.post(slackWebhook, body);
} catch (error) {
  core.setFailed(error.message);
}
