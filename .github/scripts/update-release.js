const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const owner = "ADev-Studios";
const repo = "Games";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

function detectPlatform(file) {
  if (file.endsWith(".exe")) return "windows";
  if (file.endsWith(".x86_64") || file.endsWith(".bin") || file.endsWith(".sh")) return "linux";
  return null;
}

function getGameName(file) {
  return file
    .replace(/\.(exe|x86_64|bin|sh)$/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

async function ensureRelease(game) {
  try {
    const release = await octokit.repos.getReleaseByTag({
      owner,
      repo,
      tag: game
    });
    return release.data;
  } catch {
    const release = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: game,
      name: game,
      draft: false,
      prerelease: false
    });
    return release.data;
  }
}

async function run() {
  const buildsDir = path.join(process.cwd(), "builds");
  const files = fs.readdirSync(buildsDir);

  const indexPath = path.join(process.cwd(), "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

  const games = {};

  // Group files by game
  for (const file of files) {
    const platform = detectPlatform(file);
    if (!platform) continue;

    const game = getGameName(file);
    if (!games[game]) games[game] = [];
    games[game].push({ file, platform });
  }

  for (const game of Object.keys(games)) {
    const release = await ensureRelease(game);
    const uploadUrl = release.upload_url;

    const downloads = {};

    for (const { file, platform } of games[game]) {
      const filePath = path.join(buildsDir, file);
      const zipName = `${game}-${platform}.zip`;
      const zipPath = path.join(buildsDir, zipName);

      execSync(`cd "${buildsDir}" && zip -j "${zipName}" "${file}"`);

      const data = fs.readFileSync(zipPath);

      await octokit.repos.uploadReleaseAsset({
        url: uploadUrl,
        headers: {
          "content-type": "application/zip",
          "content-length": data.length
        },
        name: zipName,
        data
      });

      downloads[platform] = `https://github.com/${owner}/${repo}/releases/download/${game}/${zipName}`;
    }

    // Update index.json
    let entry = index.find(g => g.folder === game);
    if (!entry) {
      entry = { folder: game, name: game, downloads: {} };
      index.push(entry);
    }

    entry.downloads = downloads;
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

run();
