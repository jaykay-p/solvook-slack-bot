import { AllMiddlewareArgs, SlackActionMiddlewareArgs, BlockAction } from '@slack/bolt';

export async function viewHelpAction({
  ack,
  body,
  client
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Bot Help Guide'
        },
        close: {
          type: 'plain_text',
          text: 'Close'
        },
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Welcome to Solvook Bot!'
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'This bot helps you with various tasks in your Slack workspace.'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*📝 Slash Commands*'
            }
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: '• /hello - Receive a personalized greeting\n' +
                    '• /ping - Test bot responsiveness\n' +
                    '• /help - Display available commands'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*💬 Interactions*'
            }
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: '• Mention the bot to get its attention\n' +
                    '• Send direct messages for private help\n' +
                    '• The bot reacts to urgent keywords'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*🎯 Tips*'
            }
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: '• Use thread replies to keep conversations organized\n' +
                    '• Check bot status with "status" mentions\n' +
                    '• Get quick help by typing "help" in DM'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening help modal:', error);
  }
}