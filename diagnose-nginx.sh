#!/bin/bash

echo "=========================================="
echo "Paperplane UI - Nginx Diagnostic Script"
echo "=========================================="
echo ""

# Check if PM2 app is running
echo "1. Checking PM2 status..."
pm2 list | grep paperplane-ui
echo ""

# Check if app is listening on port 3000
echo "2. Checking if app is listening on port 3000..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ App is responding on port 3000"
else
    echo "❌ App is NOT responding on port 3000"
fi
echo ""

# Check nginx status
echo "3. Checking nginx status..."
sudo systemctl status nginx --no-pager | grep -E "(Active:|Loaded:)"
echo ""

# Check if paperplane config exists
echo "4. Checking nginx configuration files..."
if [ -f /etc/nginx/sites-available/paperplane ]; then
    echo "✅ /etc/nginx/sites-available/paperplane exists"
else
    echo "❌ /etc/nginx/sites-available/paperplane NOT found"
fi

if [ -L /etc/nginx/sites-enabled/paperplane ]; then
    echo "✅ /etc/nginx/sites-enabled/paperplane is linked"
else
    echo "❌ /etc/nginx/sites-enabled/paperplane NOT linked"
fi
echo ""

# Check if default site is enabled
echo "5. Checking default nginx site..."
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "⚠️  Default nginx site is enabled (this is the problem!)"
else
    echo "✅ Default nginx site is disabled"
fi
echo ""

# Check nginx config syntax
echo "6. Testing nginx configuration..."
sudo nginx -t
echo ""

echo "=========================================="
echo "RECOMMENDED ACTIONS:"
echo "=========================================="

# Provide fix commands if needed
if [ ! -f /etc/nginx/sites-available/paperplane ] || [ ! -L /etc/nginx/sites-enabled/paperplane ]; then
    echo ""
    echo "Run the nginx setup script:"
    echo "  cd ~/paperplane-v3/paperplane-ui"
    echo "  ./deploy.sh"
    echo ""
    echo "Or manually:"
    echo "  cd ~/paperplane-v3/paperplane-ui/nginx"
    echo "  sudo ./setup-nginx.sh"
fi

if [ -f /etc/nginx/sites-enabled/default ]; then
    echo ""
    echo "Disable the default nginx site:"
    echo "  sudo rm /etc/nginx/sites-enabled/default"
    echo "  sudo systemctl reload nginx"
fi

echo ""
