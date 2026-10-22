# packages/templates/

Tier 4. Whole product screens: reference implementations that show how atoms, primitives, and blocks fit into a real app shell.

Each directory is a self-contained screen mounted by a route in `app/(templates)/`:

- **`coding-agent/`** — coding agent IDE, mounted at `/coding-agent`
- **`agent-ops/`** — agent ops console, mounted at `/agent-ops`
- **`command-center/`** — command dashboard, mounted at `/command-center`
- **`peach-mail/`** — AI inbox triage, mounted at `/inbox-triage`
- **`_shared/`** — pieces shared between templates

Templates aren't registry entries and aren't meant to be pasted file-by-file. Read them as worked examples: pull the screen you need, then lift the individual components from `components/` instead.

Template metadata for the routes lives in [`lib/templates.ts`](../../lib/templates.ts).
