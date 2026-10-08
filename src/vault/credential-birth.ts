import { z } from 'zod';
import { AgentContextIdentitySchema } from '../agent/agent-context-identity.js';
import { AgentManagementRequestIdSchema } from '../agent/agent-management.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability/capability-call-context.js';
import { CredentialKeySchema, CredentialVersionSchema } from './credential-link.js';

const CompleteIdentity = AgentContextIdentitySchema.options[0].shape.identity;
const BirthScope = CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Birth scope must not be blank');
type Identity = z.infer<typeof CompleteIdentity>;
const sameIdentity = (left: Identity, right: Identity): boolean => left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;

/** A declared source, resolved by the server-owned adapter. Future source kinds must fail closed. */
export const CredentialBirthSourceSchema = z.object({ kind: z.literal('master'), identity: CompleteIdentity }).strict();
export type CredentialBirthSource = z.infer<typeof CredentialBirthSourceSchema>;
/** Opaque digest of the complete source key/version vector, computed privately by the producer. No invented TTL. */
export const CredentialBirthSnapshotSchema = z.string().regex(/^[a-f0-9]{64}$/);
export type CredentialBirthSnapshot = z.infer<typeof CredentialBirthSnapshotSchema>;
export const CredentialBirthEntrySchema = z.object({ key: CredentialKeySchema, version: CredentialVersionSchema }).strict();
export type CredentialBirthEntry = z.infer<typeof CredentialBirthEntrySchema>;
export const CredentialBirthReferenceSchema = CredentialBirthEntrySchema.extend({ source: CredentialBirthSourceSchema }).strict();
export type CredentialBirthReference = z.infer<typeof CredentialBirthReferenceSchema>;

export const CredentialBirthPreviewRequestSchema = z.object({ source: CredentialBirthSourceSchema }).strict();
export type CredentialBirthPreviewRequest = z.infer<typeof CredentialBirthPreviewRequestSchema>;
export const CredentialBirthPreviewSuccessSchema = z.object({
  ok: z.literal(true), source: CredentialBirthSourceSchema, snapshot: CredentialBirthSnapshotSchema,
  entries: z.array(CredentialBirthEntrySchema),
}).strict().refine(value => new Set(value.entries.map(entry => entry.key)).size === value.entries.length, 'Duplicate source key');
export type CredentialBirthPreviewSuccess = z.infer<typeof CredentialBirthPreviewSuccessSchema>;

const TargetFields = {
  requestId: AgentManagementRequestIdSchema,
  birthId: z.uuid(),
  scope: BirthScope,
  identity: CompleteIdentity,
  source: CredentialBirthSourceSchema,
};
type Target = { scope: z.infer<typeof BirthScope>; identity: Identity; source: CredentialBirthSource };
function checkTarget(value: Target, ctx: z.RefinementCtx): void {
  if (value.scope.agentId !== value.identity.runtimeAgentId) ctx.addIssue({ code: 'custom', path: ['scope', 'agentId'], message: 'Birth scope must match the runtime identity' });
  const own = new Set([value.identity.managementAgentId, value.identity.runtimeAgentId]);
  const source = value.source.identity;
  if (own.has(source.managementAgentId) || own.has(source.runtimeAgentId) || source.vaultAgentId === value.identity.vaultAgentId) ctx.addIssue({ code: 'custom', path: ['source'], message: 'An agent cannot inherit its own credentials' });
}

/** Authenticate, load the reserved birth, and compare its complete authority before any source lookup. */
export const CredentialBirthBindRequestSchema = z.object({ ...TargetFields, expectedSnapshot: CredentialBirthSnapshotSchema }).strict().superRefine(checkTarget);
export type CredentialBirthBindRequest = z.infer<typeof CredentialBirthBindRequestSchema>;
export type CredentialBirthBindRequestInput = z.input<typeof CredentialBirthBindRequestSchema>;
export function createCredentialBirthBindRequest(input: CredentialBirthBindRequestInput): CredentialBirthBindRequest {
  return CredentialBirthBindRequestSchema.parse(input);
}

/** Saved references only. Neither created nor unchanged proves installation or successful provider access. */
export const CredentialBirthBindResultSchema = z.object({
  ok: z.literal(true), ...TargetFields, snapshot: CredentialBirthSnapshotSchema,
  outcome: z.enum(['created', 'unchanged']), references: z.array(CredentialBirthReferenceSchema),
}).strict().superRefine((value, ctx) => {
  checkTarget(value, ctx);
  if (new Set(value.references.map(entry => entry.key)).size !== value.references.length) ctx.addIssue({ code: 'custom', path: ['references'], message: 'Duplicate birth reference' });
  for (const [index, entry] of value.references.entries()) {
    if (!sameIdentity(entry.source.identity, value.source.identity)) ctx.addIssue({ code: 'custom', path: ['references', index, 'source'], message: 'Reference belongs to another source' });
  }
});
export type CredentialBirthBindResult = z.infer<typeof CredentialBirthBindResultSchema>;

export const CredentialBirthErrorResponseSchema = z.object({
  ok: z.literal(false), error: z.enum(['invalid_request', 'identity_mismatch', 'source_unavailable', 'snapshot_conflict', 'idempotency_conflict', 'birth_not_found']),
}).strict();
export type CredentialBirthErrorResponse = z.infer<typeof CredentialBirthErrorResponseSchema>;
export const CredentialBirthPreviewResponseSchema = z.union([CredentialBirthPreviewSuccessSchema, CredentialBirthErrorResponseSchema]);
export type CredentialBirthPreviewResponse = z.infer<typeof CredentialBirthPreviewResponseSchema>;
export const CredentialBirthBindResponseSchema = z.union([CredentialBirthBindResultSchema, CredentialBirthErrorResponseSchema]);
export type CredentialBirthBindResponse = z.infer<typeof CredentialBirthBindResponseSchema>;

/** Persist this receipt with references and audit in the same transaction; never store private source hashes here. */
export const CredentialBirthReceiptSchema = z.object({ request: CredentialBirthBindRequestSchema, result: CredentialBirthBindResultSchema }).strict().superRefine((receipt, ctx) => {
  const { request, result } = receipt;
  if (request.requestId !== result.requestId || request.birthId !== result.birthId || !sameCapabilityScope(request.scope, result.scope)
      || !sameIdentity(request.identity, result.identity) || !sameIdentity(request.source.identity, result.source.identity)
      || request.expectedSnapshot !== result.snapshot) ctx.addIssue({ code: 'custom', path: ['result'], message: 'Birth receipt must attest the complete requested intention' });
});
export type CredentialBirthReceipt = z.infer<typeof CredentialBirthReceiptSchema>;
export type CredentialBirthReplayDisposition =
  | { action: 'bind' }
  | { action: 'conflict'; error: 'idempotency_conflict' }
  | { action: 'replay'; result: CredentialBirthBindResult };

/** Pure replay decision. The consumer owns authenticated scope lookup, durable idempotency, and lock ordering. */
export function credentialBirthReplay(previous: unknown | null, incoming: unknown): CredentialBirthReplayDisposition {
  const request = CredentialBirthBindRequestSchema.parse(incoming);
  if (previous === null) return { action: 'bind' };
  const receipt = CredentialBirthReceiptSchema.parse(previous);
  if (JSON.stringify(receipt.request) !== JSON.stringify(request)) return { action: 'conflict', error: 'idempotency_conflict' };
  return { action: 'replay', result: receipt.result };
}
