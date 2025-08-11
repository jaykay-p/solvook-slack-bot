# Solvook Slack Bot

A TypeScript-based Slack bot with examples of common bot functionalities including slash commands, event handling, interactive components, and shortcuts.

> **👥 Team Learning Guide**: This project is designed for frontend developers new to Slack bot development. Each directory contains detailed README files explaining the concepts and implementation patterns.

## Features

### Slash Commands
- `/hello` - Get a personalized greeting
- `/ping` - Check bot responsiveness
- `/help` - Display available commands

### Event Listeners
- **App Mentions** - Bot responds when mentioned
- **Direct Messages** - Interactive conversations in DMs
- **Member Joined** - Welcome new channel members
- **Message Keywords** - React to urgent keywords

### Interactive Components
- Button actions for channel information
- Modal views for help and task creation
- Global shortcuts for quick actions

## Setup Instructions

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name and select workspace
4. Navigate to "Socket Mode" and enable it
5. Generate an app-level token with `connections:write` scope

### 2. Configure Bot Permissions

In "OAuth & Permissions", add these bot token scopes:
- `app_mentions:read` - Read mentions
- `channels:history` - View channel messages
- `channels:join` - Join public channels
- `channels:read` - View channel info
- `chat:write` - Send messages
- `commands` - Use slash commands
- `groups:history` - View private channel messages
- `groups:read` - View private channel info
- `im:history` - View direct messages
- `im:read` - View DM info
- `im:write` - Send direct messages
- `mpim:history` - View group DM messages
- `mpim:read` - View group DM info
- `reactions:write` - Add reactions
- `users:read` - View user info

### 3. Enable Event Subscriptions

In "Event Subscriptions", subscribe to these bot events:
- `app_mention` - When bot is mentioned
- `message.channels` - Channel messages
- `message.groups` - Private channel messages
- `message.im` - Direct messages
- `member_joined_channel` - New member joins

### 4. Create Slash Commands

In "Slash Commands", create:
- `/hello` - Description: "Get a greeting"
- `/ping` - Description: "Check bot status"
- `/help` - Description: "Show help"

### 5. Add Shortcuts

In "Interactivity & Shortcuts":
1. Enable Interactivity
2. Create global shortcut:
   - Name: "Create Task"
   - Short Description: "Create a new task"
   - Callback ID: `create_task`

### 6. Install App to Workspace

1. Go to "Install App"
2. Click "Install to Workspace"
3. Authorize the app
4. Copy the Bot User OAuth Token

## 🚀 Quick Start for Local Testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Your Slack App (One-time setup)

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app
2. **Enable Socket Mode** (this allows local testing without webhooks)
3. **Create these tokens**:
   - Bot User OAuth Token (starts with `xoxb-`)
   - App-Level Token (starts with `xapp-`) with `connections:write` scope
4. **Add bot scopes** (copy from the detailed setup section below)
5. **Subscribe to events** (copy from the detailed setup section below)
6. **Create slash commands** (`/hello`, `/ping`, `/help`)
7. **Install app to workspace**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your tokens:
```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
```

### 4. Start Local Development

```bash
npm run dev
```

**✅ Success!** Your bot should show "⚡️ Slack bot is running!" and be ready to test in your Slack workspace.

## 🧪 Testing Your Bot Locally

Once running, test these features in your Slack workspace:

1. **Slash Commands**: Type `/hello` in any channel
2. **Mentions**: Type `@YourBot help` in a channel  
3. **Direct Messages**: DM the bot with "hello"
4. **Reactions**: Post a message with "urgent" - bot will react
5. **Welcome Messages**: Invite someone new to a channel

## 📁 Project Structure & Learning Path

```
src/
├── README.md               # 📖 Start here - explains the entry point
├── index.ts               # Main entry point
└── listeners/             # 📖 Event handling system explained
    ├── README.md          # Core concepts of Slack event listeners
    ├── commands/          # 📖 Slash commands (/hello, /ping, /help)
    │   └── README.md      # How to create and handle slash commands
    ├── events/            # 📖 Real-time events (messages, mentions)  
    │   └── README.md      # Event types and handling patterns
    ├── actions/           # 📖 Interactive components (buttons, modals)
    │   └── README.md      # Button clicks and form submissions
    └── shortcuts/         # 📖 Global shortcuts and workflows
        └── README.md      # App-wide shortcuts and complex interactions
```

> **💡 Learning Tip**: Read the README files in this order for the best learning experience:
> 1. `src/README.md` - Understand the app structure
> 2. `listeners/README.md` - Learn the event system
> 3. `commands/README.md` - Start with simple slash commands  
> 4. `events/README.md` - Handle real-time messages
> 5. `actions/README.md` - Add interactive components
> 6. `shortcuts/README.md` - Create advanced workflows

## Testing Your Bot

1. **Test Slash Commands**: Type `/hello` in any channel
2. **Test Mentions**: Mention your bot with `@BotName help`
3. **Test DMs**: Send a direct message saying "hello"
4. **Test Reactions**: Send a message with "urgent" in a channel
5. **Test Welcome**: Invite someone to a channel
6. **Test Shortcuts**: Use Cmd+/ (Mac) or Ctrl+/ (Windows) and search for "Create Task"

## Extending the Bot

### Add New Slash Command

1. Create file in `src/listeners/commands/`
2. Export handler function
3. Register in `src/listeners/commands/index.ts`
4. Add command in Slack app configuration

### Add New Event Listener

1. Create file in `src/listeners/events/`
2. Export handler function
3. Register in `src/listeners/events/index.ts`
4. Enable event in Slack app configuration

### Add Interactive Component

1. Create file in `src/listeners/actions/`
2. Export handler function with unique `action_id`
3. Register in `src/listeners/actions/index.ts`

## Troubleshooting

- **Bot not responding**: Check Socket Mode is enabled and app token is correct
- **Permission errors**: Verify all required scopes are added
- **Events not firing**: Check event subscriptions are enabled
- **Commands not working**: Ensure commands are created in Slack app settings

## Resources

- [Slack Bolt Documentation](https://slack.dev/bolt-js)
- [Slack API Documentation](https://api.slack.com)
- [Block Kit Builder](https://app.slack.com/block-kit-builder)