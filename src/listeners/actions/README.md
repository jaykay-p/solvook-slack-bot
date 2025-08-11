# 🎛️ actions/ - Interactive Components

**What you'll learn**: How to handle button clicks, form submissions, and interactive elements in Slack - similar to handling `onClick`, `onSubmit`, and other interactive events in React or vanilla JavaScript.

## 🧠 What Are Slack Actions?

Actions are user interactions with interactive components in your bot messages:

- User clicks a button → `button action` fires
- User submits a modal form → `view_submission` fires  
- User selects from dropdown → `select action` fires
- User clicks overflow menu → `overflow action` fires

**Frontend analogy**: Like click handlers for buttons, form submission handlers, and dropdown change handlers.

## 📂 Files in This Directory

```
actions/
├── index.ts           # Action registry (like event handlers setup)
├── channel-info.ts    # Handle "Channel Info" button clicks
└── view-help.ts       # Handle "View Help" button → opens modal
```

## 🎯 Action Handler Pattern

Every action handler follows this structure:

```typescript
import { AllMiddlewareArgs, SlackActionMiddlewareArgs, BlockAction } from '@slack/bolt';

export async function actionName({
  ack,      // Acknowledge the action (required)  
  body,     // Full interaction payload
  client,   // Slack API access
  action    // Specific action data
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
  // 1. Always acknowledge first
  await ack();

  try {
    // 2. Process action data
    const userId = body.user.id;
    const actionValue = (action as any).value;
    
    // 3. Respond (update message, show modal, etc.)
    await client.chat.postMessage({
      channel: body.channel?.id,
      text: 'Button was clicked!'
    });
  } catch (error) {
    console.error('Action error:', error);
  }
}
```

**Key points**: 
- Actions need `ack()` like commands (they're user requests)
- Actions can update existing messages or create new ones
- Actions can open modals for complex interactions

## 🔘 Button Actions

### Creating a Button

In any message handler, add interactive buttons:

```typescript
// In a command or event handler
await say({
  text: 'Choose an action:',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'What would you like to do?'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Get Info' },
          action_id: 'get_info',     // This links to your handler
          value: 'some_data'         // Optional data to pass
        },
        {
          type: 'button', 
          text: { type: 'plain_text', text: 'Delete' },
          action_id: 'delete_item',
          style: 'danger',           // Red button
          confirm: {                 // Confirmation dialog
            title: { type: 'plain_text', text: 'Are you sure?' },
            text: { type: 'plain_text', text: 'This cannot be undone.' },
            confirm: { type: 'plain_text', text: 'Delete' },
            deny: { type: 'plain_text', text: 'Cancel' }
          }
        }
      ]
    }
  ]
});
```

### Handling Button Clicks

```typescript
// actions/get-info.ts
export async function getInfoAction({ ack, body, client, action }) {
  await ack();
  
  const actionData = (action as any).value; // 'some_data' from button
  const userId = body.user.id;
  
  // Update the original message
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    blocks: [
      {
        type: 'section', 
        text: {
          type: 'mrkdwn',
          text: `✅ Info retrieved for <@${userId}>!\n\nData: ${actionData}`
        }
      }
    ]
  });
}
```

### Register Button Action

```typescript
// actions/index.ts
export function registerActions(app: App): void {
  app.action('get_info', getInfoAction);      // Matches action_id
  app.action('delete_item', deleteItemAction);
}
```

## 🏗️ Modal Interactions

Modals are like popup forms - perfect for complex user input.

### Opening a Modal from Button

```typescript
// actions/view-help.ts - Opens help modal
export async function viewHelpAction({ ack, body, client }) {
  await ack();

  await client.views.open({
    trigger_id: body.trigger_id,  // Required for opening modals
    view: {
      type: 'modal',
      callback_id: 'help_modal',  // Links to submission handler
      title: { type: 'plain_text', text: 'Help Center' },
      close: { type: 'plain_text', text: 'Close' },
      submit: { type: 'plain_text', text: 'Submit' },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn', 
            text: 'How can we help you today?'
          }
        },
        {
          type: 'input',
          block_id: 'help_topic',
          label: { type: 'plain_text', text: 'Topic' },
          element: {
            type: 'plain_text_input',
            action_id: 'topic_input',
            placeholder: { type: 'plain_text', text: 'What do you need help with?' }
          }
        },
        {
          type: 'input', 
          block_id: 'help_details',
          label: { type: 'plain_text', text: 'Details' },
          element: {
            type: 'plain_text_input',
            action_id: 'details_input',
            multiline: true,
            placeholder: { type: 'plain_text', text: 'Provide more details...' }
          }
        }
      ]
    }
  });
}
```

### Handling Modal Submission

```typescript
// actions/help-modal-submit.ts
export async function helpModalSubmit({ ack, body, client, view }) {
  await ack();

  // Extract form data
  const values = view.state.values;
  const topic = values.help_topic.topic_input.value;
  const details = values.help_details.details_input.value;
  
  // Send help request to support channel
  await client.chat.postMessage({
    channel: 'support',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🆘 *Help Request from <@${body.user.id}>*`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Topic:*\n${topic}` },
          { type: 'mrkdwn', text: `*Details:*\n${details}` }
        ]
      }
    ]
  });
  
  // Optionally send confirmation DM to user
  await client.chat.postMessage({
    channel: body.user.id,
    text: '✅ Your help request has been submitted!'
  });
}
```

### Register Modal Handlers

```typescript  
// actions/index.ts
export function registerActions(app: App): void {
  // Button actions
  app.action('view_help', viewHelpAction);
  
  // Modal submissions
  app.view('help_modal', helpModalSubmit);  // Matches callback_id
}
```

## 📋 Select Menus & Dropdowns

### Static Select Menu

```typescript
// In message blocks
{
  type: 'section',
  text: { type: 'mrkdwn', text: 'Choose your priority:' },
  accessory: {
    type: 'static_select',
    action_id: 'priority_select',
    placeholder: { type: 'plain_text', text: 'Select priority' },
    options: [
      { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
      { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },  
      { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' }
    ]
  }
}
```

### User Select Menu

```typescript
// Let user pick another team member
{
  type: 'section',
  text: { type: 'mrkdwn', text: 'Assign to:' },
  accessory: {
    type: 'users_select',
    action_id: 'assign_user',
    placeholder: { type: 'plain_text', text: 'Select user' }
  }
}
```

### Handling Select Actions

```typescript
export async function prioritySelectAction({ ack, body, client, action }) {
  await ack();
  
  const selectedPriority = (action as any).selected_option.value;
  
  await client.chat.postMessage({
    channel: body.channel.id,
    text: `Priority set to: ${selectedPriority}`,
    thread_ts: body.message.ts
  });
}
```

## 🎨 Advanced Action Patterns

### 1. **Message Updates** (like live editing)
```typescript
export async function toggleStatusAction({ ack, body, client, action }) {
  await ack();
  
  const currentStatus = (action as any).value;
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  
  // Update the original message
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `Status: *${newStatus}*` },
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: `Toggle to ${currentStatus}` },
          action_id: 'toggle_status',
          value: newStatus
        }
      }
    ]
  });
}
```

### 2. **Ephemeral Responses** (only user sees)
```typescript
export async function secretInfoAction({ ack, body, client }) {
  await ack();
  
  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: body.user.id,
    text: '🤫 This is secret info only you can see!'
  });
}
```

### 3. **Chain Actions** (multi-step workflows)  
```typescript
export async function startWorkflowAction({ ack, body, client }) {
  await ack();
  
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '✅ Step 1 complete! Choose next step:' }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Step 2' },
            action_id: 'workflow_step_2'
          },
          {
            type: 'button', 
            text: { type: 'plain_text', text: 'Cancel' },
            action_id: 'workflow_cancel',
            style: 'danger'
          }
        ]
      }
    ]
  });
}
```

## 🛠️ Creating Your Own Action

### Step 1: Add Button to Existing Handler

Modify any command/event handler to include a button:

```typescript
// In commands/hello.ts - add button to response
await say({
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `Hello *${userName}*! 👋` }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Get Random Fact' },
          action_id: 'random_fact',  // Your custom action
          style: 'primary'
        }
      ]
    }
  ]
});
```

### Step 2: Create Action Handler

Create `actions/random-fact.ts`:
```typescript
import { AllMiddlewareArgs, SlackActionMiddlewareArgs, BlockAction } from '@slack/bolt';

const facts = [
  'Honey never spoils! 🍯',
  'Octopuses have three hearts! 🐙', 
  'Bananas are berries, but strawberries aren\'t! 🍌',
  'A group of flamingos is called a "flamboyance"! 🦩'
];

export async function randomFactAction({
  ack,
  body, 
  client
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
  await ack();

  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  
  await client.chat.postMessage({
    channel: body.channel?.id || '',
    text: `🧠 Random Fact: ${randomFact}`,
    thread_ts: body.message?.ts
  });
}
```

### Step 3: Register Action

Add to `actions/index.ts`:
```typescript
import { randomFactAction } from './random-fact';

export function registerActions(app: App): void {
  app.action('channel_info', channelInfoAction);
  app.action('view_help', viewHelpAction);
  app.action('random_fact', randomFactAction);  // Add this
}
```

### Step 4: Test Your Action

1. Save files (bot restarts)
2. Run `/hello` command  
3. Click "Get Random Fact" button
4. See your custom response!

## 🧪 Testing Actions Locally

### 1. **Button Actions**
- Add buttons to any message
- Click and watch console logs
- Verify responses appear correctly

### 2. **Modal Interactions**  
- Click button that opens modal
- Fill form and submit
- Check submission handling

### Debug Actions
```typescript
export async function debugAction({ ack, body, client, action }) {
  await ack();
  
  console.log('Action body:', JSON.stringify(body, null, 2));
  console.log('Action details:', JSON.stringify(action, null, 2));
  
  await client.chat.postMessage({
    channel: body.channel.id,
    text: `Debug - Action ID: ${(action as any).action_id}`
  });
}
```

## 🎯 Best Practices

### 1. **Always Acknowledge**
```typescript
// ✅ Good
await ack();
// ... rest of logic

// ❌ Bad
// ... logic without ack will timeout
```

### 2. **Handle Errors Gracefully**
```typescript
try {
  await client.chat.postMessage({...});
} catch (error) {
  console.error('Action failed:', error);
  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: body.user.id,  
    text: 'Sorry, something went wrong!'
  });
}
```

### 3. **Use Meaningful Action IDs**
```typescript
// ✅ Good - descriptive
action_id: 'approve_request'
action_id: 'delete_message'  
action_id: 'assign_task'

// ❌ Bad - unclear
action_id: 'btn1'
action_id: 'action'
```

## 🎓 Next Steps

**Mastered interactive components?**

- **Advanced workflows**: Explore `shortcuts/README.md`
- **Back to basics**: Review `commands/README.md` or `events/README.md`

**Want to practice?** Try creating:
- A poll system with buttons for voting
- A task assignment workflow with user selects  
- A settings panel with toggles and dropdowns
- A multi-step wizard using modal chains