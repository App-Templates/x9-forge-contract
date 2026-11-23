import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildLabDossierSnapshot } from '../../src/capability/lab/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  InternalLabDossierSnapshotErrorSchema,
  LAB_DOSSIER_SNAPSHOT_ERRORS,
  createBridgeClient,
  internalLabDossierSnapshotContract as contract,
} from '../../src/http/index.js';
import * as endpoints from '../../src/http/index.js';

const hex = (char: string) => char.repeat(64);
const page = (agent: string, slug: string, version: number, role: 'current' | 'cited_by_plan') => ({
  notebookAgentId: agent, slug, version, role, title: `Title ${slug}`, body: `Body ${slug}`, digest: hex('d'),
});
const context = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};
/** 63 current identities (two authors share a slug) plus one cited historical version: 64. */
const input = () => ({
  tenantId: 'tenant-a',
  organizationId: 'org-1',
  clientId: 'client-1',
  projectId: 'project-1',
  snapshotId: 'snap-1',
  cutoff: '2026-11-23T10:00:00.000Z',
  scope: { kind: 'project' as const, clientId: 'client-1', projectId: 'project-1' },
  pages: [
    page('agent-lab-a', 'shared', 1, 'current'),
    page('agent-lab-b', 'shared', 1, 'current'),
    ...Array.from({ length: 60 }, (_, i) => page('agent-lab-a', `topic-${String(i).padStart(2, '0')}`, 2, 'current')),
    page('agent-lab-a', 'topic-00', 1, 'cited_by_plan'),
    page('agent-lab-b', 'only-b', 1, 'current'),
  ],
  planCitations: [{ slug: 'topic-00', version: 1 }],
  sources: [],
});
const request = () => ({ context, input: input() });
const snapshot = () => buildLabDossierSnapshot(input());

describe('s8306 lab dossier snapshot contract', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects a dossier request without signed run context', () => {
    const { context: _omit, ...withoutContext } = request();
    expect(contract.bodySchema.safeParse(withoutContext).success).toBe(false);
    expect(contract.bodySchema.safeParse({ ...request(), context: undefined }).success).toBe(false);
  });

  it('accepts a valid request and a complete 64/64 response', () => {
    expect(contract.bodySchema.safeParse(request()).success).toBe(true);
    const parsed = contract.responseSchema.parse({ ok: true, snapshot: snapshot() });
    expect(parsed.snapshot.pages).toHaveLength(64);
    expect(parsed.snapshot.totalPages).toBe(64);
    expect(parsed.snapshot.currentPageCount).toBe(63);
    expect(parsed.snapshot.citedExtraPageCount).toBe(1);
  });

  it('rejects an incoherent client/project scope and a foreign organization', () => {
    const badScope = { ...input(), scope: { kind: 'project' as const, clientId: 'client-1', projectId: 'project-2' } };
    expect(contract.bodySchema.safeParse({ context, input: badScope }).success).toBe(false);
    const foreign = { context: { ...context, organizationId: 'org-2' }, input: input() };
    expect(contract.bodySchema.safeParse(foreign).success).toBe(false);
  });

  it('rejects partial, mixed and empty responses', () => {
    const full = snapshot();
    const truncated = { ...full, pages: full.pages.slice(0, 63) };
    expect(contract.responseSchema.safeParse({ ok: true, snapshot: truncated }).success).toBe(false);
    expect(contract.responseSchema.safeParse({ ok: true, snapshot: { ...full, complete: false } }).success).toBe(false);
    expect(contract.responseSchema.safeParse({ ok: true, snapshot: full, error: 'dossier_too_large' }).success).toBe(false);
    expect(contract.responseSchema.safeParse({ ok: true, snapshot: { ...full, pages: [], totalPages: 0 } }).success).toBe(false);
    expect(contract.responseSchema.safeParse({ ok: true }).success).toBe(false);
    expect(contract.responseSchema.safeParse({}).success).toBe(false);
  });

  it('names exactly the six refusals and never mixes them with a snapshot', () => {
    expect([...LAB_DOSSIER_SNAPSHOT_ERRORS]).toEqual([
      'scope_foreign', 'dossier_empty', 'cited_version_missing', 'cited_version_ambiguous',
      'dossier_too_large', 'snapshot_unavailable',
    ]);
    for (const error of LAB_DOSSIER_SNAPSHOT_ERRORS) {
      expect(InternalLabDossierSnapshotErrorSchema.safeParse({ ok: false, error }).success).toBe(true);
      expect(InternalLabDossierSnapshotErrorSchema.safeParse({ ok: false, error, snapshot: snapshot() }).success).toBe(false);
    }
    expect(InternalLabDossierSnapshotErrorSchema.safeParse({ ok: false, error: 'unavailable' }).success).toBe(false);
  });

  it('has a unique method and path, and works with createBridgeClient', async () => {
    expect(contract.method).toBe('POST');
    expect(contract.authType).toBe('secret');
    const same = Object.values(endpoints).filter((value) => {
      const c = value as { method?: unknown; path?: unknown };
      return c !== null && typeof c === 'object' && c.method === 'POST' && c.path === contract.path;
    });
    expect(same).toHaveLength(1);

    let received: { url: string; method: string | undefined; secret: string | null; body: unknown } | undefined;
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      received = {
        url, method: init.method, secret: new Headers(init.headers).get(INTERNAL_SECRET_HEADER),
        body: JSON.parse(String(init.body)),
      };
      return new Response(JSON.stringify({ ok: true, snapshot: snapshot() }), { status: 200, headers: { 'content-type': 'application/json' } });
    }));
    const client = createBridgeClient({ baseUrl: 'http://bridge.invalid', auth: { [INTERNAL_SECRET_HEADER]: 'synthetic-test-only' } });
    const body = contract.bodySchema.parse(request());
    const result = contract.responseSchema.parse(await client.request({ method: contract.method, path: contract.path, body }));
    expect(received?.url).toBe(`http://bridge.invalid${contract.path}`);
    expect(received?.method).toBe('POST');
    expect(received?.secret).toBe('synthetic-test-only');
    expect(received?.body).toEqual(body);
    expect(result.snapshot.totalPages).toBe(64);
  });
});
