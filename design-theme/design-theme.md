# Daymark Design Theme

Status: Review candidate  
Applies to: the ShopBack take-home to-do application  
Source of truth: this document plus `tokens.css`; approved changes must be reflected in both.

## Brand idea

**Daymark** is a calm daily marker: a clear place to decide what matters and acknowledge progress. The D-shaped mark combines the initial with a check. It should feel purposeful rather than playful, and polished rather than decorative.

Logo assets:

- `logo-mark.svg` — compact app mark, favicon, and small navigation use.
- `logo-lockup.svg` — full horizontal identity for headers and documentation.

Keep clear space around the mark equal to one quarter of its width. Do not rotate it, add gradients, place it on visually noisy imagery, alter the check independently, or use the coral mark on a low-contrast background.

## Design principles

1. **Quiet focus:** one primary list and one obvious next action.
2. **Progressive detail:** title-first quick add; notes, date, and priority appear only when useful.
3. **Visible confidence:** loading, empty, success, error, and destructive states are explicit.
4. **Human restraint:** no glass effects, decorative gradients, emoji navigation, or unnecessary cards.
5. **Accessible by default:** keyboard focus, semantic controls, 44 px mobile targets, and meaning that never relies on color alone.

## Color tokens

| Token | Default | Use |
| --- | --- | --- |
| `--dm-accent` | `#D43A42` | Primary actions, active progress, check state, focus |
| `--dm-accent-hover` | `#B92E37` | Primary hover/pressed state |
| `--dm-accent-soft` | `#FFE8E8` | Low-emphasis accent surface |
| `--dm-on-accent` | `#FFFFFF` | Content placed on the accent |
| `--dm-canvas` | `#F4F2EE` | Page background |
| `--dm-surface` | `#FFFEFD` | Task list and form surfaces |
| `--dm-surface-raised` | `#FFFFFF` | Dialogs, editor, floating controls |
| `--dm-ink` | `#242320` | Primary copy and icons |
| `--dm-muted` | `#74716A` | Supporting copy and metadata |
| `--dm-border` | `#E1DED7` | Dividers and quiet boundaries |
| `--dm-soft` | `#EFEDE8` | Segmented controls and passive fills |
| `--dm-success` | `#2F7A55` | Positive feedback |
| `--dm-danger` | `#BD3E44` | Delete, errors, overdue state |
| `--dm-warning` | `#9A6400` | Cautionary status |

Use the interactive `design-theme.html` to preview replacements. Any accepted color must preserve WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text or meaningful UI boundaries. Color must be paired with an icon, label, or shape for status.

## Typography

- Family: Inter, falling back to Segoe UI, Roboto, Helvetica, and Arial.
- Display: 46/48, weight 600, letter spacing `-0.04em`.
- Page title: 32/36, weight 600.
- Section title: 20/28, weight 600.
- Body: 15/22, weight 400.
- Supporting text: 13/18, weight 400.
- Label: 12/16, weight 600, optional uppercase with `0.08em` tracking.
- Use weights 400, 500, and 600 only.

## Spacing, shape, and elevation

- Base spacing unit: 4 px. Prefer 8, 12, 16, 24, 32, 48, and 64 px.
- Radius: 10 px controls, 14 px task rows, 18 px major surfaces.
- Use divider rows by default. Reserve cards for bounded forms, dialogs, and empty states.
- Shadows must be soft and functional. Use them only to establish overlays or raised input surfaces.
- Keep the primary content column at approximately 760 px on desktop.

## Component rules

- **Primary button:** coral fill, white label, one per action group.
- **Secondary button:** transparent or neutral fill with an explicit label.
- **Danger button:** danger fill only in the final confirmation step.
- **Task completion:** circular control, coral checked state, text strike-through plus reduced emphasis.
- **Priority:** text and directional icon as well as color.
- **Edit:** right-side panel on desktop; bottom sheet on mobile.
- **Delete:** compact confirmation dialog naming the task.
- **Focus:** 2 px accent outline with 2 px offset; never remove browser focus without an equivalent.

## Responsive behavior

- Desktop: centered 760 px work area with side-panel editing.
- Mobile: 16 px page gutters, persistent visible row actions, and bottom-sheet editing.
- Reflow toolbars rather than horizontally scrolling them.
- Minimum supported width: 360 px. Verify desktop at 1440 px.

## Motion

- Use 160–220 ms ease-out transitions for state changes.
- Animate completion, insertion, and overlay movement only when it clarifies cause and effect.
- No looping or decorative motion. Respect `prefers-reduced-motion`.

## Copy voice

Use short, direct, reassuring language. Prefer “Add task,” “Save changes,” and “Keep task.” Errors should explain what happened and what the user can do next. Avoid jokes in destructive or failure states.

## Implementation contract

- Import or translate `tokens.css` before writing component styles.
- Do not introduce one-off colors when a semantic token exists.
- Use Lucide icons consistently at 16–18 px; do not mix icon families.
- Treat this theme as the UI source of truth and record approved token changes here and in `tokens.css`.
- Dark mode is a future extension, not part of the initial build.
