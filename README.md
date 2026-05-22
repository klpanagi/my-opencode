<h1 align="center">⚡ my-opencode</h1>

<p align="center">
  <b>AI Agent Config · Matrixx Profiles · Plugins · DCP</b>
</p>

<p align="center">
  <a href="#-architecture"><img src="https://img.shields.io/badge/view-architecture-8A2BE2?style=flat-square" alt="Architecture"></a>
  <a href="#-matrixx-agent-profile"><img src="https://img.shields.io/badge/matrixx-v3-00E5FF?style=flat-square" alt="Matrixx"></a>
  <a href="#-plugins"><img src="https://img.shields.io/badge/plugins-4-22C55E?style=flat-square" alt="Plugins"></a>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/powered_by-OpenCode-FF6B35?style=flat-square" alt="OpenCode"></a>
</p>

<p align="center">
  <i>Your OpenCode AI agent command centre — one config to rule them all.</i>
</p>

---

## 📡 Overview

This repository holds the **central configuration** for your OpenCode AI agent environment. It wires together providers, agent profiles, plugins, and runtime settings — everything your AI coding partner needs to operate at peak performance.

```
~/.config/opencode/       ← symlinked from this repo
├── opencode.jsonc          Provider & plugin config
├── matrixx.jsonc           Agent profile definitions
├── dcp.jsonc               Dynamic Context Pruning
├── AGENTS.md               Agent instructions
├── install.sh              Bootstrap script
├── plugins/                Installed plugins
├── agents/                 Custom agents       ✨
├── skills/                 Custom skills       ✨
└── tools/                  Custom tools        ✨
```

> ✨ = extension directories ready for your additions

---

## 🏛️ Architecture

```
┌────────────────────────────────────────────────────┐
│                    OpenCode Runtime                  │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │              Ariadne Staging                 │  │
│  │  ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │  Qwen 3.5 35B-A3B │ │ Claude Haiku 4-5│  │  │
│  │  └────────────────────┘ └─────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │              Matrixx Agent Layer              │  │
│  │  morpheus · oracle · seraph · cipher · niobe │  │
│  │  sentinel · smith · merovingian · operator   │  │
│  │  trinity · construct · zion · mouse · keymaker│  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │                Plugin Layer                   │  │
│  │  DCP · Type Inject · EnvSitter · CCUsage     │  │
│  │  Braintrust · Shell Strategy · Notifications  │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 🧠 Matrixx Agent Profile

[Matrixx](https://github.com/klpanagi/matrixx) is the agent runtime & profile system that defines **who does what** in your AI dev team. The [`matrixx.jsonc`](./matrixx.jsonc) declares an agent fleet with tiered model assignment, role-specific thinking budgets, and runtime fallback strategy.

### Profiles

Matrixx ships with **5 built-in profiles** that bundle model assignments per agent. One line switches your entire stack:

| Profile | Key Models | Use Case |
|---------|-----------|----------|
| `free` | Kimi K2.5 Free, Grok, GLM, MiniMax | **Zero-cost** — current active |
| `budget` | Claude Sonnet 4.6, Haiku 4-5 | Low-cost, quality upgrade |
| `economy` | Claude Sonnet 4.6, Haiku 4-5 | Balanced cost / quality |
| `balanced` | Claude Opus 4.6, Sonnet 4.6, Haiku 4-5 | Production-grade |
| `performance` | Claude Opus 4.6, Sonnet 4.6, Haiku 4-5 | Maximum capability |

```jsonc
// matrixx.jsonc — switch in one line
{
  "$schema": "https://raw.githubusercontent.com/klpanagi/matrixx/dev/assets/matrixx.schema.json",
  "profile": "free"  // ← "budget" | "economy" | "balanced" | "performance"
}
```

Profiles use **model inheritance** — `matrixx.jsonc` only overrides temperature, thinking budget, and fallback chains. Swap profiles without touching agent definitions.

### Agent Fleet

The **`free` profile** assigns these models (full list from [`profiles.ts`](https://github.com/klpanagi/matrixx/blob/dev/src/config/profiles.ts)):

| Agent | Model | Thinking |
|-------|-------|----------|
| **Morpheus** | Kimi K2.5 Free | 32k |
| **Oracle** | Kimi K2.5 Free | 32k |
| **Seraph** | Kimi K2.5 Free | 32k |
| **Keymaker** | Kimi K2.5 Free | 16k |
| **Sentinel** | Kimi K2.5 Free | 32k |
| **Cipher** | Kimi K2.5 Free | — |
| **Niobe** | Kimi K2.5 Free | — |
| **Smith** | Kimi K2.5 Free | 16k |
| **Merovingian** | Kimi K2.5 Free | — |
| **Architect** | Kimi K2.5 Free | — |
| **Construct** | Kimi K2.5 Free | — |
| **Operator** | GLM 4.7 (`zai-coding-plan`) | — |
| **Trinity** | Grok Code Fast (`xai/grok-code-fast-1`) | — |
| **Mouse** | MiniMax M2.5 Free | 16k |
| **Zion** | MiniMax M2.5 Free | — |
| **Built-in** (`build`, `plan`) | Kimi K2.5 Free | — |

### Usage

Matrixx profiles are wired into OpenCode via the `matrixx.jsonc` config. At runtime, they work through two mechanisms:

**Default agent** — The `morpheus` agent is your primary orchestrator. When you chat with OpenCode, Morpheus reads your request, classifies the work, and delegates to the right specialist agent (Oracle for architecture, Cipher for DSLs, Sentinel for security, etc.).

**Explicit delegation** — You (or Morpheus) can invoke any agent directly via the `task()` API:

```
task(agent="oracle", prompt="Architecture review of the auth flow...")
task(agent="sentinel", prompt="SAST scan this codebase...")
task(category="broadcast", prompt="Write the release notes...")
```

**Runtime fallback** — If an agent's assigned model fails (rate limit, downtime), the fallback chain kicks in automatically:

| Setting | Value |
|---------|-------|
| Max retries | 3 |
| Cooldown | 30s |
| Triggers | 429, 500, 502, 503, 504 |
| Notification | Desktop alert on fallback |

**Switching profiles** — Change `"profile"` in `matrixx.jsonc` and restart OpenCode. All agents inherit their new models automatically — no per-agent edits needed.

---

## 🎛️ Dynamic Context Pruning

[`dcp.jsonc`](./dcp.jsonc) keeps your context window razor-sharp:

| Setting | Value |
|---------|-------|
| **Mode** | `range` |
| **Permission** | `allow` |
| **Max context** | 100k tokens |
| **Min context** | 50k tokens |
| **Nudge** | Every 5th fetch |
| **Force** | Soft |
| **Strategies** | Dedup + Error purge (4 turns) |

- **Range compression** — crystallises closed sections into dense summaries
- **Auto-dedup** — strips duplicate tool calls automatically
- **Error purge** — prunes errored tool inputs after 4 turns
- **No manual babysitting** — `/dcp` commands available if needed

---

## 🔌 Plugins

| Plugin | Purpose |
|--------|---------|
| **[DCP](./dcp.jsonc)** | Dynamic Context Pruning — automatic context management |
| **Type Inject** | Injects type information into agent context |
| **EnvSitter Guard** | `.env` key/value validation without exposing secrets |
| **CCUsage** | Context credit usage tracking |
| **Braintrust** | Trace & observability |
| **[Shell Strategy](./plugins/opencode-shell-strategy/shell_strategy.md)** | Non-interactive shell survival guide |
| **[Notifications](./plugins/opencode-notifications/)** | Desktop alerts on agent events |

### Shell Strategy (Critical)

Your shell is **non-interactive**. Always use non-interactive flags:

```bash
npm init -y              # not npm init
apt-get install -y pkg   # not apt-get install pkg
git commit -m "msg"      # not git commit
```

> **Banned**: `vim`, `nano`, `less`, `more`, `man`, `git rebase -i`, `python`/`node` REPLs

| Env Var | Value |
|---------|-------|
| `CI` | `true` |
| `DEBIAN_FRONTEND` | `noninteractive` |
| `GIT_TERMINAL_PROMPT` | `0` |
| `PAGER` | `cat` |
| `npm_config_yes` | `true` |

---

## 🚀 Installation

```bash
git clone <this-repo> ~/.myopencode
cd ~/.myopencode
./install.sh
```

The script:
1. Installs OpenCode if missing
2. Symlinks config into `~/.config/opencode/`
3. Installs npm plugin dependencies

Verify:

```bash
ls -la ~/.config/opencode/   # should all symlink to ~/.myopencode/
```

---

## 🧪 Verification Commands

```bash
# Plugin structure
ls plugins/

# Config syntax check
node -e "JSON.parse(require('fs').readFileSync('opencode.jsonc','utf8').replace(/\/\/.*/g,''))"

# Test notifications
cd plugins/opencode-notifications && npm test
```

---

## 🧩 Extension Points

```
agents/     →  Custom agent definitions  (agents/<name>.jsonc)
skills/     →  Custom skill instructions (skills/<name>.md)
tools/      →  Custom tool specs         (tools/<name>/)
```

Drop in a file and it's automatically picked up — no registry edits needed.

---

## 🧠 Gotchas

| # | Gotcha |
|---|--------|
| 1 | **No `package.json` at root** — plugins are standalone packages |
| 2 | **Empty dirs are intentional** — `agents/`, `skills/`, `tools/` ready for you |
| 3 | **JSONC format** — `.jsonc` allows comments (standard JSON doesn't) |
| 4 | **Ariadne provider** — custom OpenAI-compatible endpoint, not standard OpenAI |

---

<p align="center">
  <sub>Built with</sub><br>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/OpenCode-FF6B35?style=for-the-badge" alt="OpenCode"></a>
  <a href="https://github.com/klpanagi/matrixx"><img src="https://img.shields.io/badge/Matrixx-00E5FF?style=for-the-badge" alt="Matrixx"></a>
</p>