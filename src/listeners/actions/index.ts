import { App } from '@slack/bolt';
import { channelInfoAction } from './channel-info';
import { viewHelpAction } from './view-help';

export function registerActions(app: App): void {
  app.action('channel_info', channelInfoAction);
  app.action('view_help', viewHelpAction);
}