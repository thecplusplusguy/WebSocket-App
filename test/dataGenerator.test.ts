// ABOUTME: Unit tests for the random sensor data generator
// ABOUTME: Tests data structure, array size, and field validation

import { test } from 'node:test';
import assert from 'node:assert';
import { generateSensorData } from '../src/dataGenerator.js';

test('generateSensorData returns an array', () => {
  const result = generateSensorData();
  assert.ok(Array.isArray(result));
});

test('generateSensorData returns array with size between 1 and 100', () => {
  const result = generateSensorData();
  assert.ok(result.length >= 1 && result.length <= 100);
});

test('each sensor object has required fields: timestamp, value, type', () => {
  const result = generateSensorData();
  result.forEach(item => {
    assert.ok('timestamp' in item);
    assert.ok('value' in item);
    assert.ok('type' in item);
  });
});

test('timestamp is a valid date string', () => {
  const result = generateSensorData();
  result.forEach(item => {
    const date = new Date(item.timestamp);
    assert.ok(!isNaN(date.getTime()));
  });
});

test('value is a number', () => {
  const result = generateSensorData();
  result.forEach(item => {
    assert.strictEqual(typeof item.value, 'number');
  });
});

test('type is a string', () => {
  const result = generateSensorData();
  result.forEach(item => {
    assert.strictEqual(typeof item.type, 'string');
    assert.ok(item.type.length > 0);
  });
});

test('generates different array sizes on multiple calls', () => {
  const sizes = new Set();
  // Call it 20 times, should get some variation
  for (let i = 0; i < 20; i++) {
    sizes.add(generateSensorData().length);
  }
  // Should have at least 2 different sizes
  assert.ok(sizes.size > 1);
});