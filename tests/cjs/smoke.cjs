#!/usr/bin/env node
/**
 * tests/cjs/smoke.cjs — CommonJS resolution smoke for every public bridge subpath.
 *
 * Why this file is .cjs (not .test.cjs and not .ts):
 *   This file MUST be executed by Node's CommonJS loader, NOT by vitest. The Phase 19
 *   incident (2026-05-04) was caused by `require('@x9-forge/contracts/auth')` failing
 *   under Node's CJS resolver because bridge `package.json#/exports."./auth"` had no
 *   `"require"` field. Vitest's runtime loader is ESM-first (per vitest.config.ts
 *   `environment: 'node'`) and resolves differently — a vitest test would NOT exercise
 *   the failing code path.
 *
 *   Run via:  node /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/tests/cjs/smoke.cjs
 *   Wired into `pnpm test` (Task 2 of Phase 18.1 Plan 01).
 *
 * Coverage:
 *   1. require() resolves for every subpath listed in package.json#/exports.
 *   2. A known-named symbol from each subpath is loaded and has the expected JS type.
 *   3. Failure mode = clear exit-1 with subpath + error code (e.g. ERR_PACKAGE_PATH_NOT_EXPORTED).
 *
 * Resolution model: bridge package.json#/name is `@x9-forge/contracts`. Files under
 * the bridge repo `require('@x9-forge/contracts/<sub>')` self-reference into the
 * bridge's own dist via Node's package self-referencing (Node 12+). Verified by
 * `node -e "console.log(require.resolve('@x9-forge/contracts/auth'))"` printing a
 * path inside this repo's own dist/.
 *
 * If this file ever exits non-zero in CI, the dual-build is broken — do NOT release.
 *
 * Phase 18.1 Plan 01 — closes the validation gap that let the Phase 19 incident ship.
 */
'use strict';

const assert = require('node:assert/strict');
// C3-B1: the canonical Web policy/invitation API must exist in the real CJS package.
const webChannel = require('@x9-forge/contracts/capability');
// C3-B3: validate the real compiled callback and its unresolved-identity denial gate.
assert.equal(typeof webChannel.isElevenLabsWebAuthorityCurrent, 'function');
const webAuthority = require('@x9-forge/contracts/http').elevenLabsWebAuthorityContract;
assert.ok(webAuthority);
assert.equal(webAuthority.authType, 'token');
assert.equal(webAuthority.authHeader, require('@x9-forge/contracts/auth').INTERNAL_TOKEN_HEADER);
const authorityRequest = { requestId: 'attempt-0001', scope: { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-heir' }, linkId: 'link-0000001', phase: 'before' };
const authoritySnapshot = { ...authorityRequest, viewer: { kind: 'anonymous' }, lifecycle: 'active', configuredOrigin: 'https://forge.example', authorityVersion: 3, observedAt: '2026-10-08T12:00:00Z', expiresAt: '2026-10-08T12:01:00Z', agentIdentity: null };
assert.ok(webChannel.ElevenLabsWebAuthorityResponseSchema);
assert.equal(webChannel.ElevenLabsWebAuthorityResponseSchema.safeParse({ ok: true, request: authorityRequest, error: 'identity_unavailable', snapshot: authoritySnapshot }).success, false);
assert.ok(webChannel.ElevenLabsWebAuthoritySnapshotSchema);
assert.equal(webChannel.ElevenLabsWebAuthoritySnapshotSchema.safeParse({ ...authoritySnapshot, agentIdentity: {} }).success, false);
assert.equal(typeof webChannel.canAdmitElevenLabsWebViewer, 'function');
assert.equal(typeof webChannel.isElevenLabsWebCatalogSelectionCurrent, 'function');
assert.equal(require('@x9-forge/contracts/http').elevenLabsWebSessionContract?.authType, 'secret');
assert.equal(require('@x9-forge/contracts/http').elevenLabsWebPublicPath?.('synthetic-link'), '/parla/synthetic-link');
assert.equal(typeof webChannel.isElevenLabsWebPolicyResultCurrent, 'function');
assert.equal(typeof webChannel.isElevenLabsWebInvitationCurrent, 'function');
assert.equal(webChannel.ElevenLabsWebPolicySchema.safeParse({scope:{tenantId:'synthetic-tenant',ownerId:'synthetic-owner',agentId:'synthetic-agent'},version:1,access:'owner',paused:false}).success, true);


/** @type {Array<{ specifier: string, knownSymbol: string, expectedType?: string, expectedValue?: unknown }>} */
const PROBES = [
  // B1/B7 (v1.29.0): real CommonJS consumers must resolve both new subpaths.
  { specifier: '@x9-forge/contracts/capability/parameters', knownSymbol: 'CapabilityParameterSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/parameters', knownSymbol: 'CapabilityAgentParametersSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/presentation', knownSymbol: 'CapabilityOutputSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/presentation', knownSymbol: 'CapabilityFeedbackSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/presentation', knownSymbol: 'CapabilityTrendsSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability', knownSymbol: 'AgentTurnSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability', knownSymbol: 'CapabilityTurnLeadResponseSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/http', knownSymbol: 'capTurnLeadContract', expectedType: 'object' },
  // Root: `@x9-forge/contracts` re-exports ONLY model-router (per src/index.ts and dist/index.d.cts).
  // ModelTierSchema is the canonical Zod schema in the model-router subpath; pick it as the root probe.
  { specifier: '@x9-forge/contracts',                  knownSymbol: 'ModelTierSchema',       expectedType: 'object' },
  { specifier: '@x9-forge/contracts/auth',             knownSymbol: 'INTERNAL_TOKEN_HEADER', expectedType: 'string', expectedValue: 'X-Internal-Token' },
  { specifier: '@x9-forge/contracts/auth',             knownSymbol: 'INTERNAL_SECRET_HEADER', expectedType: 'string', expectedValue: 'X-Internal-Secret' },
  { specifier: '@x9-forge/contracts/agent',            knownSymbol: 'AgentIdSchema',         expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability',       knownSymbol: 'CapabilityManifestSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/voice',            knownSymbol: 'VoiceCallIntentSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/stt',   knownSymbol: 'CAP_STT_DEFAULT_PORT',  expectedType: 'number', expectedValue: 4011 },
  { specifier: '@x9-forge/contracts/capability/stt',   knownSymbol: 'TranscribeRequestSchema', expectedType: 'object' },
  // Phase 50 (v1.19.0) — voice-note provider lanes (CJS resolution).
  { specifier: '@x9-forge/contracts/capability/tts',   knownSymbol: 'TtsProviderSchema',      expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/tts',   knownSymbol: 'DEFAULT_TTS_PROVIDER',   expectedType: 'string', expectedValue: 'elevenlabs' },
  // Phase 50 (v1.20.0) — cap-voice-live contracts + provider lane (CJS resolution).
  { specifier: '@x9-forge/contracts/capability/voice-live', knownSymbol: 'CAP_VOICE_LIVE_DEFAULT_PORT', expectedType: 'number', expectedValue: 3217 },
  { specifier: '@x9-forge/contracts/capability/voice-live', knownSymbol: 'VoiceLiveCallStartRequestSchema', expectedType: 'object' },
  // Phase 54 (v1.28.0) — cap-ricerca / cap-lab contracts (CJS resolution).
  { specifier: '@x9-forge/contracts/capability/ricerca', knownSymbol: 'ResearchAgentConfigSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/capability/lab', knownSymbol: 'LabAgentConfigSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/http', knownSymbol: 'capAgentConfigPath', expectedType: 'function' },
  { specifier: '@x9-forge/contracts/voice',            knownSymbol: 'VoiceProviderSchema',   expectedType: 'object' },
  { specifier: '@x9-forge/contracts/http',             knownSymbol: 'CAP_VOICE_LIVE_CALL_START_PATH', expectedType: 'string', expectedValue: '/internal/live/call-start' },
  { specifier: '@x9-forge/contracts/http',             knownSymbol: 'vaultResolveContract',  expectedType: 'object' },
  // Phase 21 (v1.16.0) — TOKROT-01 token-rotate PATCH contract + request schema (CJS resolution).
  { specifier: '@x9-forge/contracts/http',             knownSymbol: 'internalFactoryTelegramTokenContract', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/http',             knownSymbol: 'InternalFactoryTelegramTokenRequestSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/memory',           knownSymbol: 'MEMORY_CORRECT_PATH',   expectedType: 'string', expectedValue: '/internal/memory/correct' },
  // Phase 11.A — messaging subpath (5 schemas). ChannelTypeSchema is the enum probe; others type-checked in consumer-cjs.
  { specifier: '@x9-forge/contracts/messaging',        knownSymbol: 'ChannelTypeSchema',     expectedType: 'object' },
  { specifier: '@x9-forge/contracts/messaging',        knownSymbol: 'IncomingMessageEnvelopeSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/messaging',        knownSymbol: 'AgentEmailInboxSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/messaging',        knownSymbol: 'AgentTelegramBotSchema', expectedType: 'object' },
  { specifier: '@x9-forge/contracts/model-router',     knownSymbol: 'ModelTierSchema',       expectedType: 'object' },
  // RagQueryRequestSchema is a top-level Zod schema export from rag/index.cjs (see dist/rag/index.d.cts).
  { specifier: '@x9-forge/contracts/rag',              knownSymbol: 'RagQueryRequestSchema', expectedType: 'object' },
  // VaultTierSchema is the canonical value-level Zod schema in vault/index.cjs (VaultTier itself is type-only).
  { specifier: '@x9-forge/contracts/vault',            knownSymbol: 'VaultTierSchema',       expectedType: 'object' },
];

let passed = 0;
let failed = 0;

for (const probe of PROBES) {
  const { specifier, knownSymbol, expectedType, expectedValue } = probe;
  try {
    const mod = require(specifier);

    if (!(knownSymbol in mod)) {
      console.error(
        '[cjs-smoke] FAIL ' + specifier + ': expected named export \'' + knownSymbol + '\' not present (got: ' +
        Object.keys(mod).slice(0, 8).join(', ') +
        (Object.keys(mod).length > 8 ? '...' : '') + ')'
      );
      failed++;
      continue;
    }

    const actualType = typeof mod[knownSymbol];
    if (expectedType && actualType !== expectedType) {
      console.error(
        '[cjs-smoke] FAIL ' + specifier + ': ' + knownSymbol +
        ' expected typeof \'' + expectedType + '\', got \'' + actualType + '\''
      );
      failed++;
      continue;
    }

    if (expectedValue !== undefined) {
      assert.equal(mod[knownSymbol], expectedValue, specifier + ': ' + knownSymbol + ' value mismatch');
    }

    console.log(
      '[cjs-smoke] OK   ' + specifier + '  ->  ' + knownSymbol +
      ' (' + actualType + (expectedValue !== undefined ? ' = ' + JSON.stringify(expectedValue) : '') + ')'
    );
    passed++;
  } catch (err) {
    const code = err && err.code ? err.code : err && err.name ? err.name : 'UNKNOWN';
    console.error('[cjs-smoke] FAIL ' + specifier + ': ' + code + ' - ' + err.message);
    failed++;
  }
}

console.log('');
console.log('[cjs-smoke] summary: ' + passed + ' passed, ' + failed + ' failed (of ' + PROBES.length + ' probes)');

if (failed > 0) {
  console.error('[cjs-smoke] EXIT 1 - dual ESM+CJS build is broken. Do NOT release.');
  process.exit(1);
}
// Canonical agent runtime behavior must work through real package subpaths.
require('./bridge-130-smoke.cjs');
// R7-1: validate the public compiled workspace contract in the normal test script.
require('./r7-workspace-smoke.cjs');
require('./model-catalog-smoke.cjs');
require('./models-batch-smoke.cjs');
// Check every public entrypoint before any module cache can hide initialization cycles.
require('node:child_process').execFileSync(process.execPath, [require('node:path').join(__dirname, 'public-entrypoints-first.mjs')], { stdio: 'inherit' });
// Canonical roleless source and local-observation API through public compiled exports.
require("node:child_process").execFileSync(process.execPath, [require("node:path").join(__dirname, "model-local-authority-smoke.mjs")], { stdio: "inherit" });
// A public legacy observation probe must execute before successful smoke exit.
const legacyObservationOutput = require('node:child_process').execFileSync(process.execPath, [require('node:path').join(__dirname, 'model-legacy-observation-smoke.mjs')], { encoding: 'utf8' });
const legacyObservationProbe = JSON.parse(legacyObservationOutput.trim());
require('node:assert/strict').equal(legacyObservationProbe.marker, 'LEGACY_OBSERVATION_PUBLIC_PROBE', 'Legacy observation semantic probe must execute');
require('node:assert/strict').equal(legacyObservationProbe.passed, 4, 'Every fresh public format must be qualified');
console.log(legacyObservationOutput.trim());
process.exit(0);
