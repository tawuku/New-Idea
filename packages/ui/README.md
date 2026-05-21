# @nexus/ui

Shared design-system components for Nexus Workspace.

## Principles (from RULES.md §1)

- **Calm by default** — no decorative animation, no bouncing icons.
- Two font weights only: `font-medium` (UI labels) and `font-semibold` (headings).
- Sentence case everywhere. Never ALL CAPS in labels.
- Motion: `duration-[120ms]` for micro-interactions, nothing longer.

## Components

| Component | Purpose |
|---|---|
| `Button` | Primary, secondary, ghost, danger variants + loading state |
| `Input` | Text input with label and inline error |
| `Badge` | Status chips — default, success, warning, danger, info |

## Usage

```tsx
import { Button } from "@nexus/ui/button";
import { Input } from "@nexus/ui/input";
import { Badge } from "@nexus/ui/badge";
```

## Adding a component

1. Create `src/components/<name>.tsx`.
2. Export from `src/index.ts`.
3. Add the export path to `package.json#exports`.
4. Never ship Tailwind classes that aren't in the app's CSS bundle — use only tokens defined in `globals.css`.
