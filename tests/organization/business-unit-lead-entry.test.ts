import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const entry = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../dist/organization/business-unit-lead.js',
);

const SPECIFIER = /(?:from\s*|import\s*\(?\s*|import\s+|require\(\s*)['"]([^'"]+)['"]/g;
const FORBIDDEN = /^(node:.*|fs|path|crypto|os|child_process)(\/.*)?$/;

function collect(file: string, seen: Map<string, string[]>): void {
  if (seen.has(file)) return;
  const source = readFileSync(file, 'utf8');
  const specifiers = [...source.matchAll(SPECIFIER)].map((m) => m[1] as string);
  seen.set(file, specifiers);
  for (const spec of specifiers) {
    if (spec.startsWith('./') || spec.startsWith('../')) {
      collect(resolve(dirname(file), spec), seen);
    }
  }
}

describe('./organization/business-unit-lead entry', () => {
  it('has a built dist file', () => {
    expect(existsSync(entry)).toBe(true);
  });

  it('reaches no node builtin, directly or through relative imports', () => {
    const graph = new Map<string, string[]>();
    collect(entry, graph);
    const offenders = [...graph].flatMap(([file, specs]) =>
      specs.filter((s) => FORBIDDEN.test(s)).map((s) => `${file}: ${s}`),
    );
    expect(graph.size).toBeGreaterThan(1);
    expect(offenders).toEqual([]);
  });

  it('exports the birth request and result schemas', async () => {
    const mod = await import(entry);
    expect(mod.BusinessUnitLeadBirthRequestSchema).toBeDefined();
    expect(mod.BusinessUnitLeadBirthResultSchema).toBeDefined();
  });
});
