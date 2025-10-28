// ABOUTME: End-to-end tests for the complete WebSocket application
// ABOUTME: Tests the full system from client connection to data reception

import { test } from 'node:test';
import assert from 'node:assert';
import WebSocket from 'ws';
import { WebSocketServer } from '../src/websocketServer.js';

test('e2e: complete flow from server start to data retrieval', async () => {
  const PORT = 9000;
  const server = new WebSocketServer(PORT);

  await server.start();
  assert.ok(server.isRunning(), 'Server should be running');

  const client = new WebSocket(`ws://localhost:${PORT}`);

  await new Promise<void>((resolve, reject) => {
    client.on('open', () => {
      assert.ok(true, 'Client connected');
      client.send(JSON.stringify({ action: 'getData' }));
    });

    client.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());

        // Verify response is array
        assert.ok(Array.isArray(response), 'Response should be array');

        // Verify array size
        assert.ok(response.length >= 1 && response.length <= 100, 'Array size should be 1-100');

        // Verify all items have correct structure
        response.forEach((item, index) => {
          assert.ok('timestamp' in item, `Item ${index} should have timestamp`);
          assert.ok('value' in item, `Item ${index} should have value`);
          assert.ok('type' in item, `Item ${index} should have type`);
          assert.strictEqual(typeof item.timestamp, 'string', 'timestamp should be string');
          assert.strictEqual(typeof item.value, 'number', 'value should be number');
          assert.strictEqual(typeof item.type, 'string', 'type should be string');
        });

        client.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    client.on('error', reject);
  });

  await server.stop();
  assert.ok(!server.isRunning(), 'Server should be stopped');
});

test('e2e: multiple sequential requests return different data', async () => {
  const PORT = 9001;
  const server = new WebSocketServer(PORT);

  await server.start();

  const client = new WebSocket(`ws://localhost:${PORT}`);
  const responses: any[] = [];

  await new Promise<void>((resolve, reject) => {
    client.on('open', () => {
      client.send(JSON.stringify({ action: 'getData' }));
    });

    let messageCount = 0;

    client.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        responses.push(response);
        messageCount++;

        if (messageCount === 1) {
          // Request second batch
          setTimeout(() => {
            client.send(JSON.stringify({ action: 'getData' }));
          }, 50);
        } else if (messageCount === 2) {
          client.close();
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });

    client.on('error', reject);
  });

  assert.strictEqual(responses.length, 2, 'Should receive 2 responses');

  // Verify responses are different (highly likely with random data)
  const firstArraySize = responses[0].length;
  const secondArraySize = responses[1].length;
  const firstJson = JSON.stringify(responses[0]);
  const secondJson = JSON.stringify(responses[1]);

  // Arrays should have different content (timestamps at minimum will differ)
  assert.notStrictEqual(firstJson, secondJson, 'Responses should be different');

  await server.stop();
});

test('e2e: server recovers gracefully from client disconnect', async () => {
  const PORT = 9002;
  const server = new WebSocketServer(PORT);

  await server.start();

  // First client connects and disconnects abruptly
  const client1 = new WebSocket(`ws://localhost:${PORT}`);

  await new Promise<void>((resolve) => {
    client1.on('open', () => {
      client1.terminate(); // Abrupt disconnect
      setTimeout(resolve, 50);
    });
  });

  // Second client should still work fine
  const client2 = new WebSocket(`ws://localhost:${PORT}`);

  await new Promise<void>((resolve, reject) => {
    client2.on('open', () => {
      client2.send(JSON.stringify({ action: 'getData' }));
    });

    client2.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        assert.ok(Array.isArray(response), 'Server should still respond correctly');
        client2.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    client2.on('error', reject);
  });

  await server.stop();
});