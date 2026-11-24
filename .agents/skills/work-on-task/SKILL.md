---
name: work-on-task
description: >-
  Use this skill when starting, delegating or finishing any ShopLearn roadmap task (IDs like T3.3),
  or when running several tasks in parallel. It covers claiming the task, loading the shared project
  context, staying inside file ownership, verifying, and updating the roadmap, progress log and learning notes.
---

# Work on a ShopLearn task

## A. Running one task (yourself)
1. **Find the task** in `docs/ROADMAP.md`. Check that every `Depends on` task is `done`.
   If not, stop and report which dependency is missing.
2. **Claim it**: change its status to `in_progress`.
3. **Load context**, in this order:
   - `AGENTS.md` (already loaded automatically) and `docs/06-CONVENTIONS.md`
   - every doc in the task's `Read` field
   - the top 3 entries of `docs/PROGRESS_LOG.md` (recent changes and follow-ups)
   - existing code in and next to the task's `Owns` paths
4. **Plan briefly**: list the files you will create or change. All of them must be inside `Owns`.
   If a contract (data model, API contract, tokens, routes) seems wrong, **stop** and propose an ADR.
   Do not work around it.
5. **Build it.** Follow the conventions. Keep the code readable for a learner.
6. **Verify** every `Done when` item. Run real commands (`npm run typecheck`, tests, curl, dev server)
   and save the output.
7. **Close it out**:
   - `docs/ROADMAP.md`: set the status to `done`. If this was the last task in the phase, set it to `review` and update the phase row.
   - `docs/PROGRESS_LOG.md`: add an entry at the top using the template.
   - `docs/LEARNING_NOTES.md`: add what, why, concept and where, and add new terms to the glossary.
   - `docs/DECISIONS.md`: add an ADR if you made a lasting choice.
   - Commit: `git checkout -b task/<id>-<slug>` (or work on the current branch if the user prefers), then commit with a Conventional Commit message.
8. **Report to the user**: what you built, how you verified it, the concept they should understand,
   and the files to read first.

## B. Running tasks in parallel (coordinator)
1. Pick tasks that are all unblocked **and** have `Owns` paths that do not overlap.
   The roadmap marks the safe pairs with "can run in parallel".
2. Before you start them, mark them all `in_progress` in the roadmap yourself. This avoids two
   workers editing the roadmap at the same time.
3. Give each worker a **context packet** (template below). Workers update only their own task's
   learning-notes section and send their progress-log text back to you. **The coordinator alone**
   writes `ROADMAP.md` and `PROGRESS_LOG.md` to avoid edit conflicts.
4. When everyone is finished: run `npm run typecheck` and the tests at the root, check that the work
   matches the contracts, and then update the docs.

### Context packet template (paste into the worker's prompt)
```
You are working on ShopLearn, a full-stack e-commerce learning project.
Workspace: /home/koragg/Desktop/web app
Task: <ID and title, copied exactly from docs/ROADMAP.md, including Owns, Read, Done when>
Before coding, read: AGENTS.md, docs/06-CONVENTIONS.md, <docs from Read>, top of docs/PROGRESS_LOG.md.
You may edit ONLY: <Owns paths> and your own section in docs/LEARNING_NOTES.md.
Do NOT edit ROADMAP.md, PROGRESS_LOG.md or any contract doc. If a contract blocks you, stop and report.
Other tasks running at the same time: <IDs and Owns>. Do not touch their files.
When done, reply with: files changed, verification output, a draft progress-log entry, and open questions.
```
