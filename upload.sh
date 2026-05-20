#!/bin/bash

echo "=== ADev Game Build Uploader ==="

# Check for GITHUB_TOKEN
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN is not set."
  echo "Set it with: export GITHUB_TOKEN=YOUR_TOKEN"
  exit 1
fi

# Check for Node
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  exit 1
fi

# Run uploader
echo "Uploading builds..."
node upload-builds.js

echo "Done."
