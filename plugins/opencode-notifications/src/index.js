import notifier from 'node-notifier';
import path from 'path';

// Track operation start times for long-running detection
const operationTimes = new Map();
const LONG_OPERATION_THRESHOLD = 30000; // 30 seconds

function sendNotification(title, message, icon = 'info') {
  notifier.notify({
    title: title,
    message: message,
    icon: path.join(process.cwd(), 'icon.png'), // Optional: add custom icon
    sound: true,
    wait: false,
    timeout: 5
  });
}

export default function plugin(modules) {
  const { hook } = modules;

  // Hook: When a task/tool execution starts
  hook('PreToolUse', async ({ messages, tool }) => {
    const toolName = tool.name;
    operationTimes.set(toolName, Date.now());
    
    // Check if this is a long-running tool
    setTimeout(() => {
      const startTime = operationTimes.get(toolName);
      if (startTime && Date.now() - startTime >= LONG_OPERATION_THRESHOLD) {
        sendNotification(
          'OpenCode - Long Operation',
          `Tool "${toolName}" is taking longer than expected...`,
          'time'
        );
      }
    }, LONG_OPERATION_THRESHOLD);

    return { messages, tool };
  });

  // Hook: When a task/tool execution completes
  hook('PostToolUse', async ({ messages, tool, result }) => {
    const toolName = tool.name;
    const startTime = operationTimes.get(toolName);
    
    if (startTime) {
      const duration = Date.now() - startTime;
      operationTimes.delete(toolName);
      
      // Notify on completion of long operations
      if (duration >= LONG_OPERATION_THRESHOLD) {
        sendNotification(
          'OpenCode - Task Completed',
          `Tool "${toolName}" completed in ${Math.round(duration / 1000)}s`,
          'success'
        );
      }
    }

    return { messages, tool, result };
  });

  // Hook: When agent stops (task completion)
  hook('Stop', async ({ messages }) => {
    sendNotification(
      'OpenCode - Session Stopped',
      'Agent has completed all tasks',
      'success'
    );
    
    // Clear all tracked operations
    operationTimes.clear();
    
    return { messages };
  });

  // Hook: When user prompt is needed (confirmation required)
  hook('UserPromptSubmit', async ({ messages, prompt }) => {
    // Check if the prompt indicates a confirmation is needed
    const lastMessage = messages[messages.length - 1];
    const needsConfirmation = lastMessage?.content?.toLowerCase().includes('confirm') ||
                             lastMessage?.content?.toLowerCase().includes('approve') ||
                             lastMessage?.content?.toLowerCase().includes('permission');
    
    if (needsConfirmation) {
      sendNotification(
        'OpenCode - Confirmation Needed',
        'Agent is waiting for your input',
        'warning'
      );
    }
    
    return { messages, prompt };
  });

  console.log('✓ OpenCode Notifications plugin loaded');
}
