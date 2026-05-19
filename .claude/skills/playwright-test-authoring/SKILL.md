---
name: playwright-test-authoring
description: >-
  Apply Playwright best practices when writing or modifying a test in this repo.
  Trigger when creating/editing any tests/*.spec.ts file, adding a Page Object
  in tests/pages/, or asked to "write a test", "add a test", "add a spec", or
  "fix a flaky test" for the english_ats suite.
---

# Playwright Test Authoring

Follow this playbook whenever you write or modify a spec in `tests/`. The site
map, anchors, key strings, and form fields live in `CLAUDE.md` — treat that as
the canonical reference and do not duplicate it here. This skill governs *how*
the test is built.

## 1. Before you write — inspect the live site via Playwright MCP

Never guess locators. Verify them against the real DOM first:

1. `mcp__playwright__browser_navigate` to `https://engleskisastojankom.lovable.app/`
   (and scroll/interact to the relevant section if needed).
2. `mcp__playwright__browser_snapshot` to read the actual accessibility tree.
3. Choose locators from the *observed* roles and accessible names — confirm the
   element really exposes the role/name you intend to query (e.g. is the theme
   control a `button` with name `Toggle dark mode`, or something else?).

If the element has no good accessible name, prefer fixing the strategy (text,
label) over falling back to brittle CSS.

## 2. Locator strategy (resilient-first)

Priority, most resilient first:

1. `getByRole()` — semantic, default choice; use the accessible name verified in step 1
2. `getByLabel()` — form fields
3. `getByText()` — visible static content
4. `getByPlaceholder()` — inputs identified only by placeholder
5. CSS selector — last resort, scoped and meaningful only

**Banned:** XPath, bare index locators (`.nth(0)`, `.first()` as a crutch),
long brittle CSS chains, locating by auto-generated class hashes.

## 3. Web-first assertions & waiting (anti-flake)

- Use auto-retrying assertions: `expect(locator).toBeVisible()`,
  `toHaveText()`, `toHaveValue()`, `expect(page).toHaveURL(/.../)`.
- Prefer specific matchers over generic truthiness checks.
- **Never** `page.waitForTimeout()`.
- **Avoid** `page.waitForLoadState('networkidle')` — it is flaky on this SPA.
  `tests/theme-toggle.spec.ts` currently uses it in `beforeEach`; that is the
  anti-pattern. Instead, assert on a real element being visible (e.g. the hero
  heading) to know the page is ready, and refactor that file if you touch it.
- Wait on **state** (an assertion) — never on **time**.

## 4. Test structure & independence

- One `test.describe` per feature/section.
- `beforeEach` does `await page.goto('/')` — relative paths only; `baseURL`
  lives in `playwright.config.ts`.
- Every test is fully self-contained: no shared mutable state, no reliance on
  execution order (`fullyParallel: true` is set).
- Group related assertions in one test rather than one assertion per test.
- Test names describe expected behaviour, not mechanics.

## 5. Page Object Model

- Any section with more than ~3 interactions gets a class in `tests/pages/`
  (e.g. `tests/pages/ContactFormPage.ts`).
- Define each locator once (constructor or readonly field); never re-query
  inline.
- Methods express user intent (`fillContactForm`, `submit`) — not raw clicks.

## 6. Network / async handling

- For data-dependent UI, use `page.waitForResponse(...)` or `expect.poll(...)`
  instead of sleeps or `networkidle`.
- Scope waits to the specific action that triggers them.

## 7. Accessible names & fixtures

- Prefer stable, user-visible accessible names; if a name is dynamic, assert on
  a stable substring/regex rather than the whole string.
- For repeated setup beyond `beforeEach`, extend `test` with a fixture rather
  than copy-pasting setup across specs.

## 8. Pre-finish checklist

Before declaring a test done, verify:

- [ ] Locators chosen from a live MCP snapshot, following the priority order
- [ ] No `waitForTimeout`, no `networkidle`
- [ ] Assertions are web-first / auto-retrying and use specific matchers
- [ ] Test is independent and parallel-safe
- [ ] Section with >~3 interactions uses a POM class in `tests/pages/`
- [ ] Relative `goto('/')`, describe/beforeEach structure followed
- [ ] Spec passes: `npx playwright test tests/<file>.spec.ts`
