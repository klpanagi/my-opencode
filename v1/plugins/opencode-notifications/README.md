# OpenCode Notifications Plugin

Desktop notification plugin for OpenCode that alerts you on important events.

## Features

- **Task Completion Notifications**: Get notified when agents complete all tasks
- **Long-Running Operation Alerts**: Receive alerts when operations take longer than 30 seconds
- **User Confirmation Needed**: Get notified when the agent needs your input or confirmation

## Installation

1. The plugin is already installed in `~/.config/opencode/plugins/opencode-notifications/`

2. Install dependencies:
   ```bash
   cd ~/.config/opencode/plugins/opencode-notifications
   npm install
   ```

3. Add the plugin to your `opencode.json`:
   ```json
   {
     "plugin": [
       "oh-my-opencode@latest",
       "opencode-antigravity-auth@1.4.6",
       "~/.config/opencode/plugins/opencode-notifications"
     ]
   }
   ```

## Configuration

You can customize the plugin by editing `src/index.js`:

- `LONG_OPERATION_THRESHOLD`: Change the threshold for long-running operations (default: 30000ms)
- Add custom notification logic in the hooks
- Customize notification messages and icons

## Supported Events

- **PreToolUse**: Tracks when tools start executing
- **PostToolUse**: Notifies when long operations complete
- **Stop**: Notifies when the agent session ends
- **UserPromptSubmit**: Notifies when user confirmation is needed

## Requirements

- Node.js installed
- `node-notifier` package (automatically installed)
- Desktop notification support on your OS (works on macOS, Linux, Windows)
