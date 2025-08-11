import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function messageEvent({
  event,
  say,
  client
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>): Promise<void> {
  try {
    if (!('text' in event) || !event.text) {
      return;
    }

    if ('subtype' in event && event.subtype) {
      return;
    }

    if ('bot_id' in event && event.bot_id) {
      return;
    }

    const channelInfo = await client.conversations.info({
      channel: event.channel
    });

    if (channelInfo.channel?.is_im) {
      const lowerText = event.text.toLowerCase();
      
      if (lowerText.includes('hello') || lowerText.includes('hi')) {
        await say({
          text: `Hello <@${event.user}>! 👋 How can I assist you today?`,
          thread_ts: event.ts
        });
      } else if (lowerText.includes('help')) {
        await say({
          text: 'I can help you with various tasks! Try these commands:\n' +
                '• `/hello` - Get a greeting\n' +
                '• `/ping` - Check bot status\n' +
                '• `/help` - See all commands\n\n' +
                'You can also just chat with me here in DM!',
          thread_ts: event.ts
        });
      } else if (lowerText.includes('how are you')) {
        await say({
          text: "I'm doing great! Thanks for asking. How can I help you today? 🤖",
          thread_ts: event.ts
        });
      }
    } else {
      const keywords = ['urgent', 'emergency', 'important', 'asap'];
      const hasKeyword = keywords.some(keyword => 
        event.text?.toLowerCase().includes(keyword) || false
      );

      if (hasKeyword) {
        await client.reactions.add({
          channel: event.channel,
          name: 'eyes',
          timestamp: event.ts
        });

        await client.reactions.add({
          channel: event.channel,
          name: 'warning',
          timestamp: event.ts
        });
      }
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
}