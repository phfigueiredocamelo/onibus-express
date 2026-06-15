# Frontend E2E Booking Flow Design

Date: 2026-06-15

## Goal

Add frontend-only end-to-end browser coverage for the primary booking journey so the app is validated through real navigation, forms, and route transitions without depending on backend runtime orchestration.

## Scope

In scope:

- Browser-based test coverage for `search -> seat -> checkout -> success`.
- Playwright as the end-to-end test runner inside `frontend/`.
- Mocked API responses at the browser network boundary.
- Shared fixtures for trips, trip detail, reservation creation, and reservation lookup.
- Developer documentation for running the E2E suite locally.

Out of scope:

- Real backend integration in E2E.
- Docker-backed E2E orchestration.
- Reservation lookup and cancellation E2E scenarios.
- Validation-only and failure-state E2E scenarios already covered by RTL tests.

## Current Context

The frontend already has strong React Testing Library coverage for page-level behavior, including search, seat selection, checkout validation, success loading, and reservation lookup. What it does not have is a real browser harness that verifies route transitions, button states, and multi-screen persistence through the booking context under a realistic navigation flow.

The app loads data through `frontend/src/services/api.ts`, which uses `fetch` against `VITE_API_BASE_URL` and maps backend payloads into frontend DTOs. This is a good seam for frontend-only E2E because Playwright can intercept the network calls without introducing test-only application branches.

## Approach

Use Playwright against the frontend app and intercept the API requests with route handlers:

- `GET /viagens?origem=&destino=&data=` returns one matching trip.
- `GET /viagens/:id` returns seat-map details for that trip.
- `POST /reservas` returns a created reservation payload.
- `GET /reservas/:codigo` returns the reservation used by the success screen.

This keeps the browser test close to production behavior:

- the router remains real
- the booking context remains real
- forms remain real
- the API contract remains realistic

At the same time, the dataset stays deterministic and fast because the backend is not part of the test runtime.

## Test Architecture

### Tooling

- Add `@playwright/test` as a frontend dev dependency.
- Add scripts for running E2E tests and installing Playwright browsers.
- Create `frontend/playwright.config.ts` with:
  - `testDir` pointing at `e2e`
  - `baseURL` set to the local frontend URL
  - `webServer` using `npm run dev -- --host 127.0.0.1 --port 4173`
  - `reuseExistingServer` enabled outside CI

### File Layout

- `frontend/playwright.config.ts`
  - Playwright runtime config.
- `frontend/e2e/fixtures.ts`
  - Shared browser-test fixtures and mock payloads.
- `frontend/e2e/mock-api.ts`
  - Playwright route interception helper for the booking scenario.
- `frontend/e2e/booking-flow.spec.ts`
  - Happy-path booking flow test.

### Mocking Strategy

Keep the API mocks centralized and data-driven instead of writing inline route handlers in each spec. The helper should:

- intercept only requests to the configured API host
- match paths robustly using `URL`
- return JSON payloads consistent with the backend contract already consumed by `frontend/src/services/api.ts`
- fail loudly if the app calls an unexpected booking endpoint during the scenario

This structure keeps future E2E cases easy to add without duplicating payload logic.

## Scenario Contract

The first E2E test covers one successful reservation journey:

1. Open `/buscar`.
2. Fill origin, destination, and date.
3. Submit and wait for the trip card to appear.
4. Open seat selection from the search result.
5. Confirm at least one occupied seat is disabled.
6. Select a free seat and confirm the continue button becomes enabled.
7. Continue to checkout.
8. Fill passenger name, CPF, and email.
9. Submit the reservation.
10. Confirm redirect to `/reservas/sucesso/:codigo`.
11. Verify reservation code, passenger name, seat number, trip label, and active status.

## Assertions

The test should assert user-visible behavior, not implementation details:

- the result card renders the mocked route and seat availability
- navigation lands on the expected seat-selection path
- occupied seats cannot be chosen
- selected seat state is reflected in the summary
- checkout receives the chosen trip and seat through the real booking context
- success page loads data through the lookup request and displays the reservation details

## Error Handling

The initial E2E slice intentionally excludes negative-path assertions. Those cases already exist in unit and integration-style frontend tests. Keeping the first browser spec focused on the golden path reduces flakiness and gives the project a dependable base that can be expanded later.

If the app issues an unexpected request during this scenario, the mock helper should return a failing status so the test reveals contract drift early.

## Testing Strategy

Implementation will follow TDD:

1. Add the E2E spec first.
2. Run the spec and observe the failing state because Playwright is not yet configured.
3. Add the minimal Playwright config, scripts, and mock helpers.
4. Re-run the spec until the booking flow passes.
5. Run the full frontend test suite plus the new E2E suite.

## Documentation

Update `frontend/README.md` with:

- how to install Playwright browsers
- how to run the E2E suite
- what the frontend-only E2E scope covers

## Success Criteria

The work is successful when:

- `frontend` can run a Playwright E2E suite locally
- one browser test covers the booking happy path from search through success
- the scenario does not depend on the backend being started
- existing frontend tests continue to pass
- the README explains how teammates can run the new suite
