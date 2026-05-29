# english_ats — Playwright Automated Test Suite

## Project Overview

Automated tests for the English tutoring website of Stojanka Mirković.

- **Target URL:** https://engleskisastojankom.lovable.app/
- **Stack:** Node.js, TypeScript, @playwright/test, Chromium
- **Type:** Single-page application (static content, anchor-based navigation)

---

## Key Commands

```bash
npm test                          # run all tests headless
npm run test:ui                   # open Playwright UI mode
npm run test:report               # open HTML report after a run
npx playwright test --headed      # run with visible browser
npx playwright test <file>        # run a single spec file
```

---

## Website Under Test

### Structure

Single-page app with 7 anchor sections reachable from the main navigation:

| Section | Anchor |
|---|---|
| Home | #home |
| About | #about |
| Why English | #why-english |
| Lessons | #lessons |
| Gallery | #gallery |
| Testimonials | #testimonials |
| Contact | #contact |

### Language Toggle

Header contains a 3-option toggle: **EN** / **SR** / **СР** (Cyrillic).
Switching language changes all visible text on the page.

### CTA Buttons

- **"Get in Touch"** — scrolls to Contact section
- **"Learn More"** — scrolls to Lessons section

### Contact Form

| Field | Type | Required |
|---|---|---|
| Full Name | text input | yes (*) — min 2 chars |
| Email Address | email input | conditional — email **or** phone required |
| Phone Number | text input (+387 prefix) | conditional — email **or** phone required |
| Your Message | textarea | yes (*) — min 10 chars |
| Preferred Date | date picker ("Pick a date...") | no |
| Preferred Time of Day | dropdown | no |

> The message field's accessible name is **"Your Message *"** (not "Message").
> Validation is client-side (react-hook-form) with inline error paragraphs:
> - `Name must be at least 2 characters.`
> - `Message must be at least 10 characters.`
> - `Please provide either an email address or a phone number.`
>
> Submission POSTs to a Supabase edge function (`/functions/v1/send-contact`)
> that emails the real teacher — **always mock it** in tests (`page.route`).
> Success toast: `Thank you! Your message has been sent. Stojanka will get back to you soon.`

**Time of Day options:**
- Morning (08:00–12:00)
- Afternoon (12:00–17:00)
- Evening (17:00–21:00)

**Submit button:** "Send Message"

### External Contact Links

| Type | Value |
|---|---|
| Phone | tel:+38765709211 |
| Email | mailto:mirkovic.stojanka@yahoo.com |
| Viber | Viber messaging link |
| WhatsApp | WhatsApp messaging link |

### Key Assertion Strings (English)

```
"Unlock the World Through English"   ← hero heading
"About the Teacher"
"Why English Matters"
"Lessons & Services"
"Learning Moments"
"What Our Students Say"
"Get in Touch"
```

### Service Categories

- Elementary (ages 6–14)
- High School (ages 15–19)
- Adults / Professionals (ages 20+)

### Testimonials

6 student reviews are displayed in the Testimonials section.

---

## Playwright Conventions

### Locator Priority

Use locators in this order — most resilient first:

1. `getByRole()` — semantic, preferred
2. `getByLabel()` — for form fields
3. `getByText()` — for visible text content
4. `getByPlaceholder()` — for inputs with placeholder text
5. CSS selector — last resort only

**Never use:** `page.waitForTimeout()`, XPath selectors, or bare index locators like `.nth(0)` unless there is no alternative.

### Test Structure

```ts
import { test, expect } from '@playwright/test';

test.describe('Section or feature name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('test name describes expected behaviour', async ({ page }) => {
    // ...
  });
});
```

- One `describe` block per section or feature area
- `beforeEach` navigates to baseURL — tests do not rely on prior test state
- Each test is fully independent — no shared mutable state between tests
- Group related assertions in one test rather than writing one assertion per test

### Assertions

Use Playwright's built-in auto-retry assertions:

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText('...');
await expect(locator).toHaveValue('...');
await expect(page).toHaveTitle(/pattern/);
await expect(page).toHaveURL(/pattern/);
```

Prefer specific matchers (`toBeVisible`, `toHaveText`) over generic ones (`toBeTruthy`).

### File Naming

```
tests/
  navigation.spec.ts       # menu links, section scroll, CTA buttons
  contact-form.spec.ts     # valid submission, validation, date/time
  language-toggle.spec.ts  # EN/SR/СР switching
  content.spec.ts          # headings, testimonials, service cards, gallery
  links.spec.ts            # external contact link hrefs
  pages/                   # Page Object Model classes
```

### Page Object Model

Use a POM class for any page section that has more than ~3 interactions. Store classes in `tests/pages/`. Example: `tests/pages/ContactFormPage.ts`.

### baseURL

`baseURL` is set in `playwright.config.ts`. Tests always use relative paths:

```ts
await page.goto('/');       // correct
await page.goto('https://engleskisastojankom.lovable.app/');  // avoid
```
