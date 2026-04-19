import { describe, it, expect } from 'vitest';
import {
  // Shared primitives (Phase 37.6 additions)
  RagIdentityEnvelopeSchema,
  RagProviderSchema,
  RagSourceStatusEnumSchema,
  RagPrivacyLevelSchema,
  RagTopicTypeSchema,
  RagTopicRefSchema,
  RagCorpusRefSchema,
  RagClaimSchema,
  RagClaimConflictSchema,
  RagCostEstimateSchema,
  RagToolErrorSchema,
  RagDegradedMarkersSchema,
  // Source tools
  RagSourceConnectionSchema,
  RagJobTypeSchema,
  RagJobStatusSchema,
  RagSyncJobSummarySchema,
  RagSourceStatusSchema,
  RagSourceSyncRequestSchema,
  RagSourceSyncResponseSchema,
  RagSourceStatusRequestSchema,
  RagSourceStatusResponseSchema,
  // Document tools
  RagDocumentRefSchema,
  RagDocumentRevisionRefSchema,
  RagDocumentStatusSchema,
  RagDocumentParseStatusSchema,
  RagDocumentListRequestSchema,
  RagDocumentListResponseSchema,
  RagDocumentOpenRequestSchema,
  RagDocumentOpenResponseSchema,
  // Existing (smoke-imported to guard against index re-export regressions)
  RagQueryRequestSchema,
  RagTopicStateRequestSchema,
} from '../src/rag/index';

// -----------------------------------------------------------------------
// Phase 37.6 extension — drift-guard / positive+negative parse tests
// ADR-cap-rag.md §21.2 (primitives) + §20.1 (tool surface)
// -----------------------------------------------------------------------

// Valid UUID v4 fixtures — Zod 4 enforces RFC 4122 version/variant bits,
// so all-zero / sequential patterns are rejected. Using the nil UUID
// (00000000-...) for the neutral case and two valid v4 UUIDs for A/B/C.
const UUID_A = '00000000-0000-0000-0000-000000000000'; // nil UUID (valid)
const UUID_B = '11111111-1111-4111-8111-111111111111'; // valid v4
const UUID_C = '22222222-2222-4222-8222-222222222222'; // valid v4

describe('@x9-forge/contracts/rag — Phase 37.6 shared primitives', () => {
  it('RagIdentityEnvelope requires tenant_id + owner_id + agent_id', () => {
    expect(
      RagIdentityEnvelopeSchema.parse({
        tenant_id: 't-1',
        owner_id: 'o-1',
        agent_id: 'a-1',
      }),
    ).toEqual({ tenant_id: 't-1', owner_id: 'o-1', agent_id: 'a-1' });
  });

  it('RagIdentityEnvelope rejects missing tenant_id', () => {
    expect(
      RagIdentityEnvelopeSchema.safeParse({ owner_id: 'o', agent_id: 'a' }).success,
    ).toBe(false);
  });

  it('RagIdentityEnvelope rejects empty tenant_id', () => {
    expect(
      RagIdentityEnvelopeSchema.safeParse({
        tenant_id: '',
        owner_id: 'o',
        agent_id: 'a',
      }).success,
    ).toBe(false);
  });

  it('RagProvider accepts all 7 canonical values', () => {
    for (const p of ['upload', 'local_folder', 'notion', 'gdocs', 'gdrive', 'slack', 'gmail']) {
      expect(RagProviderSchema.safeParse(p).success).toBe(true);
    }
    expect(RagProviderSchema.safeParse('twitter').success).toBe(false);
  });

  it('RagSourceStatusEnum accepts active | paused | error', () => {
    for (const s of ['active', 'paused', 'error']) {
      expect(RagSourceStatusEnumSchema.safeParse(s).success).toBe(true);
    }
    expect(RagSourceStatusEnumSchema.safeParse('deleted').success).toBe(false);
  });

  it('RagPrivacyLevel covers 5 tiers', () => {
    for (const p of ['standard', 'sensitive', 'secret', 'third_party', 'restricted']) {
      expect(RagPrivacyLevelSchema.safeParse(p).success).toBe(true);
    }
    expect(RagPrivacyLevelSchema.safeParse('public').success).toBe(false);
  });

  it('RagTopicType covers 5 buckets', () => {
    for (const t of ['project', 'product', 'research', 'personal', 'other']) {
      expect(RagTopicTypeSchema.safeParse(t).success).toBe(true);
    }
    expect(RagTopicTypeSchema.safeParse('random').success).toBe(false);
  });

  it('RagTopicRef requires id uuid + name + topic_type', () => {
    expect(
      RagTopicRefSchema.parse({ id: UUID_A, name: 'Topic A', topic_type: 'project' }),
    ).toEqual({ id: UUID_A, name: 'Topic A', topic_type: 'project' });
  });

  it('RagCorpusRef requires id uuid + name', () => {
    expect(RagCorpusRefSchema.parse({ id: UUID_A, name: 'Corpus A' })).toEqual({
      id: UUID_A,
      name: 'Corpus A',
    });
  });

  it('RagClaim parses a full active claim', () => {
    expect(
      RagClaimSchema.safeParse({
        id: UUID_A,
        topic_id: UUID_B,
        claim_type: 'fact',
        subject_text: 'Stefano',
        predicate: 'likes',
        object_text: 'espresso',
        confidence: 0.9,
        salience: 0.7,
        status: 'active',
      }).success,
    ).toBe(true);
  });

  it('RagClaim rejects confidence out of [0,1]', () => {
    expect(
      RagClaimSchema.safeParse({
        id: UUID_A,
        topic_id: UUID_B,
        claim_type: 'fact',
        subject_text: 's',
        predicate: 'p',
        object_text: 'o',
        confidence: 1.5,
        salience: 0.5,
        status: 'active',
      }).success,
    ).toBe(false);
  });

  it('RagClaimConflict parses an auto-resolved entry', () => {
    expect(
      RagClaimConflictSchema.safeParse({
        id: UUID_A,
        topic_id: UUID_B,
        conflict_type: 'contradiction',
        affected_claim_ids: [UUID_C],
        resolution_method: 'auto',
        winning_claim_id: UUID_C,
      }).success,
    ).toBe(true);
  });

  it('RagCostEstimate applies defaults for zero fields', () => {
    const parsed = RagCostEstimateSchema.parse({});
    expect(parsed.embedding_tokens).toBe(0);
    expect(parsed.llm_input_tokens).toBe(0);
    expect(parsed.llm_output_tokens).toBe(0);
    expect(parsed.estimated_cost_usd).toBe(0);
  });

  it('RagToolError code enum covers all 6 ADR standard codes', () => {
    for (const c of [
      'TOOL_NOT_FOUND',
      'TOOL_CALL_INVALID',
      'TOOL_EXEC_FAILED',
      'TOOL_ACL_DENIED',
      'TOOL_PRIVACY_BLOCKED',
      'TOOL_COST_EXCEEDED',
    ]) {
      expect(
        RagToolErrorSchema.safeParse({ code: c, error: 'msg' }).success,
      ).toBe(true);
    }
    expect(
      RagToolErrorSchema.safeParse({ code: 'TOOL_UNKNOWN', error: 'x' }).success,
    ).toBe(false);
  });

  it('RagDegradedMarkers all fields optional', () => {
    expect(RagDegradedMarkersSchema.safeParse({}).success).toBe(true);
    expect(
      RagDegradedMarkersSchema.safeParse({
        _degraded: true,
        _memory_v2: 'unavailable',
        _mode: 'evidence_only',
      }).success,
    ).toBe(true);
  });
});

describe('@x9-forge/contracts/rag — Phase 37.6 source tools', () => {
  it('RagSourceConnection parses minimal active connection', () => {
    expect(
      RagSourceConnectionSchema.safeParse({
        id: UUID_A,
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
        provider: 'notion',
        status: 'active',
        last_sync_at: null,
      }).success,
    ).toBe(true);
  });

  it('RagJobType covers all 15 canonical job types', () => {
    for (const jt of [
      'full_sync',
      'incremental_sync',
      'parse',
      'index',
      'extraction',
      'entity_resolution',
      'claim_validation',
      'conflict_resolution',
      'state_synthesis',
      'changes_digest',
      'timeline_extraction',
      'coherence_check',
      'kg_cleanup',
      'reindex',
      'topic_eval',
    ]) {
      expect(RagJobTypeSchema.safeParse(jt).success).toBe(true);
    }
    expect(RagJobTypeSchema.safeParse('backup').success).toBe(false);
  });

  it('RagJobStatus covers 5 lifecycle states', () => {
    for (const s of ['pending', 'running', 'completed', 'failed', 'cancelled']) {
      expect(RagJobStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('RagSyncJobSummary parses a pending job', () => {
    expect(
      RagSyncJobSummarySchema.safeParse({
        id: UUID_A,
        job_type: 'full_sync',
        status: 'pending',
        source_connection_id: UUID_B,
        created_at: '2026-04-19T10:00:00Z',
      }).success,
    ).toBe(true);
  });

  it('RagSourceStatus wraps a connection + doc_count', () => {
    expect(
      RagSourceStatusSchema.safeParse({
        source: {
          id: UUID_A,
          tenant_id: 't',
          owner_id: 'o',
          agent_id: 'a',
          provider: 'slack',
          status: 'active',
          last_sync_at: '2026-04-19T09:00:00Z',
        },
        doc_count: 42,
        last_job: null,
      }).success,
    ).toBe(true);
  });

  it('RagSourceSyncRequest defaults mode=incremental', () => {
    const parsed = RagSourceSyncRequestSchema.parse({
      source_connection_id: UUID_A,
      tenant_id: 't',
      owner_id: 'o',
      agent_id: 'a',
    });
    expect(parsed.mode).toBe('incremental');
  });

  it('RagSourceSyncRequest rejects bad UUID', () => {
    expect(
      RagSourceSyncRequestSchema.safeParse({
        source_connection_id: 'not-a-uuid',
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
      }).success,
    ).toBe(false);
  });

  it('RagSourceSyncResponse accepts enqueued + already_queued', () => {
    for (const status of ['enqueued', 'already_queued']) {
      expect(
        RagSourceSyncResponseSchema.safeParse({
          job_id: UUID_A,
          status,
          source_connection_id: UUID_B,
        }).success,
      ).toBe(true);
    }
    expect(
      RagSourceSyncResponseSchema.safeParse({
        job_id: UUID_A,
        status: 'running',
        source_connection_id: UUID_B,
      }).success,
    ).toBe(false);
  });

  it('RagSourceStatusRequest allows optional source_connection_id', () => {
    expect(
      RagSourceStatusRequestSchema.safeParse({
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
      }).success,
    ).toBe(true);
    expect(
      RagSourceStatusRequestSchema.safeParse({
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
        source_connection_id: UUID_A,
      }).success,
    ).toBe(true);
  });

  it('RagSourceStatusResponse wraps sources array', () => {
    expect(
      RagSourceStatusResponseSchema.safeParse({ sources: [] }).success,
    ).toBe(true);
  });
});

describe('@x9-forge/contracts/rag — Phase 37.6 document tools', () => {
  it('RagDocumentStatus covers active | superseded | deleted', () => {
    for (const s of ['active', 'superseded', 'deleted']) {
      expect(RagDocumentStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('RagDocumentParseStatus covers 4 values', () => {
    for (const s of ['success', 'failed', 'skipped', 'blocked_secret']) {
      expect(RagDocumentParseStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('RagDocumentRef parses minimal active doc', () => {
    expect(
      RagDocumentRefSchema.safeParse({
        id: UUID_A,
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
        title: 'Doc A',
        provider: 'gdocs',
        status: 'active',
        created_at: '2026-04-19T10:00:00Z',
      }).success,
    ).toBe(true);
  });

  it('RagDocumentRevisionRef parses revision entry', () => {
    expect(
      RagDocumentRevisionRefSchema.safeParse({
        id: UUID_A,
        document_id: UUID_B,
        revision_hash: 'sha256:abc',
        created_at: '2026-04-19T10:00:00Z',
        parse_status: 'success',
      }).success,
    ).toBe(true);
  });

  it('RagDocumentListRequest defaults limit to 25', () => {
    const parsed = RagDocumentListRequestSchema.parse({
      tenant_id: 't',
      owner_id: 'o',
      agent_id: 'a',
    });
    expect(parsed.limit).toBe(25);
  });

  it('RagDocumentListRequest caps limit at 100', () => {
    expect(
      RagDocumentListRequestSchema.safeParse({
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
        limit: 200,
      }).success,
    ).toBe(false);
  });

  it('RagDocumentListResponse requires documents array + next_cursor nullable', () => {
    expect(
      RagDocumentListResponseSchema.safeParse({
        documents: [],
        next_cursor: null,
      }).success,
    ).toBe(true);
    expect(
      RagDocumentListResponseSchema.safeParse({
        documents: [],
        next_cursor: 'page-2',
      }).success,
    ).toBe(true);
  });

  it('RagDocumentOpenRequest rejects missing document_id', () => {
    expect(
      RagDocumentOpenRequestSchema.safeParse({
        tenant_id: 't',
        owner_id: 'o',
        agent_id: 'a',
      }).success,
    ).toBe(false);
  });

  it('RagDocumentOpenResponse allows raw_excerpt=null (ACL redacted)', () => {
    expect(
      RagDocumentOpenResponseSchema.safeParse({
        document: {
          id: UUID_A,
          tenant_id: 't',
          owner_id: 'o',
          agent_id: 'a',
          title: 'Doc',
          provider: 'upload',
          status: 'active',
          created_at: '2026-04-19T10:00:00Z',
        },
        revision: {
          id: UUID_B,
          document_id: UUID_A,
          revision_hash: 'sha256:x',
          created_at: '2026-04-19T10:00:00Z',
        },
        raw_excerpt: null,
        metadata: {},
      }).success,
    ).toBe(true);
  });

  it('RagDocumentOpenResponse accepts raw_excerpt string (ACL allowed)', () => {
    expect(
      RagDocumentOpenResponseSchema.safeParse({
        document: {
          id: UUID_A,
          tenant_id: 't',
          owner_id: 'o',
          agent_id: 'a',
          title: 'Doc',
          provider: 'upload',
          status: 'active',
          created_at: '2026-04-19T10:00:00Z',
        },
        revision: {
          id: UUID_B,
          document_id: UUID_A,
          revision_hash: 'sha256:x',
          created_at: '2026-04-19T10:00:00Z',
        },
        raw_excerpt: 'Excerpt text',
        metadata: { page_count: 5 },
      }).success,
    ).toBe(true);
  });
});

describe('@x9-forge/contracts/rag — existing schemas still re-exported', () => {
  // Guard against index.ts re-export regressions during the Phase 37.6 edits.
  it('RagQueryRequest schema still accessible from index', () => {
    expect(
      RagQueryRequestSchema.safeParse({
        corpus_id: UUID_A,
        query: 'hello',
      }).success,
    ).toBe(true);
  });

  it('RagTopicStateRequest schema still accessible from index', () => {
    expect(
      RagTopicStateRequestSchema.safeParse({ topic_id: UUID_A }).success,
    ).toBe(true);
  });
});
