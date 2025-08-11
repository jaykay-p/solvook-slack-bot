import { App } from '@slack/bolt';
import { createTaskShortcut } from './create-task';

export function registerShortcuts(app: App): void {
  app.shortcut('create_task', createTaskShortcut);
}