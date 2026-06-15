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
