# Daymark Implementation Plan

Status: App and deployment implementation verified; candidate-owned reflection remains  
Approach: bottom-up, dependency-first, with automated tests after every build slice  
Source of truth: `REQUIREMENTS.md`; visual source of truth: `design-theme/design-theme.md`

## Delivery rules

- Work through phases in order. Do not begin a dependent feature while its foundation is failing.
- Every phase ends with its listed tests. A phase is complete only when those tests pass.
- Add regression tests with every bug fix.
- Keep each anonymous browser's tasks isolated through a validated `X-Client-ID`; never accept `ownerId` from a request body.
- Treat the anonymous identifier as list partitioning, not authentication.
- If the two-hour timebox slips, cut should-ship polish before cutting required behavior or tests.
- Update `README.md` and `reflection.md` only with behavior and checks that actually exist.

## Planned technical shape

- Root npm workspace coordinating `client/` and `server/`.
- React and Vite client.
- Express and Mongoose server.
- MongoDB persistence.
- Vitest for unit tests.
- React Testing Library and `user-event` for client behavior tests.
- Supertest with an isolated MongoDB test database for API integration tests.
- Shared JSON error shape: `{ "error": { "code": string, "message": string, "fields"?: object } }`.

The minimal API surface is expected to be:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Runtime health check |
| `GET` | `/api/tasks` | List the current anonymous client's tasks |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Edit fields, complete, or reopen a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

The detailed request and response contract will be finalized before Phase 3 without expanding this surface unnecessarily.

## Chronological implementation phases

### Phase 0 — Confirm design tokens and scaffold the workspace

Features and setup:

- Approve or revise the values in `design-theme/design-theme.html`.
- Create root, client, and server package manifests.
- Configure development, lint, test, and production-build scripts.
- Add environment validation for `PORT`, `MONGODB_URI`, and `CLIENT_ORIGIN`.
- Configure Vite proxy/CORS behavior and shared development commands.
- Add a minimal Express app and `/api/health` endpoint.

Tests and checks:

- Server starts with valid test configuration.
- Missing required environment configuration produces a useful failure.
- `GET /api/health` returns `200` and the expected JSON shape.
- Lint and empty test suites run successfully in both workspaces.
- Client production shell builds successfully.

Gate: repository commands work from a clean install and no credential is committed.

### Phase 1 — Build the task domain model

Features:

- Create the Mongoose task schema.
- Add `ownerId`, title, note, priority, due date, completion fields, and timestamps.
- Index `ownerId` and the fields needed by default ordering.
- Centralize trimming, length limits, enum validation, and allowed update fields.
- Define task serialization so internal Mongoose fields are not leaked.

Unit tests:

- Accepts a minimal valid task and applies defaults.
- Trims title and note.
- Rejects missing, empty, or longer-than-120-character titles.
- Rejects notes longer than 500 characters.
- Rejects unknown priority values and invalid dates.
- Requires a valid anonymous owner UUID.
- Completion sets `completedAt`; reopening clears it.
- Serialized output exposes `id` rather than `_id` and excludes internal fields.

Gate: domain tests pass without an HTTP server or UI.

### Phase 2 — Add anonymous client isolation middleware

Features:

- Read `X-Client-ID` from every task request.
- Validate it as a UUID and attach it to the request context.
- Reject missing or malformed identifiers consistently.
- Provide centralized not-found and error handling.

Unit and integration tests:

- A valid UUID reaches the route as the normalized owner identifier.
- Missing and malformed headers return `400` with the documented error shape.
- Unexpected server errors use the safe error response and do not expose stack traces.
- CORS accepts the configured client origin and required header.

Gate: no task route can execute without validated anonymous context.

### Phase 3 — Implement task reading and creation

Features:

- Implement `GET /api/tasks` with owner scoping and default ordering.
- Implement `POST /api/tasks` with server-side validation.
- Return predictable success and error shapes.
- Confirm persistence by reading newly created data back from MongoDB.

API integration tests:

- Empty owner list returns `200` with an empty array.
- Valid creation returns `201` with defaults and timestamps.
- Invalid title, note, priority, and date payloads return `400`.
- Unknown or server-owned fields are ignored or rejected according to the final contract.
- Tasks are ordered incomplete first, nearest due date next, then newest first.
- Client A cannot read Client B's tasks.
- A created task remains available in a later request.

Gate: create and list behavior is complete and isolated before client work starts.

### Phase 4 — Implement editing, completion, and reopening

Features:

- Implement `PATCH /api/tasks/:id` with an explicit allowlist.
- Support title, note, priority, and due-date edits.
- Support `completed: true` and `completed: false` transitions.
- Ensure the update query includes both task ID and anonymous owner ID.

API integration tests:

- Each editable field can be changed independently and together.
- Invalid patches return `400` without partially modifying the task.
- Completion sets `completedAt`; reopening clears it.
- Unknown task IDs return `404`.
- Malformed MongoDB IDs return the documented client error rather than `500`.
- Client A receives `404` when attempting to update Client B's task.
- Timestamps change only after a successful update.

Gate: all update transitions and cross-client isolation tests pass.

### Phase 5 — Implement deletion

Features:

- Implement `DELETE /api/tasks/:id`.
- Scope deletion by task ID and anonymous owner ID.
- Choose and document one stable success response.

API integration tests:

- Owner can delete an existing task.
- Deleted task is absent from the next list request.
- Unknown and malformed IDs produce the documented response.
- Client A cannot delete Client B's task.
- Repeated deletion is handled consistently.

Gate: the complete server CRUD suite passes in an isolated database.

### Phase 6 — Build the client foundation and anonymous identity

Features:

- Implement a small anonymous-client service using `crypto.randomUUID()`.
- Persist the identifier in local storage and reuse it on later visits.
- Build one API client that adds `X-Client-ID` to every request.
- Normalize success and error handling in one place.
- Import Daymark tokens and establish the responsive application shell.

Client unit tests:

- Generates and stores an ID when none exists.
- Reuses an existing valid ID.
- Replaces malformed stored data safely.
- Adds the same ID to every API request.
- Parses documented API errors and handles invalid/non-JSON responses.
- Does not render or request name, email, password, or login fields.

Gate: the UI can call the API consistently without implementing task screens yet.

### Phase 7 — Render the persisted task list

Features:

- Fetch tasks when the app loads.
- Render task title, note, due state, priority, and completion state.
- Add loading, empty, API-error, and retry states.
- Display active/completed counts and percentage progress.

Client integration tests:

- Shows the loading state while the request is pending.
- Renders server tasks and their metadata.
- Shows the purposeful empty state for an empty list.
- Shows a recoverable error and retry action after failure.
- Retry performs a new request and restores content on success.
- Progress count and percentage match the returned tasks.

Gate: persisted server data is understandable before mutations are added.

### Phase 8 — Add task creation UI

Features:

- Implement always-visible quick add with title required.
- Progressively reveal note, due date, and priority.
- Submit with Enter when valid and retain explicit Create/Cancel actions.
- Disable duplicate submission and add the returned task without refresh.

Client integration tests:

- Empty and whitespace-only titles are blocked with an inline message.
- Valid quick add sends the normalized payload and renders the response.
- Optional fields are included when set.
- Enter submits once; repeated clicks while pending do not duplicate.
- Server validation errors map to the relevant fields.
- A failed request preserves entered data for correction or retry.
- Cancel closes optional fields without creating a task.

Gate: a reviewer can create a persisted task from the main view.

### Phase 9 — Add complete and reopen behavior

Features:

- Toggle completion directly from each task row.
- Update the task's visual treatment, ordering, counts, and percentage.
- Prevent repeated toggles while the mutation is pending.
- Recover gracefully when the API rejects the mutation.

Client integration tests:

- Completing sends `completed: true` and updates the returned task.
- Reopening sends `completed: false`.
- Progress and active counts recalculate after both transitions.
- Pending controls are disabled or announced.
- Failure restores the confirmed server state and displays feedback.

Gate: completion works end-to-end and does not leave inconsistent progress.

### Phase 10 — Add task editing

Features:

- Open the desktop side panel or mobile bottom sheet.
- Pre-fill every editable field.
- Save valid changes or cancel without mutation.
- Keep the selected task visually anchored behind the editor.

Client integration tests:

- Editor opens with current task values.
- Save sends changed fields and updates the correct task.
- Cancel closes the editor without sending a request.
- Client and server validation errors remain visible and editable.
- Repeated save is prevented while pending.
- Closing and reopening reflects the last confirmed server state.

Gate: every task field can be edited without a page refresh.

### Phase 11 — Add deletion confirmation

Features:

- Open a compact confirmation dialog that names the task.
- Support Keep Task and Delete Task actions.
- Disable repeat deletion and remove only after confirmed success.
- Move focus into the dialog and return it to a sensible control on close.

Client integration tests:

- Delete action opens the dialog with the correct title.
- Keep Task closes without an API call.
- Confirm calls the correct endpoint once and removes the task.
- Failure leaves the task available and shows actionable feedback.
- Escape/close and keyboard focus behavior work as specified.

Gate: destructive behavior is deliberate, accessible, and persisted.

### Phase 12 — Add organization features

Features:

- Add `All`, `Active`, and `Completed` filters.
- Add case-insensitive search across title and note.
- Preserve the documented default ordering.
- Add overdue and due-today labels if the core remains stable.

Unit and integration tests:

- Every status filter shows the correct subset.
- Search matches title and note regardless of case.
- Search and status filters compose correctly.
- A no-results state differs from a genuinely empty list.
- Ordering stays correct after create, edit, complete, and reopen.
- Date labels are tested against a fixed clock and local date boundary.

Gate: users can reliably find tasks without changing persisted data.

### Phase 13 — Apply responsive, accessible polish

Features:

- Apply the approved Daymark theme and logo assets.
- Match approved desktop and mobile wireframes.
- Add useful toasts, focus treatment, reduced-motion behavior, and subtle state transitions.
- Verify visible row actions on touch layouts and eliminate layout shifts.

Automated and manual checks:

- Semantic queries can operate every core control by keyboard.
- Icon-only buttons have accessible names.
- Dialog/editor focus behavior and error announcements are correct.
- Reduced-motion preference disables nonessential movement.
- No horizontal overflow at 360 px.
- Layout and typography remain readable at 1440 px.
- Default text and control colors meet WCAG AA contrast.

Gate: visual polish does not weaken accessibility or test stability.

### Phase 14 — Full-system verification and submission packaging

Features and documentation:

- Run the complete client and server test suites.
- Run lint and production builds.
- Perform a real browser CRUD smoke test against MongoDB.
- Package the Express API as a Netlify Function and verify the Netlify production build.
- Verify two browser profiles receive different isolated lists.
- Finalize README setup, environment, run, test, and build instructions.
- Capture desktop and mobile screenshots.
- Candidate finalizes the four-question reflection within 500 words.
- Check `prompt.md`, source files, screenshots, and environment example.

Final test matrix:

- Clean install and startup using only documented steps.
- Create → refresh → edit → complete → reopen → delete journey.
- Empty, loading, validation, network failure, not-found, and retry states.
- Cross-client list/read/update/delete isolation.
- Keyboard-only journey for all required actions.
- Desktop and mobile visual checks.
- No real keys or connection strings tracked in the submission.
- Netlify rewrite, function bundle, and environment-variable setup verified.

Gate: every acceptance criterion in `REQUIREMENTS.md` has passing automated evidence or a documented manual check.

## Planned command gate

The exact scripts will be finalized in Phase 0. The root should ultimately provide:

```text
pnpm dev          Start client and server
pnpm lint         Lint both workspaces
pnpm test         Run client and server tests
pnpm build        Produce the production client build
```

Optional end-to-end tooling may add `npm run test:e2e`, but it must not replace the lower-level integration tests.

## Timebox guardrail

| Work | Target |
| --- | ---: |
| Workspace, contracts, model, and anonymous context | 20 min |
| CRUD API with integration tests | 30 min |
| React task flows with component tests | 40 min |
| Organization, accessibility, and responsive polish | 20 min |
| Full verification, documentation, and screenshots | 10 min |

Total target: 120 minutes. If needed, remove toasts, date labels, and motion in that order. Do not remove CRUD, persistence, anonymous list isolation, validation, accessibility, or their tests.
