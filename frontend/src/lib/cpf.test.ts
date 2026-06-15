import { describe, expect, it } from 'vitest';
import { isValidCpf, stripCpf } from './cpf';

describe('cpf helpers', () => {
  it('strips punctuation from cpf values', () => {
    expect(stripCpf('529.982.247-25')).toBe('52998224725');
  });

  it('accepts a valid cpf', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('rejects repeated digits', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });
});
