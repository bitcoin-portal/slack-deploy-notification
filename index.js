const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

try {
  const slackWebhook = core.getInput("slack-webhook");
  const jobStatus = core.getInput("job-status").toLowerCase();
  const deployedProjectUrl = core.getInput("deployed-project-url");

  const githubUsername = github.context.actor;
  const repositoryBranch = github.context.ref.split("/").pop();
  const { owner, repo } = github.context.repo;
  const { sha } = github.context.sha;

  const successText = `Built and deployed successfully: ${deployedProjectUrl}`;
  const cancelledText = `Build cancelled.`;
  const failureText = `Build failed...`;

  let color = "good";
  let text = `*${repo}* | ${repositoryBranch} | triggered by *${githubUsername}*\n`;

  if (jobStatus === "failure") {
    color = "danger";
    text += failureText;
  } else if (jobStatus === "cancelled") {
    color = "warning";
    text += cancelledText;
  } else {
    text += successText;
  }

  const commitUrl = `https://github.com/${owner}/${repo}/commit/${sha}`;
  const actionUrl = commitUrl + "/checks";

  text += `\n<${actionUrl}|Action> | <${commitUrl}|Commit>`;

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
