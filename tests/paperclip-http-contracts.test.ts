import { describe, expect, it } from 'vitest';
import {
  capAgentConfigPath, paperclipAgentConfigGetContract, paperclipAgentConfigPutContract,
  paperclipAgentInstallContract, paperclipAgentInstallPath,
  paperclipAgentReadbackContract, paperclipAgentReadbackPath,
  AgentConfigSavedSchema, AgentConfigStaleSchema, ReloadAgentResponseSchema,
} from '../src/http/index.js';
import { AgentContextCoreSchema } from '../src/agent/agent-context-core.js';
import { PaperclipAgentConfigSchema, PaperclipAgentInstallRequestSchema, PaperclipAgentReadbackSchema } from '../src/capability/paperclip/index.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const desired = { agentId: 'agent-a', version: 2, unitId: 'unit-a', roleRef: 'spokesperson' };
const installation = { scope, version: 2, enabled: true, registryFingerprint: 'a'.repeat(64) };
const readback = { scope, appliedVersion: 2, enabled: true, registryFingerprint: 'a'.repeat(64), configFingerprint: 'b'.repeat(64), provisioningRevision: 3,
  unitId: 'unit-a', callerRoleRef: 'spokesperson', companyId: '00000000-0000-4000-8000-000000000001', paperclipAgentId: '00000000-0000-4000-8000-000000000001',
  roleAgents: {}, provenance: { source: 'native_operator_inventory', inventoryFingerprint: 'c'.repeat(64) } };
const entry = { capability: 'paperclip', installation };
const observation = { capability: 'paperclip', readback };
const legacy = { agentId: 'agent-a', ownerId: 'owner-a', credentials: {}, llmConfig: { provider: 'test', model: 'test' }, telegramAllowFrom: [] };

describe('canonical Paperclip per-agent HTTP contracts', () => {
  it('reuses config path, params, saved schema and generic Forge version body', () => {
    expect(paperclipAgentConfigPutContract.method).toBe('PUT');
    expect(paperclipAgentConfigGetContract.method).toBe('GET');
    expect(paperclipAgentConfigPutContract.path).toBe('/internal/capability/agents/:agentId/config');
    expect(paperclipAgentConfigGetContract.path).toBe(paperclipAgentConfigPutContract.path);
    expect(capAgentConfigPath('agent-a')).toBe('/internal/capability/agents/agent-a/config');
    expect(paperclipAgentConfigPutContract.bodySchema).toBe(PaperclipAgentConfigSchema);
    expect(paperclipAgentConfigGetContract.responseSchema).toBe(PaperclipAgentConfigSchema);
    expect(paperclipAgentConfigPutContract.responseSchema).toBe(AgentConfigSavedSchema);
    expect(paperclipAgentConfigPutContract.bodySchema.parse(desired)).toEqual(desired);
    expect(AgentConfigSavedSchema.parse({ ok: true, version: desired.version })).toEqual({ ok: true, version: 2 });
    expect(AgentConfigStaleSchema.parse({ ok: false, error: 'stale_version', currentVersion: 2 }).currentVersion).toBe(2);
  });
  it('publishes distinct install and observation methods/paths with exact schemas', () => {
    expect(paperclipAgentInstallContract.method).toBe('POST');
    expect(paperclipAgentReadbackContract.method).toBe('GET');
    expect(paperclipAgentInstallContract.path).toBe('/internal/capability/agents/:agentId/install');
    expect(paperclipAgentReadbackContract.path).toBe('/internal/capability/agents/:agentId/readback');
    expect(paperclipAgentInstallPath('agent-a')).toBe('/internal/capability/agents/agent-a/install');
    expect(paperclipAgentReadbackPath('agent-a')).toBe('/internal/capability/agents/agent-a/readback');
    expect(paperclipAgentInstallContract.bodySchema).toBe(PaperclipAgentInstallRequestSchema);
    expect(paperclipAgentInstallContract.responseSchema).toBe(PaperclipAgentReadbackSchema);
    expect(paperclipAgentReadbackContract.responseSchema).toBe(PaperclipAgentReadbackSchema);
  });
  it.each([paperclipAgentConfigGetContract, paperclipAgentConfigPutContract, paperclipAgentInstallContract, paperclipAgentReadbackContract])(
    'requires the canonical internal secret and validates agent params for $method $path', contract => {
      expect(contract.authType).toBe('secret');
      expect(contract.paramsSchema.safeParse({ agentId: 'agent-a' }).success).toBe(true);
      expect(contract.paramsSchema.safeParse({ agentId: '../agent-b' }).success).toBe(false);
    });
  it.each(['', '../agent-b', 'Agent-A', 'a/b'])('rejects unsafe helper input %s', agentId => {
    expect(() => paperclipAgentInstallPath(agentId)).toThrow();
    expect(() => paperclipAgentReadbackPath(agentId)).toThrow();
  });
});

describe('loaded context and reload compatibility', () => {
  it('keeps old context and reload response valid and preserves existing runtime fields', () => {
    expect(AgentContextCoreSchema.parse({ ...legacy, workspacePath: '/synthetic/agent-a' }).workspacePath).toBe('/synthetic/agent-a');
    expect(ReloadAgentResponseSchema.parse({ ok: true, agentId: 'agent-a', telegram: 'skipped' })).toEqual({ ok: true, agentId: 'agent-a', telegram: 'skipped' });
  });
  it('roundtrips desired installation metadata and actual cap readback separately', () => {
    expect(AgentContextCoreSchema.parse({ ...legacy, capabilityInstallations: [entry] }).capabilityInstallations).toEqual([entry]);
    expect(ReloadAgentResponseSchema.parse({ ok: true, agentId: 'agent-a', capabilityAttestations: [observation] }).capabilityAttestations).toEqual([observation]);
  });
  it('rejects malformed installation metadata instead of passthrough acceptance', () => {
    expect(AgentContextCoreSchema.safeParse({ ...legacy, capabilityInstallations: [{ ...entry, installation: { ...installation, version: 0 } }] }).success).toBe(false);
  });
  it('rejects malformed cap readback instead of stripping it from the reload', () => {
    expect(ReloadAgentResponseSchema.safeParse({ ok: true, agentId: 'agent-a', capabilityAttestations: [{ ...observation, readback: { ...readback, appliedVersion: 0 } }] }).success).toBe(false);
  });
  it('bounds one installation/attestation per agent and refuses unknown capabilities', () => {
    expect(AgentContextCoreSchema.safeParse({ ...legacy, capabilityInstallations: [entry, entry] }).success).toBe(false);
    expect(ReloadAgentResponseSchema.safeParse({ ok: true, agentId: 'agent-a', capabilityAttestations: [observation, observation] }).success).toBe(false);
    expect(AgentContextCoreSchema.safeParse({ ...legacy, capabilityInstallations: [{ ...entry, capability: 'other' }] }).success).toBe(false);
    expect(ReloadAgentResponseSchema.safeParse({ ok: true, agentId: 'agent-a', capabilityAttestations: [{ ...observation, capability: 'other' }] }).success).toBe(false);
  });
  it('rejects credential/run fields in either wrapper', () => {
    expect(AgentContextCoreSchema.safeParse({ ...legacy, capabilityInstallations: [{ ...entry, credentials: {} }] }).success).toBe(false);
    expect(ReloadAgentResponseSchema.safeParse({ ok: true, agentId: 'agent-a', capabilityAttestations: [{ ...observation, runId: 'synthetic' }] }).success).toBe(false);
  });
});
