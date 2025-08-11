# 🎧 listeners/ - The Event System

**What you'll learn**: How Slack's event-driven architecture works, similar to DOM events in frontend development but for Slack workspace interactions.

## 🧠 Core Concept: Event-Driven Architecture

In frontend development, you handle events like:
```javascript
button.addEventListener('click', handleClick);
input.addEventListener('change', handleChange);
```

In Slack bots, you handle events like:
```typescript
app.command('/hello', handleHelloCommand);
app.event('message', handleMessage);
app.action('button_click', handleButtonClick);
```

## 📂 Directory Structure

```
listeners/
├── index.ts        # Central registry - imports all handlers
├── commands/       # Slash commands (/hello, /ping, /help)
├── events/         # Real-time events (messages, mentions, joins)
├── actions/        # Interactive components (buttons, menus, modals)  
└── shortcuts/      # Global shortcuts and workflows
```

## 🔄 How the Event System Works

### 1. **User Action in Slack**
- User types `/hello` 
- User mentions the bot
- User clicks a button
- User joins a channel

### 2. **Slack Sends Event**  
- Event data sent to your bot via Socket Mode
- Contains user info, channel info, message content, etc.

### 3. **Bot Routes to Handler**
- `index.ts` receives the event
- Routes to appropriate handler based on event type
- Handler function executes your custom logic

### 4. **Bot Responds**
- Send message back to Slack
- Show modal, add reaction, etc.

## 🎯 Event Types (like DOM events)

| Slack Event Type | Frontend Equivalent | When it Triggers |
|------------------|-------------------|------------------|
| `slash command` | `form submit` | User types `/command` |
| `message` | `keyup/input` | User sends message |  
| `app_mention` | `focus` | User @mentions bot |
| `button action` | `click` | User clicks button |
| `modal submit` | `form submit` | User submits modal form |
| `member_joined` | `load` | User joins channel |

## 📋 Event Handler Pattern

Every handler follows this pattern (similar to React event handlers):

```typescript
export async function handlerName({
  // Event data (like event.target in DOM)
  event,
  
  // Quick response (like preventDefault())  
  ack,
  
  // Send messages (like updating state)
  say,
  
  // Full Slack API access (like fetch())
  client
}: HandlerParams): Promise<void> {
  // 1. Acknowledge the event (required)
  await ack();
  
  // 2. Process the event  
  const userData = event.user;
  const messageText = event.text;
  
  // 3. Respond to user
  await say('Hello!');
}
```

## 🚦 Handler Registration (like addEventListener)

Each directory has an `index.ts` that registers handlers:

```typescript
// commands/index.ts - like setting up form handlers
export function registerCommands(app: App): void {
  app.command('/hello', helloCommand);
  app.command('/ping', pingCommand);
}

// events/index.ts - like setting up DOM listeners  
export function registerEvents(app: App): void {
  app.event('message', messageEvent);
  app.event('app_mention', appMentionEvent);
}
```

The main `listeners/index.ts` combines all registrations:

```typescript
export function registerListeners(app: App): void {
  registerCommands(app);    // All slash commands
  registerEvents(app);      // All message events  
  registerActions(app);     // All button/modal interactions
  registerShortcuts(app);   // All global shortcuts
}
```

## 🔍 Event Data Structure

Each event contains rich data (like event objects in frontend):

```typescript
// Slash command event
{
  command: '/hello',
  text: 'extra parameters',
  user_id: 'U1234567890',
  channel_id: 'C1234567890',
  team_id: 'T1234567890',
  trigger_id: 'xxx.yyy.zzz' // For opening modals
}

// Message event  
{
  type: 'message',
  text: 'Hello bot!',
  user: 'U1234567890',
  channel: 'C1234567890', 
  ts: '1609459200.001900' // Message timestamp
}
```

## ⚡ Key Methods (like DOM APIs)

| Method | Purpose | Frontend Equivalent |
|--------|---------|-------------------|
| `ack()` | Acknowledge event received | `event.preventDefault()` |
| `say()` | Send message to same channel | `element.textContent = '...'` |
| `client.chat.postMessage()` | Send message anywhere | `fetch()` API call |
| `client.reactions.add()` | Add emoji reaction | `element.classList.add()` |
| `client.views.open()` | Open modal | `modal.showModal()` |

## 🛠️ Development Workflow

### Adding a New Handler

1. **Create handler file** in appropriate subdirectory:
   ```typescript
   // commands/my-command.ts
   export async function myCommand({ ack, say }) {
     await ack();
     await say('My response!');
   }
   ```

2. **Register in subdirectory index**:
   ```typescript  
   // commands/index.ts
   import { myCommand } from './my-command';
   
   export function registerCommands(app: App): void {
     app.command('/my-command', myCommand);
   }
   ```

3. **Test immediately**: Save file, bot auto-restarts, test in Slack

### Debugging Events

- **Console logs**: Add `console.log(event)` to see event data
- **Error handling**: Wrap in try/catch like frontend error boundaries
- **Event inspector**: Use Slack's event data to understand structure

## 🎓 Learning Path

**Start simple → Build complexity**

1. **Slash Commands** (`commands/`) - Like form submissions
2. **Message Events** (`events/`) - Like input handlers  
3. **Interactive Components** (`actions/`) - Like click handlers
4. **Advanced Workflows** (`shortcuts/`) - Like complex user flows

## 🔗 Event Flow Visualization

```
User types "/hello" in Slack
           ↓
Slack sends command event to bot
           ↓  
listeners/index.ts receives event
           ↓
Routes to commands/hello.ts handler
           ↓
Handler processes and responds
           ↓
User sees bot's response in Slack
```

## 🎯 Next Steps

Ready to dive into specific event types?

- **New to Slack bots?** Start with `commands/README.md` 
- **Want real-time interactions?** Check `events/README.md`
- **Need interactive components?** Explore `actions/README.md`
- **Building complex workflows?** See `shortcuts/README.md`

**Remember**: Each directory has its own detailed README with examples and patterns specific to that event type!