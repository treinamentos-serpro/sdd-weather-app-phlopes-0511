import { test, expect } from '@playwright/test';

test('fluxo completo: buscar → clima atual → previsão → trocar unidade', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('São Paulo');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: /previsão de 5 dias/i })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);

  // 22.4 °C é exibido como 22° e convertido para 72 °F.
  await expect(page.getByText('22°')).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('72°')).toBeVisible();
});

test('estado vazio quando a cidade não existe', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.fulfill({ json: {} }));
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('xyzxyz');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/nenhuma cidade encontrada/i)).toBeVisible();
});

test('viewport mobile renderiza o fluxo principal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('São Paulo');
  await page.getByRole('button', { name: /buscar/i }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
});

test('não há overflow horizontal nos viewports suportados', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/buscar cidade/i).fill('São Paulo');
  await page.getByRole('button', { name: /buscar/i }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();

  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth, `overflow horizontal em ${width}px`).toBeLessThanOrEqual(
      dimensions.clientWidth,
    );
    await expect(page.getByLabel(/buscar cidade/i)).toBeVisible();
    await expect(page.getByRole('group', { name: /unidade de temperatura/i })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(5);
  }
});
