// ABOUTME: Integration tests for the WebSocket server
// ABOUTME: Tests server lifecycle, client connections, and data request/response flow

import { test } from 'node:test';
import assert from 'node:assert';
import WebSocket from 'ws';
import { WebSocketServer } from '../src/websocketServer.js';

test('WebSocketServer can start and stop', async () => {
  const server = new WebSocketServer(8080);
  await server.start();
  assert.ok(server.isRunning());
  await server.stop();
  assert.ok(!server.isRunning());
});

test('client can connect to server', async () => {
  const server = new WebSocketServer(8081);
  await server.start();

  const client = new WebSocket('ws://localhost:8081');

  await new Promise<void>((resolve) => {
    client.on('open', () => {
      assert.ok(true, 'Client connected successfully');
      client.close();
      resolve();
    });
  });

  await server.stop();
});

test('server responds with sensor data when client sends request', async () => {
  const server = new WebSocketServer(8082);
  await server.start();

  const client = new WebSocket('ws://localhost:8082');

  await new Promise<void>((resolve, reject) => {
    client.on('open', () => {
      client.send(JSON.stringify({ action: 'getData' }));
    });

    client.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        assert.ok(Array.isArray(response), 'Response should be an array');
        assert.ok(response.length >= 1 && response.length <= 100, 'Array size should be 1-100');

        // Verify structure of first item
        if (response.length > 0) {
          const item = response[0];
          assert.ok('timestamp' in item);
          assert.ok('value' in item);
          assert.ok('type' in item);
        }

        // Verify Structure of last item
        if (response.length > 0) {
          const item = response[response.length-1];
          assert.ok('timestamp' in item);
          assert.ok('value' in item);
          assert.ok('type' in item);
        }

        client.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    client.on('error', reject);
  });

  await server.stop();
});

test('server handles multiple clients simultaneously', async () => {
  const server = new WebSocketServer(8083);
  await server.start();

  const client1 = new WebSocket('ws://localhost:8083');
  const client2 = new WebSocket('ws://localhost:8083');

  const responses: any[] = [];

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      client1.on('open', () => {
        client1.send(JSON.stringify({ action: 'getData' }));
      });

      client1.on('message', (data) => {
        try {
          responses.push(JSON.parse(data.toString()));
          client1.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      client1.on('error', reject);
    }),
    new Promise<void>((resolve, reject) => {
      client2.on('open', () => {
        client2.send(JSON.stringify({ action: 'getData' }));
      });

      client2.on('message', (data) => {
        try {
          responses.push(JSON.parse(data.toString()));
          client2.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      client2.on('error', reject);
    })
  ]);

  assert.strictEqual(responses.length, 2, 'Both clients should receive responses');
  await server.stop();
});

test('server ignores invalid messages', async () => {
  const server = new WebSocketServer(8084);
  await server.start();

  const client = new WebSocket('ws://localhost:8084');

  await new Promise<void>((resolve, reject) => {
    let messageCount = 0;

    client.on('open', () => {
      // Send invalid message
      client.send('not valid json');

      // Then send valid message
      setTimeout(() => {
        client.send(JSON.stringify({ action: 'getData' }));
      }, 100);
    });

    client.on('message', (data) => {
      try {
        messageCount++;
        const response = JSON.parse(data.toString());
        assert.ok(Array.isArray(response), 'Should receive valid response after invalid message');
        client.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    client.on('error', reject);
  });

  await server.stop();
});