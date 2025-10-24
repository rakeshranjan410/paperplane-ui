#!/bin/bash

echo "=========================================="
echo "Fixing Nginx Configuration"
echo "=========================================="
echo ""

# Check if PM2 app is running, if not start it
echo "1. Checking PM2 app..."
if ! pm2 list | grep -q "paperplane-ui.*online"; then
    echo "Starting PM2 app..."
    cd ~/paperplane-v3/paperplane-ui
    npm run pm2:start
else
    echo "✅ PM2 app is running"
fi
echo ""

# Run the deploy script which includes nginx setup
echo "2. Running deployment script..."
cd ~/paperplane-v3/paperplane-ui
./deploy.sh

echo ""
echo "=========================================="
echo "Testing the fix..."
echo "=========================================="
echo ""

# Wait a moment for services to start
sleep 2

# Test if app is accessible
echo "Testing http://localhost:3000..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ App is responding"
else
    echo "❌ App is not responding - check PM2 logs: pm2 logs paperplane-ui"
fi
echo ""

echo "Testing https://localhost..."
if curl -k -s https://localhost > /dev/null; then
    echo "✅ Nginx is serving the app"
else
    echo "❌ Nginx is not working - check logs: sudo tail -f /var/log/nginx/error.log"
fi
echo ""

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Your app should now be accessible at:"
echo "  https://YOUR_EC2_IP"
echo ""
echo "If you still see the nginx default page:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Try in an incognito/private window"
echo "3. Wait 30 seconds and try again"
echo ""
