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

test('server sends sensor data immediately on connect', async () => {
  const server = new WebSocketServer(8082);
  await server.start();

  const client = new WebSocket('ws://localhost:8082');

  await new Promise<void>((resolve, reject) => {
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

test('server sends data at 5-second intervals', async () => {
  const server = new WebSocketServer(8084);
  await server.start();

  const client = new WebSocket('ws://localhost:8084');
  const receivedMessages: any[] = [];

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timeout - did not receive expected messages'));
    }, 10000); // 10 seconds to allow for initial + one interval

    client.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        receivedMessages.push(response);

        // After receiving 2 messages (initial + one interval), we're done
        if (receivedMessages.length === 2) {
          clearTimeout(timeout);
          client.close();
          resolve();
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });

    client.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

  // Verify we got 2 messages
  assert.strictEqual(receivedMessages.length, 2, 'Should receive 2 messages (initial + 1 interval)');

  // Verify both are valid sensor data arrays
  receivedMessages.forEach((msg, index) => {
    assert.ok(Array.isArray(msg), `Message ${index} should be an array`);
  });

  await server.stop();
});