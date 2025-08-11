# 💬 events/ - Real-time Event Handling

**What you'll learn**: How to handle real-time Slack events like messages, mentions, and user activities - similar to handling DOM events like `keyup`, `scroll`, or `resize` in frontend development.

## 🧠 What Are Slack Events?

Events are real-time notifications about things happening in your Slack workspace:

- User sends a message → `message` event fires
- Someone mentions your bot → `app_mention` event fires  
- User joins a channel → `member_joined_channel` event fires
- User reacts to a message → `reaction_added` event fires

**Frontend analogy**: Like `addEventListener()` but for Slack workspace activities instead of DOM interactions.

## 📂 Files in This Directory

```
events/
├── index.ts           # Event registry (like event listeners setup)
├── app-mention.ts     # When bot is @mentioned
├── message.ts         # When messages are posted
└── member-joined.ts   # When users join channels
```

## 🎯 Event Handler Pattern

Every event handler follows this structure:

```typescript
import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function eventName({
  event,    // Event data (like event object in DOM)
  say,      // Respond in same channel
  client    // Full Slack API access
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'event_type'>): Promise<void> {
  try {
    // Process event data
    const userId = event.user;
    const messageText = event.text;
    
    // Respond if needed  
    await say('Response message');
  } catch (error) {
    console.error('Event error:', error);
  }
}
```

**Key difference from commands**: Events don't need `ack()` - they're notifications, not requests.

## 🔍 Event Types & Examples

### 1. **app_mention** - Bot is @mentioned

**When it triggers**: Someone types `@YourBot help me`

```typescript
// app-mention.ts
export async function appMentionEvent({ event, say }) {
  const messageText = event.text.toLowerCase();
  
  if (messageText.includes('help')) {
    await say(`Hi <@${event.user}>! I can help you with...`);
  } else {
    await say(`You mentioned me! How can I help?`);  
  }
}
```

**Event data structure**:
```typescript
{
  type: 'app_mention',
  text: '@botname help me please',
  user: 'U1234567890',
  channel: 'C1234567890', 
  ts: '1609459200.001900'
}
```

### 2. **message** - Any message in channels bot has access to

**When it triggers**: Someone posts a message in a channel or DM

```typescript
// message.ts  
export async function messageEvent({ event, say, client }) {
  // Ignore bot messages and message subtypes
  if ('bot_id' in event || 'subtype' in event) return;
  
  const text = event.text?.toLowerCase();
  
  // Check if it's a DM (direct message)
  const channelInfo = await client.conversations.info({
    channel: event.channel
  });
  
  if (channelInfo.channel?.is_im) {
    // Handle DM differently
    await say(`Thanks for your DM! You said: "${event.text}"`);
  }
  
  // React to urgent keywords in channels
  if (text?.includes('urgent')) {
    await client.reactions.add({
      channel: event.channel,
      name: 'warning',
      timestamp: event.ts  
    });
  }
}
```

**Event data structure**:
```typescript
{
  type: 'message',
  text: 'Hello everyone!',
  user: 'U1234567890',
  channel: 'C1234567890',
  ts: '1609459200.001900'
}
```

### 3. **member_joined_channel** - User joins a channel

**When it triggers**: Someone is added to or joins a channel

```typescript
// member-joined.ts
export async function memberJoinedChannelEvent({ event, client }) {
  const userInfo = await client.users.info({ user: event.user });
  const userName = userInfo.user?.real_name || 'New member';
  
  await client.chat.postMessage({
    channel: event.channel,
    text: `Welcome ${userName}! 🎉 Glad to have you here!`
  });
}
```

## 🚦 Event Registration

In `index.ts`, events are registered like event listeners:

```typescript
import { App } from '@slack/bolt';
import { appMentionEvent } from './app-mention';
import { messageEvent } from './message';
import { memberJoinedChannelEvent } from './member-joined';

export function registerEvents(app: App): void {
  // Register each event with its handler
  app.event('app_mention', appMentionEvent);
  app.event('message', messageEvent);  
  app.event('member_joined_channel', memberJoinedChannelEvent);
}
```

## 🎨 Response Strategies

### 1. **Immediate Response** (like real-time chat)
```typescript
export async function messageEvent({ event, say }) {
  if (event.text?.includes('hello')) {
    await say('Hello there!'); // Immediate response
  }
}
```

### 2. **Reactions** (like social media likes)
```typescript  
export async function messageEvent({ event, client }) {
  if (event.text?.includes('good job')) {
    await client.reactions.add({
      channel: event.channel,
      name: 'thumbsup', // 👍
      timestamp: event.ts
    });
  }
}
```

### 3. **Thread Replies** (keeps conversation organized)
```typescript
export async function appMentionEvent({ event, say }) {
  await say({
    text: 'My response',
    thread_ts: event.ts // Reply in thread
  });
}
```

### 4. **Conditional Logic** (smart bot behavior)
```typescript
export async function messageEvent({ event, say, client }) {
  const text = event.text?.toLowerCase();
  
  if (text?.includes('weather')) {
    await say('🌤️ It looks sunny today!');
  } else if (text?.includes('lunch')) {
    await say('🍕 How about pizza?');  
  } else if (text?.includes('urgent')) {
    // React AND notify
    await client.reactions.add({
      channel: event.channel, 
      name: 'eyes',
      timestamp: event.ts
    });
    await say('I see this is urgent! How can I help?');
  }
}
```

## 🛠️ Creating Custom Event Handlers

### Step 1: Create Handler File

Create `events/reaction-added.ts`:
```typescript
import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function reactionAddedEvent({
  event,
  client
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'reaction_added'>): Promise<void> {
  try {
    // When someone adds a 🎉 reaction, bot celebrates too
    if (event.reaction === 'tada') {
      await client.reactions.add({
        channel: event.item.channel,
        name: 'party',  
        timestamp: event.item.ts
      });
      
      await client.chat.postMessage({
        channel: event.item.channel,
        text: `Party time! 🎉 <@${event.user}> is celebrating!`,
        thread_ts: event.item.ts
      });
    }
  } catch (error) {
    console.error('Reaction event error:', error);
  }
}
```

### Step 2: Register the Event

Add to `events/index.ts`:
```typescript
import { reactionAddedEvent } from './reaction-added';

export function registerEvents(app: App): void {
  app.event('app_mention', appMentionEvent);
  app.event('message', messageEvent);
  app.event('member_joined_channel', memberJoinedChannelEvent);  
  app.event('reaction_added', reactionAddedEvent); // Add this
}
```

### Step 3: Enable Event in Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Navigate to "Event Subscriptions"  
3. Add `reaction_added` to bot events
4. Reinstall app if prompted

## 🎯 Event Filtering & Performance

### Filter Out Bot Messages
```typescript
export async function messageEvent({ event, say }) {
  // Ignore messages from bots (including your own bot)
  if ('bot_id' in event && event.bot_id) return;
  
  // Ignore message subtypes (edits, deletes, etc.)
  if ('subtype' in event && event.subtype) return;
  
  // Your logic here...
}
```

### Channel-Specific Logic
```typescript
export async function messageEvent({ event, say, client }) {
  const channelInfo = await client.conversations.info({
    channel: event.channel
  });
  
  const channelName = channelInfo.channel?.name;
  
  if (channelName === 'general') {
    // Different behavior in #general
  } else if (channelName?.startsWith('project-')) {
    // Different behavior in project channels  
  }
}
```

### User-Specific Logic
```typescript
export async function appMentionEvent({ event, say, client }) {
  const userInfo = await client.users.info({ user: event.user });
  
  if (userInfo.user?.is_admin) {
    await say('Hello admin! You have special privileges.');
  } else {
    await say('Hello team member! How can I help?');
  }
}
```

## 🧪 Testing Events Locally

### 1. **Message Events**
- Send message in channel where bot is present
- Send DM to bot
- Watch console for event logs

### 2. **Mention Events**  
- Type `@YourBot hello` in any channel
- Check bot responds correctly

### 3. **Join Events**
- Add someone to a channel 
- Verify welcome message appears

### Debug Events
```typescript
export async function messageEvent({ event, say }) {
  // Log event structure to understand data
  console.log('Message event:', JSON.stringify(event, null, 2));
  
  await say(`Debug: ${event.type} from ${event.user}`);
}
```

## 🔍 Common Event Patterns

### 1. **Smart Bot Conversation**
```typescript
export async function messageEvent({ event, say }) {
  const text = event.text?.toLowerCase();
  
  // Question detection  
  if (text?.endsWith('?')) {
    await say('Great question! Let me think about that...');
  }
  
  // Greeting detection
  if (text?.match(/^(hi|hello|hey)/)) {
    await say(`Hey <@${event.user}>! 👋`);
  }
}
```

### 2. **Keyword Monitoring**
```typescript
export async function messageEvent({ event, client }) {
  const urgentKeywords = ['down', 'broken', 'error', 'urgent', 'help'];
  const text = event.text?.toLowerCase() || '';
  
  const hasUrgentKeyword = urgentKeywords.some(keyword => 
    text.includes(keyword)
  );
  
  if (hasUrgentKeyword) {
    // Alert admins about urgent message
    await client.chat.postMessage({
      channel: 'admin-alerts',
      text: `🚨 Urgent keyword detected in <#${event.channel}>: "${event.text}"`
    });
  }
}
```

### 3. **Auto-Reactions**
```typescript
export async function messageEvent({ event, client }) {
  const text = event.text?.toLowerCase() || '';
  
  // Auto-react to different types of content
  if (text.includes('thank')) {
    await client.reactions.add({ channel: event.channel, name: 'heart', timestamp: event.ts });
  } else if (text.includes('lunch')) {
    await client.reactions.add({ channel: event.channel, name: 'hamburger', timestamp: event.ts });
  } else if (text.includes('deploy')) {
    await client.reactions.add({ channel: event.channel, name: 'rocket', timestamp: event.ts });
  }
}
```

## 🎓 Next Steps

**Mastered events?**

- **Interactive components**: Check out `actions/README.md`
- **Advanced workflows**: Explore `shortcuts/README.md`

**Want to practice?** Try creating these event handlers:
- Auto-respond to questions with "?"
- Welcome users on their first message  
- Create a word counting bot
- Auto-react to certain emojis in messages