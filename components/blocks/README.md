# components/blocks/

Tier 3. Full-featured sections: compositions of atoms and primitives that carry real product weight. Some blocks span a folder (e.g. `sidebar/`, `settings/`); most are a single file.

Copy a file plus the shared bits described in [components/README.md](../README.md#the-copy-contract). Blocks pull in more shared code than atoms; check the imports carefully and expect atoms, `components/lib`, `components/types`, and `components/data` in the tree.

## Index

- **Agent:** Agent thinking, Prompt deck, Agent chat, Plan & write, Context library, Tool approval, Answer comparison, Review queue, Workflow runbook, Agent run
- **Dashboard:** Breakdown card, Live line, Billing & usage, Model router, Kanban board, Sales pipeline, Morning brief
- **Navigation:** Sidebar, App shell, Dashboard
- **Forms:** Auth card, Calendar, Dropzone, Stepper form
- **Settings:** Settings
- **Feedback:** Notification center, Deploy gate
- **Data display:** Inbox triage, Audit explorer

## Adding a block

1. `kebab-name.tsx` (or a folder for multi-part blocks), named exports.
2. Demo as `XxxDemo` in [`../catalog/block-demos.tsx`](../catalog/block-demos.tsx).
3. Registry entry via `block({ ... })` in [`lib/catalog/registry.tsx`](../../lib/catalog/registry.tsx). For folder blocks, pass `file` pointing at the entry file.

Blocks get extra scrutiny on motion and density. The quality bar is in [CONTRIBUTING.md](../../CONTRIBUTING.md#the-bar).
