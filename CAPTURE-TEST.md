# Capture Test

## Setup

- **Tool:** Claude Code (CLI)
- **Model:** `claude-sonnet-5` (Sonnet 5) — this is the only model in play. There is no
  separate planner/executor split; the same model plans and executes in this session.
  A cheap `claude-haiku-4-5-20251001` call also showed up in one run's usage stats —
  that's Claude Code's internal micro-classifier for the `-p` headless CLI (e.g.
  generating the one-line command description), not a second reasoning model, and it
  does not touch the prompt/response content being captured.
- **Automatic mechanism:** Yes. Claude Code has a native hooks mechanism, configured in
  `.claude/settings.json`, that runs a shell command on specific lifecycle events. I
  wired two of them:
  - `UserPromptSubmit` — fires the moment a prompt is submitted, before Claude
    processes it. Payload on stdin includes `session_id`, `cwd`, `transcript_path`, and
    the prompt text.
  - `Stop` — fires when the assistant finishes responding (end of turn). Payload on
    stdin includes `session_id`, `cwd`, `transcript_path`, and `last_assistant_message`
    (the final response text for that turn, already isolated from tool calls and
    thinking blocks).

  Both hooks are declared once in `.claude/settings.json` at the project root, so they
  fire automatically for every session opened in this directory — nothing to
  re-register per session.

## Mechanism / config changed

- **Config file:** [.claude/settings.json](.claude/settings.json) — registers the
  `UserPromptSubmit` and `Stop` hooks, each running:
  `node "${CLAUDE_PROJECT_DIR}/.claude/hooks/capture.cjs" PROMPT|RESPONSE`
- **Script:** [.claude/hooks/capture.cjs](.claude/hooks/capture.cjs) — a small Node
  script (Node chosen over a bash/PowerShell script so the same command works
  unmodified on Windows and POSIX shells). It:
  1. Reads the hook's JSON payload from stdin.
  2. Finds or creates `.agent-logs/<UTC-timestamp>_<short-session-id>.md` for the
     current `session_id`.
  3. On `PROMPT`, appends a `LOG_ENTRY type=PROMPT` block with the verbatim prompt text
     and bumps `total_exchanges` in the frontmatter.
  4. On `RESPONSE`, appends a `LOG_ENTRY type=RESPONSE` block using
     `last_assistant_message` (falling back to scanning the transcript's last
     assistant text blocks if that field is ever empty).
  5. Rewrites the file's YAML frontmatter (`total_exchanges`, `last_prompt_time`,
     `model`) each time. Past entries are never edited — only appended to.

## Log file the canaries landed in

Two separate `.md` files, one per session (this is expected and correct — one file per
session per the spec):

- [.agent-logs/2026-09-07_14-29-04_4e7740ba.md](.agent-logs/2026-09-07_14-29-04_4e7740ba.md)
- [.agent-logs/2026-09-07_14-30-16_cfb778c2.md](.agent-logs/2026-09-07_14-30-16_cfb778c2.md)

Both were produced by running `claude -p "CAPTURE TEST — 8x assignment, Wasif Ali"`
from this project directory as two independent, freshly-started sessions (no shared
process, no manual re-registration between them) — proving the hook is picked up
automatically by any new session, not just the one that was open when it was
installed.

## Canary entries (pasted raw)

### Session 1 — `4e7740ba`

```
---
session_id: 4e7740ba-2e71-46a3-9b34-fa401701864b
date: 2026-09-07
author: wasif-ali
model: claude-sonnet-5
tool: claude-code
project: 8x Task
total_exchanges: 1
first_prompt_time: 2026-09-07T14:29:04.973Z
last_prompt_time: 2026-09-07T14:29:22.600Z
---

# Session Log - 2026-09-07

Session: `4e7740ba` | Project: `8x Task` | Author: `wasif-ali`

---

[LOG_ENTRY type=PROMPT num=1 session=4e7740ba]
timestamp: 2026-09-07T14:29:04.973Z
model: unknown

CAPTURE TEST — 8x assignment, Wasif Ali


[LOG_ENTRY type=RESPONSE num=1 session=4e7740ba]
timestamp: 2026-09-07T14:29:22.600Z
model: claude-sonnet-5

This confirms it — this project has a logging hook set up (`.claude/hooks/capture.cjs`) that captures every prompt and response into `.agent-logs/`, and it just successfully logged your message as the first entry in this session's log file. The capture system is working correctly.

There's no other content in this project yet (empty git repo, no assignment files). Is there something specific about the 8x assignment you'd like to start working on, or were you just verifying the capture hook fires?

---
```

### Session 2 — `cfb778c2`

```
---
session_id: cfb778c2-8348-40c7-917c-db70571adfb6
date: 2026-09-07
author: wasif-ali
model: claude-sonnet-5
tool: claude-code
project: 8x Task
total_exchanges: 1
first_prompt_time: 2026-09-07T14:30:16.092Z
last_prompt_time: 2026-09-07T14:30:27.375Z
---

# Session Log - 2026-09-07

Session: `cfb778c2` | Project: `8x Task` | Author: `wasif-ali`

---

[LOG_ENTRY type=PROMPT num=1 session=cfb778c2]
timestamp: 2026-09-07T14:30:16.092Z
model: unknown

CAPTURE TEST — 8x assignment, Wasif Ali


[LOG_ENTRY type=RESPONSE num=1 session=cfb778c2]
timestamp: 2026-09-07T14:30:27.375Z
model: claude-sonnet-5

The project directory is empty aside from `.agent-logs`, `.claude`, and `.git` — there's no actual assignment content yet. Your message just reads "CAPTURE TEST" with no task attached.

Could you clarify what you'd like me to do? For example:
- Is there an assignment spec/doc you want me to work from?
- Should I scaffold a new project here?
- Or is this just a connectivity/setup check?

---
```

## What I tried first that did not work

1. **Trusted a subagent's field-name guesses without cross-checking.** I first asked a
   research subagent to summarize Claude Code's hooks docs. It reported plausible-but-
   unverified field names (`user_prompt`, an invented `model` field on `Stop`). Rather
   than build the hook around those guesses, I cross-checked against the installed
   package and the live docs site directly (`code.claude.com/docs/en/hooks`), and found
   the docs page is long enough that automated fetches kept truncating before the
   per-event JSON examples. Given that uncertainty, I made `capture.cjs` defensive: it
   tries several plausible field names for the prompt text and falls back gracefully
   instead of assuming one exact key.
2. **Parsing the transcript JSONL for everything.** The hooks reference explicitly
   states the transcript file format is internal and can change between releases, so I
   dropped the idea of extracting the response text from it. `Stop`'s documented
   `last_assistant_message` field is more than sufficient. I still parse the transcript
   as a *fallback only*, and only for the model name, since no hook event exposes a
   `model` field directly.
3. **First manual dry-run of the script silently wrote nothing.** I hand-built a fake
   stdin payload with a `cwd` value written in git-bash/POSIX style
   (`/d/Visual Code/...`). `node.exe` is a native Windows binary and doesn't understand
   MSYS-style paths, so `path.join` produced a path under the current drive's root
   (`D:\d\Visual Code\...`) instead of the real project folder, and the script exited 0
   having written nothing anyone would notice. Fixed by using a real Windows-style path
   (`D:\\Visual Code\\...`) in the test payload — confirmed real Claude Code hook
   payloads use proper Windows paths since Claude Code itself is a native Windows
   process, so this was purely a test-harness bug, not a bug in the production path.
4. **`model` on the very first `PROMPT` entry of a session shows `unknown`.** No hook
   event exposes the active model at prompt-submit time — it's only knowable once a
   response comes back. I added a fallback chain (explicit field → env var →
   transcript's last assistant turn → this session's last-known model), so every
   `RESPONSE` entry and every `PROMPT` after the first one in a session resolves
   correctly; the very first `PROMPT` of a brand-new session will always show
   `unknown` until its matching `RESPONSE` lands. This is a documented limitation, not
   a bug — the frontmatter's `model` field always reflects the latest resolved value.
