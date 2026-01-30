# AGENTS.md - IoT Weather Station Project

This document provides guidance for AI coding agents working on this codebase.

## Project Overview

This is a connected weather station (Station Meteo Connectee) IoT project with three components:

- **ESP32 firmware** (`station-meteo/esp32/`) - Arduino-based sensor code
- **Bridge server** (`bridge/`) - Node.js server bridging MQTT and WebSocket
- **Frontend** (`frontend/`) - Web dashboard for real-time sensor data display

## Architecture

```
ESP32 (sensors) --MQTT--> Bridge Server --WebSocket--> Frontend Dashboard
```

- **MQTT Broker**: `captain.dev0.pandor.cloud:1884`
- **Bridge Port**: 8080 (HTTP + WebSocket)
- **Data Flow**: Sensor data published via MQTT, bridged to WebSocket clients

---

## Build, Lint, and Test Commands

### Bridge Server (Node.js)

```bash
# Navigate to bridge directory
cd bridge

# Install dependencies
npm install

# Start the server
node server.js

# No tests currently configured
# Package.json scripts: "test": "echo \"Error: no test specified\" && exit 1"
```

### ESP32 Firmware (Arduino)

```bash
# Use Arduino IDE or PlatformIO
# File: station-meteo/esp32/station.ino
# Currently empty - needs implementation

# If using PlatformIO:
# pio run            # Build
# pio run -t upload  # Upload to device
```

### Frontend

```bash
# Static files - no build required
# Serve with any static file server:
cd frontend
python -m http.server 8000
# Or: npx serve .
```

---

## Code Style Guidelines

### JavaScript (Bridge & Frontend)

#### Formatting

- **Indentation**: 2 spaces (inferred from codebase)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required at end of statements
- **Line length**: Keep under 100 characters
- **Trailing commas**: Not used

#### Naming Conventions

- **Variables/Functions**: camelCase (`mqttClient`, `handleSensorData`)
- **Constants**: camelCase for runtime, UPPER_SNAKE_CASE for config (`PORT`, `wsUrl`)
- **HTML IDs**: camelCase (`tempValue`, `wsStatus`, `dataTableBody`)
- **CSS classes**: kebab-case (`sensor-card`, `humidity-fill`, `status-bar`)

#### Imports

```javascript
// Node.js - use require (CommonJS)
const http = require("http");
const mqtt = require("mqtt");
const WebSocket = require("ws");

// Group imports: built-in modules first, then third-party
```

#### Functions

- Use function declarations for named functions
- Use arrow functions for callbacks and event handlers
- Keep functions focused and single-purpose

```javascript
// Event handlers with arrow functions
ws.onopen = () => {
  console.log("[WS] Connected");
};

// Named functions for main logic
function handleSensorData(data) {
  // ...
}
```

#### Error Handling

- Wrap JSON parsing in try-catch blocks
- Log errors with context prefix (`[WS]`, `[MQTT]`, `[APP]`)
- Provide user feedback on connection errors

```javascript
try {
  const data = JSON.parse(message.toString());
} catch (error) {
  console.error("[MQTT] Error parsing message:", error);
}
```

#### Comments

- Use `// Comment` for single-line comments
- Use section headers with `// ============` dividers for major sections
- Write comments in French or English (project uses both)

```javascript
// ============================================
// WEBSOCKET CONNECTION
// ============================================
```

### CSS

#### Structure

- Use CSS custom properties (variables) in `:root`
- Organize with section headers
- Mobile-first responsive approach

```css
:root {
  --primary: #6366f1;
  --bg: #0f172a;
  --radius: 12px;
}
```

#### Naming

- Use BEM-like naming: `.card-content`, `.humidity-fill`
- State classes: `.connected`, `.active`, `.hot`, `.cold`

### HTML

- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`)
- French language: `lang="fr"`
- Include proper meta viewport for responsive design

### Arduino/C++ (ESP32)

When implementing ESP32 code:

- Use Arduino framework conventions
- Include proper sensor libraries (DHT, BME280, etc.)
- Structure: setup(), loop(), helper functions
- Use meaningful variable names for sensor readings

---

## Project-Specific Patterns

### WebSocket Message Format

```javascript
// Outgoing sensor data
{
  type: 'sensor_data',
  data: {
    temperature: 22.5,
    humidity: 65.0,
    unit: 'C',         // 'C' or 'F'
    simulation: false
  }
}

// Incoming commands
{
  type: 'command',
  unit: 'C'  // or 'F'
}
```

### MQTT Topics

- Data: `classroom/+/telemetry` or `station/meteo/data`
- Commands: `station/meteo/command`

### Logging Convention

Use prefixed console logs for debugging:

```javascript
console.log("[WS] Message received");
console.log("[MQTT] Connected");
console.log("[APP] Initializing...");
```

---

## Dependencies

### Bridge Server

- `mqtt` (^5.14.1) - MQTT client
- `ws` (^8.19.0) - WebSocket library

### Runtime

- Node.js (CommonJS modules, `"type": "commonjs"`)

---

## File Structure

```
TP-Station-Meteo-Connecte/
├── bridge/
│   ├── server.js          # Main bridge server
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── index.html         # Dashboard HTML
│   ├── app.js             # Frontend JavaScript
│   └── style.css          # Styles
├── station-meteo/
│   └── esp32/
│       └── station.ino    # ESP32 firmware
├── README.md
├── LICENSE
└── AGENTS.md              # This file
```

---

## Important Notes for Agents

1. **No linting/formatting tools configured** - Follow existing code style
2. **No test framework** - Consider adding Jest for Node.js, Vitest for frontend
3. **CommonJS modules** - Use `require()` not `import` in bridge server
4. **Bilingual codebase** - Comments may be in French or English
5. **ESP32 code is empty** - Needs full implementation
6. **No build step for frontend** - Static HTML/CSS/JS files

Membre du groupe
OUARDI Ahmed-Amine

Ousmane Sacko

Ehoura Christ-Yvann

JACQUET Oscar

Antoine Mahassadi
