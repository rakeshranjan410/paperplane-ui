# PM2 Deployment Guide

This guide explains how to deploy and manage the Paperplane UI application using PM2 on a production server.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PM2** installed globally:
   ```bash
   npm install -g pm2
   ```

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

This will create an optimized production build in the `dist/` directory.

### 3. Create Logs Directory

```bash
mkdir -p logs
```

## PM2 Commands

### Start the Application

```bash
npm run pm2:start
```

Or directly:
```bash
pm2 start ecosystem.config.cjs
```

### Stop the Application

```bash
npm run pm2:stop
```

### Restart the Application

```bash
npm run pm2:restart
```

### View Logs

```bash
npm run pm2:logs
```

Or view specific log files:
```bash
# Error logs
pm2 logs paperplane-ui --err

# Output logs
pm2 logs paperplane-ui --out
```

### Check Status

```bash
npm run pm2:status
```

### Monitor Application

```bash
npm run pm2:monit
```

### Delete/Remove Application

```bash
npm run pm2:delete
```

## Important: Avoiding Port Conflicts

The configuration is set to use **single instance mode** (`instances: 1`) to avoid EADDRINUSE errors. If you need to scale:

1. Use a load balancer (like nginx) in front
2. Run multiple instances on different ports
3. Use PM2 cluster mode with proper port configuration

## Environment Configuration

The application uses the following ports by default:

- **Production**: Port 3000
- **Development**: Port 3001

You can override the port using the `PORT` environment variable:

```bash
PORT=8080 npm run pm2:start
```

Or modify `ecosystem.config.cjs`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 8080  // Change this
}
```

## Deployment Workflow

### First Time Deployment

```bash
# 1. Clone and navigate to project
cd /path/to/paperplane-ui

# 2. Install dependencies
npm install

# 3. Set up environment variables (copy from .env.example)
cp .env.example .env
# Edit .env with your configuration

# 4. Build the application
npm run build

# 5. Create logs directory
mkdir -p logs

# 6. Start with PM2
npm run pm2:start

# 7. Save PM2 process list (optional, for auto-restart on reboot)
pm2 save

# 8. Setup PM2 to start on system boot (optional)
pm2 startup
```

### Update Deployment

```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
npm install

# 3. Rebuild the application
npm run build

# 4. Restart PM2
npm run pm2:restart
```

## Auto-restart on System Reboot

To ensure PM2 and your application start automatically after a server reboot:

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

## Monitoring and Logs

### Log Locations

- Error logs: `./logs/pm2-error.log`
- Output logs: `./logs/pm2-out.log`
- Combined logs: `./logs/pm2-combined.log`

### Real-time Monitoring

```bash
# Dashboard view
pm2 monit

# Follow logs in real-time
pm2 logs paperplane-ui --lines 100
```

## Troubleshooting

### Port Already in Use (EADDRINUSE)

If you encounter port conflicts:

```bash
# 1. Stop all PM2 processes
pm2 stop all

# 2. Delete the app
pm2 delete paperplane-ui

# 3. Check if port is still in use
lsof -i :3000

# 4. Kill the process if needed
kill -9 <PID>

# 5. Restart
npm run pm2:start
```

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs paperplane-ui

# Check if build exists
ls -la dist/

# Rebuild if needed
npm run build
```

### Memory Issues

The app is configured to restart if memory usage exceeds 1GB. Adjust in `ecosystem.config.cjs`:

```javascript
max_memory_restart: '1G'  // Change as needed
```

## Production Best Practices

1. **Use Environment Variables**: Never commit `.env` files. Use `.env.example` as a template.
2. **Enable HTTPS**: Use a reverse proxy (nginx/Apache) with SSL certificates.
3. **Set up Monitoring**: Consider using PM2 Plus for advanced monitoring.
4. **Log Rotation**: Configure log rotation to prevent disk space issues:
   ```bash
   pm2 install pm2-logrotate
   ```
5. **Regular Updates**: Keep dependencies updated and rebuild regularly.

## Advanced Configuration

For advanced PM2 features, edit `ecosystem.config.cjs`:

- **Cluster mode**: Change `exec_mode: 'cluster'` and `instances: 'max'`
- **Auto-restart on file changes**: Set `watch: true`
- **Custom environment variables**: Add to `env` section
- **Graceful shutdown**: Adjust `kill_timeout` and `listen_timeout`

## Support

For more information:
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Project README: See `README.md`
