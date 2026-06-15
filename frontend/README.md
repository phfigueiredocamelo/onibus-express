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
