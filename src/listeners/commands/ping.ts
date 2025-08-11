import { SlackCommandMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';

export async function pingCommand({ 
  ack, 
  say, 
  command 
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  const startTime = Date.now();
  await ack();
  const ackTime = Date.now() - startTime;

  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '🏓 *Pong!*'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Response time: ${ackTime}ms | User: <@${command.user_id}>`
          }
        ]
      }
    ]
  });
}