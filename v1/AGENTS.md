# OpenCode Agent Instructions

This repository contains your **OpenCode AI agent configuration** and plugins.

## Architecture

```
~/.myopencode/
├── opencode.jsonc      # Main OpenCode config (providers, plugins, instructions)
├── dcp.jsonc           # Dynamic Context Pruning settings
├── matrixx.jsonc       # Matrixx agent profile (uses Claude Sonnet 4.6)
├── plugins/            # Installed plugins
│   ├── opencode-notifications/  # Desktop alerts on agent events
│   └── opencode-shell-strategy/ # Non-interactive shell guidance
├── agents/             # Custom agent definitions (empty - add yours here)
├── skills/             # Custom skills (empty - add yours here)
└── tools/              # Custom tools (empty - add yours here)
```

## Key Files

### `opencode.jsonc`
- **Provider**: Ariadne Staging (Qwen 3.5 35B, Claude Haiku 4-5)
- **Active plugins**: DCP, type-inject, mem, envsitter-guard, ccusage, braintrust
- **Instructions**: Shell strategy loaded from `plugins/opencode-shell-strategy/shell_strategy.md`

### `dcp.jsonc`
Dynamic Context Pruning config:
- Modes: `range` compression, `allow` permission
- Limits: 50k-100k tokens (soft bounds)
- Auto-prunes: duplicate tools, errored tool inputs after 4 turns

### `matrixx.jsonc`
- Profile: `balanced`
- Default agent: `morpheus` → uses `claude-sonnet-4-6`

## Shell Strategy (CRITICAL)

**Your shell is non-interactive.** Every command must use non-interactive flags:

### Mandatory Patterns
- `npm init -y` (not `npm init`)
- `apt-get install -y pkg` (not `apt-get install pkg`)
- `git commit -m "msg"` (not `git commit`)
- `rm -f file` (not `rm file`)
- `unzip -o file.zip` (not `unzip file.zip`)

### Banned Commands (Will Hang)
- **Editors**: `vim`, `nano`, `vi`, `emacs`
- **Pagers**: `less`, `more`, `man`
- **Interactive Git**: `git add -p`, `git rebase -i`
- **REPLs**: `python`, `node` (without `-c` or script)

### Environment Variables (Auto-Set)
```bash
CI=true
DEBIAN_FRONTEND=noninteractive
GIT_TERMINAL_PROMPT=0
PAGER=cat
npm_config_yes=true
```

## Plugin Behavior

### `opencode-notifications`
Desktop notifications for:
- Task completion (long operations ≥30s)
- Long-running tool warnings
- Session end
- Confirmation requests

**Test it**: `npm test` in `plugins/opencode-notifications/`

## Extension Points

### Custom Agents
Create `agents/<name>.jsonc` for new agent definitions.

### Custom Skills
Create `skills/<name>.md` for new skill definitions.

### Custom Tools
Create `tools/<name>/` with tool spec.

## Context Management

DCP (Dynamic Context Pruning) runs automatically:
- **Max context**: 100k tokens (nudge at 50k)
- **Auto-compress**: duplicate tools, errored inputs
- **Protects**: active tool outputs, file operations

Use `/dcp` commands for manual control if needed.

## Gotchas

1. **No `package.json` at root** - plugins are standalone packages
2. **Empty dirs are intentional** - `agents/`, `skills/`, `tools/` are for your extensions
3. **JSONC format** - `.jsonc` files allow comments (standard JSON doesn't)
4. **Ariadne provider** - uses custom OpenAI-compatible endpoint, not standard OpenAI

## Verification Commands

```bash
# Plugin structure
ls plugins/

# Check config syntax
node -e "JSON.parse(require('fs').readFileSync('opencode.jsonc','utf8').replace(/\/\/.*/g,''))"

# Test notification plugin
cd plugins/opencode-notifications && npm test
```
