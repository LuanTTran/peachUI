# @peachy/border-beam (deprecated)

The border-beam effect now lives in **`@peachui/react`**:

```tsx
import { BorderBeam } from "@peachui/react/components";
// or
import { BorderBeam } from "@peachui/react/components/border-beam";
```

This directory keeps the older import path working. In this repo it holds the actual implementation (`border-beam.tsx`), re-exported through `index.ts`.

**If you're copying a PeachUI component that lists `border-beam` in its deps** (Prompt bar, Agent composer): copy this directory too and keep the `@/components/border-beam` import resolvable, or swap the import to `@peachui/react`.
