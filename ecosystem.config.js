module.exports = {
  apps: [{
    name: 'MyApp',
    script: 'server.js', // Your main ES module file
    interpreter: 'node',
    interpreter_args: '--require esm', // Use the esm module
    instances: 2,                  // Or 1 for debugging
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};