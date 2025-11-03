// ABOUTME: WebSocket server that streams sensor data to connected clients
// ABOUTME: Sends random sensor data immediately on connect and every 5 seconds thereafter

import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { generateSensorData } from './dataGenerator.js';

export class WebSocketServer {
  private wss: WSServer | null = null;
  private port: number;
  private clientIntervals: Map<WebSocket, NodeJS.Timeout> = new Map();

  constructor(port: number) {
    this.port = port;
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.wss = new WSServer({ port: this.port });

      this.wss.on('connection', (ws: WebSocket) => {
        // Send data immediately on connect
        const initialData = generateSensorData();
        const initialJson = JSON.stringify(initialData);
        console.log('Sending initial data:', initialJson);
        ws.send(initialJson);

        // Set up interval to send data every 5 seconds
        const interval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const sensorData = generateSensorData();
            const jsonResponse = JSON.stringify(sensorData);
            console.log('Sending interval data:', jsonResponse);
            ws.send(jsonResponse);
          }
        }, 5000); // 5 seconds in milliseconds

        // Store interval for cleanup
        this.clientIntervals.set(ws, interval);

        // Clean up interval on disconnect
        ws.on('close', () => {
          const clientInterval = this.clientIntervals.get(ws);
          if (clientInterval) {
            clearInterval(clientInterval);
            this.clientIntervals.delete(ws);
          }
        });
      });

      this.wss.on('listening', () => {
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.wss) {
        resolve();
        return;
      }

      // Clear all client intervals
      this.clientIntervals.forEach((interval) => {
        clearInterval(interval);
      });
      this.clientIntervals.clear();

      this.wss.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.wss = null;
          resolve();
        }
      });
    });
  }

  isRunning(): boolean {
    return this.wss !== null;
  }
}