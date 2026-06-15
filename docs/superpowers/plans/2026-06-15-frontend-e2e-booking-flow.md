# Frontend E2E Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add frontend-only Playwright coverage for the booking happy path from search through reservation success using mocked API responses.

**Architecture:** The frontend keeps using the existing `fetch`-based API client and real browser routing. Playwright will start the Vite app, intercept API requests at the network boundary, and drive the real UI through the booking flow with shared mocked payloads.

**Tech Stack:** React 18, TypeScript, Vite, Playwright, Vitest, React Testing Library.

---

## File Structure

- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/README.md`
- Create: `frontend/playwright.config.ts`
- Create: `frontend/e2e/fixtures.ts`
- Create: `frontend/e2e/mock-api.ts`
- Create: `frontend/e2e/booking-flow.spec.ts`

---

### Task 1: Add The Failing E2E Spec

**Files:**
- Create: `frontend/e2e/booking-flow.spec.ts`
- Test: `frontend/e2e/booking-flow.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/e2e/booking-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
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
  await expect(page).toHaveURL(/\/viagens\/trip-1\/assentos$/);

  await expect(page.getByRole('button', { name: /Assento 2/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Continuar para checkout' })).toBeDisabled();

  await page.getByRole('button', { name: /Assento 7/i }).click();
  await expect(page.getByText('Selecionado:').locator('..')).toContainText('7');
  await expect(page.getByRole('button', { name: 'Continuar para checkout' })).toBeEnabled();

  await page.getByRole('button', { name: 'Continuar para checkout' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByLabel('Nome completo').fill('Maria Silva');
  await page.getByLabel('CPF').fill('12345678909');
  await page.getByLabel('E-mail').fill('maria@example.com');
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();

  await expect(page).toHaveURL(/\/reservas\/sucesso\/ONB-12345$/);
  await expect(page.getByText('Reserva confirmada')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Codigo ONB-12345' })).toBeVisible();
  await expect(page.getByText('Maria Silva')).toBeVisible();
  await expect(page.getByText('Porto Alegre -> Santa Maria')).toBeVisible();
  await expect(page.getByText('active')).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:e2e -- booking-flow.spec.ts
```

Expected: FAIL because Playwright is not installed or configured yet.

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/booking-flow.spec.ts
git commit -m "test: add failing booking flow e2e spec"
```

---

### Task 2: Add Playwright Tooling And Mock Helpers

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/playwright.config.ts`
- Create: `frontend/e2e/fixtures.ts`
- Create: `frontend/e2e/mock-api.ts`
- Test: `frontend/e2e/booking-flow.spec.ts`

- [ ] **Step 1: Add Playwright dependencies and scripts**

Update `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:install": "playwright install chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.2"
  }
}
```

- [ ] **Step 2: Add Playwright config**

Create `frontend/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/buscar',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

- [ ] **Step 3: Add booking fixtures**

Create `frontend/e2e/fixtures.ts`:

```ts
export const bookingFixtures = {
  trip: {
    id: 'trip-1',
    route: {
      id: 'route-1',
      origin: 'Porto Alegre',
      destination: 'Santa Maria',
      estimatedDuration: '04:35:00',
    },
    departureAt: '2026-06-15T07:30:00-03:00',
    basePrice: 142.9,
    totalSeats: 12,
    availableSeats: 8,
  },
  tripDetail: {
    id: 'trip-1',
    route: {
      id: 'route-1',
      origin: 'Porto Alegre',
      destination: 'Santa Maria',
      estimatedDuration: '04:35:00',
    },
    departureAt: '2026-06-15T07:30:00-03:00',
    basePrice: 142.9,
    totalSeats: 12,
    availableSeats: 8,
    seats: [
      { seatNumber: 1, status: 'Available' },
      { seatNumber: 2, status: 'Occupied' },
      { seatNumber: 3, status: 'Occupied' },
      { seatNumber: 4, status: 'Available' },
      { seatNumber: 5, status: 'Available' },
      { seatNumber: 6, status: 'Available' },
      { seatNumber: 7, status: 'Available' },
      { seatNumber: 8, status: 'Available' },
    ],
  },
  reservation: {
    id: 'reservation-1',
    tripId: 'trip-1',
    seatNumber: 7,
    status: 'Active',
    code: 'ONB-12345',
    createdAt: '2026-06-01T10:00:00-03:00',
    cancelledAt: null,
    passenger: {
      id: 'passenger-1',
      fullName: 'Maria Silva',
      cpf: '12345678909',
      email: 'maria@example.com',
      birthDate: null,
    },
  },
};
```

- [ ] **Step 4: Add API mock helper**

Create `frontend/e2e/mock-api.ts`:

```ts
import type { Page, Route } from '@playwright/test';
import { bookingFixtures } from './fixtures';

const apiBaseUrl = 'http://localhost:8080';

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockBookingApi(page: Page) {
  await page.route(`${apiBaseUrl}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'GET' && url.pathname === '/viagens') {
      return json(route, [bookingFixtures.trip]);
    }

    if (request.method() === 'GET' && url.pathname === `/viagens/${bookingFixtures.trip.id}`) {
      return json(route, bookingFixtures.tripDetail);
    }

    if (request.method() === 'POST' && url.pathname === '/reservas') {
      return json(route, bookingFixtures.reservation, 201);
    }

    if (request.method() === 'GET' && url.pathname === `/reservas/${bookingFixtures.reservation.code}`) {
      return json(route, bookingFixtures.reservation);
    }

    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'unexpected_request',
        message: `Unexpected request: ${request.method()} ${url.pathname}`,
      }),
    });
  });
}
```

- [ ] **Step 5: Install dependencies and run the test**

Run:

```bash
npm install
npm run test:e2e:install
npm run test:e2e -- booking-flow.spec.ts
```

Expected: the test runs and may still fail on selector or assertion mismatches, but Playwright starts successfully.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/playwright.config.ts frontend/e2e
git commit -m "test: add playwright booking flow harness"
```

---

### Task 3: Make The Booking Flow Pass

**Files:**
- Modify: `frontend/e2e/booking-flow.spec.ts`
- Modify: `frontend/e2e/mock-api.ts`
- Test: `frontend/e2e/booking-flow.spec.ts`

- [ ] **Step 1: Adjust the spec to match accessible UI text exactly**

Update `frontend/e2e/booking-flow.spec.ts`:

```ts
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
  await expect(page.getByRole('heading', { name: `Codigo ${bookingFixtures.reservation.code}` })).toBeVisible();
  await expect(page.getByText('Maria Silva')).toBeVisible();
  await expect(page.getByText('Porto Alegre -> Santa Maria')).toBeVisible();
  await expect(page.getByText('active')).toBeVisible();
});
```

- [ ] **Step 2: Ensure the mock helper tolerates encoded query strings and uppercase reservation lookup**

Update `frontend/e2e/mock-api.ts`:

```ts
import type { Page, Route } from '@playwright/test';
import { bookingFixtures } from './fixtures';

const apiBaseUrl = 'http://localhost:8080';

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockBookingApi(page: Page) {
  await page.route(`${apiBaseUrl}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'GET' && url.pathname === '/viagens') {
      return json(route, [bookingFixtures.trip]);
    }

    if (request.method() === 'GET' && url.pathname === `/viagens/${bookingFixtures.trip.id}`) {
      return json(route, bookingFixtures.tripDetail);
    }

    if (request.method() === 'POST' && url.pathname === '/reservas') {
      return json(route, bookingFixtures.reservation, 201);
    }

    if (
      request.method() === 'GET' &&
      url.pathname === `/reservas/${bookingFixtures.reservation.code.toUpperCase()}`
    ) {
      return json(route, bookingFixtures.reservation);
    }

    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'unexpected_request',
        message: `Unexpected request: ${request.method()} ${url.pathname}`,
      }),
    });
  });
}
```

- [ ] **Step 3: Run the E2E spec until it passes**

Run:

```bash
npm run test:e2e -- booking-flow.spec.ts
```

Expected: PASS with one booking-flow test in Chromium.

- [ ] **Step 4: Commit**

```bash
git add frontend/e2e/booking-flow.spec.ts frontend/e2e/mock-api.ts
git commit -m "test: cover frontend booking flow end to end"
```

---

### Task 4: Document And Verify The Frontend Test Surface

**Files:**
- Modify: `frontend/README.md`
- Test: `frontend/package.json`

- [ ] **Step 1: Update README**

Update `frontend/README.md`:

```md
# Frontend

React 18 + TypeScript + Vite frontend for the OniBus Express booking flow.

## Scripts

```bash
npm install
npm run dev
npm run build
npm test
npm run test:e2e:install
npm run test:e2e
```

## Test coverage

- `npm test`: component and page behavior with Vitest and React Testing Library
- `npm run test:e2e`: browser-based booking flow with Playwright and mocked API responses

## Routes

- `/` and `/buscar` - trip search
- `/viagens/:id/assentos` - seat selection
- `/checkout` - passenger details
- `/reservas/sucesso/:codigo` - reservation confirmation
- `/reservas` - reservation lookup
```

- [ ] **Step 2: Run verification**

Run:

```bash
npm test
npm run test:e2e
```

Expected: both the existing frontend suite and the new Playwright suite pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/README.md
git commit -m "docs: document frontend e2e workflow"
```
