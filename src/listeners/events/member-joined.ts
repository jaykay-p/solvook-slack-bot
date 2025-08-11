import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function memberJoinedChannelEvent({
  event,
  client
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'member_joined_channel'>): Promise<void> {
  try {
    const userInfo = await client.users.info({
      user: event.user
    });

    const channelInfo = await client.conversations.info({
      channel: event.channel
    });

    const userName = userInfo.user?.real_name || userInfo.user?.name || 'New member';
    const channelName = channelInfo.channel?.name || 'the channel';

    await client.chat.postMessage({
      channel: event.channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Welcome to #${channelName}, *${userName}*! 🎉`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "We're glad to have you here. Feel free to introduce yourself and let us know if you need any help getting started!"
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Get Channel Info'
              },
              action_id: 'channel_info',
              value: event.channel
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Help'
              },
              action_id: 'view_help',
              style: 'primary'
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error handling member joined event:', error);
  }
}