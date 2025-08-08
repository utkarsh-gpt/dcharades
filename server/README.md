# Game Server

A Socket.IO server for real-time multiplayer games including Charades, UNO, Blockbuster, and Filmi Rishta.

## Features

- **Health Check Endpoint**: `/health` or `/ping` for monitoring
- **Auto-Ping**: Server pings itself every 30 seconds to stay alive on Render
- **Game Types**: Charades, UNO, Blockbuster, Filmi Rishta
- **Real-time**: Socket.IO for instant game updates

## Deployment on Render

### Environment Variables

Set these in your Render dashboard:

- `PORT`: Server port (default: 3001)
- `HOST`: Server host (default: 0.0.0.0)
- `SERVER_URL`: Your Render app URL (e.g., `https://your-app.onrender.com`)
- `CLIENT_URL`: Your frontend URL
- `TMB_READ_ONLY`: TMDb API key for movie data

### Health Check

The server automatically pings itself every 30 seconds to prevent sleep on Render:

```javascript
// Self-ping every 30 seconds
setInterval(pingServer, 30 * 1000);
```

### Manual Health Check

You can also manually check the server health:

```bash
curl https://your-app.onrender.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "games": 5
}
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Test the ping mechanism:
```bash
node test-ping.js
```

## Game Types

### Charades
- Classic charades gameplay
- Movie-based clues
- Timer support

### UNO
- Full UNO card game
- Special unique cards
- 2-player optimized

### Blockbuster
- Team-based movie guessing
- Head-to-head challenges
- Genre-based scoring

### Filmi Rishta
- Connect Bollywood celebrities
- Movie-based connections
- Hint system

## Server Monitoring

The server logs include:
- ✅ Successful pings
- ⚠️ Failed pings
- ❌ Ping errors
- Game creation/cleanup events
- Active game counts 