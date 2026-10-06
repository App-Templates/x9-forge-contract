import { describe, expect, it } from 'vitest';
import {
  CapabilityCallContextErrorCodeSchema,
  CapabilityCallContextRequestSchema,
  CapabilityCallContextResponseSchema,
  CapabilityCallContextSchema,
  CapabilityAgentScopeSchema,
  CapabilityCallIdentitySchema,
  CapabilityPersonScopeSchema,
  sameCapabilityScope,
  ToolCallRequestSchema,
  pickCapabilityCredentials,
  toToolCallScope,
} from '../../src/capability/index.js';
import { capabilityCallContextContract, CAPABILITY_CALL_CONTEXT_PATH } from '../../src/http/index.js';

const identity = { tenantId: 't-1', ownerId: 'o-2', agentId: 'agent-7', userId: 'person-9' };
const context = {
  identity,
  capability: 'ricerca',
  configVersion: 3,
  settings: { 'budget.daily': 5 },
  credentials: { OPENAI_API_KEY: 'sk-test' },
  credentialVersions: { OPENAI_API_KEY: 4 },
};

describe('R3 capability call identity', () => {
  it('requires tenant, owner and agent; person optional', () => {
    expect(CapabilityCallIdentitySchema.safeParse(identity).success).toBe(true);
    const { userId: _drop, ...agentScope } = identity;
    expect(CapabilityCallIdentitySchema.safeParse(agentScope).success).toBe(true);
  });

  it.each(['tenantId', 'ownerId', 'agentId'])('rejects a missing %s (no default tenant)', (key) => {
    const input: Record<string, unknown> = { ...identity };
    delete input[key];
    expect(CapabilityCallIdentitySchema.safeParse(input).success).toBe(false);
  });

  it('derives agent and person scopes without redefining identity', () => {
    const { userId: _drop, ...agentScope } = identity;
    expect(CapabilityAgentScopeSchema.safeParse(agentScope).success).toBe(true);
    expect(CapabilityAgentScopeSchema.safeParse(identity).success).toBe(false);
    expect(CapabilityPersonScopeSchema.safeParse(identity).success).toBe(true);
    expect(CapabilityPersonScopeSchema.safeParse(agentScope).success).toBe(false);
    expect(sameCapabilityScope(identity, { ...identity })).toBe(true);
    expect(sameCapabilityScope(identity, { ...identity, agentId: 'other' })).toBe(false);
    expect(sameCapabilityScope(identity, { ...identity, userId: 'other' })).toBe(false);
    expect(sameCapabilityScope(identity, agentScope)).toBe(false);
  });

  it('rejects extra identity claims', () => {
    expect(CapabilityCallIdentitySchema.safeParse({ ...identity, role: 'superadmin' }).success).toBe(false);
  });
});

describe('R3 capability call context', () => {
  it('carries only the credentials of this capability, each with its version', () => {
    expect(CapabilityCallContextSchema.safeParse(context).success).toBe(true);
    expect(CapabilityCallContextSchema.safeParse({ ...context, credentials: {}, credentialVersions: {} }).success).toBe(true);
  });

  it.each([
    ['credential without version', { credentials: { OPENAI_API_KEY: 'sk', ELEVENLABS_API_KEY: 'el' }, credentialVersions: { OPENAI_API_KEY: 4 } }],
    ['version without credential', { credentials: {}, credentialVersions: { OPENAI_API_KEY: 4 } }],
    ['platform-internal credential', { credentials: { TELEGRAM_SESSION_STRING: 's' }, credentialVersions: { TELEGRAM_SESSION_STRING: 1 } }],
    ['empty credential value', { credentials: { OPENAI_API_KEY: '' }, credentialVersions: { OPENAI_API_KEY: 4 } }],
    ['missing capability', { capability: '' }],
    ['the whole credential bag', { allCredentials: { OPENAI_API_KEY: 'sk' } }],
  ])('rejects %s', (_label, patch) => {
    expect(CapabilityCallContextSchema.safeParse({ ...context, ...patch }).success).toBe(false);
  });

  it('refuses platform-internal keys in the credential map itself', () => {
    expect(CapabilityCallContextSchema.shape.credentials.safeParse({ TELEGRAM_SESSION_STRING: 's' }).success).toBe(false);
    expect(CapabilityCallContextSchema.shape.credentialVersions.safeParse({ TELEGRAM_SESSION_STRING: 1 }).success).toBe(false);
  });

  it('picks the minimum and lists what is missing', () => {
    const available = {
      OPENAI_API_KEY: { value: 'sk', version: 4 },
      ELEVENLABS_API_KEY: { value: 'el', version: 2 },
      TELEGRAM_SESSION_STRING: { value: 'internal', version: 1 },
    };
    expect(pickCapabilityCredentials(available, ['OPENAI_API_KEY'])).toEqual({
      ok: true, credentials: { OPENAI_API_KEY: 'sk' }, credentialVersions: { OPENAI_API_KEY: 4 },
    });
    expect(pickCapabilityCredentials(available, ['OPENAI_API_KEY', 'GOOGLE_API_KEY'])).toEqual({
      ok: false, error: 'credential_missing', keys: ['GOOGLE_API_KEY'],
    });
    expect(pickCapabilityCredentials(available, ['TELEGRAM_SESSION_STRING'])).toEqual({
      ok: false, error: 'credential_missing', keys: ['TELEGRAM_SESSION_STRING'],
    });
  });

  it('feeds the 1.30 tool call without changing its shape', () => {
    const scope = toToolCallScope(CapabilityCallContextSchema.parse(context));
    expect(scope).toEqual({ agentId: 'agent-7', userId: 'person-9', tenantId: 't-1', ownerId: 'o-2', credentials: { OPENAI_API_KEY: 'sk-test' } });
    expect(ToolCallRequestSchema.safeParse({ callId: 'c', tool: 'research_start', input: {}, sessionId: 's', ...scope }).success).toBe(true);
    const { userId: _drop, ...agentScope } = identity;
    expect('userId' in toToolCallScope(CapabilityCallContextSchema.parse({ ...context, identity: agentScope }))).toBe(false);
  });
});

describe('R3 resolve endpoint', () => {
  it('is a token-auth Forge vault route', () => {
    expect(CAPABILITY_CALL_CONTEXT_PATH).toBe('/resolve/capability-context');
    expect(capabilityCallContextContract).toMatchObject({ method: 'POST', path: CAPABILITY_CALL_CONTEXT_PATH, authType: 'token' });
  });

  it('asks for declared keys of one capability', () => {
    expect(CapabilityCallContextRequestSchema.safeParse({ identity, capability: 'ricerca', keys: ['OPENAI_API_KEY'] }).success).toBe(true);
    expect(CapabilityCallContextRequestSchema.safeParse({ identity, capability: 'ricerca', keys: ['K', 'K'] }).success).toBe(false);
    expect(CapabilityCallContextRequestSchema.safeParse({ identity, capability: 'ricerca', keys: ['TELEGRAM_SESSION_STRING'] }).success).toBe(false);
  });

  it('keeps missing key, unavailable source and disabled capability distinct', () => {
    expect(CapabilityCallContextErrorCodeSchema.options).toEqual(expect.arrayContaining(['credential_missing', 'source_unavailable', 'capability_disabled', 'capability_not_installed', 'identity_mismatch']));
    expect(CapabilityCallContextResponseSchema.safeParse({ ok: true, context }).success).toBe(true);
    expect(CapabilityCallContextResponseSchema.safeParse({ ok: false, error: 'credential_missing', keys: ['GOOGLE_API_KEY'] }).success).toBe(true);
    expect(CapabilityCallContextResponseSchema.safeParse({ ok: false, error: 'source_unavailable' }).success).toBe(true);
    expect(CapabilityCallContextResponseSchema.safeParse({ ok: false, error: 'capability_disabled' }).success).toBe(true);
  });

  it.each([
    ['missing key without the key list', { ok: false, error: 'credential_missing' }],
    ['key list on another error', { ok: false, error: 'source_unavailable', keys: ['K'] }],
    ['unknown error', { ok: false, error: 'fallback_to_env' }],
    ['success without context', { ok: true }],
  ])('rejects %s', (_label, input) => {
    expect(CapabilityCallContextResponseSchema.safeParse(input).success).toBe(false);
  });
});
