# Project context: Critical Colleague (IUP, Entrepreneurship, 3rd semester)

Context file for Claude. Read it first in any new session that works in this folder.
Last updated: 2026-11-11 · Written by Claude (Opus 5.5)

## Folder rules (mandatory)
1. **Never delete or overwrite an old version.** Before you create a new version, move the current file into `history/`.
2. **Every version gets a new version name** in the filename: `name_vMAJOR.MINOR.ext` (e.g. `critical-colleague_v0.2.html`).
   - Increase MINOR for changes to content or design, and MAJOR for a new concept or a new main feature.
3. Only the current version of each deliverable stays in the root folder. All earlier versions are in `history/`.
4. Add an entry to the version log below for every new version.
5. This file (`CLAUDE.md`) keeps its name so it loads automatically. Before a substantial rewrite, copy it to `history/CLAUDE_YYYY-MM-DD.md`.
6. Every Excel, PowerPoint or Word file must carry a marker stating that AI was used, and which model.

## The idea
A **custom GPT (or a pasted system prompt) that plays a critical colleague.**
- The user describes how they plan to use AI for a task.
- The tool asks **five tough questions**, one at a time:
  1. **Data:** what goes into the tool? Is it personal or confidential data, and is the tool approved?
  2. **Errors:** assume the output is confidently wrong. How would you notice, and what follows if you don't?
  3. **Who checks:** who reviews the output, and are they competent to disagree?
  4. **Accountability:** whose name is on the result, and can they explain it?
  5. **What you'd lose:** which skills, judgment or relationships erode?
- It then gives **pushback** on vague answers and a **risk rating**.

**Need served:** quick, judgment-free practice at thinking critically about AI use. No expertise or training budget is needed.

## Current state
| File | Version | What it is |
|---|---|---|
| `critical-colleague_v0.1.html` | v0.1 | Offline, single-file prototype that works without login or API calls |

### Prototype v0.1: how it works
- **Step 1:** a free-text plan, plus "where the output ends up": personal ×0.8, internal ×1.0, external ×1.2, decisions about people, money, health or law ×1.4.
- **Step 2:** five questions with fixed answer options scored 0–3. "I don't know" scores 3.
  - Each answer triggers one pushback sentence.
  - Simple keyword detection on the plan adds context hints.
  - There is an optional free-text reasoning field.
- **Step 3:** the rating.
  - Total 0–15 × the stakes factor. Bands: <4 Low, <8 Moderate, <11 High, ≥11 Critical.
  - **Red-flag overrides:**
    - Sensitive data with weak or no review → at least High.
    - High stakes with weak review → at least High.
    - Hard-to-spot errors with no reviewer → at least High.
    - No owner → at least Moderate.
    - High stakes, unclear owner and risky data → Critical.
  - Output: a bar breakdown per dimension, red flags, fixes, and a copyable summary.
- **Second tab:** the full system prompt for a custom GPT or Claude Project. It uses the same five dimensions and scoring, asks one question at a time, never does the task itself, gives no legal conclusions, and warns users not to paste confidential data.
- **Footer:** an AI-creation marker.

## Critical weaknesses identified (unresolved)
1. **"Judgment-free" and a risk rating contradict each other.** A score feels like a judgment and invites gaming. Options to consider:
   - Show the rating only after reflection.
   - Replace it with "your 3 biggest gaps".
2. **The rating is self-reported.** It only measures how honest the user is. The LLM version can challenge vague answers; the HTML version cannot.
3. **The tool has the risk it warns about.** Users may paste real confidential plans into a public GPT. A hosting decision is needed: which approved tool should run it?
4. **Fixed questions get stale.** After about three uses, users learn the "right" answers.
5. **No evidence of impact yet.** The success metric should be "user changed their plan", not satisfaction.

## Open next steps
- Clarify what the IUP deliverable requires (format, assessment criteria, deadline). This is not yet known to Claude.
- Test v0.1 with 3–5 users. Record whether they changed their plan.
- Decide on rating vs. gaps framing (weakness 1).
- Build the custom GPT from the system prompt and compare it with the HTML version.
- Optional: German language version.

## User preferences (relevant here)
- Prioritise truth over agreement. Challenge weak assumptions; no flattery or filler.
- For university topics: structured, deep explanations with tradeoffs.
- Accuracy over speed; state uncertainty.

## Version log
| Date | File | Change |
|---|---|---|
| 2026-11-10 | critical-colleague_v0.1.html | First prototype |
| 2026-11-11 | CLAUDE.md | Context file created |
| 2026-11-13 | index.html (v0.2) | Minimalist redesign of the ClearAI site; feedback made prominent (header button on every screen, feedback panel directly under the verdict, general-feedback dialog). v0.1 kept as `history/index_v0.1.html`. |
