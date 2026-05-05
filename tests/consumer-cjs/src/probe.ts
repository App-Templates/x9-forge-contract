// Synthetic CommonJS consumer probe — exists to be type-checked by tsc --noEmit.
// Each import targets a distinct public bridge subpath. If any subpath's
// .d.cts references a missing .cjs (the Phase 19 incident bug class), tsc
// emits TS2307 and the consumer-cjs-node20 CI job exits non-zero.
//
// Subpath/symbol pairs are kept in lockstep with tests/cjs/smoke.cjs PROBES
// (the runtime counterpart). When adding a new public subpath to the bridge,
// add a probe here AND in tests/cjs/smoke.cjs.

import { ModelTierSchema as RootModelTierSchema } from "@x9-forge/contracts";
import { INTERNAL_TOKEN_HEADER, INTERNAL_SECRET_HEADER } from "@x9-forge/contracts/auth";
import { AgentIdSchema } from "@x9-forge/contracts/agent";
import { CapabilityManifestSchema } from "@x9-forge/contracts/capability";
import { VoiceCallIntentSchema } from "@x9-forge/contracts/voice";
import { CAP_STT_DEFAULT_PORT, TranscribeRequestSchema } from "@x9-forge/contracts/capability/stt";
import { vaultResolveContract } from "@x9-forge/contracts/http";
import { MEMORY_CORRECT_PATH } from "@x9-forge/contracts/memory";
import { ModelTierSchema } from "@x9-forge/contracts/model-router";
import { RagQueryRequestSchema } from "@x9-forge/contracts/rag";
import { VaultTierSchema } from "@x9-forge/contracts/vault";

// Force the imports to be retained (no `noUnusedLocals`-style elision).
// `void` consumes the references at type level without runtime cost.
void RootModelTierSchema;
void INTERNAL_TOKEN_HEADER;
void INTERNAL_SECRET_HEADER;
void AgentIdSchema;
void CapabilityManifestSchema;
void VoiceCallIntentSchema;
void CAP_STT_DEFAULT_PORT;
void TranscribeRequestSchema;
void vaultResolveContract;
void MEMORY_CORRECT_PATH;
void ModelTierSchema;
void RagQueryRequestSchema;
void VaultTierSchema;

// Compile-time assertion: a known-shaped value from each subpath has the expected JS type at the type level.
// (Runtime checks live in tests/cjs/smoke.cjs — this file is type-only.)
const _internalTokenHeader: string = INTERNAL_TOKEN_HEADER;
const _capSttPort: number = CAP_STT_DEFAULT_PORT;
const _memoryCorrectPath: string = MEMORY_CORRECT_PATH;
void _internalTokenHeader; void _capSttPort; void _memoryCorrectPath;
