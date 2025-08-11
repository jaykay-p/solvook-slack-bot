import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function appMentionEvent({
  event,
  say
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_mention'>): Promise<void> {
  try {
    const messageText = event.text.toLowerCase();
    
    let response = '';
    
    if (messageText.includes('help')) {
      response = `Hi <@${event.user}>! I can help you with:\n` +
                 '• `/hello` - Get a greeting\n' +
                 '• `/ping` - Check my response time\n' +
                 '• `/help` - Show all available commands';
    } else if (messageText.includes('status')) {
      response = `I'm online and ready to help, <@${event.user}>! 🟢`;
    } else if (messageText.includes('thank')) {
      response = `You're welcome, <@${event.user}>! Happy to help! 😊`;
    } else {
      response = `Hi <@${event.user}>! You mentioned me. How can I help you today?\n` +
                 '_Try asking for "help" or "status"_';
    }

    await say({
      text: response,
      thread_ts: event.ts
    });
  } catch (error) {
    console.error('Error handling app mention:', error);
  }
}