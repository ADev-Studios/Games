#!/bin/bash
echo "=== ADev Release Sync ==="

if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN not set."
  exit 1
fi

read -p "Enter the GitHub release URL: " RELEASE_URL
export RELEASE_URL

echo ""
echo "Upload your executables to the release now."
echo "Press ENTER when you're done."
read

node upload-builds.js

echo "Done."
