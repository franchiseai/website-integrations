import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function firstPage(page: Page) {
  await page.getByLabel('First name', { exact: false }).fill('Alex');
  await page.getByLabel('Last name', { exact: false }).fill('Rivera');
  await page.getByLabel('Email *', { exact: true }).fill('alex@example.com');
  await page
    .getByLabel('Where would you like to open?', { exact: false })
    .fill('Austin');
  await page.getByRole('radio', { name: '6–12 months', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: false }).click();
}
async function finish(page: Page) {
  await page.getByRole('radio', { name: '$250k–$500k', exact: true }).check();
  await page.getByRole('radio', { name: 'Yes, I have', exact: true }).check();
  await page.getByRole('button', { name: 'Find my next step' }).click();
}

for (const design of ['01 Common Table', '02 Pulse']) {
  test(`${design}: qualification, validation, continuation and mobile layout`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: design, exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: false }).click();
    await expect(page.getByText('First name is required.')).toBeVisible();
    await firstPage(page);
    await finish(page);
    await expect(
      page.getByRole('heading', { name: 'This could be your next chapter.' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Email my next step' }).click();
    await expect(
      page.getByRole('heading', { name: 'Check your inbox.' })
    ).toBeVisible();
    await expect(
      page.getByText('Demo preview · No email was sent.')
    ).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(
      page.getByRole('heading', { name: 'First, the big picture.' })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
}

test('switching presentation preserves answers without changing the page URL', async ({
  page,
}) => {
  await page.goto('/?utm_source=agency');
  await page.getByLabel('First name', { exact: false }).fill('Alex');
  await page.getByRole('button', { name: '02 Pulse', exact: true }).click();
  await expect(page.getByLabel('First name', { exact: false })).toHaveValue(
    'Alex'
  );
  await expect(page).toHaveURL('/?utm_source=agency');
});

test('not-qualified, returning and recovery scenarios', async ({ page }) => {
  await page.goto('/');
  await page
    .getByLabel('Scenario', { exact: true })
    .selectOption('not_qualified');
  await firstPage(page);
  await finish(page);
  await expect(
    page.getByRole('heading', { name: 'Let’s keep the conversation going.' })
  ).toBeVisible();
  await page.getByLabel('Scenario', { exact: true }).selectOption('returning');
  await firstPage(page);
  await expect(
    page.getByRole('heading', { name: 'Check your inbox.' })
  ).toBeVisible();
  await page
    .getByLabel('Scenario', { exact: true })
    .selectOption('submission_error');
  await firstPage(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('First name', { exact: false })).toHaveValue(
    'Alex'
  );
  await page.getByRole('button', { name: 'Continue', exact: false }).click();
  await expect(
    page.getByRole('heading', { name: 'Let’s find your fit.' })
  ).toBeVisible();
  await page
    .getByLabel('Scenario', { exact: true })
    .selectOption('unavailable');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'First, the big picture.' })
  ).toBeVisible();
});

test('saved answers recover from a progress failure without reopening the form', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Scenario', { exact: true })
    .selectOption('progress_error');
  await firstPage(page);
  await finish(page);
  await expect(
    page.getByRole('heading', { name: 'Your answers are saved.' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retry continuation' }).click();
  await expect(
    page.getByRole('heading', { name: 'This could be your next chapter.' })
  ).toBeVisible();
});
