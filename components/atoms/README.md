# components/atoms/

Tier 1. Single-purpose controls: the smallest copy-ready units in PeachUI. One file per component, named exports, no composition.

Copy a file plus the shared bits described in [components/README.md](../README.md#the-copy-contract).

## Index

- **Actions:** Button, Button group, Close button, Icon button, Link button, Social button
- **Forms:** Checkbox, Checkbox card, Date picker, File upload, Input, Input OTP, Meeting scheduler, Radio, Radio card, Select, Slider, Switch, Switch card, Textarea
- **Data display:** Avatar, Badge, Chip, Status dot, Table, Tree view
- **Navigation:** Breadcrumb, Pagination, Pill tabs, Segmented control, Tabs
- **Overlays:** Dropdown, Tooltip
- **Feedback:** Announcement, Notification, Stream text
- **Layout:** Divider

File names are kebab-case slugs (`date-picker.tsx` → "Date picker"). Some atoms share internals like `date-picker-shared.tsx` or `checkbox-glyph.tsx`; a file that lists them imports them the same way it imports `lib/utils`.

## Adding an atom

1. `kebab-name.tsx`, named exports, props as a `XxxProps` interface.
2. Demo as `XxxDemo` in [`../catalog/atom-demos.tsx`](../catalog/atom-demos.tsx).
3. Registry entry via `atom({ ... })` in [`lib/catalog/registry.tsx`](../../lib/catalog/registry.tsx).

The quality bar (tokens, a11y, copy) is in [CONTRIBUTING.md](../../CONTRIBUTING.md#the-bar).
