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
  const failureText = `Build failed...`;

  let color = "danger";
  let text = `*${repositoryName}* | ${repositoryBranch} | triggered by *${githubUsername}*\n`;

  if (jobStatus === "success") {
    color = "good";
    text += successText;
  } else {
    text += failureText;
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
