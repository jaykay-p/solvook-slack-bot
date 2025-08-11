import { App } from '@slack/bolt';
import { helloCommand } from './hello';
import { helpCommand } from './help';
import { pingCommand } from './ping';

export function registerCommands(app: App): void {
  app.command('/hello', helloCommand);
  app.command('/help', helpCommand);
  app.command('/ping', pingCommand);
}