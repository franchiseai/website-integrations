import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function introduction(page: Page) {
  await page.getByLabel('First name', { exact: true }).fill('Alex');
  await page.getByLabel('Last name', { exact: true }).fill('Rivera');
  await page
    .getByLabel('Email address', { exact: true })
    .fill('alex@example.com');
  await page
    .getByLabel('Where would you like to open?', { exact: true })
    .fill('Austin');
  await page
    .getByLabel('When are you thinking?', { exact: true })
    .selectOption('Within 6 months');
  await page.getByRole('button', { name: 'Choose how to continue' }).click();
}
async function signup(page: Page) {
  await page
    .getByLabel('Create a password', { exact: true })
    .fill('DemoOnlyPass!42');
  await page
    .getByRole('button', { name: 'Create account & send confirmation' })
    .click();
}

test('Portal password + email handoff stays local and survives design changes', async ({
  page,
}) => {
  const mutations: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') mutations.push(request.url());
  });
  await page.goto('/?flow=portal');
  await page.getByRole('button', { name: 'Choose how to continue' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await introduction(page);
  await page.getByRole('button', { name: 'Midnight', exact: true }).click();
  await expect(
    page.getByText('alex@example.com', { exact: true })
  ).toBeVisible();
  await signup(page);
  await expect(
    page.getByRole('heading', { name: 'Your next chapter is in your inbox.' })
  ).toBeVisible();
  await expect(page.locator('input[type=password]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open demo inbox' }).click();
  await page
    .getByRole('button', { name: 'Simulate confirmation → Portal' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Welcome aboard, Alex.' })
  ).toBeVisible();
  expect(mutations).toEqual([]);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).some((key) =>
        /portal|password|token|enrollment/.test(key)
      )
    )
  ).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});

for (const provider of ['Google', 'LinkedIn']) {
  test(`Portal ${provider} cancellation and verified handoff`, async ({
    page,
  }) => {
    await page.goto('/?flow=portal');
    await introduction(page);
    await page
      .getByRole('button', { name: `Continue with ${provider}`, exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Cancel and return to options' })
      .click();
    await expect(
      page.getByText('alex@example.com', { exact: true })
    ).toBeVisible();
    await page
      .getByRole('button', { name: `Continue with ${provider}`, exact: true })
      .click();
    await page
      .getByRole('button', { name: `Simulate ${provider} return` })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Welcome aboard, Alex.' })
    ).toBeVisible();
  });
}
test('Portal mismatching provider preserves original email and offers password fallback', async ({
  page,
}) => {
  await page.goto('/?flow=portal');
  await page.getByLabel('Scenario', { exact: true }).selectOption('mismatch');
  await introduction(page);
  await page
    .getByRole('button', { name: 'Continue with Google', exact: true })
    .click();
  await page.getByRole('button', { name: 'Simulate Google return' }).click();
  await expect(
    page.getByRole('heading', { name: 'Let’s keep your details together.' })
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Use email and password instead' })
    .click();
  await signup(page);
  await page.getByRole('button', { name: 'Open demo inbox' }).click();
  await page
    .getByRole('button', { name: 'Simulate confirmation → Portal' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Welcome aboard, Alex.' })
  ).toBeVisible();
  await expect(page.getByText('different.person@example.com')).toHaveCount(0);
});
test('Portal existing account goes to hosted login, not a duplicate signup', async ({
  page,
}) => {
  await page.goto('/?flow=portal');
  await page.getByLabel('Scenario', { exact: true }).selectOption('returning');
  await introduction(page);
  await signup(page);
  await expect(
    page.getByRole('heading', { name: 'Your application is waiting.' })
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Simulate successful Portal login' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex.' })
  ).toBeVisible();
});
