# Wireframes — Review Candidate

Status: Layout approved; brand theme under review

## Proposed product direction

The wireframes use a calm, single-list layout with a warm neutral canvas and one coral accent. The interface avoids dashboard cards and keeps progress, quick-add, search, filters, and tasks in one clear reading order.

## Screens represented

1. Desktop and mobile task-list layouts.
2. Expanded quick-add with optional note, due date, and priority.
3. Task editing in a desktop side panel and mobile bottom sheet.
4. Compact delete-confirmation dialog.
5. Purposeful empty state.

## Interaction decisions for approval

- Product name: **Daymark**.
- Task rows use quiet dividers by default; a card-row alternative is available in the design controls.
- Editing uses a side panel on desktop and a bottom sheet on mobile so the list remains visually anchored.
- Add starts as a one-line quick action and progressively reveals optional metadata.
- Completion remains one click; deletion requires confirmation.
- Edit and delete actions remain visible on mobile rather than relying on hover.

The layout, divider-row direction, information density, desktop side panel, and mobile bottom sheet were accepted. Final colors and logo details remain reviewable in `design-theme/design-theme.html`.

No production UI code has been implemented from these wireframes yet.
