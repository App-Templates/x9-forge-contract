import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  VideoModelApproveRequestSchema,
  VideoModelCreateRequestSchema,
  VideoModelListSchema,
  VideoModelSchema,
} from '../../../src/capability/video/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const hash = (c: string) => c.repeat(64);
const description = { face: 'viso ovale', body: 'slanciata', hair: 'castani lunghi' };
const generation = { model: 'img-model-1', seed: 42, parameters: [{ name: 'steps', value: '30' }] };
const ref = (kind: string, c = 'a') => ({ kind, fileName: `${kind}.png`, sha256: hash(c), width: 1024, height: 1536, sizeBytes: 5000 });
const version = {
  version: 1,
  status: 'approvata',
  description,
  refs: [ref('frontale'), ref('figura_intera', 'b')],
  generation,
  createdAt: '2026-11-17T10:00:00Z',
  approvedAt: '2026-11-17T10:05:00.123Z',
  digest: hash('c'),
};
const model = { id: 'giulia-1', name: 'Giulia', identity, versions: [version], currentVersion: 1 };
const ok = (v: unknown) => VideoModelSchema.safeParse(v).success;

describe('modella', () => {
  it('accepts a real model, one without approved versions and an empty list', () => {
    expect(ok(model)).toBe(true);
    expect(ok({ ...model, versions: [{ ...version, status: 'bozza', approvedAt: null, refs: [] }], currentVersion: null })).toBe(true);
    expect(VideoModelListSchema.safeParse({ models: [] }).success).toBe(true);
  });
  it.each(['../x', 'Giulia', '', 'a'.repeat(49)])('refuses id %j', (id) => {
    expect(ok({ ...model, id })).toBe(false);
  });
  const withVersion = (patch: object) => ({ ...model, versions: [{ ...version, ...patch }] });
  it('refuses bad refs', () => {
    expect(ok(withVersion({ refs: [ref('laterale')] }))).toBe(false);
    expect(ok(withVersion({ refs: [{ ...ref('frontale'), sha256: hash('A') }] }))).toBe(false);
    expect(ok(withVersion({ refs: [{ ...ref('frontale'), sha256: 'a'.repeat(63) }] }))).toBe(false);
    expect(ok(withVersion({ refs: [{ ...ref('frontale'), fileName: '../x.png' }] }))).toBe(false);
    expect(ok(withVersion({ refs: [{ ...ref('frontale'), fileName: 'x.gif' }] }))).toBe(false);
    expect(ok(withVersion({ refs: [{ ...ref('frontale'), extra: 1 }] }))).toBe(false);
  });
  it('refuses 5 references', () => {
    const five = ['frontale', 'tre_quarti', 'profilo', 'figura_intera', 'frontale'].map((k) => ref(k));
    expect(ok(withVersion({ refs: five }))).toBe(false);
  });
  it('refuses bad versions, status, seed, parameters', () => {
    expect(ok(withVersion({ version: 0 }))).toBe(false);
    expect(ok(withVersion({ version: 51 }))).toBe(false);
    expect(ok(withVersion({ status: 'pubblicata' }))).toBe(false);
    expect(ok(withVersion({ generation: { ...generation, seed: -1 } }))).toBe(false);
    const many = Array.from({ length: 21 }, (_, i) => ({ name: `p${i}`, value: 'v' }));
    expect(ok(withVersion({ generation: { ...generation, parameters: many } }))).toBe(false);
    expect(ok(withVersion({ extra: 1 }))).toBe(false);
  });
  it('refuses an identity without tenantId or agentId', () => {
    const { tenantId: _t, ...noTenant } = identity;
    const { agentId: _a, ...noAgent } = identity;
    expect(ok({ ...model, identity: noTenant })).toBe(false);
    expect(ok({ ...model, identity: noAgent })).toBe(false);
  });
  it('refuses an extra field in the model and in the requests', () => {
    expect(ok({ ...model, extra: 1 })).toBe(false);
    expect(VideoModelCreateRequestSchema.safeParse({ name: 'Giulia', description, generation }).success).toBe(true);
    expect(VideoModelCreateRequestSchema.safeParse({ name: 'Giulia', description, generation, extra: 1 }).success).toBe(false);
  });
  it('checks the approval digest', () => {
    expect(VideoModelApproveRequestSchema.safeParse({ digest: hash('a') }).success).toBe(true);
    expect(VideoModelApproveRequestSchema.safeParse({ digest: 'abc' }).success).toBe(false);
  });
  it('does not use refine or superRefine', () => {
    const source = readFileSync(new URL('../../../src/capability/video/modella.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
  });
});
