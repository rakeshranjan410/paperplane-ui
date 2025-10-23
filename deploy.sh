#!/bin/bash

# Paperplane UI - PM2 Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Paperplane UI deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed. Please install it first:${NC}"
    echo "   npm install -g pm2"
    exit 1
fi

echo -e "${GREEN}✓ PM2 is installed${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please update .env with your configuration before proceeding!${NC}"
        exit 1
    else
        echo -e "${RED}❌ No .env.example file found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Environment file exists${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs
echo -e "${GREEN}✓ Logs directory ready${NC}"

# Check if app is already running
if pm2 list | grep -q "paperplane-ui"; then
    echo "🔄 Restarting existing application..."
    npm run pm2:restart
else
    echo "🚀 Starting application with PM2..."
    npm run pm2:start
fi

# Save PM2 process list
pm2 save

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "💡 Useful commands:"
echo "   - View logs:    npm run pm2:logs"
echo "   - Monitor:      npm run pm2:monit"
echo "   - Restart:      npm run pm2:restart"
echo "   - Stop:         npm run pm2:stop"
echo ""
echo "📖 For more information, see PM2_DEPLOYMENT.md"
