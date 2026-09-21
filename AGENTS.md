# Project instructions

Build a polished, login-free MERN to-do app for a time-boxed take-home. Multiple anonymous browser clients must be able to keep separate task lists. `REQUIREMENTS.md` is the product source of truth; do not expand scope silently.

## Repository map

- `client/`: React UI and client tests.
- `server/`: Express API, MongoDB model, and server tests.
- `netlify/functions/`: thin production adapter that runs the same Express app on Netlify.
- `netlify.toml`: production build, function bundling, rewrites, and response headers.
- `plan.md`: chronological implementation order and test gates.
- `docs/`: short-lived design and API planning artifacts.
- `design-theme/`: approved brand assets, design tokens, and the interactive theme review document.
- `screenshots/`: final desktop and mobile evidence.
- `.agents/skills/take-home-maintainer/`: project-specific delivery/reflection workflow.

## Working rules

- Read only the files relevant to the current task; use search before opening large files.
- Prefer small, reviewable changes and reuse established patterns.
- Keep UI copy, validation, task fields, and API behavior consistent with `REQUIREMENTS.md`.
- Follow `plan.md` in order unless the user explicitly changes priorities; finish each phase's test gate before starting a dependent phase.
- Follow `design-theme/design-theme.md` and reuse `design-theme/tokens.css`; do not introduce one-off colors when a semantic token exists.
- Never commit secrets. Use environment variables and maintain `.env.example`.
- Keep browser API calls on same-origin `/api`; Netlify routing owns the production function rewrite.
- Generate one anonymous UUID per browser profile, persist it locally, send it as `X-Client-ID`, and scope every task query and mutation by the validated identifier.
- Treat the anonymous identifier as list partitioning, not authentication. Do not collect names, emails, or passwords and do not claim the data is securely authenticated.
- Do not add login, collaboration, reminders, subtasks, drag-and-drop, or AI features unless the user changes scope.
- Preserve user changes and do not rewrite unrelated files.
- Keep progress reports concise: outcome, notable decision, verification, blocker.

## Verification

- Add or update tests with every behavior change.
- Before calling a milestone complete, run the relevant tests and lint; run the production build for UI/configuration changes.
- Test behavior and user-visible outcomes rather than implementation details.
- Check responsive behavior, keyboard focus, empty/loading/error states, and reduced motion for UI work.
- Test that anonymous clients cannot read or mutate each other's tasks through ordinary API requests.

## Documentation discipline

- Use the `take-home-maintainer` skill after each meaningful feature batch.
- Keep `reflection.md` factual and under 500 words; consolidate entries instead of appending a diary.
- Update `README.md` only with commands and behavior verified in the repository.
- Keep `docs/` concise and delete superseded planning artifacts only with user approval.

## Definition of done

A change is done when its behavior works, relevant tests pass, documentation is accurate, no secret is committed, and the result remains within the agreed two-hour MVP.
