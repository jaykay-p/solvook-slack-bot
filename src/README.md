# 🚀 src/ - Application Entry Point

**What you'll learn**: How Slack bots are structured and initialized, similar to how you'd set up an Express.js or React app.

## 📂 What's in this directory?

```
src/
├── index.ts        # Main entry point - like your App.js in React
└── listeners/      # Event handlers - like your component event handlers
```

## 🔧 index.ts - The Bot's Entry Point

Think of `index.ts` like the main component in a React app or the server setup in Express. It:

1. **Initializes the Slack app** (like creating your Express app)
2. **Loads environment variables** (like your API keys in frontend apps)
3. **Registers all event listeners** (like setting up your routes or event handlers)
4. **Starts the bot** (like calling `app.listen()` or `ReactDOM.render()`)

### Code Breakdown:

```typescript
// Similar to importing React or Express
import { App } from '@slack/bolt';
import * as dotenv from 'dotenv';
import { registerListeners } from './listeners';

// Load environment variables (like your .env in frontend)
dotenv.config();

// Create the Slack app instance (like creating Express app)
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,        // Bot's access token
  signingSecret: process.env.SLACK_SIGNING_SECRET,  // Security validation
  socketMode: true,                          // Local development mode
  appToken: process.env.SLACK_APP_TOKEN,     // App-level permissions
  port: parseInt(process.env.PORT || '3000') // Server port
});

// Register all event handlers (like setting up routes)
registerListeners(app);

// Start the bot (like starting your server)
await app.start();
```

## 🌐 Socket Mode vs HTTP Mode

**Socket Mode** (what we're using for local development):
- Like running `npm run dev` for your frontend
- Creates a persistent WebSocket connection to Slack
- Perfect for local testing - no need for public URLs or tunneling
- Similar to how React dev server connects to your browser

**HTTP Mode** (for production):
- Like deploying your app to production
- Requires a public URL for Slack to send webhooks
- More like traditional REST API endpoints

## 🔐 Environment Variables

Just like in frontend development, we keep sensitive data in `.env`:

```bash
# These are like your API keys in frontend projects
SLACK_BOT_TOKEN=xoxb-...      # Bot's authentication token
SLACK_SIGNING_SECRET=...       # Verifies requests are from Slack  
SLACK_APP_TOKEN=xapp-...       # App-level permissions token
PORT=3000                      # Server port (optional)
```

## 🎯 Key Concepts for Frontend Developers

| Frontend Concept | Slack Bot Equivalent | Description |
|------------------|---------------------|-------------|
| Event handlers (`onClick`) | Slash commands, message events | Respond to user actions |
| API calls (`fetch`) | Slack Web API calls | Get data or post messages |
| Component state | Bot memory/database | Store information between interactions |
| Props/parameters | Event payloads | Data passed to your handlers |
| Development server | Socket Mode | Local testing environment |

## 🚦 Starting Your Development

1. **Install dependencies**: `npm install`
2. **Set up environment**: Copy `.env.example` to `.env` and fill in tokens  
3. **Start development**: `npm run dev`
4. **See logs**: Watch the console for events and errors

## 🔍 Understanding the Flow

When someone interacts with your bot:

1. **User action** (types `/hello`, mentions bot, clicks button)
2. **Slack sends event** to your bot (via Socket Mode)
3. **Event reaches `index.ts`** (your main entry point)
4. **Router finds handler** (in `listeners/` directory)  
5. **Handler executes** (your custom code runs)
6. **Response sent back** (message, modal, reaction, etc.)

## 🛠️ Common Development Tasks

### Adding New Features
1. Create handler in appropriate `listeners/` subdirectory
2. Register the handler in the corresponding `index.ts` file
3. The main `index.ts` automatically picks it up via `registerListeners()`

### Debugging
- Check console logs for errors
- Use `console.log()` in handlers to debug (like frontend debugging)
- Slack events show in terminal when `npm run dev` is running

### Testing Changes
- Save file → bot automatically restarts (hot reload like frontend dev)
- Test immediately in Slack workspace
- No need to redeploy or restart manually

## 🎓 Next Steps

Now that you understand the entry point, explore the `listeners/` directory to learn how different types of Slack interactions work!

**Recommended next read**: `listeners/README.md` - Learn the event system that powers Slack bots.