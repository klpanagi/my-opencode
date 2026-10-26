import { Plugin } from "@opencode/plugin";
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

// ---------------------------------------------------------------------------
// V2 setup: registered via Plugin.define below.
// ---------------------------------------------------------------------------
async function setupV2(ctx) {
  // Hook: a tool execution is about to start — record start time and arm a
  // long-operation timer.
  ctx.tool.hook("execute.before", async (input) => {
    const toolName = input?.tool ?? input?.name ?? "unknown";
    operationTimes.set(toolName, Date.now());

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

    return input;
  });

  // Hook: a tool execution finished — notify on slow completions, log errors.
  ctx.tool.hook("execute.after", async (input, output) => {
    const toolName = input?.tool ?? input?.name ?? "unknown";
    const startTime = operationTimes.get(toolName);
    const status = output?.status ?? output?.state ?? "completed";

    if (output?.error || status === "error") {
      console.error(`[opencode-notifications] tool "${toolName}" errored:`, output?.error ?? output);
    } else if (startTime && status === "completed") {
      const duration = Date.now() - startTime;
      if (duration >= LONG_OPERATION_THRESHOLD) {
        sendNotification(
          'OpenCode - Task Completed',
          `Tool "${toolName}" completed in ${Math.round(duration / 1000)}s`,
          'success'
        );
      }
    }

    operationTimes.delete(toolName);
    return output;
  });

  // Hook: user prompt submitted — notify when it looks like the agent is
  // waiting on a confirmation / approval / permission decision.
  ctx.session.hook("prompt", async (input) => {
    const text = input?.prompt ?? input?.message ?? "";
    const haystack = (typeof text === "string" ? text : JSON.stringify(text)).toLowerCase();
    const needsConfirmation =
      haystack.includes('confirm') ||
      haystack.includes('approve') ||
      haystack.includes('permission');

    if (needsConfirmation) {
      sendNotification(
        'OpenCode - Confirmation Needed',
        'Agent is waiting for your input',
        'warning'
      );
    }

    return input;
  });

  // Event loop: notify on session idle/completion-type events, log anything
  // else session-scoped so the rule set can be refined over time.
  const sessionEventTypes = ["session.idle", "session.completed", "session.complete"];
  for (const type of sessionEventTypes) {
    ctx.event.subscribe(type, async (event) => {
      const name = event?.type ?? type;
      if (/session\.(idle|completed|complete)/.test(name)) {
        sendNotification(
          'OpenCode - Session Update',
          `Session event: ${name}`,
          'success'
        );
      } else {
        console.log(`[opencode-notifications] unmatched session event type for refinement: ${name}`);
      }
      // Clear tracked ops whenever a session settles.
      operationTimes.clear();
    });
  }

  console.log('✓ OpenCode Notifications plugin loaded (V2)');
}

// ---------------------------------------------------------------------------
// V1 fallback: the legacy server(modules) hook surface. Kept byte-for-byte so
// the same package runs on opencode 1.x via the documented Support-V1 pattern.
// ---------------------------------------------------------------------------
function server(modules) {
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

// One default export serving both runtimes (Support-V1 pattern):
// V2 loads the defined plugin, V1 calls server(modules).
export default {
  ...Plugin.define({ id: "opencode-notifications", setup: setupV2 }),
  server,
};
