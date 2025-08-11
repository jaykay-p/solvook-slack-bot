import { App } from '@slack/bolt';
import { registerCommands } from './commands';
import { registerEvents } from './events';
import { registerActions } from './actions';
import { registerShortcuts } from './shortcuts';

export function registerListeners(app: App): void {
  registerCommands(app);
  registerEvents(app);
  registerActions(app);
  registerShortcuts(app);
}