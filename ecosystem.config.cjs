module.exports = {
  apps: [{
    name: 'MyApp',
    script: 'server.js',
    exec_mode: 'fork',  // Force fork mode so PM2 uses dynamic import instead of require()
    interpreter: 'node',
    instances: 1,       // Fork mode runs a single instance per app
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: { // Default environment variables (used if NODE_ENV is not explicitly set)
      NODE_ENV: 'development', // Or any other default you want
    },
    env_production: { // Production environment variables
      NODE_ENV: 'production',
      MONGODB_URL: process.env.MONGODB_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
      SALT: process.env.SALT,
      Backend_URL: process.env.Backend_URL,
      FRONTEND_URL: process.env.FRONTEND_URL,
    }
  }]
}