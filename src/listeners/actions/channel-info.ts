import { AllMiddlewareArgs, SlackActionMiddlewareArgs, BlockAction } from '@slack/bolt';

export async function channelInfoAction({
  ack,
  body,
  client,
  action
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
  await ack();

  try {
    const channelId = (action as any).value || body.channel?.id;
    
    const channelInfo = await client.conversations.info({
      channel: channelId
    });

    const memberCount = await client.conversations.members({
      channel: channelId
    });

    await client.chat.postEphemeral({
      channel: channelId,
      user: body.user.id,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Channel Information 📊'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Channel Name:*\n#${channelInfo.channel?.name}`
            },
            {
              type: 'mrkdwn',
              text: `*Members:*\n${memberCount.members?.length || 0} members`
            },
            {
              type: 'mrkdwn',
              text: `*Created:*\n<!date^${channelInfo.channel?.created}^{date_long}|${new Date((channelInfo.channel?.created || 0) * 1000).toLocaleDateString()}>`
            },
            {
              type: 'mrkdwn',
              text: `*Purpose:*\n${channelInfo.channel?.purpose?.value || 'No purpose set'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Topic:*\n${channelInfo.channel?.topic?.value || 'No topic set'}`
          }
        }
      ]
    });
  } catch (error) {
    console.error('Error handling channel info action:', error);
  }
}