import { Page, Locator, Request, expect } from '@playwright/test';

/**
 * Page Object for the "Get in Touch" contact form.
 *
 * Locators are resolved once here (getByRole / getByLabel only — verified
 * against the live accessibility tree). Submission goes to a Supabase edge
 * function that emails the real teacher, so `mockSubmission()` must be called
 * before any test that clicks "Send Message" with valid data.
 */
export class ContactFormPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly fullName: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly message: Locator;
  readonly timeOfDay: Locator;
  readonly datePicker: Locator;
  readonly submit: Locator;
  readonly successToast: Locator;

  /** Requests captured by `mockSubmission()` (none reach the real backend). */
  submissionRequests: Request[] = [];

  /** Endpoint the form POSTs to — stubbed so no real email is ever sent. */
  static readonly SUBMIT_URL = '**/functions/v1/send-contact';

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Get in Touch' });
    this.fullName = page.getByRole('textbox', { name: 'Full Name' });
    this.email = page.getByRole('textbox', { name: 'Email Address' });
    this.phone = page.getByRole('textbox', { name: 'Phone Number' });
    this.message = page.getByRole('textbox', { name: 'Your Message' });
    this.timeOfDay = page.getByLabel('Preferred Time of Day');
    // The trigger's accessible name changes to the chosen date once a date is
    // picked, so a name-based locator would go stale by design. `.contact-date-trigger`
    // is a stable, intentional class hook (not an auto-generated hash).
    this.datePicker = page.locator('button.contact-date-trigger');
    this.submit = page.getByRole('button', { name: 'Send Message' });
    this.successToast = page.getByText('Your message has been sent');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.heading).toBeVisible();
  }

  async fill(data: {
    fullName?: string;
    email?: string;
    phone?: string;
    message?: string;
  }): Promise<void> {
    if (data.fullName !== undefined) await this.fullName.fill(data.fullName);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.phone !== undefined) await this.phone.fill(data.phone);
    if (data.message !== undefined) await this.message.fill(data.message);
  }

  /** Select a "Preferred Time of Day" option by its visible label. */
  async selectTime(label: string): Promise<void> {
    await this.timeOfDay.selectOption({ label });
  }

  /** The currently selected time-of-day option. */
  selectedTime(): Locator {
    return this.timeOfDay.locator('option:checked');
  }

  /**
   * Open the date-picker popover, move to next month, and pick a fixed day.
   * Next month + day 15 is always selectable regardless of the run date
   * (avoids the "past dates are disabled" trap).
   */
  async pickNextMonthMidDate(): Promise<void> {
    await this.datePicker.click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Go to next month' }).click();
    await dialog.getByRole('gridcell', { name: '15', exact: true }).click();
    await expect(dialog).toBeHidden();
  }

  /**
   * Intercept the submission POST and fulfil a fake 200 so the success path
   * is exercised without contacting the backend / emailing the teacher.
   */
  async mockSubmission(): Promise<void> {
    this.submissionRequests = [];
    await this.page.route(ContactFormPage.SUBMIT_URL, async (route) => {
      this.submissionRequests.push(route.request());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });
  }

  async submitForm(): Promise<void> {
    await this.submit.click();
  }
}
