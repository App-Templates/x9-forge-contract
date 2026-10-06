import { describe, expect, it } from 'vitest';
import {
  AgentCredentialLinkEntrySchema,
  AgentCredentialLinksSchema,
  CredentialActionErrorResponseSchema,
  CredentialActionRequestSchema,
  CredentialActionResultSchema,
  CredentialKeySchema,
  CredentialLinkSchema,
} from '../../src/vault/index.js';

const linked = { link: 'linked', source: 'master' } as const;
const ownerOwn = { link: 'unlinked', tier: 'owner' } as const;
const entry = { key: 'OPENAI_API_KEY', provenance: linked, present: true, version: 3, appliedVersion: 3, isSecret: true };

describe('R3 credential provenance', () => {
  it('is linked to the X9 Master Chief or unlinked with an owner/agent value', () => {
    expect(CredentialLinkSchema.safeParse(linked).success).toBe(true);
    expect(CredentialLinkSchema.safeParse(ownerOwn).success).toBe(true);
    expect(CredentialLinkSchema.safeParse({ link: 'unlinked', tier: 'agent' }).success).toBe(true);
  });

  it.each([
    ['platform tier as an own value', { link: 'unlinked', tier: 'platform' }],
    ['linked to a tier', { link: 'linked', source: 'owner' }],
    ['unknown link', { link: 'inherited' }],
    ['unlinked without tier', { link: 'unlinked' }],
  ])('rejects %s', (_label, input) => {
    expect(CredentialLinkSchema.safeParse(input).success).toBe(false);
  });

  it('accepts capability keys and refuses platform-internal ones', () => {
    expect(CredentialKeySchema.safeParse('OPENAI_API_KEY').success).toBe(true);
    expect(CredentialKeySchema.safeParse('cap.research_key').success).toBe(true);
    expect(CredentialKeySchema.safeParse('TELEGRAM_SESSION_STRING').success).toBe(false);
    expect(CredentialKeySchema.safeParse('').success).toBe(false);
    expect(CredentialKeySchema.safeParse('BAD KEY').success).toBe(false);
  });
});

describe('R3 per-agent key entries', () => {
  it('describes a key without ever carrying its value', () => {
    expect(AgentCredentialLinkEntrySchema.safeParse(entry).success).toBe(true);
    expect(AgentCredentialLinkEntrySchema.safeParse({ ...entry, value: 'sk-123' }).success).toBe(false);
  });

  it('shows a saved rotation not yet applied', () => {
    expect(AgentCredentialLinkEntrySchema.safeParse({ ...entry, version: 4, appliedVersion: 3 }).success).toBe(true);
    expect(AgentCredentialLinkEntrySchema.safeParse({ ...entry, version: 4, appliedVersion: null }).success).toBe(true);
  });

  it('accepts an absent key with no version', () => {
    expect(AgentCredentialLinkEntrySchema.safeParse({ ...entry, present: false, version: null, appliedVersion: null }).success).toBe(true);
  });

  it.each([
    ['present without version', { present: true, version: null, appliedVersion: null }],
    ['absent with a version', { present: false, version: 2, appliedVersion: null }],
    ['applied ahead of saved', { version: 2, appliedVersion: 3 }],
    ['absent with applied version', { present: false, version: null, appliedVersion: 1 }],
  ])('rejects %s', (_label, patch) => {
    expect(AgentCredentialLinkEntrySchema.safeParse({ ...entry, ...patch }).success).toBe(false);
  });

  it('lists each key once per agent', () => {
    const links = { agentId: 'agent-7', masterAgentId: 'x9-staging', entries: [entry, { ...entry, key: 'ELEVENLABS_API_KEY', provenance: ownerOwn }] };
    expect(AgentCredentialLinksSchema.safeParse(links).success).toBe(true);
    expect(AgentCredentialLinksSchema.safeParse({ ...links, entries: [entry, entry] }).success).toBe(false);
  });
});

describe('R3 rotate / relink / unlink', () => {
  it.each([
    { action: 'rotate', requestId: 'rot-00000001', key: 'OPENAI_API_KEY', scope: 'master', version: 4 },
    { action: 'rotate', requestId: 'rot-00000002', key: 'OPENAI_API_KEY', scope: 'own', agentId: 'agent-7', version: 2 },
    { action: 'relink', requestId: 'rel-00000001', key: 'OPENAI_API_KEY', agentId: 'agent-7' },
    { action: 'unlink', requestId: 'unl-00000001', key: 'OPENAI_API_KEY', agentId: 'agent-7', tier: 'agent', version: 1 },
  ])('accepts $action', (input) => {
    expect(CredentialActionRequestSchema.safeParse(input).success).toBe(true);
  });

  it.each([
    ['master rotation naming one agent', { action: 'rotate', requestId: 'rot-00000001', key: 'K', scope: 'master', agentId: 'agent-7', version: 4 }],
    ['own rotation without agent', { action: 'rotate', requestId: 'rot-00000001', key: 'K', scope: 'own', version: 4 }],
    ['rotation carrying a secret', { action: 'rotate', requestId: 'rot-00000001', key: 'K', scope: 'master', version: 4, value: 'sk' }],
    ['relink without agent', { action: 'relink', requestId: 'rel-00000001', key: 'K' }],
    ['unlink to platform', { action: 'unlink', requestId: 'unl-00000001', key: 'K', agentId: 'a', tier: 'platform', version: 1 }],
    ['missing request key', { action: 'relink', key: 'K', agentId: 'agent-7' }],
    ['platform-internal key', { action: 'rotate', requestId: 'rot-00000001', key: 'TELEGRAM_SESSION_STRING', scope: 'master', version: 4 }],
  ])('rejects %s', (_label, input) => {
    expect(CredentialActionRequestSchema.safeParse(input).success).toBe(false);
  });
});

describe('R3 per-agent outcome of a credential action', () => {
  const okRow = (agentId: string) => ({ agentId, outcome: 'ok', appliedVersion: 4 });
  const errRow = (agentId: string) => ({ agentId, outcome: 'error', reason: { code: 'timeout' }, appliedVersion: 3 });
  const result = { ok: true, requestId: 'rot-00000001', action: 'rotate', key: 'OPENAI_API_KEY', version: 4, replayed: false };

  it('reports applied/total over the linked agents', () => {
    expect(CredentialActionResultSchema.safeParse({ ...result, outcome: 'ok', agents: [okRow('x9-staging'), okRow('agent-7')], applied: 2, total: 2 }).success).toBe(true);
    expect(CredentialActionResultSchema.safeParse({ ...result, outcome: 'partial', agents: [okRow('x9-staging'), errRow('agent-7')], applied: 1, total: 2 }).success).toBe(true);
  });

  it.each([
    ['global success over a failed agent', { outcome: 'ok', agents: [okRow('a'), errRow('b')], applied: 1, total: 2 }],
    ['wrong applied count', { outcome: 'ok', agents: [okRow('a'), okRow('b')], applied: 1, total: 2 }],
    ['wrong total', { outcome: 'ok', agents: [okRow('a')], applied: 1, total: 2 }],
    ['ok agent on another version', { outcome: 'ok', agents: [{ agentId: 'a', outcome: 'ok', appliedVersion: 3 }], applied: 1, total: 1 }],
    ['failed agent without reason', { outcome: 'error', agents: [{ agentId: 'a', outcome: 'error', appliedVersion: 3 }], applied: 0, total: 1 }],
    ['duplicate agent', { outcome: 'ok', agents: [okRow('a'), okRow('a')], applied: 2, total: 2 }],
    ['no agent', { outcome: 'error', agents: [], applied: 0, total: 0 }],
  ])('rejects %s', (_label, patch) => {
    expect(CredentialActionResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });

  it('limits relink/unlink/own rotation to the one agent', () => {
    const one = { ...result, action: 'relink', outcome: 'ok', agents: [okRow('a')], applied: 1, total: 1 };
    expect(CredentialActionResultSchema.safeParse(one).success).toBe(true);
    expect(CredentialActionResultSchema.safeParse({ ...one, agents: [okRow('a'), okRow('b')], applied: 2, total: 2 }).success).toBe(false);
  });

  it('distinguishes action errors', () => {
    expect(CredentialActionErrorResponseSchema.safeParse({ ok: false, error: 'source_unavailable' }).success).toBe(true);
    expect(CredentialActionErrorResponseSchema.safeParse({ ok: false, error: 'version_not_found' }).success).toBe(true);
    expect(CredentialActionErrorResponseSchema.safeParse({ ok: false, error: 'oops' }).success).toBe(false);
  });
});
