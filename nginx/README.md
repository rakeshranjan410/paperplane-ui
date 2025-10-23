# Nginx + SSL Setup for Paperplane UI

This directory contains Nginx configuration and SSL setup scripts to route HTTPS traffic (port 443) to your Node.js application (port 3000).

## Quick Start

### Option 1: Self-Signed Certificate (IP Address)
```bash
# Run deployment with nginx setup
./deploy.sh

# Or setup nginx manually
cd nginx
sudo ./setup-nginx.sh
```

**Result:** Your app will be accessible at `https://YOUR_EC2_IP` with a self-signed certificate (browser will show warning).

### Option 2: Let's Encrypt Certificate (Domain Name)
```bash
# Run deployment with Let's Encrypt
./deploy.sh yourdomain.com your@email.com

# Or setup nginx manually
cd nginx
sudo ./setup-nginx.sh yourdomain.com your@email.com
```

**Result:** Your app will be accessible at `https://yourdomain.com` with a trusted SSL certificate.

### Option 3: Skip Nginx Setup
```bash
# Deploy without nginx
./deploy.sh --skip-nginx
```

## What This Does

1. **Installs Nginx** (if not already installed)
2. **Generates SSL Certificate**:
   - Self-signed certificate for IP addresses
   - Let's Encrypt certificate for domains
3. **Configures Nginx** to:
   - Listen on port 443 (HTTPS)
   - Redirect port 80 (HTTP) to HTTPS
   - Proxy requests to your app on port 3000
   - Add security headers
4. **Configures Firewall** (if UFW is active)
5. **Starts Nginx** service

## Architecture

```
Internet → Port 443 (Nginx HTTPS) → Port 3000 (Node.js App)
           Port 80  (Nginx HTTP)  ↗
```

## Files

- **`paperplane.conf`** - Nginx configuration file
- **`setup-nginx.sh`** - Automated setup script
- **`README.md`** - This file

## Requirements

- **Root/sudo access** - Required for nginx installation and SSL setup
- **Domain name** (optional) - For Let's Encrypt SSL
- **EC2 Security Group** - Must allow ports 80 and 443

## AWS Security Group Setup

**Required Inbound Rules:**

| Type | Port | Source | Description |
|------|------|--------|-------------|
| HTTP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | 443 | 0.0.0.0/0 | HTTPS traffic |
| Custom TCP | 3000 | 127.0.0.1/32 | Internal app (optional) |

**Steps:**
1. AWS Console → EC2 → Instances
2. Select your instance
3. Security tab → Security group
4. Edit inbound rules
5. Add HTTP (80) and HTTPS (443) rules
6. Save rules

## Using Let's Encrypt (Recommended for Production)

### Prerequisites
- **Domain name** pointed to your EC2 IP
- **Email address** for certificate renewal notifications

### Setup

```bash
# Deploy with Let's Encrypt
./deploy.sh yourdomain.com your@email.com

# Or manual setup
cd nginx
sudo ./setup-nginx.sh yourdomain.com your@email.com
```

### Certificate Renewal

Let's Encrypt certificates are valid for 90 days. Certbot sets up automatic renewal.

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

**Manual renewal:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Auto-renewal:** Certbot creates a cron job or systemd timer automatically.

## Using Self-Signed Certificate

For development or when using an IP address instead of a domain.

```bash
# Deploy with self-signed certificate
./deploy.sh

# Or manual setup
cd nginx
sudo ./setup-nginx.sh
```

**Browser Warning:** Browsers will show a security warning because the certificate is not trusted by a Certificate Authority. This is normal for self-signed certificates.

**Bypass warning:**
- Chrome: Click "Advanced" → "Proceed to [site] (unsafe)"
- Firefox: Click "Advanced" → "Accept the Risk and Continue"
- Safari: Click "Show Details" → "visit this website"

## Manual Nginx Configuration

If you need to modify the nginx configuration:

```bash
# Edit configuration
sudo nano /etc/nginx/sites-available/paperplane
# or
sudo nano /etc/nginx/conf.d/paperplane.conf

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Troubleshooting

### Nginx won't start

```bash
# Check nginx status
sudo systemctl status nginx

# Check configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Port 443 not accessible

```bash
# Check if nginx is listening
sudo netstat -tlnp | grep :443
sudo lsof -i :443

# Check firewall
sudo ufw status

# Check AWS Security Group (most common issue)
# → Ensure port 443 is allowed from 0.0.0.0/0
```

### Let's Encrypt fails

```bash
# Check DNS
dig yourdomain.com
nslookup yourdomain.com

# Ensure domain points to your EC2 public IP
# Wait for DNS propagation (can take up to 48 hours)

# Check if port 80 is accessible (Let's Encrypt uses it for validation)
curl -I http://yourdomain.com
```

### Certificate expired

```bash
# Renew certificate
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx

# Check certificate expiry
sudo certbot certificates
```

### App not responding behind nginx

```bash
# Check if app is running
pm2 status

# Check if app is listening on port 3000
curl http://localhost:3000

# Check nginx proxy settings
sudo nginx -t

# View nginx access logs
sudo tail -f /var/log/nginx/paperplane-ui.access.log

# View nginx error logs
sudo tail -f /var/log/nginx/paperplane-ui.error.log
```

## Useful Commands

```bash
# Nginx
sudo systemctl start nginx      # Start nginx
sudo systemctl stop nginx       # Stop nginx
sudo systemctl restart nginx    # Restart nginx
sudo systemctl reload nginx     # Reload config (no downtime)
sudo systemctl status nginx     # Check status
sudo nginx -t                   # Test configuration

# SSL Certificates
sudo certbot certificates       # List certificates
sudo certbot renew             # Renew certificates
sudo certbot delete            # Delete certificates

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/paperplane-ui.access.log
sudo tail -f /var/log/nginx/paperplane-ui.error.log

# App
pm2 logs paperplane-ui         # View app logs
pm2 restart paperplane-ui      # Restart app
curl http://localhost:3000     # Test app directly
```

## Security Considerations

1. **Keep certificates updated** - Set up auto-renewal for Let's Encrypt
2. **Use strong SSL protocols** - TLS 1.2 and 1.3 only (already configured)
3. **Security headers** - Already included in nginx config
4. **Firewall rules** - Limit access as needed
5. **Regular updates** - Keep nginx and certbot updated

```bash
# Update packages
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo yum update -y                       # Amazon Linux/CentOS
```

## Production Checklist

- [ ] Domain name configured and pointing to EC2 IP
- [ ] AWS Security Group allows ports 80 and 443
- [ ] Let's Encrypt certificate installed (not self-signed)
- [ ] Certificate auto-renewal configured
- [ ] Nginx running and enabled on startup
- [ ] App running with PM2
- [ ] Tested HTTPS access from external network
- [ ] HTTP redirects to HTTPS
- [ ] Monitoring and logging configured

## Uninstall

To remove nginx and SSL setup:

```bash
# Stop and disable nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Remove nginx
sudo apt remove nginx -y       # Ubuntu/Debian
sudo yum remove nginx -y       # Amazon Linux/CentOS

# Remove SSL certificates
sudo certbot delete

# Remove configuration
sudo rm -f /etc/nginx/sites-available/paperplane
sudo rm -f /etc/nginx/sites-enabled/paperplane
sudo rm -f /etc/nginx/conf.d/paperplane.conf
sudo rm -rf /etc/nginx/ssl

# App will still run on port 3000
# Access directly: http://YOUR_IP:3000
```

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [AWS Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)
