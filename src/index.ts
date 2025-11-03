// ABOUTME: Main entry point for the WebSocket server application
// ABOUTME: Starts the server on port 8081 and handles graceful shutdown

import { WebSocketServer } from './websocketServer.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8081;

const server = new WebSocketServer(PORT);

async function start() {
  try {
    await server.start();
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
    console.log('Clients will receive sensor data automatically every 5 seconds');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown() {
  console.log('\nShutting down server...');
  try {
    await server.stop();
    console.log('Server stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();