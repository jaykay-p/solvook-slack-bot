# ⚡ commands/ - Slash Commands

**What you'll learn**: How to handle slash commands like `/hello` - think of them as form submissions or API endpoints that users can trigger by typing commands.

## 🧠 What Are Slash Commands?

Slash commands are like **keyboard shortcuts or CLI commands** for Slack:

- User types `/hello` → Bot responds with greeting  
- User types `/ping` → Bot responds with "Pong!"
- User types `/help` → Bot shows available commands

**Frontend analogy**: Like form submissions or button clicks that trigger specific actions.

## 📂 Files in This Directory

```
commands/
├── index.ts        # Command registry (like route definitions)
├── hello.ts        # /hello command handler  
├── ping.ts         # /ping command handler
└── help.ts         # /help command handler
```

## 🎯 Command Handler Pattern

Every command handler follows this structure:

```typescript
import { SlackCommandMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';

export async function commandName({ 
  command,  // Command data (like form data)
  ack,      // Acknowledge receipt (required)
  say,      // Respond in same channel  
  client    // Full Slack API access
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  // 1. Always acknowledge first (like preventing default)
  await ack();

  // 2. Process command data
  const userId = command.user_id;
  const commandText = command.text; // Additional parameters
  
  // 3. Respond to user
  await say('Your response here');
}
```

## 📋 Command Data Structure

When a user types `/hello world testing`, your handler receives:

```typescript
{
  command: '/hello',              // The command itself
  text: 'world testing',         // Everything after the command
  user_id: 'U1234567890',       // Who ran the command  
  channel_id: 'C1234567890',    // Where they ran it
  team_id: 'T1234567890',       // Workspace ID
  trigger_id: '123.456.789'     // For opening modals
}
```

## 🔍 Example Breakdown: `/hello` Command

Let's analyze the `hello.ts` file:

```typescript
export async function helloCommand({ 
  command, 
  ack, 
  say, 
  client 
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  // Required: Acknowledge the command
  await ack();

  try {
    // Get user information from Slack API
    const userInfo = await client.users.info({
      user: command.user_id
    });

    // Extract user's real name or fallback to username
    const userName = userInfo.user?.real_name || userInfo.user?.name || 'there';

    // Respond with rich formatting (Block Kit)
    await say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hello *${userName}*! 👋`
          }
        },
        // ... more blocks
      ]
    });
  } catch (error) {
    console.error('Error in hello command:', error);
    await say('Sorry, something went wrong with the hello command.');
  }
}
```

## 🎨 Response Types

### 1. Simple Text Response
```typescript
await say('Simple text response');
```

### 2. Rich Block Kit Response  
```typescript
await say({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Text with *bold* and _italic_'
      }
    }
  ]
});
```

### 3. Ephemeral Response (only user sees)
```typescript
await client.chat.postEphemeral({
  channel: command.channel_id,
  user: command.user_id,  
  text: 'Only you can see this message'
});
```

### 4. Direct Message Response
```typescript
await client.chat.postMessage({
  channel: command.user_id, // DM channel is user's ID
  text: 'Private message to you'
});
```

## 🚦 Command Registration

In `index.ts`, commands are registered like routes:

```typescript
import { App } from '@slack/bolt';
import { helloCommand } from './hello';
import { helpCommand } from './help';
import { pingCommand } from './ping';

export function registerCommands(app: App): void {
  // Register each command with its handler
  app.command('/hello', helloCommand);
  app.command('/help', helpCommand);
  app.command('/ping', pingCommand);
}
```

## 🛠️ Creating Your Own Command

### Step 1: Create the Handler File

Create `commands/weather.ts`:
```typescript
import { SlackCommandMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';

export async function weatherCommand({ 
  command, 
  ack, 
  say 
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();
  
  const location = command.text || 'your location';
  
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🌤️ Weather for *${location}*: 72°F and sunny!`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Requested by <@${command.user_id}>`
          }
        ]
      }
    ]
  });
}
```

### Step 2: Register the Command

Add to `commands/index.ts`:
```typescript
import { weatherCommand } from './weather';

export function registerCommands(app: App): void {
  app.command('/hello', helloCommand);
  app.command('/help', helpCommand);
  app.command('/ping', pingCommand);
  app.command('/weather', weatherCommand); // Add this line
}
```

### Step 3: Create Command in Slack App

1. Go to your Slack app settings at [api.slack.com/apps](https://api.slack.com/apps)
2. Navigate to "Slash Commands"
3. Click "Create New Command"
4. Fill in:
   - **Command**: `/weather`
   - **Short Description**: `Get weather information`
   - **Usage Hint**: `[city name]`

### Step 4: Test Your Command

1. Save files (bot auto-restarts)
2. Type `/weather San Francisco` in Slack
3. See your custom response!

## 🎯 Command Best Practices

### 1. Always Acknowledge First
```typescript
// ✅ Good
await ack();
// ... rest of logic

// ❌ Bad - will timeout
// ... logic first  
await ack(); // Too late!
```

### 2. Handle Errors Gracefully
```typescript
try {
  // Your logic
} catch (error) {
  console.error('Command error:', error);
  await say('Sorry, something went wrong!');
}
```

### 3. Parse Command Text
```typescript
const text = command.text?.trim();
if (!text) {
  await say('Please provide some text with the command');
  return;
}

const parts = text.split(' ');
const action = parts[0];
const target = parts.slice(1).join(' ');
```

### 4. Use Rich Formatting
```typescript
// ✅ Good - rich blocks
await say({
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: 'Rich *formatting*' }},
    { type: 'divider' },
    { type: 'context', elements: [{ type: 'mrkdwn', text: '_Context info_' }]}
  ]
});

// ⚠️ Basic - plain text  
await say('Plain text response');
```

## 🧪 Testing Commands Locally

1. **Start dev mode**: `npm run dev`
2. **Type command in Slack**: `/hello`
3. **Check console**: See logs and errors
4. **Modify code**: Auto-restarts on file changes
5. **Test again**: Immediate feedback

## 🔍 Debugging Commands

### Check Command Data
```typescript
export async function debugCommand({ command, ack, say }) {
  await ack();
  
  // Log all command data to console
  console.log('Command data:', JSON.stringify(command, null, 2));
  
  await say(`Debug info: ${JSON.stringify(command, null, 2)}`);
}
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Command timeout" | Make sure `await ack()` is first |
| "Command not found" | Check registration in `index.ts` |
| "Bot not responding" | Check console for errors |
| "Permission denied" | Verify bot scopes in Slack app |

## 🎓 Next Steps

**Mastered slash commands?** 

- **Real-time interactions**: Check out `events/README.md` 
- **Interactive components**: Explore `actions/README.md`
- **Complex workflows**: See `shortcuts/README.md`

**Want to practice?** Try creating these commands:
- `/joke` - Tell a random joke
- `/remind` - Set a reminder (store in memory)
- `/team` - Show team information
- `/status` - Show bot status and uptime