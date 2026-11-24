import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { constants, Script } from 'node:vm';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../..');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const SUBPATHS = {
  http: 'dist/http/index',
  'http/endpoints/internal-colloquio-links': 'dist/http/endpoints/internal-colloquio-links',
} as const;
type Subpath = keyof typeof SUBPATHS;
type Mod = Record<string, unknown>;
type Schema = { parse(v: unknown): unknown; safeParse(v: unknown): { success: boolean } };

// Use Node's native loader: Vitest otherwise transforms the entire built dependency graph.
const nativeImport = new Script('(specifier) => import(specifier)', {
  importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
}).runInThisContext() as (specifier: string) => Promise<Mod>;
const esm = (name: Subpath) => nativeImport(pathToFileURL(resolve(root, `${SUBPATHS[name]}.js`)).href);
const cjs = (name: Subpath) => require(resolve(root, `${SUBPATHS[name]}.cjs`)) as Mod;

const NEW_SYMBOLS = [
  'colloquioLinkContract', 'ColloquioLinkRequestSchema', 'ColloquioLinkResponseSchema', 'ColloquioLinkRefusalSchema',
  'COLLOQUIO_LINK_TTL_MS', 'COLLOQUIO_TOPIC_SUBJECT_MAX', 'COLLOQUIO_TOPIC_EXCERPT_MAX',
  'COLLOQUIO_LINK_CODE_PATTERN', 'COLLOQUIO_LINK_REFUSALS',
];

const atLeast = (version: string, minimum: string) => {
  const [a, b] = [version, minimum].map((v) => v.split('.').map(Number));
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};
const names = (m: Mod) => Object.keys(m).filter((k) => k !== 'default' && k !== '__esModule').sort();

const request = () => ({
  scope: { tenantId: 'tenant-a', ownerId: 'owner-1', agentId: 'agent-director' },
  recipient: 'referente@example.com',
  email: { threadKey: 'thread-1' },
  projectId: 'project-1',
  topic: { subject: 'Piano di azione', excerpt: 'Parliamone a voce.' },
});
const response = (url = 'https://colloquio.example.com/parla/abcDEF12345') => ({
  url, code: 'abcDEF12345', expiresAt: '2026-12-24T10:00:00.000Z',
});

describe('s8611 built package exports the colloquio link contract', () => {
  it('s8611 built ESM and CJS export the same colloquio link contract at least at version 1.319.0', () => {
    expect(atLeast(manifest.version, '1.319.0')).toBe(true);
  });

  for (const name of Object.keys(SUBPATHS) as Subpath[]) {
    it(`s8611 ${name}: ESM and CJS export identical names including the colloquio symbols`, async () => {
      const [e, c] = [await esm(name), cjs(name)];
      if (name === 'http') expect(names(e)).toEqual(names(c));
      for (const symbol of NEW_SYMBOLS) {
        expect(e[symbol], `ESM ${symbol}`).toBeDefined();
        expect(c[symbol], `CJS ${symbol}`).toBeDefined();
        expect(typeof e[symbol]).toBe(typeof c[symbol]);
      }
      expect(e.COLLOQUIO_LINK_TTL_MS).toBe(c.COLLOQUIO_LINK_TTL_MS);
      expect(e.COLLOQUIO_TOPIC_SUBJECT_MAX).toBe(c.COLLOQUIO_TOPIC_SUBJECT_MAX);
      expect(e.COLLOQUIO_TOPIC_EXCERPT_MAX).toBe(c.COLLOQUIO_TOPIC_EXCERPT_MAX);
      expect(e.COLLOQUIO_LINK_REFUSALS).toEqual(c.COLLOQUIO_LINK_REFUSALS);
      expect(String(e.COLLOQUIO_LINK_CODE_PATTERN)).toBe(String(c.COLLOQUIO_LINK_CODE_PATTERN));
    });
  }

  it('s8611 both entries accept a valid link request and refuse a non-https response', async () => {
    for (const mod of [await esm('http'), cjs('http')]) {
      const req = mod.ColloquioLinkRequestSchema as Schema;
      expect(req.safeParse(request()).success).toBe(true);
      expect(req.safeParse({ ...request(), email: {} }).success).toBe(false);
      const res = mod.ColloquioLinkResponseSchema as Schema;
      expect(res.safeParse(response()).success).toBe(true);
      expect(res.safeParse(response('http://colloquio.example.com/parla/abcDEF12345')).success).toBe(false);
      const refusal = mod.ColloquioLinkRefusalSchema as Schema;
      expect(refusal.safeParse({ error: 'recipient_not_referente' }).success).toBe(true);
      expect(refusal.safeParse({ error: 'other' }).success).toBe(false);
      const contract = mod.colloquioLinkContract as { method: string; path: string; authType: string };
      expect(contract).toMatchObject({
        method: 'POST', path: '/internal/capability/agents/:agentId/colloquio/links', authType: 'secret',
      });
    }
  });

  it('s8611 both entries keep the historical dev delivery links contract identical', async () => {
    const [e, c] = [await esm('http'), cjs('http')];
    const [a, b] = [e.devDeliveryLinksContract, c.devDeliveryLinksContract] as Array<{ method: string; path: string }>;
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect({ method: a.method, path: a.path }).toEqual({ method: b.method, path: b.path });
  });
});
