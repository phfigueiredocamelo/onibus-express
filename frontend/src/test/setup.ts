import '@testing-library/jest-dom/vitest';

Object.assign(globalThis, {
  Request: window.Request,
  Response: window.Response,
  Headers: window.Headers,
  AbortController: window.AbortController,
  AbortSignal: window.AbortSignal,
});
