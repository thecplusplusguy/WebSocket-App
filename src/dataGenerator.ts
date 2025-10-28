// ABOUTME: Generates random sensor/metric data for WebSocket responses
// ABOUTME: Creates arrays of varying size (1-100) with timestamp, value, and type fields

export interface SensorData {
  timestamp: string;
  value: number;
  type: string;
}

const SENSOR_TYPES = [
  'temperature',
  'humidity',
  'pressure',
  'light',
  'motion',
  'sound',
  'air_quality',
  'co2'
] as const;

/**
 * Generates a random array of sensor data objects
 * @returns Array of sensor data with random size between 1 and 100
 */
export function generateSensorData(): SensorData[] {
  const arraySize = Math.floor(Math.random() * 100) + 1; // 1-100
  const data: SensorData[] = [];

  for (let i = 0; i < arraySize; i++) {
    data.push({
      timestamp: new Date().toISOString(),
      value: Math.random() * 100, // Random value 0-100
      type: SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)]
    });
  }

  return data;
}