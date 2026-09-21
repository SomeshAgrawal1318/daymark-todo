# ShopBack Take-Home — To-Do App Requirements

Status: Implemented and verified  
Scope target: a polished, testable MVP implementable in about two focused hours  
Stack: MongoDB, Express, React, Node.js

## 1. Product goal

Build a login-free personal task manager that feels fast, calm, and intentional. A reviewer should be able to create, update, complete, reopen, and delete tasks without instructions, then refresh the page and see the same data. Different browser clients must receive separate task lists without creating accounts.

The submission should favor a small, complete experience over a wide but shallow feature set.

## 2. Research summary

The MVP borrows proven, low-complexity patterns from established task tools:

- Todoist emphasizes rapid capture, task metadata, priority, filtering, and focused Today/Upcoming views: https://www.todoist.com/help/todoist/get-started/todoist-glossary-cA60laWMH
- Microsoft To Do groups the essential task actions with due dates, importance, notes, and lightweight organization: https://support.microsoft.com/en-us/todo/managing-tasks-in-microsoft-to-do
- Things separates the focused current list from future work and uses restrained visual hierarchy: https://culturedcode.com/things/support/articles/2803579/

The selected scope keeps the interaction value of those products while avoiding accounts, collaboration, notifications, and scheduling engines that would consume the implementation and testing budget.

## 3. Target user and primary journey

The target user is one person managing a short daily list on desktop or mobile. The deployment may serve several people at once, but each uses an anonymous browser-scoped list with no login flow.

Primary journey:

1. Open the app and immediately see active tasks and progress.
2. Add a task from the main view with only a title required.
3. Optionally add a note, due date, and priority.
4. Complete, reopen, edit, or delete a task inline or from a focused edit surface.
5. Find tasks with status filters and text search.
6. Refresh the browser and retain all task data.

## 4. Feature scope

### Must ship

1. Task creation
   - Title is required and trimmed.
   - Optional note, due date, and priority (`low`, `medium`, `high`).
   - Enter submits the quick-add form when valid.
   - Newly created tasks appear without a manual refresh.

2. Task editing
   - Users can change every editable field.
   - Save and cancel are explicit.
   - Validation errors appear beside the relevant field.

3. Task deletion
   - Destructive intent is clear and requires confirmation.
   - The app prevents accidental double submission.

4. Completion
   - A task can be completed and reopened.
   - Completed tasks have a distinct but readable treatment.
   - Progress shows completed tasks as a count and percentage.

5. Persistence
   - Tasks are persisted in MongoDB through an Express API.
   - A page refresh restores server data.
   - Loading, empty, and recoverable error states are visible.

6. Anonymous list isolation
   - On first use, the client creates a random UUID and stores it in local storage.
   - Every API request sends the UUID through the `X-Client-ID` header.
   - The server validates the identifier and scopes every query and mutation to it.
   - No name, email, password, or login screen is required.
   - The identifier partitions take-home data but is not represented as authentication or a security boundary.

7. Organization
   - Status filters: `All`, `Active`, `Completed`.
   - Case-insensitive text search across task titles and notes.
   - Default ordering: incomplete before complete, then nearest due date, then newest creation time.

8. Responsive, accessible UI
   - Fully usable at 360 px width and common desktop widths.
   - Keyboard-visible focus, semantic controls, labelled icon buttons, and sufficient contrast.
   - Respect `prefers-reduced-motion`.

### Should ship if the core is stable

- Overdue and due-today labels.
- Compact priority indicator with a non-color cue.
- Toast feedback for successful mutations and recoverable failures.
- A purposeful empty state with a single add-task action.
- Subtle entry/completion motion that does not block input.

### Explicitly out of scope for this take-home

- Accounts, login, authenticated identity, or cross-device identity recovery.
- Shared lists, assignment, comments, or real-time collaboration.
- Recurring tasks, reminders, push notifications, or calendar sync.
- Subtasks, projects, tags, drag-and-drop, or custom ordering.
- Natural-language date parsing or generative AI features.
- File attachments and offline synchronization.
- Dark mode unless all required behavior and tests are complete.

## 5. Interaction and visual requirements

- Use one primary list view rather than a dashboard of unrelated cards.
- Keep task creation continuously available near the list.
- Use generous whitespace, clear typography, one restrained accent color, and subtle borders/elevation.
- Avoid decorative gradients, glass effects, excessive pills, emoji-heavy labels, and animation without functional purpose.
- On mobile, preserve the same actions without hover-only controls.
- Editing must not cause layout jumps that hide the task being edited.
- Deleting uses a compact confirmation dialog; completion remains one click.
- Follow the approved tokens and component rules in `design-theme/design-theme.md`.

The Daymark layout and edit interaction are approved. Color and brand-token changes remain reviewable in `design-theme/design-theme.html` before implementation.

## 6. Task data requirements

Each task contains:

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Server-generated MongoDB identifier |
| `ownerId` | UUID string | Anonymous browser identifier; required and indexed |
| `title` | string | Required, trimmed, 1–120 characters |
| `note` | string | Optional, trimmed, maximum 500 characters |
| `priority` | enum | `low`, `medium`, or `high`; default `medium` |
| `dueDate` | date/null | Optional calendar date |
| `completed` | boolean | Default `false` |
| `completedAt` | datetime/null | Set on completion; cleared on reopen |
| `createdAt` | datetime | Server-generated |
| `updatedAt` | datetime | Server-generated |

## 7. Acceptance criteria

- A valid task can be added, displayed, edited, completed, reopened, and deleted.
- Invalid titles are rejected by both client and server.
- Refreshing after any successful mutation shows the same server state.
- Two distinct anonymous client IDs receive isolated task lists, and one cannot mutate a task owned by the other through ordinary API requests.
- Filters, search, ordering, and progress reflect the current task collection.
- API failures do not silently discard user intent or leave controls permanently disabled.
- The UI has no horizontal overflow at 360 px and remains readable at 1440 px.
- Core controls are reachable and operable by keyboard.
- Automated tests cover server CRUD/validation and the main client interactions.
- A production build succeeds with no committed secrets.

## 8. Quality and test requirements

- Server unit/integration tests: model or validation rules, CRUD success paths, missing records, invalid payloads, completion transitions, missing/invalid client IDs, and cross-client isolation.
- Client unit/integration tests: add, edit, delete confirmation, complete/reopen, filters/search, loading, empty, and error states.
- Use deterministic test data and isolate the test database.
- Keep API and UI behavior aligned through one documented response/error shape.
- Run lint, tests, and production build before each milestone is considered complete.

## 9. Two-hour implementation budget

| Workstream | Target |
| --- | ---: |
| Server foundation, model, CRUD | 30 min |
| Core React list and mutations | 40 min |
| Filters, search, progress, responsive polish | 20 min |
| Unit and integration tests | 20 min |
| README, screenshots, final verification | 10 min |

If time slips, remove should-ship polish before weakening CRUD, persistence, accessibility, or tests.

## 10. Submission deliverables

- Complete source code.
- `README.md` with prerequisites, environment setup, run, test, and build instructions.
- `prompt.md` containing the originating development prompt.
- UI screenshots in `screenshots/` for desktop and mobile.
- `reflection.md`, no more than 500 words, accurately explaining AI use, human decisions, verification, and limitations.

## 11. Security and configuration

- Do not commit API keys, database credentials, or connection strings.
- Commit only `.env.example` with placeholder values.
- Load configuration from environment variables and fail with a useful message when required values are missing.
- Restrict any hosted database credential by user, network, and least privilege where the provider supports it.
- Validate `X-Client-ID` as a UUID and include `ownerId` in every database query filter, including update and delete operations.
- Anonymous client IDs prevent accidental list sharing but do not provide authentication; document this limitation without overstating privacy.
