import { test, expect, type Page } from '@playwright/test';
async function property(page: Page) {
  await page.getByLabel('Local team').selectOption('location-1');
  await page.getByLabel('Your name').fill('Alex');
  await page.getByLabel('Email', { exact: true }).fill('alex@example.ca');
  await page.getByLabel('Property type').selectOption('Condominium');
  await page.getByLabel('Property address').fill('100 King Street');
}
test('property retry retains its receipt, repeat request and mobile profile', async ({
  page,
}) => {
  await page.goto('/?offerings');
  await page.getByLabel('Scenario').selectOption('retry');
  await property(page);
  await expect(
    page.getByRole('heading', { name: 'Toronto Central' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Response lost');
  await page.getByRole('button', { name: 'Retry the same enquiry' }).click();
  await expect(
    page.getByText('Your reference is receipt-1.', { exact: false })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Make another enquiry' }).click();
  await property(page);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(
    page.getByText('Your reference is receipt-2.', { exact: false })
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});
test('changed form preserves compatible answers and requires review', async ({
  page,
}) => {
  await page.goto('/?offerings');
  await page.getByLabel('Scenario').selectOption('form_changed');
  await property(page);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await page
    .getByRole('button', { name: 'Reload form and review answers' })
    .click();
  await expect(page.getByLabel('Property address')).toHaveValue(
    '100 King Street'
  );
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByText('Required', { exact: true })).toBeVisible();
  await page.getByLabel('Additional details').fill('Call in the afternoon');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Thank you. We received your enquiry.' })
  ).toBeVisible();
});
test('catering uses the same contract and unmatched routing goes to head office', async ({
  page,
}) => {
  await page.goto('/?offerings');
  await page
    .getByRole('combobox', { name: 'Example', exact: true })
    .selectOption('catering');
  await page.getByLabel('Scenario').selectOption('unmatched_address');
  await page.getByLabel('Street address').fill('100 King Street');
  await page.getByLabel('City', { exact: true }).fill('Toronto');
  await page.getByLabel('Postal code').fill('M5H 1J9');
  await page.getByRole('button', { name: 'Find my team' }).click();
  await expect(
    page.getByText('Head office will help find the right team.')
  ).toBeVisible();
  await page.getByLabel('Your name').fill('Alex');
  await page.getByLabel('Email', { exact: true }).fill('alex@example.ca');
  await page.getByLabel('Number of guests').fill('50');
  await page.getByLabel('Preferred event date').fill('2026-12-15');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Thank you. We received your enquiry.' })
  ).toBeVisible();
});
