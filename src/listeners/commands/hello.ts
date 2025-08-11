import { SlackCommandMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';

export async function helloCommand({ 
  command, 
  ack, 
  say, 
  client 
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  try {
    const userInfo = await client.users.info({
      user: command.user_id
    });

    const userName = userInfo.user?.real_name || userInfo.user?.name || 'there';

    await say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hello *${userName}*! 👋`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `You called the \`/hello\` command from <#${command.channel_id}>`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_Command text: "${command.text || 'none'}"_`
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error in hello command:', error);
    await say('Sorry, something went wrong with the hello command.');
  }
}