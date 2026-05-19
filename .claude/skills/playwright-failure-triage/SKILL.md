---
name: playwright-failure-triage
description: >-
  Diagnose and fix a failing or flaky Playwright test in the english_ats suite.
  Trigger when `npm test` / `npx playwright test` reports a failure, a spec is
  flaky or intermittently red, a test times out, or the user says "the test is
  failing", "this test is flaky", "triage the failure", or "the report shows".
---

# Playwright Failure & Flaky-Test Triage

Use this when a spec in `tests/` fails or flakes. The suite runs against an
external live site (`https://engleskisastojankom.lovable.app/`) the team does
**not** control, so red has several distinct causes that need different fixes.
Classify before you edit. This skill governs *diagnosis*; defer to the
`playwright-test-authoring` skill for the *shape* of any rewritten code.

## 1. Reproduce & gather evidence first — no blind reruns

- Re-run only the failing spec: `npx playwright test tests/<file>.spec.ts`.
  Add `--repeat-each=3` to confirm whether it is flaky vs. consistently red.
- Open the evidence — do not guess from the terminal line alone:
  - HTML report: `npm run test:report`.
  - Trace is captured `on-first-retry` and screenshot `only-on-failure`
    (`playwright.config.ts`). Read the failing step, the resolved locator, the
    error, and the DOM snapshot at the moment of failure.

## 2. Classify the root cause — pick exactly one before fixing

- **Real regression / true bug in the site behaviour** → this is the test
  doing its job. Report it clearly. Do **not** weaken or delete the assertion
  to make it pass.
- **Live-site content/DOM change** (copy reworded, heading/label renamed, role
  changed on lovable.app) → re-snapshot reality before editing:
  `mcp__playwright__browser_navigate` to the section, then
  `mcp__playwright__browser_snapshot`. Update the locator / expected string to
  the confirmed new truth. If a key assertion string in `CLAUDE.md` is now
  stale, flag it to the user (do not silently let it rot).
- **Locator drift / brittle selector** (selector matched 0 or >1, or relied on
  a generated class) → replace with a resilient locator per the authoring
  priority: `getByRole` → `getByLabel` → `getByText` → `getByPlaceholder` →
  CSS last.
- **Timing / flake** (passes on retry, intermittent, timed out waiting) →
  almost always a missing web-first assertion or a banned wait. Note the known
  offender: `tests/theme-toggle.spec.ts` uses
  `page.waitForLoadState('networkidle')` in `beforeEach`. Replace with an
  auto-retrying `expect(...)` on observable state (e.g. hero heading visible).
  **Never** add `waitForTimeout`, a sleep, or bump a timeout to mask it.

## 3. Apply the minimal targeted fix

- Fix only the classified cause. Do not broaden scope, refactor unrelated
  tests, or relax a matcher (`toHaveText` → `toContainText` → removed) just to
  turn red green.
- For the shape of any rewritten locator, assertion, fixture, or POM, follow
  `playwright-test-authoring` — this skill does not restate those rules.

## 4. Verify the fix is stable

- Re-run the spec with `--repeat-each=3` and confirm it is consistently green
  (one green run does not clear a flake).
- Run the full suite (`npm test`) to confirm no neighbouring spec regressed.

## 5. Triage checklist — all true before declaring resolved

- [ ] Root cause classified from trace/report evidence, not guessed
- [ ] Live site re-snapshotted via MCP if a content/DOM change was suspected
- [ ] Fix is minimal and targets the classified cause only
- [ ] No assertion weakened, no sleep added, no timeout bumped to mask a flake
- [ ] Stale `CLAUDE.md` key strings flagged if the live site changed
- [ ] Spec green across repeated runs; full `npm test` still green
