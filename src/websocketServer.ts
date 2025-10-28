// ABOUTME: WebSocket server that handles client connections and data requests
// ABOUTME: Listens for 'getData' action and responds with random sensor data

import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { generateSensorData } from './dataGenerator.js';

export class WebSocketServer {
  private wss: WSServer | null = null;
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.wss = new WSServer({ port: this.port });

      this.wss.on('connection', (ws: WebSocket) => {
        ws.on('message', (message: Buffer) => {
          const messageStr = message.toString();
          try {
            const data = JSON.parse(messageStr);

            if (data.action === 'getData') {
              const sensorData = generateSensorData();
              const jsonResponse = JSON.stringify(sensorData);
              console.log('Sending data:', jsonResponse);
              ws.send(jsonResponse);
            }
          } catch (error) {
            console.log('not valid json:', messageStr);
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