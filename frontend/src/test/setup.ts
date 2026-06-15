import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});

Object.assign(globalThis, {
  Request: window.Request,
  Response: window.Response,
  Headers: window.Headers,
  AbortController: window.AbortController,
  AbortSignal: window.AbortSignal,
});
