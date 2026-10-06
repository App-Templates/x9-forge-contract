import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const root = new URL('../../', import.meta.url);
const baseline = JSON.parse(readFileSync(new URL('bridge-128-exports.json', import.meta.url), 'utf8')) as Record<string, {
  targets: { types: string; import: string; require: string }; source: string; symbols: string[];
}>;
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as {
  version: string; exports: Record<string, { types: string; import: string; require: string }>;
  zshy: { exports: Record<string, string> };
};
describe('v1.29 additive distribution', () => {
  it('uses the coordinated 1.29.0 proposal version', () => {
    expect(pkg.version).toBe('1.29.0');
  });
  for (const [key, previous] of Object.entries(baseline)) {
    it('preserves old targets and symbols at ' + key, async () => {
      expect(pkg.exports[key]).toEqual(previous.targets);
      expect(pkg.zshy.exports[key]).toBe(previous.source);
      const esm = await import(new URL(previous.targets.import, root).href) as Record<string, unknown>;
      const cjs = createRequire(import.meta.url)(new URL(previous.targets.require, root).pathname) as Record<string, unknown>;
      for (const name of previous.symbols) {
        expect(name in esm, 'ESM ' + key + ':' + name).toBe(true);
        expect(name in cjs, 'CJS ' + key + ':' + name).toBe(true);
      }
    });
  }
});
