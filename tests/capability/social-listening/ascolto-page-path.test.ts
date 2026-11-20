import { describe, expect, it } from 'vitest';
import {
  SOCIAL_ASCOLTO_PAGE_PATH,
  socialAscoltoPagePath,
} from '../../../src/capability/social-listening/tools.js';

describe('social Ascolto page path', () => {
  it('(a) exposes the shared path template', () => {
    expect(SOCIAL_ASCOLTO_PAGE_PATH).toBe('/agents/{slug}/ascolto');
  });

  it('(b) encodes valid slugs exactly once', () => {
    expect(socialAscoltoPagePath('x9')).toBe('/agents/x9/ascolto');
    expect(socialAscoltoPagePath('agente prova')).toBe('/agents/agente%20prova/ascolto');
    expect(socialAscoltoPagePath('東京')).toBe('/agents/%E6%9D%B1%E4%BA%AC/ascolto');
    expect(socialAscoltoPagePath('a%20b')).toBe('/agents/a%2520b/ascolto');
    expect(socialAscoltoPagePath('x')).toBe('/agents/x/ascolto');
    expect(socialAscoltoPagePath('x'.repeat(100))).toBe(`/agents/${'x'.repeat(100)}/ascolto`);
  });

  it('(c) rejects invalid slugs without throwing or coercing objects', () => {
    const throwingObject = {
      get toString() {
        throw new Error('The slug must not be coerced');
      },
    };
    const invalid: unknown[] = [
      '', '.', '..', 'a/b', 'a\\b', '%2e%2e', '%2E%2E', '%2e', '.%2e', '%2E.',
      'x'.repeat(101), 42, null, undefined, throwingObject,
      'a\u0000b', 'a\nb', 'a\rb', 'a\tb', 'a\u001fb', 'a\u007fb', 'a\u0085b', 'a\u009fb',
      '\ud800', '\udfff',
    ];
    for (const slug of invalid) {
      expect(socialAscoltoPagePath(slug)).toBeNull();
    }
  });

  it('(d) preserves the encoded agent path when resolved against a base URL', () => {
    for (const [slug, pathname] of [
      ['x9', '/agents/x9/ascolto'],
      ['agente prova', '/agents/agente%20prova/ascolto'],
    ]) {
      const path = socialAscoltoPagePath(slug);
      expect(path).not.toBeNull();
      expect(new URL(path!, 'https://forge.example').pathname).toBe(pathname);
    }
  });
});
