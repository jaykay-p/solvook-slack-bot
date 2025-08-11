import { App } from '@slack/bolt';
import { appMentionEvent } from './app-mention';
import { messageEvent } from './message';
import { memberJoinedChannelEvent } from './member-joined';

export function registerEvents(app: App): void {
  app.event('app_mention', appMentionEvent);
  app.event('message', messageEvent);
  app.event('member_joined_channel', memberJoinedChannelEvent);
}