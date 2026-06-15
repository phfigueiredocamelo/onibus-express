import { describe, expect, it } from 'vitest';
import { getDateInputValue } from './date';

describe('date helper', () => {
  it('returns an input-friendly date string', () => {
    expect(getDateInputValue(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
