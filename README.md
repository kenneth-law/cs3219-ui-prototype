<!-- AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-14.
Scope: Prototype usage, standalone setup, Figma attribution, and AI disclosure documentation. Human review pending. See /ai/usage-log.md. -->

# CS3219 UI Prototype — Campus errands

A UI design created in Figma and exported as a React + TypeScript application with Vite and Tailwind CSS.

A local interactive prototype for Group 11’s supplied D1 backlog. State is held in memory and resets on refresh. No services or database are connected.

Use Node 22.12 or newer (the included `.mise.toml` selects Node 22).

```sh
git clone https://github.com/kenneth-law/cs3219-ui-prototype.git
cd cs3219-ui-prototype
npm ci
npm run dev
```

No environment variables, backend services, or Figma account are required to run locally. If port 8443 is occupied, use `npm run dev -- --port 8444` and open the URL printed by Vite.

Open http://localhost:8443. The sign-in screen’s “Try a demo account” section fills sample credentials. All demo passwords are `Passw0rd!`.

| Email | Access |
| --- | --- |
| alex@campus.edu | Requester, courier, administrator, Admin Manager |
| priya@campus.edu | Requester and courier |
| marcus@campus.edu | Requester and courier |

The account menu switches requester/courier mode and opens profile, credits, and permitted administrative screens. Sign out and sign in as another demo user to show both sides of a delivery without refreshing. New accounts receive 100 credits and can sign in again during the same session.

## Demonstration walkthrough

1. Sign in as Alex. Request an errand with a whole-number reward; inspect the reserved balance and 15-minute countdown.
2. Sign out and sign in as Priya. Filter the noticeboard, accept Alex’s request, mark it picked up, then delivered.
3. Sign in as Alex. Confirm receipt; inspect both accounts’ credit histories and the activity log.
4. Create a second request and cancel it to release its credits. An open request also expires automatically after 15 minutes.
5. As Alex, manage suppliers, inspect the blocked deactivation of a supplier with active errands, or create and deactivate an unused supplier.
6. Open administrator access to grant/revoke supplier-management privileges. Open monitoring to simulate a service failure and recovery and inspect the sample centralised logs.

## Password reset demo

Choose **Forgot password?** on sign-in, enter an existing demo or newly registered account email, and choose **Request reset link**. The confirmation contains a labeled **Open demo reset link** preview because no email service is connected. Open it in the same tab, enter and confirm a valid new password, then sign in with that password.

Links expire after 15 minutes and work only once. Requesting a new link replaces the previous one for that email. Refreshing clears accounts and reset links with all other demo state. The default demo credential buttons still fill the original sample password; manually enter the updated password after a reset.

## Checks

```sh
npm run check
npm test
npm run build
```

Tests use React and JSDOM; they cover local state behavior and rendered interactions. They do not establish browser layout correctness, real server concurrency, security, or performance guarantees. Dialog behavior is polyfilled in JSDOM; native focus trapping still needs browser verification.

If your shell still uses an older Node version, the build and development server can run with:

```sh
npx --yes --package=node@22 node node_modules/vite/bin/vite.js build
npx --yes --package=node@22 node node_modules/vite/bin/vite.js --host 127.0.0.1
```

## Production preview

```sh
npm run build
npm run preview
```

Open http://localhost:8443 after stopping the development server. The build output is written to `dist/`.

## Design and source attribution

The original UI design and exported scaffold were created in Figma/Figma Make, as identified by the project owner. The `.figma/` configuration is retained because the Vite configuration imports it. A source Figma file URL was not supplied.

Earlier prototype refinements referenced [Leonxlnx Taste](https://github.com/leonxlnx/taste-skill) and [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines). Seed place descriptions and operating hours are illustrative demo data.

## AI Use Summary

OpenAI Codex (GPT-6) assisted with the existing prototype implementation, tests, UI refinements, and documentation on 2026-09-06, and standalone repository preparation and setup documentation on 2026-09-14. Existing source-file disclosures are retained. Recorded prompts, validation results, and provenance are in [ai/usage-log.md](ai/usage-log.md).

Human review and team agreement remain pending. This is a local demonstration with simulated accounts, credits, monitoring, and password recovery; no production backend or security guarantees are claimed.
