# Deployment Summary - Nginx + SSL Setup Complete ✅

Your deployment script has been updated to automatically configure Nginx with SSL certificates, routing HTTPS traffic (port 443) to your Node.js application (port 3000).

## 🎯 What's New

### Automated Nginx + SSL Setup
- **Single command deployment** with nginx configuration
- **Automatic SSL certificate** generation (self-signed or Let's Encrypt)
- **HTTPS enabled** on port 443
- **HTTP to HTTPS redirect** configured
- **Security headers** added automatically

## 🚀 How to Deploy

### Option 1: Self-Signed SSL (IP Address)
```bash
cd ~/paperplane-v3/paperplane-ui
./deploy.sh
```
**Result:** App accessible at `https://YOUR_EC2_IP` (browser will show security warning)

### Option 2: Let's Encrypt SSL (Domain Name)
```bash
cd ~/paperplane-v3/paperplane-ui
./deploy.sh yourdomain.com your@email.com
```
**Result:** App accessible at `https://yourdomain.com` (trusted certificate, no warnings)

### Option 3: Skip Nginx (HTTP only)
```bash
cd ~/paperplane-v3/paperplane-ui
./deploy.sh --skip-nginx
```
**Result:** App accessible at `http://YOUR_EC2_IP:3000`

## 📋 Before Deployment

### 1. Update AWS Security Group

**Required inbound rules:**

| Type | Port | Source | Description |
|------|------|--------|-------------|
| HTTPS | 443 | 0.0.0.0/0 | HTTPS traffic |
| HTTP | 80 | 0.0.0.0/0 | HTTP (redirects to HTTPS) |
| SSH | 22 | Your IP | SSH access |

**Steps:**
1. AWS Console → EC2 → Instances
2. Select instance → Security tab
3. Click security group → Edit inbound rules
4. Add HTTPS (443) and HTTP (80) rules
5. Save

### 2. (Optional) Point Domain to EC2

If using Let's Encrypt:
1. In your domain registrar, create an A record
2. Point it to your EC2 public IP
3. Wait for DNS propagation (use `dig yourdomain.com` to verify)
4. Use domain in deployment command

## 📁 New Files Created

```
paperplane-ui/
├── deploy.sh                    # ✨ Updated with nginx support
├── nginx/
│   ├── paperplane.conf         # Nginx configuration
│   ├── setup-nginx.sh          # Nginx + SSL setup script
│   └── README.md               # Detailed nginx documentation
└── DEPLOYMENT_SUMMARY.md       # This file
```

## 🔧 What Happens During Deployment

1. **Git Operations**
   - Stash uncommitted changes
   - Pull latest from main branch
   - Show recent commits

2. **Build Process**
   - Install dependencies (`npm install`)
   - Build production bundle (`npm run build`)
   - Create logs directory

3. **PM2 Deployment**
   - Stop old PM2 process
   - Start new process on port 3000
   - Save PM2 configuration
   - Test server health

4. **Nginx + SSL Setup** (unless `--skip-nginx`)
   - Install Nginx if not present
   - Generate SSL certificate (self-signed or Let's Encrypt)
   - Configure reverse proxy (443 → 3000)
   - Add security headers
   - Start and enable Nginx
   - Configure firewall (if UFW active)

5. **Post-Deployment**
   - Restore stashed changes
   - Display access URLs
   - Show useful commands

## 🌐 Access Your Application

### With Nginx (HTTPS)
- **HTTPS:** `https://YOUR_EC2_IP` or `https://yourdomain.com`
- **HTTP:** Automatically redirects to HTTPS
- **Direct:** `http://localhost:3000` (on EC2)

### Without Nginx (HTTP)
- **HTTP:** `http://YOUR_EC2_IP:3000`

## 🔐 SSL Certificates

### Self-Signed Certificate
- **Valid for:** 365 days
- **Browser warning:** Yes (expected)
- **Good for:** Testing, IP addresses
- **Location:** `/etc/nginx/ssl/paperplane.crt`

### Let's Encrypt Certificate
- **Valid for:** 90 days
- **Browser warning:** No
- **Good for:** Production, domains
- **Auto-renewal:** Yes (configured automatically)
- **Check status:** `sudo certbot certificates`
- **Test renewal:** `sudo certbot renew --dry-run`

## 📊 Architecture

```
Internet
   ↓
Port 443 (HTTPS) ──→ Nginx (SSL Termination)
Port 80 (HTTP)   ↗         ↓
                    Reverse Proxy
                           ↓
                  Port 3000 (Node.js App)
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Deployment completed without errors
- [ ] PM2 shows process as "online": `pm2 status`
- [ ] App responds on port 3000: `curl http://localhost:3000`
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] HTTPS accessible: Visit `https://YOUR_IP` in browser
- [ ] HTTP redirects to HTTPS
- [ ] No 502 errors (check nginx logs if any)
- [ ] SSL certificate installed: `sudo nginx -t`

## 🛠️ Useful Commands

### Deployment
```bash
./deploy.sh                              # Deploy with self-signed SSL
./deploy.sh yourdomain.com your@email.com  # Deploy with Let's Encrypt
./deploy.sh --skip-nginx                 # Deploy without nginx
```

### PM2
```bash
pm2 status                    # Check status
pm2 logs paperplane-ui        # View logs
pm2 restart paperplane-ui     # Restart app
pm2 monit                     # Monitor
```

### Nginx
```bash
sudo systemctl status nginx   # Check status
sudo systemctl reload nginx   # Reload config
sudo nginx -t                 # Test config
sudo tail -f /var/log/nginx/paperplane-ui.access.log  # Logs
```

### SSL/Certbot
```bash
sudo certbot certificates     # List certificates
sudo certbot renew           # Renew certificates
sudo certbot renew --dry-run # Test renewal
```

## 🐛 Troubleshooting

### Can't access https://YOUR_IP

**Check Security Group:**
```bash
# AWS Console → EC2 → Security Groups
# Ensure ports 80 and 443 are allowed from 0.0.0.0/0
```

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Browser shows "Your connection is not private"

**This is normal for self-signed certificates!**

**Options:**
1. Click "Advanced" → "Proceed to site" (temporary)
2. Use Let's Encrypt with a domain (permanent fix)
3. Use HTTP on port 3000 without nginx

### 502 Bad Gateway

**Nginx can't reach the app**

```bash
# Check if app is running
pm2 status
pm2 logs paperplane-ui

# Restart app
pm2 restart paperplane-ui

# Test app directly
curl http://localhost:3000
```

### Let's Encrypt fails

**Common causes:**
- Domain not pointing to EC2 IP
- DNS not propagated (wait 24-48 hours)
- Port 80 blocked in Security Group

**Debug:**
```bash
dig yourdomain.com           # Check DNS
curl http://yourdomain.com   # Test port 80
sudo certbot --help          # Certbot options
```

## 📚 Documentation

- **Quick Reference:** `/paperplane-v3/DEPLOY_CHEATSHEET.md`
- **Complete Guide:** `/paperplane-v3/NGINX_SSL_SETUP.md`
- **Nginx Details:** `/paperplane-v3/paperplane-ui/nginx/README.md`
- **PM2 Guide:** `/paperplane-v3/paperplane-ui/PM2_DEPLOYMENT.md`

## 🔄 Next Deployment

Future deployments are even simpler:

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Deploy (nginx setup cached, only updates if changed)
cd ~/paperplane-v3/paperplane-ui
./deploy.sh
```

Nginx will:
- Skip setup if already configured
- Update config if files changed
- Reload to pick up any changes

## 🎓 Pro Tips

1. **Use Let's Encrypt in production** - Free trusted certificates
2. **Set up monitoring** - CloudWatch, New Relic, etc.
3. **Enable auto-updates** - For OS security patches
4. **Backup regularly** - Especially before major changes
5. **Use domains** - Better than IP addresses
6. **Monitor certificate expiry** - `sudo certbot certificates`
7. **Check logs regularly** - `sudo tail -f /var/log/nginx/error.log`
8. **Test after each deployment** - Verify HTTPS works

## 🆘 Need Help?

1. Check error logs:
   - PM2: `pm2 logs paperplane-ui`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`

2. Review documentation:
   - Nginx setup: `nginx/README.md`
   - Full guide: `/paperplane-v3/NGINX_SSL_SETUP.md`

3. Test components:
   - App: `curl http://localhost:3000`
   - Nginx config: `sudo nginx -t`
   - DNS: `dig yourdomain.com`

4. Common fixes:
   - Restart app: `pm2 restart paperplane-ui`
   - Restart nginx: `sudo systemctl restart nginx`
   - Check Security Group in AWS Console

## 🎉 You're All Set!

Your deployment script now handles everything automatically:
- ✅ Git pull and build
- ✅ PM2 process management
- ✅ Nginx configuration
- ✅ SSL certificate setup
- ✅ HTTPS enabled
- ✅ Security headers
- ✅ HTTP to HTTPS redirect

Just run `./deploy.sh` and you're live with HTTPS! 🚀
