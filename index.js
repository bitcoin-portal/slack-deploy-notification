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

  let sha = null;

  if (typeof github.context.sha !== "undefined") {
    sha = github.context.sha;
  } else if (
    typeof github.context.payload.pull_request !== "undefined" &&
    typeof github.context.payload.pull_request.head !== "undefined" &&
    typeof github.context.payload.pull_request.head.sha !== "undefined"
  ) {
    sha = github.context.payload.pull_request.head.sha;
  }

  if (sha !== null && typeof sha !== "undefined") {
    const commitUrl = `https://github.com/${owner}/${repo}/commit/${sha}`;
    const actionUrl = commitUrl + "/checks";

    text += `\n<${actionUrl}|Action> | <${commitUrl}|Commit>`;
  }

  let envText = "Development";
  let envColor = "#f542ad";

  if (repositoryBranch === "staging") {
    envText = "Staging";
    envColor = "#bf42f5";
  } else if (repositoryBranch === "master") {
    envText = "Production";
    envColor = "#4287f5";
  }

  const body = {
    attachments: [
      {
        text: envText,
        color: envColor
      },
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
