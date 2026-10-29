#!/bin/bash

# 🚀 Cesium Flight Simulator Cloudflare Pages Deployment Script
# This script:
# 1. Builds the web app
# 2. Deploys to Cloudflare Pages via Wrangler CLI

set -e  # Exit on error

# Script expects to be run from project root
PROJECT_ROOT="$(pwd)"
WEB_DIR="$PROJECT_ROOT/packages/web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Cesium Flight Simulator Deployment (Cloudflare Pages)${NC}"
echo "===================================================="

# Check if wrangler is installed
if ! command -v npx wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: Wrangler CLI not found${NC}"
    echo ""
    echo "Install it globally:"
    echo "  npm install -g wrangler"
    echo ""
    echo "Or locally in the project:"
    echo "  npm install --save-dev wrangler"
    exit 1
fi

echo -e "${GREEN}✓${NC} Wrangler CLI found"

# Load .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${BLUE}📄 Loading .env file...${NC}"
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Validate required environment variables
REQUIRED_VARS=(
    "CLOUDFLARE_ACCOUNT_ID"
    "CLOUDFLARE_API_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: $var is not set in .env${NC}"
        echo ""
        echo "Add these to your .env file in project root:"
        echo "  CLOUDFLARE_ACCOUNT_ID=your_account_id"
        echo "  CLOUDFLARE_API_TOKEN=your_api_token"
        echo ""
        echo "Get them from: https://dash.cloudflare.com/profile/api-tokens"
        exit 1
    fi
done

echo -e "${GREEN}✓${NC} Cloudflare credentials validated"

# Set Wrangler environment variables
export CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"
export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"

PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT_NAME:-realestate3d}"
echo -e "${BLUE}📦 Project: $PROJECT_NAME${NC}"

# Step 1: Build the app
echo ""
echo -e "${BLUE}🔨 Building web app...${NC}"
cd "$WEB_DIR"

# Clean previous build
if [ -d "./dist" ]; then
    rm -rf ./dist
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "./node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Build
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build successful"

# Verify dist exists
if [ ! -d "./dist" ]; then
    echo -e "${RED}❌ Error: dist/ directory not found after build${NC}"
    exit 1
fi

# Step 2: Deploy to Cloudflare Pages
echo ""
echo -e "${BLUE}🚀 Deploying to Cloudflare Pages...${NC}"

npx wrangler pages deploy ./dist \
  --project-name="$PROJECT_NAME" \
  --branch=main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Deployment successful"

# Step 3: Output deployment info
echo ""
echo -e "${GREEN}===================================================="
echo "✅ Deployment Complete!"
echo "====================================================${NC}"
echo ""
echo "Project: $PROJECT_NAME"
echo "Preview URL: https://$PROJECT_NAME.pages.dev"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Configure custom domain in Cloudflare Dashboard:"
echo "   https://dash.cloudflare.com → Pages → $PROJECT_NAME → Custom domains"
echo ""
echo "2. Add custom domain (e.g., app.realestate3d.com)"
echo ""
echo "3. Set up environment variables in Cloudflare Pages:"
echo "   - VITE_MAPBOX_TOKEN (if not using in-app setup)"
echo "   - VITE_CESIUM_TOKEN (if not using in-app setup)"
echo ""
echo -e "${BLUE}🧪 Test deployment:${NC}"
echo "  https://$PROJECT_NAME.pages.dev"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Users can configure API tokens in-app on first launch"

