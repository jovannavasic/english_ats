import { test, expect } from '@playwright/test';
import { ContactFormPage } from './pages/ContactFormPage';

test.describe('Contact form', () => {
  let form: ContactFormPage;

  test.beforeEach(async ({ page }) => {
    form = new ContactFormPage(page);
    await form.goto();
  });

  test('renders all fields and the submit button', async () => {
    await expect(form.fullName).toBeVisible();
    await expect(form.email).toBeVisible();
    await expect(form.phone).toBeVisible();
    await expect(form.message).toBeVisible();
    await expect(form.datePicker).toBeVisible();
    await expect(form.timeOfDay).toBeVisible();
    await expect(form.submit).toBeVisible();
  });

  test('accepts input and reflects entered values', async () => {
    await form.fill({
      fullName: 'Test Automation User',
      email: 'qa@example.com',
      phone: '65123456',
      message: 'This is an automated end-to-end test message for the contact form.',
    });

    await expect(form.fullName).toHaveValue('Test Automation User');
    await expect(form.email).toHaveValue('qa@example.com');
    await expect(form.phone).toHaveValue('65123456');
    await expect(form.message).toHaveValue(
      'This is an automated end-to-end test message for the contact form.',
    );
  });

  test('time-of-day dropdown exposes the expected options and reflects selection', async () => {
    await expect(form.timeOfDay.locator('option')).toHaveText([
      'Select a time...',
      'Morning (08:00–12:00)',
      'Afternoon (12:00–17:00)',
      'Evening (17:00–21:00)',
    ]);

    await form.selectTime('Afternoon (12:00–17:00)');
    await expect(form.selectedTime()).toHaveText('Afternoon (12:00–17:00)');
  });

  test('date picker opens a calendar and sets the chosen date', async () => {
    await form.pickNextMonthMidDate();

    await expect(form.datePicker).not.toHaveText('Pick a date...');
  });

  test('blocks submission and shows validation errors when required fields are empty', async () => {
    await form.submitForm();

    await expect(
      form.page.getByText('Name must be at least 2 characters.'),
    ).toBeVisible();
    await expect(
      form.page.getByText('Message must be at least 10 characters.'),
    ).toBeVisible();
    await expect(
      form.page.getByText('Please provide either an email address or a phone number.'),
    ).toBeVisible();
    await expect(form.successToast).toBeHidden();
  });

  test('requires either an email or a phone number even when name and message are valid', async () => {
    await form.fill({
      fullName: 'Test Automation User',
      message: 'This is an automated end-to-end test message for the contact form.',
    });

    await form.submitForm();

    await expect(
      form.page.getByText('Please provide either an email address or a phone number.'),
    ).toBeVisible();
    await expect(form.successToast).toBeHidden();
  });

  test('submits successfully with valid data (backend mocked, no real email)', async () => {
    await form.mockSubmission();

    await form.fill({
      fullName: 'Test Automation User',
      email: 'qa@example.com',
      message: 'This is an automated end-to-end test message for the contact form.',
    });
    await form.selectTime('Morning (08:00–12:00)');
    await form.submitForm();

    await expect(form.successToast).toBeVisible();
    expect(form.submissionRequests).toHaveLength(1);

    const body = form.submissionRequests[0].postDataJSON();
    expect(body).toMatchObject({
      fullName: 'Test Automation User',
      email: 'qa@example.com',
      message: 'This is an automated end-to-end test message for the contact form.',
    });
  });
});
