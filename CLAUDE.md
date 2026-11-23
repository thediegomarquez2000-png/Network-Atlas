# Network Atlas — project guide for Claude Code

Network Atlas is a single-file, offline-capable web app that teaches networking from zero to CCNA (with CCNP/CCIE mapped as future tracks). It was designed to be accessible for learners with special needs. It also includes a three-form CCNA 200-301 v2.0 practice exam that produces a PDF report for an AI tutor.

The owner, Diego, is building it and also uses it to study for the CCNA. Explain changes in plain language. Show diagrams when explaining how something works.

## What's in this folder

| Path | What it is |
|---|---|
| `Network-Atlas-v0.7.html` | The whole app in one file (about 1 MB). This is the current source of truth. |
| `tests/test_v6.py` | Browser test: settings, lesson flow (hints, show-it modes, unlock), come-back check, themes, learner profiles. |
| `tests/test_anim.py` | Browser test: simulator route animation (successful and failing ping). |
| `tests/test_fx.py` | Browser test: final exam (each question type, skip warning, pause/resume, scoring, skills map, PDF and Markdown download). |
| `tests/validate_bank.js` | Node check of the exam bank: 100 questions per form, each skill twice per form, unique options, every typed answer accepted by its own grader, abbreviation rules. |

Run the browser tests with Python Playwright: `pip install playwright && playwright install chromium`, then `python tests/test_fx.py Network-Atlas-v0.7.html shots/` (create `shots/` first). The scripts point at `/usr/bin/google-chrome`. Change `executable_path` or remove it to use Playwright's bundled Chromium. Run the bank check with `node tests/validate_bank.js Network-Atlas-v0.7.html`.

## First job: turn the single file into a real project

1. `git init`, then commit the HTML file unchanged as the baseline.
2. Split the file into source files (it has 7 `<style>` blocks and the 11 `<script>` blocks listed below), for example `src/styles/*.css`, `src/data/*.js`, `src/modules/*.js` and `src/index.html` with placeholders.
3. Add a small build script (Node, no framework) that inlines everything back into **one** `dist/index.html`. The single-file output must keep working, because it is used offline and published as a claude.ai artifact.
4. Prove the split changed nothing: the built file must pass all four tests, and a diff of the built and original files should show only whitespace.
5. Add `npm test` to build and then run every test.

### Script blocks, in load order (order matters)

1. **Prefs module**: learner profiles, accessibility settings, read-aloud (speechSynthesis), break reminders, `saveFile()`. Exposes `window.ATLAS_PREFS`. It must run first, because the other modules read `profileSuffix()` to build their storage keys.
2. `window.ATLAS_TOPICS`: 158 topics (CCNA, CCNP, CCIE). Only 15 have `ready:true`.
3. `window.ATLAS_LESSONS`: 15 authored Foundations lessons (n001–n015). Each has paragraphs, key facts, an analogy, a lab scenario, a 3-question quiz, a teach prompt and keyword groups.
4. `window.ATLAS_GLOSSARY`: 380 plain-English terms. Lesson text links them automatically.
5. `window.ATLAS_EXAMS`: the Foundations subject exam (a pool of 34 questions, 15 drawn, 90% to pass).
6. The legacy v0.3 lab. Its `ATLAS_LAB` is overridden by block 7, but `ATLAS_LAB_TEST` is still exposed. It's a candidate for deletion once confirmed unused.
7. The v0.4.1 simulator plus the v0.6.1 route animation. Exposes `ATLAS_LAB={render, open(missionId)}` and `ATLAS_EMULATOR_TEST`. It has 8 missions; the animation functions are `startRoute`, `paintRoute` and `raTick`.
8. jsPDF 2.5.1 (MIT), bundled so PDFs work offline and inside the claude.ai sandbox. Keep this as a vendored file; do not load it from a CDN.
9. `window.FX_BANK`: the final-exam question bank. Each `K(id, domain, topic, name, {A:[2], B:[2], C:[2]})` call defines one skill with two questions per form.
10. **Final exam engine** (`window.ATLAS_FINAL`, `ATLAS_FINAL_TEST`): generators, grading, the timer, results, the skills map and the PDF/Markdown report.
11. **Main app**: views, mastery gates, lesson loop, come-back checks, dictionary, flashcards, matching game, recap quizzes, subject exams, resources, knowledge graph, search and import/export.

## Final exam design (keep these principles)

- **Same skills, three ways.** 50 skills mapped to the official CCNA v2.0 topics. Form A (Classic) asks about concepts. Form B (Troubleshoot) uses exhibits: show output, logs and configs from a clinic network. Form C (Hands-on) uses typed IOS commands, ordering and matching. Each form has 2 questions per skill, 100 in total. Domain spread is 24/24/20/20/12%, against the blueprint's 25/25/20/20/10.
- **Generated skills** (`ipv4-subnet`, `eui64`, `lpm`) are built by code from a seeded random number generator. The numbers change on every attempt, so the answers are always computed correctly. If you add a generator, add a check against Python's `ipaddress` module (see "Verification" below).
- **Like the real exam:** 120 minutes, random order, no feedback until the end, no going back by default, a scaled score of `300 + 700 × fraction correct`, and a target of 825. Cisco does not publish its pass mark; 825 is a commonly quoted community estimate. Always label both as estimates.
- **Accommodations:** extended time (180 or 240 minutes) or untimed, a toggle to hide the countdown, read-aloud, and a pause that stops the timer.
- **Question types:** `mc` (correct answer is `o[0]` in the source), `multi` (the first `k` options are correct), `input` (accepted answers in `i[]`, optional validator `v`: `ipv4`, `ipv6`, `mac` or `iid`), `order` (`ord[]` in the correct order) and `match` (`pr[]` of left/right pairs). Option order is shuffled at runtime.
- **Typed-answer grading** accepts IOS-style abbreviations: each word the user types must be at least 2 characters and a prefix of the expected keyword, and interface names are normalized (`g0/1`, `lo0`). Numbers, IP addresses and names must match exactly. IPv6 is compared in expanded form.
- **Skills map rating:** Gap (under 50%), Shaky (50–99%), Looks solid (100% but not yet tested in all three forms), Solid (100% in all three). Notes such as "Missed in Hands-on" show which way of asking failed.

## Lesson loop (main app)

See it (read-aloud plus a button to open the matching lab mission) → Try it (a hint ladder: wrong answers get crossed out, and the key facts are shown) → Quiz (retry one question at a time) → Show it (type it, say it with speech-to-text, pick the ideas, or tell a grown-up who ticks off each key idea, with an optional PIN) → Unlock.

After unlocking, a **come-back check** is due the next day: 3 questions with no hints, all correct to reach Mastered ★. A subject exam opens only when every lesson in that subject is mastered.

## Storage (localStorage). Do not rename keys, or users lose progress.

- `network-atlas-profiles-v6`: the learner list, the active learner and the grown-up PIN (a light lock, not security).
- Per learner: the base key plus a suffix (empty for the first learner `p1`, otherwise `::<profileId>`):
  - `network-atlas-prefs-v6…`
  - `network-atlas-progress-v1…`
  - `network-atlas-virtual-lab-v4…`
  - `network-atlas-final-v1…`
- `network-atlas-lab-v3` is legacy.

## Publishing targets

1. **claude.ai artifact (live link):** slug `9d53e193-2133-4be2-8fe1-e14904912ebb`, https://claude.ai/artifact/LRo5UxroMoJYEL7NFaoH22. It declares the `downloads` capability. The page runs in a sandboxed frame:
   - `alert`, `confirm` and `prompt` are refused, so code skips `confirm` when framed.
   - Ordinary downloads are refused. `ATLAS_PREFS.saveFile()` uses `claude.use("downloads")` when it's available and falls back to a normal download.
   - The microphone is blocked, so "Say it" fails there. To fix it, switch to the `dictation` capability.
   - Remote scripts load only from approved CDNs (cdnjs and similar).

   Republishing from Claude Code may not be possible; if not, ask Diego to publish the built file from the Claude app.
2. **Vercel (planned):** deploy `dist/index.html` as a static site on Diego's Vercel account (the same one Project Outlast uses). The fallback download path already works there.

## Backlog, in suggested order

1. Split into a real project with a build step and tests (above).
2. A labelled diagram for each of the 15 lessons. The owner is a visual learner, and so are many target learners. The ping-trace code in block 7 can render most of them.
3. "Say it" on the live page through the `dictation` capability.
4. A proper light theme. The current one inverts the dark colors, so emoji come out in odd colors.
5. Author lessons 16+ (CCNA Infrastructure & connectivity), using the full lesson loop and adding subject exams.
6. A grown-up dashboard: a readable progress report and alignment with IEP goals.
7. Accessibility audit against WCAG 2.2 AA: keyboard focus trapped inside the definition pop-up, an alternative to the canvas knowledge graph, and a contrast check in every theme.

## Verification

- Exam content accuracy matters more than anything else. After changing the bank, run `validate_bank.js`. For generated questions, cross-check the answers with Python's `ipaddress` module: subnets, EUI-64 (flip bit 0x02 of the first byte, insert FFFE) and longest-prefix match. It was last run on 2026-11-23 with 0 errors and 48 of 48 generated answers matching Python.
- Before claiming something works, run the browser test for the area you changed and look at a screenshot.
- Keep the "not affiliated with Cisco" notes and the "practice estimate" labels.
