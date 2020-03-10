const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

try {
  const slackWebhook = core.getInput("slack-webhook");
  const jobStatus = core.getInput("job-status").toLowerCase();
  const deployedProjectUrl = core.getInput("deployed-project-url");
  const isManualDeploy = core.getInput("manual-deploy") === "true";
  const manualDeployUrl = core.getInput("manual-deploy-url");
  const manualDeployLabel = core.getInput("manual-deploy-label");

  const githubUsername = github.context.actor;
  const repositoryBranch = github.context.ref.split("/").pop();
  const { owner, repo } = github.context.repo;

  let successText = `Built and deployed successfully: ${deployedProjectUrl}`;

  if (isManualDeploy === true) {
    successText = `Built successfully! Will be available at ${deployedProjectUrl} after manual deployment.`;
  }

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

    if (isManualDeploy === true && jobStatus === "success") {
      text += ` | <${manualDeployUrl}|${manualDeployLabel}>`;
      text += `\nCommit hash: *${sha}*`;
    }
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
