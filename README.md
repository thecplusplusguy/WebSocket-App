# WebSocket Sensor Data Server

A WebSocket server built with Node.js and TypeScript that returns random sensor/metric data on demand.

## Features

- Returns random arrays of sensor data (1-100 items per request)
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

The server will start on `ws://localhost:8080` by default.

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

Connect to the WebSocket server at `ws://localhost:8080` (or your configured port).

### Request Format

To request sensor data, send a JSON message with the following format:

```json
{
  "action": "getData"
}
```

### Response Format

The server responds with a JSON array of sensor data objects:

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

**Array Size:** Each response contains a random number of items (1-100).

### Error Handling

If you send invalid JSON or a malformed message, the server will:
1. Log the invalid message to the console
2. Continue operating normally
3. Not send any response for that invalid message

The server will still respond to subsequent valid messages.

## Testing with a WebSocket Client

### Using `wscat` (Command Line)

Install `wscat` globally:
```bash
npm install -g wscat
```

Connect and test:
```bash
# Connect to the server
wscat -c ws://localhost:8080

# Send a request (type this after connecting)
{"action":"getData"}

# You'll receive a JSON array of sensor data
```

### Using Browser Console

```javascript
// Connect to the server
const ws = new WebSocket('ws://localhost:8080');

// Handle connection open
ws.onopen = () => {
  console.log('Connected to server');

  // Request data
  ws.send(JSON.stringify({ action: 'getData' }));
};

// Handle incoming messages
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

const client = new WebSocket('ws://localhost:8080');

client.on('open', () => {
  console.log('Connected to server');

  // Request data
  client.send(JSON.stringify({ action: 'getData' }));
});

client.on('message', (data) => {
  const sensorData = JSON.parse(data.toString());
  console.log('Received sensor data:', sensorData);
  console.log('Number of items:', sensorData.length);

  // Request more data
  setTimeout(() => {
    client.send(JSON.stringify({ action: 'getData' }));
  }, 1000);
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

WebSocket server is running on ws://localhost:8080
Send {"action": "getData"} to receive random sensor data

# Terminal 2: Connect with wscat
$ wscat -c ws://localhost:8080
Connected (press CTRL+C to quit)

> {"action":"getData"}
< [{"timestamp":"2025-10-28T20:05:05.413Z","value":69.03,"type":"co2"}, ...]

> {"action":"getData"}
< [{"timestamp":"2025-10-28T20:05:06.123Z","value":23.45,"type":"temperature"}, ...]
```

## Notes

- Each request returns a newly generated random dataset
- The server can handle multiple simultaneous client connections
- All timestamps are in UTC
- The server logs all sent data for debugging purposes

## License

ISC