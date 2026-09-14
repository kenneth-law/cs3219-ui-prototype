<!--
AI Assistance Disclosure:
Tool: OpenAI Codex (GPT-6), date: 2026-09-06
Scope: Generated repository disclosure and administrative documentation scaffolding.
Author review: Pending team review; no human validation or agreement is claimed.
See ai/usage-log.md for prompts and key responses.
-->

# AI usage log

Maintain this shared log for all team members. Never record passwords, access tokens, or device authorization codes here. Preserve exact task prompts and key responses; redact sensitive content explicitly where necessary.

## 2026-09-06 — Repository setup and disclosure scaffolding

- Timestamp: 2026-09-06 (Asia/Singapore; exact session start time not recorded).
- Tool/model: OpenAI Codex, GPT-6.
- Mode: Generate documentation scaffolding; explain account requirements; assist with repository authentication/configuration.
- Source: User-provided CS3219 AY2627S1 Project Description, especially Project Code Management and Appendix 2. The assessment text is not duplicated in this public repository.
- Human review: Pending. No team agreement, signatures, or human verification claimed.

### Exact user task prompts and replies

1. `first fork this, then publish, then create the ai log and stuff mentioned in the requirement`
2. `Group 11` (reply to the requested organization/group number).
3. `who is currently signed into github?`
4. `okay sign out of that, does the doc mention that I need to use my university email account?`
5. `log into kenneth-law`
6. `done`

The first prompt included an attached project document; its supplied text ended with `what do I have to do for this?`. Consult the official course document for the source attachment.

### Key responses and resulting work

- Identified the required organization as `AY2627S1-CS3219-P11`.
- Explained that the provided document does not require a university email for GitHub.
- Removed the previously saved Git HTTPS credentials and completed GitHub CLI sign-in as `kenneth-law`; authentication secrets are omitted.
- Verified that the team repository already exists as a fork of `CS3219-AY2627S1/FoC-Template`. The account has read access but no push access at this point.
- Configured `upstream` for the course template and `origin` for the team fork.
- Generated file-header attribution, README disclosure, log, draft team agreement, submission checklist, and agent instructions. The generated files themselves preserve the key documentation outputs.
- No application implementation, architecture/design decisions, backlog prioritization/consolidation, sprint planning, or decision rationales were generated.

### Affected files

- `README.md`
- `AGENTS.md`
- `ai/usage-log.md`
- `ai/team-agreement.md`
- `docs/submission-checklist.md`

### Validation and publication

- Agent checked GitHub account identity, fork parent, and repository permissions through GitHub CLI/API.
- Agent validation: `git diff --check` passed; all five affected files have attribution headers, relative Markdown links resolve, and AI Use Summary is the final README section. Human content review remains pending.
- Publication is blocked until `kenneth-law` receives write access to the team repository.

## 2026-09-06 — D1 UI prototype audit and implementation

- Timestamp: 2026-09-06, Asia/Singapore; exact session start/end not recorded.
- Tool/model: OpenAI Codex (GPT-6).
- Modes: Review existing UI, generate/refactor prototype implementation, debug, generate regression tests, document results.
- Input: User-supplied Group 11 D1 feature list. Student numbers and the assessment attachment are not reproduced in the repository.
- Exact task prompt:

```text
build in UI prototype for now, don't worry about git,
audit the app, and add missing features from this feature list
Also make the deisgn of the site look less vibe coded, so remove the "C" logo, amd tabs everywhere

cheeck this out for taste ideas
[https://github.com/leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill)
```

The same message supplied a `web-design-guidelines` skill wrapper instructing the agent to fetch the latest rules at `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`, inspect the UI files, and report terse `file:line` findings. The supplied wrapper is archived in `ai/instructions/user-web-design-SKILL.md`; the fetched rules and Taste redesign instructions are archived in the same directory.

### Key responses and retained outputs

- Audit identified screen-only registration/sign-in, missing Admin Manager controls and filters, hardcoded 12-hour expiry, hard deletion of suppliers, and missing action/credit guards.
- Implemented the supplied user-facing flows inside the existing React prototype. Removed the C badge and repeated tab/pill navigation; added a text wordmark, restrained green/neutral styling, serif headings, noticeboard/list views, labeled controls, accessible modal dialogs, and mobile progress layout.
- Added account validation and role selection, soft supplier deactivation with an active-order guard, 15-minute countdown/expiry, credit reservations/releases/payouts, permission-checked status actions, per-user transaction history, and read-only audit records.
- Added explicitly simulated monitoring failure/recovery, alerts, and centralised log filtering. No microservice implementation or real monitoring/CI/CD deployment was performed.
- Preserved generated implementation in the files listed below. Documented scope and remaining gaps in `docs/ui-prototype-audit.md`.

### Affected files and generated artifacts

- `UI Prototype CS3219 (Copy)/src/App.tsx`, `src/Nav.tsx`, `src/routes.tsx`, `src/store.tsx`, `src/ui.tsx`, `src/index.css`.
- `UI Prototype CS3219 (Copy)/index.html`, `.figma/make/site.json`, `package.json`, `README.md`, `tests/prototype.test.tsx`.
- Package-manager-generated lockfiles `UI Prototype CS3219 (Copy)/package-lock.json` and `pnpm-lock.yaml`; installed dependencies and generated `dist/` build output. Source disclosure is in package metadata; generated dependency/build artifacts are documented here.
- Root `README.md`, `ai/usage-log.md`, `docs/ui-prototype-audit.md`, and `ai/instructions/` reference snapshots.

### Agent checks and actual limitations

- `npm run check`: pass.
- `npm test`: pass. Covers account validation, 100-credit registration, invalid reward rejection, self/repeated acceptance, status permissions, credit conservation, cancellation and expiry, supplier retention and administrator permissions, profile uniqueness, all screens rendering, form error labels, supplier dialogs, and simulated monitoring failure/recovery.
- Production build using Node 22: pass. Local shell Node 20.17 is below Vite’s supported range; project toolchain already specifies Node 22.
- Dev server serves the prototype locally at port 8443.
- No real-browser visual or native dialog focus verification was performed: no callable browser-control tool was available. JSDOM dialog methods were polyfilled for interaction checks.
- Accounts, credits, audit records, messages, and access checks are local demo behavior. No bcrypt, server authorization, database durability/atomicity, cross-client timing guarantee, immutable storage, capacity test, or live telemetry is claimed.
- A formatter run exposed invalid inline type separators; the agent corrected them and repeated TypeScript and regression checks successfully.
- Human review, actual browser review, and team acceptance: pending. No human edits or validation are claimed.

### Sources

- The team-authored D1 feature list supplied in the conversation.
- Vercel Web Interface Guidelines and Leonxlnx Taste redesign guidance; source URLs and archived instructions are linked in the audit document. Taste’s MIT license is retained with its snapshot. Existing project AGENTS.md instructions were followed. No new system architecture or requirements prioritization was proposed.

## 2026-09-06 — Chat Send button layout fix

- Tool/model: OpenAI Codex (GPT-6); mode: debug/refactor UI.
- Exact prompt: `send here is malformed` (with a screenshot showing “Send” wrapping across two lines).
- Key response/output: Made the chat message field flexible with a zero minimum width, and prevented the Send button from shrinking or wrapping. Reserved button width also keeps its loading state stable.
- Affected file: `UI Prototype CS3219 (Copy)/src/routes.tsx`.
- Validation: Production build passed using Node 22. Visual confirmation in the browser remains pending; no new tests added for this small CSS correction.
- Human review: Pending.

## 2026-09-06 — Password reset prototype

- Exact prompt: `also add reset password feature`
- Tool/model: OpenAI Codex (GPT-6); modes: implement, debug, test, document.
- Key output: Added a Forgot password link on sign-in, email request/confirmation, labeled demo email preview, new password and confirmation fields, success screen, and invalid/expired/used-link handling. Reset links expire after 15 minutes, are replaced by a new request for the same email, and are consumed on successful reset. Passwords follow the existing 8–64 character uppercase/lowercase/numeric rules. The reset changes only the local account password, ends the current local session, and preserves credits and profile information.
- Locations: `UI Prototype CS3219 (Copy)/src/store.tsx`, `src/routes.tsx`, `src/App.tsx`, `tests/prototype.test.tsx`, and prototype/root README and audit documentation.
- Agent checks: TypeScript and Node 22 production build pass. Regression tests pass, including old-password rejection/new-password login, password confirmation, invalid/expired/replaced/reused links, unaffected credits, and the rendered recovery flow through the success screen. Fixed test initialization to install JSDOM before importing React DOM; checks assert no uncaught UI errors.
- Boundaries: No email is sent. The reset link is exposed only as a clearly labeled local demo preview, works in the same tab, and disappears on refresh. No production email ownership verification or account-recovery backend is claimed. Browser visual verification and human review remain pending.

## 2026-09-06 — Mobile usability refinements

- Exact prompt: `I love it, but can you make it more mobile friendly?`
- Tool/model: OpenAI Codex (GPT-6); mode: UI refactoring and documentation.
- Key response/output: Retained the existing visual design while increasing phone tap targets, using 16px form controls, shortening the mobile authentication header, adding device safe-area spacing, wrapping narrow-screen content, stacking request layouts through tablet widths, and keeping supplier administration stacked until desktop. Chat uses a viewport-relative height with a flexible message field and non-shrinking Send button. Audit records become labeled vertical records on phones while retaining explicit table semantics. Credit details no longer truncate, and the balance link has an accessible name at narrow widths.
- Affected files: `UI Prototype CS3219 (Copy)/src/index.css`, `src/routes.tsx`, `src/ui.tsx`, `src/Nav.tsx`, `index.html`; this log and the prototype audit.
- Agent checks: TypeScript, existing React/JSDOM interaction tests, and Node 22 production build passed. No new tests were added for CSS-only sizing rules; JSDOM does not verify rendered viewport layout.
- Human/visual review: Pending. Browser-control tools are unavailable; phone screenshots, device keyboard behavior, native dialog focus, and physical-device checks were not performed.

## Entry template

- Timestamp/timezone:
- Team member:
- Tool and model:
- Mode and usage scenario:
- Exact prompts:
- Key responses (or repository-relative transcript link):
- Affected files/locations:
- What was retained, changed, or rejected (human to complete):
- Agent checks and results:
- Human reviewer, review date, and validation evidence:
- Sources/licensing acknowledgments:

## 2026-09-14T19:43:24.295133+08:00 — Standalone prototype publication

- Tool/model: OpenAI Codex (GPT-6).
- Mode: Documentation, repository preparation, validation, and GitHub publication.
- Exact prompt: `can you push only the content in UI Prototype CS3219 into a repo on my github? write first commit message, this is design in figma, and readme on how to get it running`
- Key responses: Prepared only the prototype directory contents for a standalone private repository, `kenneth-law/cs3219-ui-prototype`; documented Figma provenance, clone/install/run/preview commands, demo behavior, and AI use.
- First commit message: `Initial commit: add Figma-designed CS3219 UI prototype`
- Affected files: Prototype `README.md`, `ai/usage-log.md`, and `ai/instructions/project-AGENTS.md`; parent `ai/usage-log.md` and README disclosure. Existing app implementation is retained.
- Provenance: Earlier entries were copied from the parent project's usage log; their historical paths and references describe that original repository, and referenced attachments remain there. Parent project instructions are archived in `ai/instructions/project-AGENTS.md`.
- Validation: `npm run check`, `npm test`, and production build with Node 22 passed. No browser visual checks performed. Publication pending at commit preparation.
- Human review and team agreement: Pending; no new human validation claimed.

- Packaging correction: Replaced exported blanket Git LFS rules in `.gitattributes` with ordinary Git binary handling for the two small PNG assets, so cloning requires no Git LFS installation.
