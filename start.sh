#!/bin/bash
cd "$(dirname "$0")/server"
echo "Starting Mortar CMS..."
npx tsx src/index.ts
