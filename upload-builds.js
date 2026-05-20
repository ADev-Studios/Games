// upload-builds.js
// Uploads local builds to GitHub as an artifact using GitHub's container API.

import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import FormData from "form-data";

const owner = "ADev-Studios";
const repo = "Games";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("ERROR: Missing GITHUB_TOKEN environment variable.");
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

async function uploadArtifact() {
  const buildsDir = path.join(process.cwd(), "builds");

  if (!fs.existsSync(buildsDir)) {
    console.error("ERROR: builds/ folder does not exist.");
    process.exit(1);
  }

  const files = fs.readdirSync(buildsDir).filter(f => f !== ".keep");

  if (files.length === 0) {
    console.error("ERROR: No builds found in /builds.");
    process.exit(1);
  }

  console.log("Uploading builds:", files);

  // 1. Create artifact container
  const container = await octokit.request(
    "POST /repos/{owner}/{repo}/actions/artifacts",
    {
      owner,
      repo,
      name: "game-builds",
      headers: { "X-GitHub-Api-Version": "2022-11-28" }
    }
  );

  const containerId = container.data.id;

  // 2. Upload each file using multipart/form-data
  for (const file of files) {
    const filePath = path.join(buildsDir, file);
    const fileData = fs.readFileSync(filePath);

    const form = new FormData();
    form.append("file", fileData, file);

    const uploadUrl = container.data.file_container_url;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    if (!res.ok) {
      console.error("Upload failed:", await res.text());
      process.exit(1);
    }
  }

  // 3. Finalize artifact
  await octokit.request(
    "PATCH /repos/{owner}/{repo}/actions/artifacts/{artifact_id}",
    {
      owner,
      repo,
      artifact_id: containerId,
      size_in_bytes: 1, // GitHub ignores this value
      headers: { "X-GitHub-Api-Version": "2022-11-28" }
    }
  );

  console.log("Builds uploaded successfully.");

  // 4. Trigger workflow
  await octokit.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: "upload-builds.yml",
    ref: "main"
  });

  console.log("Triggered upload-builds workflow.");
}

uploadArtifact();
