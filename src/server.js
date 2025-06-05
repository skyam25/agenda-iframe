const app = require('./app');
const config = require('./config');

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log('\n🚀 Zoom Agenda Widget Server Started');
  console.log('==========================================');
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Widget: ${config.server.widgetDomain}/agenda/`);
  console.log(`Demo: ${config.server.widgetDomain}/demo/`);
  console.log(`Health: ${config.server.widgetDomain}/health`);
  console.log('==========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;