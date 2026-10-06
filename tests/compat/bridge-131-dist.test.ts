import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * BRIDGE-131: the new contracts are published from EXISTING subpaths (no package.json change), in both ESM and CJS
 * builds. Runs against dist/, so `pnpm build` must precede it (as for bridge-129-package.test.ts).
 */
const root = new URL('../../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as {
  exports: Record<string, { import: string; require: string }>;
};

const added: Record<string, string[]> = {
  './agent': [
    'AgentManagementCommandSchema', 'AgentManagementCommandResultSchema', 'AgentManagementStateSchema',
    'AgentConfigVersionStateSchema', 'deriveAgentManagementOutcome', 'sameAgentCommand',
    'AgentScopePolicySchema', 'PolicyApprovalSchema', 'AgentActionLogEventSchema', 'resolvePolicyDecision',
  ],
  './vault': [
    'CredentialLinkSchema', 'AgentCredentialLinkEntrySchema', 'AgentCredentialLinksSchema',
    'CredentialActionRequestSchema', 'CredentialActionResultSchema', 'CredentialActionErrorResponseSchema',
  ],
  './capability': [
    'CapabilityCallIdentitySchema', 'CapabilityAgentScopeSchema', 'CapabilityPersonScopeSchema',
    'CapabilityCallContextSchema', 'CapabilityCallContextResponseSchema', 'pickCapabilityCredentials', 'toToolCallScope',
    'ElevenLabsProvisionRequestSchema', 'ElevenLabsProvisionResultSchema', 'ElevenLabsChannelStatusSchema',
    'CoachProgramSchema', 'CoachSessionSchema', 'CoachProgressSchema', 'CoachMinuteBudgetSchema', 'CoachPersonSnapshotSchema',
  ],
  './voice': [
    'AgentVoiceSettingsSchema', 'AgentVoiceConfigSchema', 'VoiceProviderCatalogSchema', 'OutboundCallerIdentitySchema',
    'validateAgentVoiceSettings', 'outboundCallerIdentityFor',
  ],
  './http': [
    'agentCommandContract', 'agentManagementStateContract', 'agentCommandsPath', 'agentManagementPath',
    'capabilityCallContextContract', 'CAPABILITY_CALL_CONTEXT_PATH',
    'elevenLabsProvisionContract', 'elevenLabsStatusContract', 'capElevenLabsAgentPath',
    'coachProgramPutContract', 'coachProgramGetContract', 'coachSessionRecordContract', 'coachPersonSnapshotContract',
    'capCoachProgramPath', 'capCoachSessionsPath', 'capCoachPersonPath',
  ],
};

describe('1.31 additive contracts are published from existing subpaths', () => {
  for (const [subpath, names] of Object.entries(added)) {
    it(`exports ${names.length} new symbols from ${subpath} in ESM and CJS`, async () => {
      const target = pkg.exports[subpath]!;
      const esm = await import(new URL(target.import, root).href) as Record<string, unknown>;
      const cjs = createRequire(import.meta.url)(new URL(target.require, root).pathname) as Record<string, unknown>;
      expect(names.filter((name) => !(name in esm))).toEqual([]);
      expect(names.filter((name) => !(name in cjs))).toEqual([]);
    });
  }
});
