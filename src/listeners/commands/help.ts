import { SlackCommandMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';

export async function helpCommand({ 
  ack, 
  say 
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  await say({
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Solvook Bot Help 📚'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Here are the available commands:'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Slash Commands:*\n' +
                '• `/hello` - Get a personalized greeting\n' +
                '• `/ping` - Check if the bot is responsive\n' +
                '• `/help` - Show this help message'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Message Events:*\n' +
                '• Mention the bot to get a response\n' +
                '• Direct message the bot for assistance'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Interactive Features:*\n' +
                '• Click buttons in bot messages\n' +
                '• Use shortcuts from the shortcuts menu'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_Need more help? Contact your Slack admin._'
          }
        ]
      }
    ]
  });
}