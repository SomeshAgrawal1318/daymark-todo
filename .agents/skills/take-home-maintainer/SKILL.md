---
name: take-home-maintainer
description: Maintain the ShopBack take-home's reflection, requirements alignment, verification record, and submission readiness after meaningful implementation batches. Use after features, tests, architecture decisions, or material AI-assisted revisions; do not trigger for trivial formatting-only edits.
---

# Take-home maintainer

Keep the submission honest, concise, and synchronized with the code.

After a meaningful feature batch:

1. Inspect the actual diff and test results. Do not infer work that is not present or claim checks that were not run.
2. Confirm the change remains inside `REQUIREMENTS.md`. Surface a scope conflict instead of silently changing the requirements.
3. Update `reflection.md` as a coherent write-up, not a chronological diary. Keep it at or below 500 words and explicitly answer:
   - How did you break down the problem before prompting?
   - What did the AI get wrong, and how did you fix it?
   - What did you deliberately not delegate to AI, and why?
   - What would you do differently with more time?
   Include AI contributions and verification within those answers without inventing work.
4. Update `README.md` only when setup, commands, architecture, or user-visible behavior has actually changed and been verified.
5. Check submission readiness: source, README, original prompt, screenshots, reflection, environment example, tests, and production build.

Prefer replacing stale reflection sentences over continuously appending. Never include credentials, invented metrics, fabricated user feedback, or unverified claims.
