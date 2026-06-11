/**
 * tests/esm/smoke.test.ts — ESM resolution smoke for every public bridge subpath.
 *
 * Mirrors tests/cjs/smoke.cjs. Two smokes cover both module systems:
 *   - cjs/smoke.cjs uses require() — proves Phase 19 bug class fix
 *   - esm/smoke.test.ts uses import — proves ESM consumers (agent-x9 link mode + future ESM forge-v2) unaffected
 *
 * Static imports prove the ESM resolver finds every subpath at module-load time.
 * (Dynamic import() inside `it()` would still work but would catch the wrong class
 *  of bug — static imports match how real consumers actually write the code.)
 *
 * Phase 18.1 Plan 01 — closes CONTEXT SC-3 (CJS resolution test) + SC-4 (ESM consumers unaffected).
 */
import { describe, expect, it } from 'vitest';

// Root: only model-router is re-exported at root (per src/index.ts) — pick ModelTierSchema.
import { ModelTierSchema as RootModelTierSchema } from '@x9-forge/contracts';
import { INTERNAL_TOKEN_HEADER, INTERNAL_SECRET_HEADER } from '@x9-forge/contracts/auth';
import { AgentIdSchema } from '@x9-forge/contracts/agent';
import { CapabilityManifestSchema } from '@x9-forge/contracts/capability';
import { VoiceCallIntentSchema } from '@x9-forge/contracts/voice';
import { CAP_STT_DEFAULT_PORT, TranscribeRequestSchema } from '@x9-forge/contracts/capability/stt';
import { vaultResolveContract } from '@x9-forge/contracts/http';
import { MEMORY_CORRECT_PATH, INTERNAL_MEMORY_INGEST_PATH } from '@x9-forge/contracts/memory';
import { ModelTierSchema } from '@x9-forge/contracts/model-router';
import { RagQueryRequestSchema } from '@x9-forge/contracts/rag';
import { VaultTierSchema } from '@x9-forge/contracts/vault';

describe('ESM smoke — every public bridge subpath resolves via import', () => {
  it('root subpath: re-exports model-router (ModelTierSchema)', () => {
    expect(typeof RootModelTierSchema.parse).toBe('function');
  });

  it('auth subpath: header constants are well-known string literals', () => {
    expect(INTERNAL_TOKEN_HEADER).toBe('X-Internal-Token');
    expect(INTERNAL_SECRET_HEADER).toBe('X-Internal-Secret');
  });

  it('agent subpath: AgentIdSchema is a Zod schema with .parse', () => {
    expect(typeof AgentIdSchema.parse).toBe('function');
  });

  it('capability subpath: CapabilityManifestSchema is a Zod schema', () => {
    expect(typeof CapabilityManifestSchema.parse).toBe('function');
  });

  it('voice subpath: VoiceCallIntentSchema is a Zod schema', () => {
    expect(typeof VoiceCallIntentSchema.parse).toBe('function');
  });

  it('capability/stt subpath (Phase 18.1 back-filled): port + request schema', () => {
    expect(CAP_STT_DEFAULT_PORT).toBe(4011);
    expect(typeof TranscribeRequestSchema.parse).toBe('function');
  });

  it('http subpath: vaultResolveContract is a contract object', () => {
    expect(typeof vaultResolveContract).toBe('object');
    expect(vaultResolveContract).not.toBeNull();
  });

  it('memory subpath: MEMORY_CORRECT_PATH literal preserved', () => {
    expect(MEMORY_CORRECT_PATH).toBe('/internal/memory/correct');
    expect(INTERNAL_MEMORY_INGEST_PATH).toBe('/internal/memory/ingest');
  });

  it('model-router subpath: ModelTierSchema is a Zod schema', () => {
    expect(typeof ModelTierSchema.parse).toBe('function');
  });

  it('rag subpath: RagQueryRequestSchema is a Zod schema', () => {
    expect(typeof RagQueryRequestSchema.parse).toBe('function');
  });

  it('vault subpath: VaultTierSchema is a Zod schema (value-level export)', () => {
    expect(typeof VaultTierSchema.parse).toBe('function');
  });
});
