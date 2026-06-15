import { expect, test } from '@playwright/test';
import { bookingFixtures } from './fixtures';
import { mockBookingApi } from './mock-api';

test('completes the booking flow from search to success', async ({ page }) => {
  await mockBookingApi(page);

  await page.goto('/buscar');

  await page.getByLabel('Origem').fill('Porto Alegre');
  await page.getByLabel('Destino').fill('Santa Maria');
  await page.getByLabel('Data').fill('2026-06-15');
  await page.getByRole('button', { name: 'Buscar viagens' }).click();

  await expect(page.getByText('Porto Alegre para Santa Maria')).toBeVisible();
  await expect(page.getByText('8 assentos livres')).toBeVisible();

  await page.getByRole('button', { name: 'Selecionar assento' }).click();
  await expect(page).toHaveURL(`/viagens/${bookingFixtures.trip.id}/assentos`);

  await expect(page.getByRole('button', { name: /Assento\s+2/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Continuar para checkout' })).toBeDisabled();

  await page.getByRole('button', { name: /Assento\s+7/i }).click();
  await expect(page.getByText('Selecionado:').locator('..')).toContainText('7');
  await expect(page.getByRole('button', { name: 'Continuar para checkout' })).toBeEnabled();

  await page.getByRole('button', { name: 'Continuar para checkout' }).click();
  await expect(page).toHaveURL('/checkout');
  await expect(page.getByText('Assento 7')).toBeVisible();

  await page.getByLabel('Nome completo').fill('Maria Silva');
  await page.getByLabel('CPF').fill('12345678909');
  await page.getByLabel('E-mail').fill('maria@example.com');
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();

  await expect(page).toHaveURL(`/reservas/sucesso/${bookingFixtures.reservation.code}`);
  await expect(page.getByText('Reserva confirmada')).toBeVisible();
  await expect(page.getByRole('heading', { name: `Código ${bookingFixtures.reservation.code}` })).toBeVisible();
  await expect(page.getByText('Maria Silva')).toBeVisible();
  await expect(page.getByText('Porto Alegre -> Santa Maria')).toBeVisible();
  await expect(page.getByText('active')).toBeVisible();
});
