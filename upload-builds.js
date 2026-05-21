// upload-builds.js — Sync index.json from a GitHub Release (after manual upload)

import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import { execSync } from "child_process";

const token = process.env.GITHUB_TOKEN;
const releaseUrl = process.env.RELEASE_URL;

if (!token) {
  console.error("ERROR: Missing GITHUB_TOKEN.");
  process.exit(1);
}

if (!releaseUrl) {
  console.error("ERROR: Missing RELEASE_URL.");
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

// Parse release URL
// Example: https://github.com/ADev-Studios/Games/releases/tag/latest
const parts = releaseUrl.split("/");
const owner = parts[3];
const repo = parts[4];
const tag = parts[7];

async function main() {
  console.log(`Fetching release: ${owner}/${repo} @ ${tag}`);

  // 1. Get release
  const release = await octokit.repos.getReleaseByTag({ owner, repo, tag });
  const assets = release.data.assets;

  console.log("Found assets:", assets.map(a => a.name));

  // 2. Load index.json
  const indexPath = path.join(process.cwd(), "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.games = index.games || [];

  // 3. Load thumbnails from /assets
  const assetDir = path.join(process.cwd(), "assets");
  const thumbnails = fs.readdirSync(assetDir).filter(f => f.endsWith(".png"));

  // 4. Process each asset
  for (const asset of assets) {
    const name = asset.name;
    const url = asset.browser_download_url;

    // Base name without extension
    const base = name.replace(/\..+$/, "");

    // Find or create game entry
    let game = index.games.find(g => g.name === base);
    if (!game) {
      game = { name: base };
      index.games.push(game);
    }

    // Detect platform
    if (name.endsWith(".exe")) game.windows = url;
    if (name.endsWith(".x86_64")) game.linux = url;

    // Detect thumbnail
    const thumb = thumbnails.find(t => t.startsWith(base));
    if (thumb) {
      game.thumbnail = `assets/${thumb}`;
    } else {
      game.thumbnail = "assets/default.png";
    }
  }

  // 5. Save index.json
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log("index.json updated.");

  // 6. Commit + push
  execSync("git add index.json");
  execSync('git commit -m "Auto-update index.json" || echo "No changes"');
  execSync("git push");

  console.log("index.json pushed.");
}

main();
