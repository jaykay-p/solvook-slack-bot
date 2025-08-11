import { App } from '@slack/bolt';
import * as dotenv from 'dotenv';
import { registerListeners } from './listeners';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: parseInt(process.env.PORT || '3000')
});

registerListeners(app);

(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack bot is running!');
  } catch (error) {
    console.error('Unable to start App', error);
    process.exit(1);
  }
})();