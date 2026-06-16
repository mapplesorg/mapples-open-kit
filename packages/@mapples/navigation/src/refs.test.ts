/// <reference types="jest" />
import { isRef, parseRef } from './refs';

describe('refs', () => {
  it('parses a well-formed ref', () => {
    expect(parseRef('ref(theme:abc-123:primary.main)')).toEqual({
      type: 'theme',
      uuid: 'abc-123',
      name: 'primary.main',
    });
  });

  it('parses an icon ref with a dotted name', () => {
    expect(parseRef('ref(icon:u1:home.filled)')).toEqual({
      type: 'icon',
      uuid: 'u1',
      name: 'home.filled',
    });
  });

  it('returns null for non-refs', () => {
    expect(parseRef('#ff0000')).toBeNull();
    expect(parseRef(undefined)).toBeNull();
    expect(parseRef('ref(broken)')).toBeNull();
  });

  it('isRef honours the optional type filter', () => {
    expect(isRef('ref(theme:u:p)')).toBe(true);
    expect(isRef('ref(theme:u:p)', 'theme')).toBe(true);
    expect(isRef('ref(theme:u:p)', 'icon')).toBe(false);
    expect(isRef('#fff', 'theme')).toBe(false);
  });
});
