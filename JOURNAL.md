# WebSocket-App Project Journal

## 2025-10-28

### Session Start
- Started working with Dan on the WebSocket-App project
- Created this journal to track our progress and interactions

### Project Requirements
- Build a WebSocket server in Node.js with TypeScript
- Server returns random sensor/metric data (timestamp, value, type)
- Array size varies randomly (1-100 items)
- Data sent on client request (action: 'getData')
- Following TDD methodology

### Implementation Complete
Built using TDD (Test-Driven Development):

**1. Data Generator (src/dataGenerator.ts)**
- Generates random sensor data arrays (1-100 items)
- Sensor types: temperature, humidity, pressure, light, motion, sound, air_quality, co2
- Each item has: timestamp (ISO string), value (number 0-100), type (string)

**2. WebSocket Server (src/websocketServer.ts)**
- Listens for client connections
- Responds to {"action": "getData"} messages
- Handles invalid JSON gracefully
- Debug logging for sent data
- Supports multiple concurrent clients

**3. Main Entry Point (src/index.ts)**
- Starts server on port 8081 (configurable via PORT env var)
- Graceful shutdown on SIGINT/SIGTERM

**4. Test Suite (15 tests, all passing)**
- Unit tests (7): Data generation structure and validation
- Integration tests (5): Server lifecycle, client connections, message handling
- E2E tests (3): Complete flow, sequential requests, error recovery

### Project Structure
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
├── package.json
├── tsconfig.json
├── CLAUDE.md              # Project instructions
└── JOURNAL.md            # This file
```

### How to Use
```bash
npm install          # Install dependencies
npm test            # Run all tests
npm start           # Start the server
```

Connect with WebSocket client and send:
```json
{"action": "getData"}
```

### Notes
- All code follows TDD: tests written first, then implementation
- TypeScript for type safety
- Clean error handling with user-friendly debug output
- Server runs on ws://localhost:8081 by default

### Session Complete
- Successfully built complete WebSocket server with TDD
- All 15 tests passing
- Full documentation (README.md with examples)
- Committed to main branch (commit ad15e67)
- Project ready for use

### Build Configuration Cleanup
- Unified build process: `npm run build` now compiles both src and test
- Removed separate `build:test` script - everything uses single build command
- Updated tsconfig.json to include both src and test directories
- Fixed output structure: dist/src/ and dist/test/ directories
- Cleaned up old compiled artifacts from source directories
- Updated .gitignore to prevent compiled files in src/test directories
- All 15 tests still passing after refactor
- Build configuration simplified and maintainable

## 2025-11-03

### Server Behavior Change: Auto-Streaming Implementation
- Changed from request/response model to automatic streaming
- Server now sends sensor data immediately upon client connection
- Data automatically streams every 5 seconds to all connected clients
- No client message required - data starts flowing on connect

**Implementation Changes:**
- Updated `src/websocketServer.ts`:
  - Removed message handler for "getData" action
  - Added immediate data send on connection
  - Implemented 5-second interval timer using `setInterval`
  - Added proper cleanup of intervals when clients disconnect
  - Maintains Map of client intervals for proper resource management

- Updated tests to match new behavior:
  - `websocketServer.test.ts`: Removed message sending from tests, expect auto-delivery
  - `e2e.test.ts`: Updated to wait for interval-based streaming
  - All tests updated with 10-second timeouts (sufficient for 5-second interval + buffer)
  - Test: "server sends data at 5-second intervals" validates streaming behavior

**Test Results:**
- All 15 tests passing
- Unit tests (7): Data generation unchanged
- Integration tests (5): Updated for auto-streaming
- E2E tests (3): Updated for interval-based delivery

**How to Use (Updated):**
```bash
npm start  # Start the server
```

Connect with WebSocket client - no message needed:
- Data streams immediately on connection
- Fresh data every 5 seconds automatically
- Server runs on ws://localhost:8081 by default

**Technical Notes:**
- Each client gets independent interval timer
- Intervals properly cleaned up on disconnect to prevent memory leaks
- Server maintains Map<WebSocket, NodeJS.Timeout> for interval tracking
- All intervals cleared when server stops

---
