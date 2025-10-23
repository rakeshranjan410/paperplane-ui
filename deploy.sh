#!/bin/bash

###############################################################################
# Paperplane UI - PM2 Deployment Script
# 
# This script pulls the latest changes from main branch, reinstalls 
# dependencies, rebuilds the app, restarts PM2, and configures Nginx + SSL.
#
# Usage: 
#   ./deploy.sh                                    # Self-signed SSL
#   ./deploy.sh yourdomain.com your@email.com      # Let's Encrypt SSL
#   ./deploy.sh --skip-nginx                       # Skip Nginx setup
###############################################################################

set -e  # Exit on any error

# Parse arguments
DOMAIN=""
EMAIL=""
SKIP_NGINX=false

if [ "$1" = "--skip-nginx" ]; then
    SKIP_NGINX=true
elif [ -n "$1" ]; then
    DOMAIN="$1"
    EMAIL="${2:-}"
fi

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

# Nginx + SSL Setup
if [ "$SKIP_NGINX" = false ]; then
    echo ""
    echo "=========================================="
    print_info "Setting up Nginx + SSL..."
    echo "=========================================="
    echo ""
    
    # Check if nginx directory exists
    if [ ! -d "nginx" ]; then
        print_warning "Nginx directory not found. Creating..."
        mkdir -p nginx
    fi
    
    # Check if setup script exists
    if [ -f "nginx/setup-nginx.sh" ]; then
        chmod +x nginx/setup-nginx.sh
        
        # Check if running as root
        if [ "$EUID" -eq 0 ]; then
            # Already root, run directly
            if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
                print_info "Setting up with Let's Encrypt for domain: $DOMAIN"
                cd nginx && ./setup-nginx.sh "$DOMAIN" "$EMAIL" && cd ..
            else
                print_info "Setting up with self-signed certificate"
                cd nginx && ./setup-nginx.sh && cd ..
            fi
            print_success "Nginx + SSL configured"
        else
            # Not root, need sudo
            print_warning "Nginx setup requires sudo privileges"
            if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
                print_info "Setting up with Let's Encrypt for domain: $DOMAIN"
                sudo bash -c "cd $(pwd)/nginx && ./setup-nginx.sh \"$DOMAIN\" \"$EMAIL\""
            else
                print_info "Setting up with self-signed certificate"
                sudo bash -c "cd $(pwd)/nginx && ./setup-nginx.sh"
            fi
            print_success "Nginx + SSL configured"
        fi
        
        # Reload nginx to pick up any config changes
        if command -v nginx &> /dev/null; then
            print_info "Reloading Nginx..."
            sudo systemctl reload nginx 2>/dev/null || true
        fi
    else
        print_warning "Nginx setup script not found at nginx/setup-nginx.sh"
        print_info "Run manually: cd nginx && sudo ./setup-nginx.sh"
    fi
fi

echo ""
echo "=========================================="
print_success "Deployment Complete! 🚀"
echo "=========================================="
echo ""

# Get public IP for display
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_IP")

if [ "$SKIP_NGINX" = false ]; then
    print_info "Your application is now accessible at:"
    if [ -n "$DOMAIN" ]; then
        echo "  HTTPS: https://$DOMAIN"
        echo "  HTTP:  http://$DOMAIN (redirects to HTTPS)"
    else
        echo "  HTTPS: https://$PUBLIC_IP"
        echo "  HTTP:  http://$PUBLIC_IP (redirects to HTTPS)"
        echo ""
        print_warning "Using self-signed certificate - browser will show security warning"
    fi
    echo ""
    print_info "Direct access (behind nginx):"
    echo "  http://localhost:3000"
else
    print_info "Your frontend is running on:"
    echo "  http://localhost:3000"
    echo "  http://$PUBLIC_IP:3000"
fi

echo ""
print_info "Useful commands:"
echo "  pm2 logs paperplane-ui         - View PM2 logs"
echo "  pm2 monit                      - Monitor in real-time"
echo "  pm2 restart paperplane-ui      - Restart server"
if [ "$SKIP_NGINX" = false ]; then
    echo "  sudo systemctl status nginx    - Check Nginx status"
    echo "  sudo systemctl reload nginx    - Reload Nginx config"
    echo "  sudo nginx -t                  - Test Nginx config"
fi
echo ""
print_info "For more information, see PM2_DEPLOYMENT.md"
echo ""
