---
name: review-phase
description: >-
  Use this skill when a ShopLearn phase (P0–P10) has all of its tasks done and needs an end-of-phase
  review with the user before the next phase starts, or when the user asks "review the phase" or
  "are we ready for the next phase".
---

# End-of-phase review

1. **Check completeness**: every task in the phase is `done` or `review` in `docs/ROADMAP.md`.
2. **Run the full checks** from the repo root and record the output:
   - `npm run typecheck`
   - `npm run test` (if tests exist yet)
   - `npm run dev`, then smoke-test the phase's features (curl the endpoints, or load the pages)
3. **Check against the contracts**:
   - The endpoints match `docs/04-API_CONTRACT.md` (paths, shapes, error codes)
   - `schema.prisma` matches `docs/03-DATA_MODEL.md`
   - The UI uses the tokens and primitives from `docs/05-UI_DESIGN.md`
4. **Check the non-negotiables** in `AGENTS.md` §7 (money as integers, server-side pricing, zod
   everywhere, no secrets committed).
5. **Write the phase summary** in `docs/LEARNING_NOTES.md`:
   - The key concepts learned, as 3–5 bullets
   - 3 **self-check questions** for the user (for example, "Why do we snapshot the price in OrderItem?")
   - One optional **hands-on exercise** the user can try on their own
6. **Update the docs**: set the phase status to `done` in the overview table, and add a progress-log entry.
7. **Ask the user** to review the work. Wait for approval before starting the next phase.
