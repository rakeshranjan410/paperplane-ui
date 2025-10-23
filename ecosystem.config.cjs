module.exports = {
  apps: [{
    name: 'paperplane-ui',
    script: './server.js',
    instances: 1, // Single instance to avoid port conflicts
    exec_mode: 'fork', // Use fork mode for single instance
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // Advanced features
    autorestart: true,
    watch: false, // Set to true if you want PM2 to restart on file changes
    max_memory_restart: '1G',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Error handling
    max_restarts: 10,
    min_uptime: '10s',
    
    // Delay between restarts
    restart_delay: 4000
  }]
};
