import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { constants, Script } from 'node:vm';
import { beforeAll, describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../..');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
type Mod = Record<string, unknown>;
type Mode = 'ESM' | 'CJS';
type Entry = Record<string, unknown> & { version: number };
type Result = { ok: boolean; code?: string; entry?: Entry; level?: string };
type Lookup = (input: unknown) => Result;
type Schema = { parse(value: unknown): Record<string, unknown> };

// Native Node loaders exercise emitted code without Vitest transforming its dependency graph.
const nativeImport = new Script('(specifier) => import(specifier)', {
  importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
}).runInThisContext() as (specifier: string) => Promise<Mod>;

const SUBPATHS = {
  organization: 'organization',
  map: 'organization/company-map',
  plan: 'organization/action-plan',
} as const;
type Name = keyof typeof SUBPATHS;
const load = async (mode: Mode, name: Name): Promise<Mod> => {
  const subpath = SUBPATHS[name];
  const exported = manifest.exports[`./${subpath}`] ?? manifest.exports['./organization/*'];
  const target = (mode === 'ESM' ? exported.import : exported.require).replace('*', subpath.slice('organization/'.length));
  const file = resolve(root, target);
  expect(file).toBe(resolve(root, `dist/${subpath === 'organization' ? 'organization/index' : subpath}.${mode === 'ESM' ? 'js' : 'cjs'}`));
  if (mode === 'CJS') {
    expect(require.resolve(`@x9-forge/contracts/${subpath}`)).toBe(file);
    return require(`@x9-forge/contracts/${subpath}`) as Mod;
  }
  return nativeImport(pathToFileURL(file).href);
};

const scope = { tenantId: '1', organizationId: 'good-choice', clientId: 'client-1', projectId: 'project-1', buSlug: 'design' };
const referent = { personRef: 'maria-verdi', entryVersion: 3 };
const levels = ['client', 'project', 'business_unit'] as const;
const hex = (char: string) => char.repeat(64);
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

// Test data rebuilt from the 8322 cases; the source tree is not the API under test.
const rawEntry = (level: string, version: number, changes: Record<string, unknown> = {}) => ({
  tenantId: scope.tenantId, organizationId: scope.organizationId, clientId: scope.clientId,
  level,
  ...(level !== 'client' ? { projectId: scope.projectId } : {}),
  ...(level === 'business_unit' ? { buSlug: scope.buSlug } : {}),
  kind: 'referent', personRef: referent.personRef,
  name: 'Maria Verdi', role: 'Owner', email: 'maria@example.com',
  version, supersedes: version - 1,
  digest: hex(version === 3 ? 'a' : 'b'),
  source: { kind: 'decision', requestId: version === 3 ? 'dec_3544a95d' : 'dec_d477c8de', planVersion: 2 },
  confirmedAt: version === 3 ? '2026-11-23T10:00:00Z' : '2026-11-24T10:00:00Z',
  ...changes,
});

for (const mode of ['ESM', 'CJS'] as const) {
  describe(`s8323 ${mode} referent comparison by content`, () => {
    const mods = {} as Record<Name, Mod>;
    beforeAll(async () => {
      for (const name of Object.keys(SUBPATHS) as Name[]) mods[name] = await load(mode, name);
    });
    const lookups = (): Lookup[] => [mods.organization, mods.map].map((m) => m.referentForUnit as Lookup);
    const entry = (level: string, version: number, changes: Record<string, unknown> = {}) =>
      (mods.map.CompanyMapEntrySchema as Schema).parse(rawEntry(level, version, changes)) as Entry;

    it(`s8323 ${mode} identical reconfirmation`, () => {
      for (const referentForUnit of lookups()) {
        expect(typeof referentForUnit).toBe('function');
        for (const level of levels) {
          const pointed = entry(level, 3);
          const current = entry(level, 4);
          for (const entries of [[pointed, current], [current, pointed]]) {
            const result = referentForUnit({ entries, scope, referent });
            expect(result).toEqual({ ok: true, entry: current, level });
            expect(result.entry).toBe(current);
          }
        }
      }
    });

    it(`s8323 ${mode} changed email`, () => {
      for (const referentForUnit of lookups()) {
        for (const level of levels) {
          const result = referentForUnit({
            entries: [entry(level, 3), entry(level, 4, { email: 'other@example.com' })], scope, referent,
          });
          expect(result).toEqual({ ok: false, code: 'referent_superseded' });
          expect(result.ok).toBe(false);
          expect(result.entry).toBeUndefined();
        }
      }
    });

    it(`s8323 ${mode} changed name, role and email case`, () => {
      const [referentForUnit] = lookups();
      for (const changes of [{ name: 'maria verdi' }, { role: 'owner' }, { email: 'Maria@example.com' }]) {
        for (const level of levels) {
          expect(referentForUnit({ entries: [entry(level, 3), entry(level, 4, changes)], scope, referent }))
            .toEqual({ ok: false, code: 'referent_superseded' });
        }
      }
    });

    it(`s8323 ${mode} missing pointed version`, () => {
      const [referentForUnit] = lookups();
      for (const level of levels) {
        for (const entries of [[entry(level, 4)], [entry(level, 2), entry(level, 4)], [entry(level, 5), entry(level, 4)]]) {
          expect(referentForUnit({ entries, scope, referent })).toEqual({ ok: false, code: 'referent_superseded' });
        }
      }
    });

    it(`s8323 ${mode} foreign scope`, () => {
      const [referentForUnit] = lookups();
      for (const changes of [
        { tenantId: '2' }, { organizationId: 'other-org' }, { clientId: 'other-client' },
        { projectId: 'other-project' }, { buSlug: 'other-unit' }, { personRef: 'other-person' },
      ]) {
        expect(referentForUnit({
          entries: [entry('business_unit', 3, changes), entry('business_unit', 4, changes)], scope, referent,
        })).toEqual({ ok: false, code: 'referent_not_in_map' });
      }
      expect(referentForUnit({ entries: [], scope, referent })).toEqual({ ok: false, code: 'referent_not_in_map' });
    });

    it(`s8323 ${mode} unversioned and same-version lookups`, () => {
      const [referentForUnit] = lookups();
      const current = entry('project', 4, { email: 'new@example.com' });
      for (const pointer of [{ personRef: referent.personRef }, { personRef: referent.personRef, entryVersion: 4 }]) {
        expect(referentForUnit({ entries: [entry('project', 3), current], scope, referent: pointer }))
          .toEqual({ ok: true, entry: current, level: 'project' });
      }
    });

    it(`s8323 ${mode} saved plans reread identically`, () => {
      const plans = mods.plan as { ActionPlanSchema: Schema; actionPlanCanonicalJson(plan: unknown): string };
      const raw: Record<string, unknown> & { businessUnits: Array<Record<string, unknown>> } = JSON.parse(
        readFileSync(resolve(__dirname, 'fixtures/action-plan-v3-forma.json'), 'utf8'),
      );
      const rebuilt = {
        ...raw, planId: 'plan_ecc3bd19', version: 2,
        businessUnits: raw.businessUnits.map((unit) => ({
          ...unit, referent: { ...(unit.referent as object), entryVersion: 3 },
        })),
      };
      const withDigest = { ...rebuilt, digest: sha256(plans.actionPlanCanonicalJson(plans.ActionPlanSchema.parse(rebuilt))) };
      for (const saved of [raw, withDigest]) {
        const before = JSON.stringify(saved);
        const parsed = plans.ActionPlanSchema.parse(saved);
        expect(parsed).toEqual(saved);
        const canonical = plans.actionPlanCanonicalJson(parsed);
        expect(canonical).toBe(plans.actionPlanCanonicalJson(saved));
        expect(sha256(canonical)).toBe(saved.digest);
        expect(JSON.stringify(saved)).toBe(before);
        expect(plans.ActionPlanSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
        for (const unit of (parsed as { businessUnits: Array<{ buSlug: string; referent: { personRef: string; entryVersion?: number } }> }).businessUnits) {
          const unitScope = { ...scope, buSlug: unit.buSlug, projectId: String(parsed.projectId), clientId: String(parsed.clientId),
            tenantId: String(parsed.tenantId), organizationId: String(parsed.organizationId) };
          const common = { ...unitScope, personRef: unit.referent.personRef, supersedes: undefined };
          const pointedVersion = unit.referent.entryVersion ?? 3;
          const current = entry('business_unit', pointedVersion + 1, { ...common, supersedes: pointedVersion });
          for (const referentForUnit of lookups()) {
            expect(referentForUnit({
              entries: [entry('business_unit', pointedVersion, common), current], scope: unitScope, referent: unit.referent,
            })).toEqual({ ok: true, entry: current, level: 'business_unit' });
          }
        }
      }
    });
  });
}

describe('s8323 package', () => {
  it('s8323 reserves exactly version 1.324.0', () => {
    expect(manifest.version).toBe('1.324.0');
  });

  it('s8323 built ESM and CJS agree on the referent result for the same input', async () => {
    const [e, c] = [await load('ESM', 'map'), await load('CJS', 'map')];
    expect(e.REFERENT_FOR_UNIT_REFUSALS).toEqual(c.REFERENT_FOR_UNIT_REFUSALS);
    const input = (parse: Schema) => ({
      entries: [parse.parse(rawEntry('project', 3)), parse.parse(rawEntry('project', 4))], scope, referent,
    });
    const results = [e, c].map((m) => (m.referentForUnit as Lookup)(input(m.CompanyMapEntrySchema as Schema)));
    expect(results[0]).toEqual(results[1]);
    expect(results[0].ok).toBe(true);
  });

  it('s8323 declarations describe the same lookup in .d.ts and .d.cts', () => {
    for (const file of ['dist/organization/company-map.d.ts', 'dist/organization/company-map.d.cts']) {
      const text = readFileSync(resolve(root, file), 'utf8');
      expect(text).toContain('referentForUnit');
      expect(text).toContain('ReferentForUnitResult');
      expect(text).toContain('referent_superseded');
    }
    for (const file of ['dist/organization/index.d.ts', 'dist/organization/index.d.cts']) {
      expect(readFileSync(resolve(root, file), 'utf8')).toContain('company-map');
    }
  });

  it('s8323 native loaders start in both loading orders with fresh module caches', () => {
    const names = Object.keys(SUBPATHS) as Name[];
    const orders = [names, [...names].reverse()];
    const script = `
      const { createRequire } = await import('node:module');
      const require = createRequire(import.meta.url);
      const [mode, orderJson, subpathsJson, entriesJson, scopeJson, referentJson] = process.argv.slice(1);
      const subpaths = JSON.parse(subpathsJson);
      const loaded = {};
      for (const name of JSON.parse(orderJson)) {
        const path = '@x9-forge/contracts/' + subpaths[name];
        loaded[name] = mode === 'esm' ? await import(path) : require(path);
      }
      const out = {};
      for (const name of ['organization', 'map']) {
        const m = loaded[name];
        const entries = JSON.parse(entriesJson).map((e) => m.CompanyMapEntrySchema.parse(e));
        out[name] = m.referentForUnit({ entries, scope: JSON.parse(scopeJson), referent: JSON.parse(referentJson) }).ok;
      }
      process.stdout.write(JSON.stringify(out));
    `;
    const entries = JSON.stringify([rawEntry('project', 3), rawEntry('project', 4)]);
    for (const mode of ['esm', 'cjs']) {
      for (const order of orders) {
        const result = JSON.parse(execFileSync(process.execPath, [
          '--input-type=module', '-e', script, mode, JSON.stringify(order), JSON.stringify(SUBPATHS),
          entries, JSON.stringify(scope), JSON.stringify(referent),
        ], { cwd: root, env: {}, encoding: 'utf8' })) as Record<string, boolean>;
        expect(result).toEqual({ organization: true, map: true });
      }
    }
  }, 30_000);
});

// ---- s8700: project referents in the built package (data rebuilt from requests 591/8399; src is not imported) ----
type Scope = { level: string; projectId?: string; buSlug?: string };
type ScopeFn = (scope: Scope, projectId?: string) => Scope;
type ReferentsFn = (input: { entries: readonly Entry[]; scope: Record<string, string> }) => Entry[];
const GC2 = { tenantId: '1', organizationId: 'good-choice', clientId: 'gc2', projectId: 'gc2-project' };
const person = (personRef: string, level: string, version: number, changes: Record<string, unknown> = {}) => ({
  ...rawEntry(level, version, { clientId: GC2.clientId, personRef, name: `Name ${personRef}`, email: `${personRef}@example.invalid` }),
  ...(level !== 'client' ? { projectId: GC2.projectId } : {}),
  ...changes,
});
const freeze = <T>(value: T): T => {
  if (value !== null && typeof value === 'object') {
    Object.values(value as object).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const SCOPE_EXPORTS = ['companyMapConfirmedReferentScope', 'companyMapReferentsForProject'] as const;

for (const mode of ['ESM', 'CJS'] as const) {
  describe(`s8700 ${mode} project referents`, () => {
    const mods = {} as Record<'organization' | 'map', Mod>;
    beforeAll(async () => {
      mods.organization = await load(mode, 'organization');
      mods.map = await load(mode, 'map');
    });
    const both = <T>(name: string): T[] => [mods.organization, mods.map].map((m) => m[name] as T);
    const parse = (raw: unknown) => (mods.map.CompanyMapEntrySchema as Schema).parse(raw) as Entry;

    it(`s8700 ${mode} exports`, () => {
      for (const name of SCOPE_EXPORTS) {
        for (const fn of both<unknown>(name)) expect(typeof fn).toBe('function');
      }
    });

    it(`s8700 ${mode} project write scope`, () => {
      for (const confirmedScope of both<ScopeFn>('companyMapConfirmedReferentScope')) {
        expect(confirmedScope({ level: 'client' }, GC2.projectId)).toEqual({ level: 'project', projectId: GC2.projectId });
        expect(confirmedScope({ level: 'client' })).toEqual({ level: 'client' });
        expect(confirmedScope({ level: 'project', projectId: GC2.projectId }, GC2.projectId))
          .toEqual({ level: 'project', projectId: GC2.projectId });
        expect(confirmedScope({ level: 'business_unit', projectId: GC2.projectId, buSlug: 'design' }, GC2.projectId))
          .toEqual({ level: 'business_unit', projectId: GC2.projectId, buSlug: 'design' });
        expect(() => confirmedScope({ level: 'project', projectId: 'other-project' }, GC2.projectId)).toThrow();
        expect(() => confirmedScope({ level: 'business_unit', projectId: 'other-project', buSlug: 'design' }, GC2.projectId)).toThrow();
        expect(() => confirmedScope({ level: 'project' }, GC2.projectId)).toThrow();
      }
    });

    it(`s8700 ${mode} project beats client`, () => {
      for (const referentsForProject of both<ReferentsFn>('companyMapReferentsForProject')) {
        const client5 = parse(person('maria-verdi', 'client', 5));
        const project2 = parse(person('maria-verdi', 'project', 2));
        for (const entries of [[client5, project2], [project2, client5]]) {
          const result = referentsForProject({ entries, scope: GC2 });
          expect(result).toHaveLength(1);
          expect(result[0]).toBe(project2);
        }
      }
    });

    it(`s8700 ${mode} selection rules`, () => {
      for (const referentsForProject of both<ReferentsFn>('companyMapReferentsForProject')) {
        const project2 = parse(person('maria-verdi', 'project', 2));
        const project3 = parse(person('maria-verdi', 'project', 3));
        const client5 = parse(person('maria-verdi', 'client', 5));
        const fallback = parse(person('anna-neri', 'client', 4));
        const otherProject = parse(person('luca-gialli', 'project', 7, { projectId: 'other-project' }));
        const bu = parse(person('paolo-blu', 'business_unit', 3, { buSlug: 'design' }));
        const strangers = [
          parse(person('zeta', 'client', 9, { tenantId: '2' })),
          parse(person('zeta', 'client', 9, { organizationId: 'other-org' })),
          parse(person('zeta', 'client', 9, { clientId: 'other-client' })),
        ];
        const entries = freeze([strangers[0], bu, otherProject, client5, project2, fallback, project3, strangers[1], strangers[2]]);
        const snapshot = JSON.stringify(entries);
        const result = referentsForProject({ entries, scope: GC2 });
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(fallback);
        expect(result[1]).toBe(project3);
        expect(JSON.stringify(entries)).toBe(snapshot);
        const second = referentsForProject({ entries: [otherProject], scope: { ...GC2, projectId: 'other-project' } });
        expect(second).toEqual([otherProject]);
        expect(referentsForProject({ entries: [], scope: GC2 })).toEqual([]);
        expect(referentsForProject({ entries: [bu, strangers[0]], scope: GC2 })).toEqual([]);
      }
    });

    it(`s8700 ${mode} saved v5 rereads unchanged`, () => {
      const raw = person('maria-verdi', 'client', 5);
      const text = JSON.stringify(raw);
      const parsed = parse(JSON.parse(text));
      expect(JSON.stringify(parsed)).toBe(JSON.stringify(parse(JSON.parse(text))));
      expect(parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
      expect(sha256(JSON.stringify(parsed))).toBe(sha256(JSON.stringify(parse(JSON.parse(text)))));
      expect(JSON.stringify(raw)).toBe(text);
    });
  });
}

describe('s8700 package', () => {
  it('s8700 reserves exactly version 1.324.0', () => {
    expect(manifest.version).toBe('1.324.0');
  });

  it('s8700 built ESM and CJS agree on results and refusals for the same data', async () => {
    const [e, c] = [await load('ESM', 'map'), await load('CJS', 'map')];
    const run = (m: Mod) => {
      const parse = (raw: unknown) => (m.CompanyMapEntrySchema as Schema).parse(raw) as Entry;
      const entries = [parse(person('maria-verdi', 'client', 5)), parse(person('maria-verdi', 'project', 2)), parse(person('anna-neri', 'client', 4))];
      const confirmedScope = m.companyMapConfirmedReferentScope as ScopeFn;
      let refusal = '';
      try { confirmedScope({ level: 'project', projectId: 'other-project' }, GC2.projectId); } catch (error) { refusal = String((error as Error).constructor.name); }
      return {
        write: confirmedScope({ level: 'client' }, GC2.projectId),
        kept: confirmedScope({ level: 'client' }),
        refusal,
        read: (m.companyMapReferentsForProject as ReferentsFn)({ entries, scope: GC2 }),
      };
    };
    expect(run(e)).toEqual(run(c));
    expect(run(e).read.map((x) => `${x.personRef}:${x.level}:${x.version}`)).toEqual(['anna-neri:client:4', 'maria-verdi:project:2']);
  });

  it('s8700 declarations describe both functions in .d.ts and .d.cts', () => {
    const manifestTarget = manifest.exports['./organization/*'].types.replace('*', 'company-map');
    expect(resolve(root, manifestTarget)).toBe(resolve(root, 'dist/organization/company-map.d.cts'));
    const texts = ['dist/organization/company-map.d.ts', 'dist/organization/company-map.d.cts'].map((file) => readFileSync(resolve(root, file), 'utf8'));
    for (const text of texts) {
      for (const name of SCOPE_EXPORTS) expect(text).toContain(name);
      expect(text).toMatch(/companyMapConfirmedReferentScope\(scope: \{[^}]*\}, confirmationProjectId\?: string \| undefined\): CompanyMapConfirmedReferentScope/);
      expect(text).toMatch(/companyMapReferentsForProject\(input: \{[\s\S]*?\}\): CompanyMapEntry\[\]/);
      expect(text).toContain('CompanyMapConfirmedReferentScope');
      expect(text).not.toMatch(/\/Users\/|\bsrc\//);
    }
    const strip = (text: string) => text.replace(/\s+/g, ' ');
    const signature = (text: string, name: string) => text.match(new RegExp(`function ${name}\\([\\s\\S]*?\\) ?: ?[\\w\\[\\]]+;`))?.[0];
    for (const name of SCOPE_EXPORTS) {
      expect(signature(strip(texts[0]!), name)).toBeDefined();
      expect(signature(strip(texts[0]!), name)).toBe(signature(strip(texts[1]!), name));
    }
    for (const file of ['dist/organization/index.d.ts', 'dist/organization/index.d.cts']) {
      expect(readFileSync(resolve(root, file), 'utf8')).toContain('company-map');
    }
  });

  it('s8700 native loaders expose and run both functions in both orders with fresh caches', () => {
    const names = Object.keys(SUBPATHS) as Name[];
    const orders = [names, [...names].reverse()];
    const script = `
      const { createRequire } = await import('node:module');
      const require = createRequire(import.meta.url);
      const [mode, orderJson, subpathsJson, entriesJson, projectId] = process.argv.slice(1);
      const subpaths = JSON.parse(subpathsJson);
      const loaded = {};
      for (const name of JSON.parse(orderJson)) {
        const path = '@x9-forge/contracts/' + subpaths[name];
        loaded[name] = mode === 'esm' ? await import(path) : require(path);
      }
      const out = {};
      for (const name of ['organization', 'map']) {
        const m = loaded[name];
        const entries = JSON.parse(entriesJson).map((e) => m.CompanyMapEntrySchema.parse(e));
        const scope = { tenantId: '1', organizationId: 'good-choice', clientId: 'gc2', projectId };
        out[name] = {
          types: [typeof m.companyMapConfirmedReferentScope, typeof m.companyMapReferentsForProject],
          write: m.companyMapConfirmedReferentScope({ level: 'client' }, projectId),
          read: m.companyMapReferentsForProject({ entries, scope }).map((e) => e.level + ':' + e.version),
        };
      }
      process.stdout.write(JSON.stringify(out));
    `;
    const entries = JSON.stringify([person('maria-verdi', 'client', 5), person('maria-verdi', 'project', 2)]);
    const expected = {
      types: ['function', 'function'],
      write: { level: 'project', projectId: GC2.projectId },
      read: ['project:2'],
    };
    for (const mode of ['esm', 'cjs']) {
      for (const order of orders) {
        const result = JSON.parse(execFileSync(process.execPath, [
          '--input-type=module', '-e', script, mode, JSON.stringify(order), JSON.stringify(SUBPATHS), entries, GC2.projectId,
        ], { cwd: root, env: {}, encoding: 'utf8' })) as Record<string, unknown>;
        expect(result).toEqual({ organization: expected, map: expected });
      }
    }
  }, 30_000);
});
