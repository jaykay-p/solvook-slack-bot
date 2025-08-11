# ⚡ shortcuts/ - Global Shortcuts & Workflows

**What you'll learn**: How to create global shortcuts and complex workflows in Slack - like creating app-wide keyboard shortcuts or context menu actions that users can access from anywhere in Slack.

## 🧠 What Are Slack Shortcuts?

Shortcuts are quick actions users can trigger from anywhere in Slack:

- **Global shortcuts**: Like `Cmd+K` for quick switcher, accessed via shortcuts menu
- **Message shortcuts**: Right-click context menu actions on any message  
- **Complex workflows**: Multi-step processes with forms, confirmations, etc.

**Frontend analogy**: Like global keyboard shortcuts, context menus, or complex user wizards in desktop applications.

## 📂 Files in This Directory

```
shortcuts/
├── index.ts         # Shortcut registry
└── create-task.ts   # Global shortcut for task creation workflow
```

## 🎯 Shortcut Types & Patterns

### 1. **Global Shortcuts** (accessible anywhere)

Users access via:
- Slash command: `/shortcuts` or `Cmd+/` (Mac) or `Ctrl+/` (Windows)  
- Search for your shortcut name
- Click to trigger

### 2. **Message Shortcuts** (right-click on messages)

Users access via:
- Right-click any message  
- See your shortcut in context menu
- Click to trigger with message data

## 🔧 Global Shortcut Handler Pattern

```typescript
import { AllMiddlewareArgs, SlackShortcutMiddlewareArgs } from '@slack/bolt';

export async function shortcutName({
  ack,        // Acknowledge shortcut (required)
  body,       // Shortcut data
  client      // Slack API access  
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs): Promise<void> {
  await ack();

  try {
    // Open modal, send message, or start workflow
    await client.views.open({
      trigger_id: body.trigger_id,
      view: { /* modal definition */ }
    });
  } catch (error) {
    console.error('Shortcut error:', error);
  }
}
```

## 🏗️ Example: Task Creation Workflow

Let's analyze the `create-task.ts` workflow:

### Step 1: Shortcut Opens Modal

```typescript  
// create-task.ts
export async function createTaskShortcut({ ack, body, client }) {
  await ack();

  await client.views.open({
    trigger_id: body.trigger_id,  // Required for modals
    view: {
      type: 'modal',
      callback_id: 'task_modal',   // Links to submission handler
      title: { type: 'plain_text', text: 'Create New Task' },
      submit: { type: 'plain_text', text: 'Create' },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        // Task title input
        {
          type: 'input',
          block_id: 'task_title',
          label: { type: 'plain_text', text: 'Task Title' },
          element: {
            type: 'plain_text_input',
            action_id: 'title_input',
            placeholder: { type: 'plain_text', text: 'Enter task title' }
          }
        },
        // Priority selection  
        {
          type: 'input',
          block_id: 'task_priority',
          label: { type: 'plain_text', text: 'Priority' },
          element: {
            type: 'static_select',
            action_id: 'priority_select',
            options: [
              { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
              { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },
              { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' }
            ]
          }
        },
        // User assignment
        {
          type: 'input',
          block_id: 'task_assignee',
          label: { type: 'plain_text', text: 'Assign To' },
          element: {
            type: 'users_select',
            action_id: 'assignee_select'
          },
          optional: true
        }
      ]
    }
  });
}
```

### Step 2: Handle Modal Submission

Create `actions/task-modal-submit.ts`:

```typescript
export async function taskModalSubmit({ ack, body, view, client }) {
  await ack();

  // Extract form data
  const values = view.state.values;
  const title = values.task_title.title_input.value;
  const priority = values.task_priority.priority_select.selected_option.value;
  const assignee = values.task_assignee.assignee_select.selected_user;
  
  // Create task message in tasks channel
  await client.chat.postMessage({
    channel: 'tasks',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📝 New Task Created' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Title:*\n${title}` },
          { type: 'mrkdwn', text: `*Priority:*\n${priority}` },
          { type: 'mrkdwn', text: `*Created by:*\n<@${body.user.id}>` },
          { 
            type: 'mrkdwn', 
            text: `*Assigned to:*\n${assignee ? `<@${assignee}>` : 'Unassigned'}` 
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Complete' },
            action_id: 'complete_task',
            style: 'primary'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '✏️ Edit' },
            action_id: 'edit_task'
          }
        ]
      }
    ]
  });
  
  // Send confirmation to creator
  await client.chat.postMessage({
    channel: body.user.id,
    text: `✅ Task "${title}" created successfully!`
  });
}
```

### Step 3: Register Shortcut & Modal Handler

```typescript
// shortcuts/index.ts
export function registerShortcuts(app: App): void {
  app.shortcut('create_task', createTaskShortcut);
}

// actions/index.ts (add to existing file)
export function registerActions(app: App): void {
  app.action('channel_info', channelInfoAction);
  app.view('task_modal', taskModalSubmit);  // Add modal handler
}
```

## 📱 Message Shortcuts

Message shortcuts appear in right-click context menu:

### Create Message Shortcut

```typescript
// shortcuts/save-message.ts
export async function saveMessageShortcut({ ack, body, client }) {
  await ack();

  const message = body.message;
  
  // Save important message to bookmarks channel
  await client.chat.postMessage({
    channel: 'bookmarks',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📌 *Message saved by <@${body.user.id}>*`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn', 
          text: `> ${message.text}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `From <#${body.channel.id}> | ${new Date(parseFloat(message.ts) * 1000).toLocaleString()}`
          }
        ]
      }
    ]
  });
  
  // Confirm to user  
  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: body.user.id,
    text: '📌 Message saved to #bookmarks!'
  });
}
```

### Register Message Shortcut

```typescript
export function registerShortcuts(app: App): void {
  app.shortcut('create_task', createTaskShortcut);         // Global  
  app.shortcut('save_message', saveMessageShortcut);       // Message
}
```

## 🔄 Complex Multi-Step Workflows

### Step-by-Step Workflow Example

```typescript
// shortcuts/approval-workflow.ts
export async function approvalWorkflowShortcut({ ack, body, client }) {
  await ack();

  // Step 1: Initial request form
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'approval_step_1',
      title: { type: 'plain_text', text: 'Request Approval' },
      submit: { type: 'plain_text', text: 'Next' },
      blocks: [
        {
          type: 'input',
          block_id: 'request_type',
          label: { type: 'plain_text', text: 'Request Type' },
          element: {
            type: 'static_select',
            action_id: 'type_select',
            options: [
              { text: { type: 'plain_text', text: 'Budget Approval' }, value: 'budget' },
              { text: { type: 'plain_text', text: 'Time Off' }, value: 'timeoff' },
              { text: { type: 'plain_text', text: 'Equipment' }, value: 'equipment' }
            ]
          }
        }
      ]
    }
  });
}

// Handle step 1 submission → open step 2
export async function approvalStep1Submit({ ack, body, view, client }) {
  await ack();

  const requestType = view.state.values.request_type.type_select.selected_option.value;
  
  // Step 2: Different form based on request type
  let step2Blocks;
  if (requestType === 'budget') {
    step2Blocks = [
      {
        type: 'input',
        block_id: 'amount',
        label: { type: 'plain_text', text: 'Amount ($)' },
        element: { type: 'plain_text_input', action_id: 'amount_input' }
      }
    ];
  } else if (requestType === 'timeoff') {
    step2Blocks = [
      {
        type: 'input',
        block_id: 'dates',
        label: { type: 'plain_text', text: 'Dates' },
        element: { type: 'datepicker', action_id: 'date_picker' }
      }
    ];
  }

  await client.views.update({
    view_id: body.view.id,
    view: {
      type: 'modal',
      callback_id: 'approval_step_2',
      title: { type: 'plain_text', text: 'Approval Details' },
      submit: { type: 'plain_text', text: 'Submit Request' },
      blocks: step2Blocks
    }
  });
}
```

## 🛠️ Creating Your Own Shortcut

### Step 1: Create Shortcut Handler

Create `shortcuts/team-standup.ts`:

```typescript
import { AllMiddlewareArgs, SlackShortcutMiddlewareArgs } from '@slack/bolt';

export async function teamStandupShortcut({
  ack,
  body,
  client
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs): Promise<void> {
  await ack();

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'standup_modal',
      title: { type: 'plain_text', text: 'Daily Standup' },
      submit: { type: 'plain_text', text: 'Share Update' },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: 'input',
          block_id: 'yesterday',
          label: { type: 'plain_text', text: 'What did you work on yesterday?' },
          element: {
            type: 'plain_text_input',
            action_id: 'yesterday_input',
            multiline: true
          }
        },
        {
          type: 'input', 
          block_id: 'today',
          label: { type: 'plain_text', text: 'What will you work on today?' },
          element: {
            type: 'plain_text_input',
            action_id: 'today_input',
            multiline: true
          }
        },
        {
          type: 'input',
          block_id: 'blockers',
          label: { type: 'plain_text', text: 'Any blockers or help needed?' },
          element: {
            type: 'plain_text_input', 
            action_id: 'blockers_input',
            multiline: true
          },
          optional: true
        }
      ]
    }
  });
}
```

### Step 2: Create Modal Handler

Create `actions/standup-modal-submit.ts`:

```typescript
export async function standupModalSubmit({ ack, body, view, client }) {
  await ack();

  const values = view.state.values;
  const yesterday = values.yesterday.yesterday_input.value;
  const today = values.today.today_input.value;
  const blockers = values.blockers.blockers_input.value;

  await client.chat.postMessage({
    channel: 'standup', 
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📅 *Standup Update from <@${body.user.id}>*`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Yesterday:*\n${yesterday}` },
          { type: 'mrkdwn', text: `*Today:*\n${today}` }
        ]
      },
      ...(blockers ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Blockers:*\n${blockers}` }
      }] : [])
    ]
  });
}
```

### Step 3: Register Everything  

```typescript
// shortcuts/index.ts
import { teamStandupShortcut } from './team-standup';

export function registerShortcuts(app: App): void {
  app.shortcut('create_task', createTaskShortcut);
  app.shortcut('team_standup', teamStandupShortcut);  // Add this
}

// actions/index.ts
export function registerActions(app: App): void {
  app.view('task_modal', taskModalSubmit);
  app.view('standup_modal', standupModalSubmit);      // Add this
}
```

### Step 4: Configure in Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Navigate to "Interactivity & Shortcuts"
3. Create Global Shortcut:
   - **Name**: "Team Standup"
   - **Short Description**: "Share daily standup update"
   - **Callback ID**: `team_standup`

## 🧪 Testing Shortcuts Locally

### Access Global Shortcuts
1. In Slack, press `Cmd+/` (Mac) or `Ctrl+/` (Windows)
2. Search for your shortcut name
3. Click to trigger

### Access Message Shortcuts  
1. Right-click any message
2. Look for your shortcut in "More actions"
3. Click to trigger

### Debug Shortcuts
```typescript
export async function debugShortcut({ ack, body, client }) {
  await ack();
  
  console.log('Shortcut body:', JSON.stringify(body, null, 2));
  
  await client.chat.postMessage({
    channel: body.user.id,
    text: `Debug - Shortcut triggered by ${body.user.id}`
  });
}
```

## 🎯 Best Practices

### 1. **User Experience First**
```typescript
// ✅ Good - Clear, helpful interface
{
  type: 'modal',
  title: { type: 'plain_text', text: 'Create Bug Report' },
  submit: { type: 'plain_text', text: 'Create Report' },
  // Clear labels, helpful placeholders
}

// ❌ Bad - Confusing interface
{
  type: 'modal', 
  title: { type: 'plain_text', text: 'Form' },
  submit: { type: 'plain_text', text: 'Submit' }
}
```

### 2. **Handle All Steps**
```typescript
// Multi-step workflows need handlers for each step
app.shortcut('workflow_start', startWorkflow);      // Step 1
app.view('workflow_step_1', handleStep1);           // Step 2  
app.view('workflow_step_2', handleStep2);           // Step 3
app.action('workflow_complete', completeWorkflow);  // Final
```

### 3. **Provide Feedback**
```typescript
// Always confirm actions completed
await client.chat.postMessage({
  channel: body.user.id,
  text: '✅ Your request has been submitted!'
});
```

## 🎓 Graduation Complete!

**🎉 Congratulations!** You've learned all the core Slack bot concepts:

- **Entry Point** (`src/`) - How bots start and connect
- **Event System** (`listeners/`) - How bots respond to activities  
- **Slash Commands** (`commands/`) - Simple user-triggered actions
- **Real-time Events** (`events/`) - Reactive bot behaviors
- **Interactive Components** (`actions/`) - Buttons, forms, and engagement
- **Complex Workflows** (`shortcuts/`) - Multi-step user experiences

## 🚀 What's Next?

**Build your own bot features:**
- Employee onboarding workflow
- Meeting scheduling system  
- Project status dashboard
- Team polling and voting
- Automated reminders and notifications

**Advanced topics to explore:**
- Database integration for persistent data
- External API integrations  
- Scheduled tasks and cron jobs
- Advanced security and permissions
- Bot analytics and monitoring

Happy bot building! 🤖