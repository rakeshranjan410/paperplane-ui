#!/bin/bash

###############################################################################
# Paperplane UI - PM2 Deployment Script
# 
# This script pulls the latest changes from main branch, reinstalls 
# dependencies, rebuilds the app, and restarts PM2.
#
# Usage: 
#   chmod +x deploy.sh
#   ./deploy.sh
###############################################################################

set -e  # Exit on any error

echo "🚀 Starting Paperplane UI deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo ""
echo "=========================================="
echo "  Paperplane UI - Deployment Script"
echo "=========================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Please run this script from the project root."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Stash any uncommitted changes
print_info "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Stashing them..."
    git stash
    STASHED=true
    print_success "Changes stashed"
else
    STASHED=false
    print_success "No uncommitted changes"
fi

# Pull latest changes from main
print_info "Pulling latest changes from main branch..."
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Switching to main branch..."
    git checkout main
fi

git pull origin main
print_success "Latest changes pulled"

# Show what changed
echo ""
print_info "Recent commits:"
git log --oneline -5
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install it first: npm install -g pm2"
    exit 1
fi

print_success "PM2 is installed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning "No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please update .env with your configuration before proceeding!"
        exit 1
    else
        print_error "No .env.example file found"
        exit 1
    fi
fi

print_success "Environment file exists"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Build the application
print_info "Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Build successful"

# Create logs directory if it doesn't exist
mkdir -p logs
print_success "Logs directory ready"

# Stop existing PM2 process if running
if pm2 list | grep -q "paperplane-ui"; then
    print_info "Stopping existing application..."
    pm2 delete paperplane-ui 2>/dev/null || true
    print_success "Existing application stopped"
fi

# Wait a moment for process to fully stop
sleep 2

# Start application with PM2
print_info "Starting application with PM2..."
pm2 start ecosystem.config.cjs
print_success "Application started"

# Save PM2 process list
print_info "Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

echo ""
print_info "Current PM2 status:"
pm2 status
echo ""

# Wait for server to start
print_info "Waiting for server to start..."
sleep 3

# Test if server is running
print_info "Testing server health..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Server is running! ✓"
else
    print_warning "Server might not be ready yet. Check logs: pm2 logs paperplane-ui"
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo ""
    print_warning "Restoring stashed changes..."
    git stash pop
    print_success "Stashed changes restored"
fi

echo ""
echo "=========================================="
print_success "Deployment Complete! 🚀"
echo "=========================================="
echo ""
print_info "Your frontend is now running with the latest changes."
echo ""
print_info "Useful commands:"
echo "  pm2 logs paperplane-ui    - View logs"
echo "  pm2 monit                 - Monitor in real-time"
echo "  pm2 restart paperplane-ui - Restart server"
echo ""
print_info "For more information, see PM2_DEPLOYMENT.md"
echo ""
