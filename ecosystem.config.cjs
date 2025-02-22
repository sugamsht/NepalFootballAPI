module.exports = {
  apps: [{
    name: 'MyApp',
    script: 'server.js',
    exec_mode: 'fork',  // Force fork mode so PM2 uses dynamic import instead of require()
    interpreter: 'node',
    instances: 1,       // Fork mode runs a single instance per app
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};