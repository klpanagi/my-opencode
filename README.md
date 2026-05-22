<h1 align="center">⚡ my-opencode</h1>

<p align="center">
  <b>AI Agent Config · Matrixx Profiles · Plugins · DCP</b>
</p>

<p align="center">
  <a href="#-architecture"><img src="https://img.shields.io/badge/view-architecture-8A2BE2?style=flat-square" alt="Architecture"></a>
  <a href="#-matrixx-agent-profile"><img src="https://img.shields.io/badge/matrixx-v3-00E5FF?style=flat-square" alt="Matrixx"></a>
  <a href="#-kimi-k25--vertex-ai"><img src="https://img.shields.io/badge/Kimi_K2.5-Vertex_AI-4285F4?style=flat-square" alt="Kimi Vertex"></a>
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
┌───────────────────────────────────────────────────────┐
│                     OpenCode Runtime                    │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌──────────────────────────┐   │
│  │  Ariadne Staging │   │  Kimi K2.5 (Vertex AI)  │   │
│  │  ┌────────────┐  │   │  ┌───────────────────┐  │   │
│  │  │ Qwen 3.5   │  │   │  │ Kimi-K2.5         │  │   │
│  │  │ 35B-A3B    │  │   │  │ 8× NVIDIA B200    │  │   │
│  │  ├────────────┤  │   │  │ 65536 ctx         │  │   │
│  │  │ Claude     │  │   │  └───────────────────┘  │   │
│  │  │ Haiku 4-5  │  │   │                         │   │
│  │  └────────────┘  │   │                         │   │
│  └─────────────────┘   └──────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │              Matrixx Agent Layer                │   │
│  │  morpheus · oracle · seraph · cipher · niobe   │   │
│  │  sentinel · smith · merovingian · operator      │   │
│  │  trinity · construct · zion · mouse · keymaker  │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │                  Plugin Layer                   │   │
│  │  DCP · Type Inject · EnvSitter · CCUsage       │   │
│  │  Braintrust · Shell Strategy · Notifications    │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

---

## 🧠 Matrixx Agent Profile

The [`matrixx.jsonc`](./matrixx.jsonc) defines a **free-profile** agent fleet with tiered model assignment:

| Tier | Model | Agents | Thinking |
|------|-------|--------|----------|
| 🔥 **Heavy Reasoning** | Kimi K2.5 Free | `morpheus`, `oracle`, `seraph`, `keymaker`, `sentinel` | 16–32k |
| 🧬 **DSL & Research** | Kimi K2.5 Free | `cipher`, `niobe` | — |
| ⚡ **Medium** | Gemini 3.1 Pro | `smith`, `merovingian` | 16k |
| 🪶 **Lightweight** | MiniMax / Grok / GLM | `architect`, `mouse`, `zion`, `operator`, `trinity`, `construct` | — |
| 🔧 **Built-in** | Kimi K2.5 Free | `build`, `plan` | — |

### Agent Roles

| Agent | Role | Thinking |
|-------|------|----------|
| **Morpheus** | Primary orchestrator — reads you, delegates everything | 32k |
| **Oracle** | Architecture, hard problems, read-only consultation | 32k |
| **Seraph** | Pre-planning — finds ambiguity before you do | 32k |
| **Keymaker** | Key decisions, critical path analysis | 16k |
| **Sentinel** | Security auditing — SAST, secrets, deps, OWASP | 32k |
| **Cipher** | DSL engineering — grammars, parsers, codegen | — |
| **Niobe** | Research lifecycle — EU proposals, papers, project mgmt | — |
| **Smith** | Plan review — catches gaps before implementation | 16k |
| **Merovingian** | Code review & debugging consultation | — |
| **Mouse** | Focused task executor | 16k |

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

## ⚡ Kimi K2.5 + Vertex AI

A dedicated Vertex AI endpoint running **Kimi K2.5** on 8× NVIDIA B200 GPUs (vLLM, 65536 tokens).

### Provider Config

```jsonc
{
  "provider": {
    "kimi-vertex": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Kimi K2.5 (Vertex)",
      "options": {
        "baseURL": "https://[vertex-endpoint-id-redacted].us-central1-558205681231.prediction.vertexai.goog/...",
      },
      "models": {
        "moonshotai/Kimi-K2.5": { "name": "Kimi K2.5" }
      }
    }
  }
}
```

### Quick Auth

```bash
gcloud auth print-access-token              # get token (expires 1h)
```

In OpenCode: `/connect` → select `kimi-vertex` → paste token. Repeat hourly.

### Endpoint Specs

| Field | Value |
|-------|-------|
| **Model** | `publishers/moonshotai/models/kimi-k2-5` |
| **Hardware** | `a4-highgpu-8g` · 8× NVIDIA B200 |
| **Region** | `us-central1` |
| **Context** | 65536 tokens |
| **Auth** | Google Cloud OAuth (hourly refresh) |

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
| 5 | **Vertex auth** — OAuth token expires hourly, set a cron/alias for refresh |

---

<p align="center">
  <sub>Built with</sub><br>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/OpenCode-FF6B35?style=for-the-badge" alt="OpenCode"></a>
  <a href="https://github.com/klpanagi/matrixx"><img src="https://img.shields.io/badge/Matrixx-00E5FF?style=for-the-badge" alt="Matrixx"></a>
</p>