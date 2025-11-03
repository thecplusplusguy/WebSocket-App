# WebSocket Sensor Data Server

A WebSocket server built with Node.js and TypeScript that streams random sensor/metric data automatically to connected clients.

## Features

- Automatically streams random arrays of sensor data (1-100 items) every 5 seconds
- Data sent immediately upon client connection
- Supports multiple concurrent clients
- Graceful error handling
- Built with Test-Driven Development (TDD)
- Full test coverage (unit, integration, and e2e tests)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

```bash
npm install
```

## Running the Server

### Development Mode

```bash
npm start
```

The server will start on `ws://localhost:8081` by default.

### Custom Port

```bash
PORT=3000 npm start
```

### Build Only

```bash
npm run build
```

## Running Tests

```bash
npm test
```

This runs all 15 tests:
- 7 unit tests for data generation
- 5 integration tests for WebSocket server
- 3 end-to-end tests

## Server-Client Interaction

### Connection

Connect to the WebSocket server at `ws://localhost:8081` (or your configured port).

**The server automatically sends data:**
- Immediately upon connection
- Every 5 seconds thereafter
- No client message required

### Data Stream Format

The server streams JSON arrays of sensor data objects:

```json
[
  {
    "timestamp": "2025-10-28T20:05:05.413Z",
    "value": 69.03327186194646,
    "type": "co2"
  },
  {
    "timestamp": "2025-10-28T20:05:05.413Z",
    "value": 13.62189581114448,
    "type": "air_quality"
  }
]
```

**Response Properties:**
- `timestamp` (string): ISO 8601 formatted timestamp
- `value` (number): Sensor reading value (0-100)
- `type` (string): Sensor type

**Sensor Types:**
- `temperature`
- `humidity`
- `pressure`
- `light`
- `motion`
- `sound`
- `air_quality`
- `co2`

**Array Size:** Each data stream contains a random number of items (1-100).

**Streaming Behavior:**
- Data is sent immediately when a client connects
- New data is automatically sent every 5 seconds
- Each client receives independent data streams

## Testing with a WebSocket Client

### Using `wscat` (Command Line)

Install `wscat` globally:
```bash
npm install -g wscat
```

Connect and test:
```bash
# Connect to the server
wscat -c ws://localhost:8081

# You'll immediately receive a JSON array of sensor data
# New data will arrive automatically every 5 seconds
```

### Using Browser Console

```javascript
// Connect to the server
const ws = new WebSocket('ws://localhost:8081');

// Handle connection open
ws.onopen = () => {
  console.log('Connected to server');
  console.log('Waiting for automatic data stream...');
};

// Handle incoming messages (automatically sent every 5 seconds)
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received sensor data:', data);
  console.log('Number of items:', data.length);
};

// Handle errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Handle connection close
ws.onclose = () => {
  console.log('Disconnected from server');
};
```

### Using Node.js Client

```javascript
import WebSocket from 'ws';

const client = new WebSocket('ws://localhost:8081');

client.on('open', () => {
  console.log('Connected to server');
  console.log('Waiting for automatic data stream...');
});

// Data arrives automatically every 5 seconds
client.on('message', (data) => {
  const sensorData = JSON.parse(data.toString());
  console.log('Received sensor data:', sensorData);
  console.log('Number of items:', sensorData.length);
});

client.on('error', (error) => {
  console.error('WebSocket error:', error);
});

client.on('close', () => {
  console.log('Disconnected from server');
});
```

## Project Structure

```
WebSocket-App/
├── src/
│   ├── dataGenerator.ts    # Random sensor data generation
│   ├── websocketServer.ts  # WebSocket server implementation
│   └── index.ts            # Application entry point
├── test/
│   ├── dataGenerator.test.ts    # Unit tests
│   ├── websocketServer.test.ts  # Integration tests
│   └── e2e.test.ts             # End-to-end tests
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── CLAUDE.md              # Project instructions
├── JOURNAL.md            # Development journal
└── README.md             # This file
```

## Development

### Watch Mode

To automatically rebuild on file changes:
```bash
npm run dev
```

### TypeScript Configuration

The project uses strict TypeScript settings for type safety. See `tsconfig.json` for details.

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running. The server will shut down gracefully.

## Example Session

```bash
# Terminal 1: Start the server
$ npm start
> websocket-app@1.0.0 start
> npm run build && node dist/index.js

WebSocket server is running on ws://localhost:8081
Clients will receive sensor data automatically every 5 seconds

# Terminal 2: Connect with wscat
$ wscat -c ws://localhost:8081
Connected (press CTRL+C to quit)

< [{"timestamp":"2025-11-03T20:05:05.413Z","value":69.03,"type":"co2"}, ...]
# (wait 5 seconds)
< [{"timestamp":"2025-11-03T20:05:10.413Z","value":23.45,"type":"temperature"}, ...]
# (wait 5 seconds)
< [{"timestamp":"2025-11-03T20:05:15.413Z","value":87.12,"type":"humidity"}, ...]
```

## Notes

- Each data stream contains a newly generated random dataset
- Data is sent automatically every 5 seconds to all connected clients
- Each client receives independent data streams with their own timers
- The server can handle multiple simultaneous client connections
- All timestamps are in UTC
- The server logs all sent data for debugging purposes
- Connection timers are properly cleaned up when clients disconnect

## License

ISC