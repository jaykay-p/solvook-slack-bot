import { AllMiddlewareArgs, SlackShortcutMiddlewareArgs } from '@slack/bolt';

export async function createTaskShortcut({
  ack,
  body,
  client
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs): Promise<void> {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'task_modal',
        title: {
          type: 'plain_text',
          text: 'Create New Task'
        },
        submit: {
          type: 'plain_text',
          text: 'Create'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'task_title',
            label: {
              type: 'plain_text',
              text: 'Task Title'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'title_input',
              placeholder: {
                type: 'plain_text',
                text: 'Enter task title'
              }
            }
          },
          {
            type: 'input',
            block_id: 'task_description',
            label: {
              type: 'plain_text',
              text: 'Description'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'description_input',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'Describe your task'
              }
            },
            optional: true
          },
          {
            type: 'input',
            block_id: 'task_priority',
            label: {
              type: 'plain_text',
              text: 'Priority'
            },
            element: {
              type: 'static_select',
              action_id: 'priority_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select priority'
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '🔴 High'
                  },
                  value: 'high'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '🟡 Medium'
                  },
                  value: 'medium'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '🟢 Low'
                  },
                  value: 'low'
                }
              ]
            }
          },
          {
            type: 'input',
            block_id: 'task_assignee',
            label: {
              type: 'plain_text',
              text: 'Assign To'
            },
            element: {
              type: 'users_select',
              action_id: 'assignee_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select a user'
              }
            },
            optional: true
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening task modal:', error);
  }
}