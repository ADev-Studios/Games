// upload-builds.js
// Uploads local builds to GitHub as an artifact without committing them.

import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import AdmZip from "adm-zip";

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

  // Trigger workflow
  await octokit.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: "upload-builds.yml",
    ref: "main"
  });

  console.log("Triggered upload-builds workflow.");

  // Zip builds
  const zipper = new AdmZip();

  files.forEach(file => {
    zipper.addLocalFile(path.join(buildsDir, file));
  });

  const zipped = zipper.toBuffer();

  // Upload artifact
  const artifactUrl = `https://uploads.github.com/repos/${owner}/${repo}/actions/artifacts?name=game-builds`;

  const res = await fetch(artifactUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip",
      "Content-Length": zipped.length
    },
    body: zipped
  });

  if (!res.ok) {
    console.error("Artifact upload failed:", await res.text());
    process.exit(1);
  }

  console.log("Builds uploaded successfully.");
}

uploadArtifact();
