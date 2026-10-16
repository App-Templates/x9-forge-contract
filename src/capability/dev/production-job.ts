import { z } from 'zod';
import { ApprovalBindingsSchema, ApprovalRequestIdSchema, ApprovalTextSha256Schema, type ApprovalBindings } from '../approvals/index.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
import { DevelopmentSessionBindingSchema } from '../connect/development-session.js';
import { DevSignedCommandV2Schema } from './signed-command.js';

export const DevProductionKindSchema = z.enum(['code', 'automation', 'presentation', 'design']);
export type DevProductionKind = z.infer<typeof DevProductionKindSchema>;

/** Additive job domain; it does not change the signed command v2 protocol. */
export const DevProductionJobSchema = z.strictObject({
  version: z.literal(1),
  scope: CapabilityAgentScopeSchema,
  jobId: z.string().min(1),
  requestId: ApprovalRequestIdSchema,
  projectId: z.string().min(1),
  session: DevelopmentSessionBindingSchema,
  productKind: DevProductionKindSchema,
  instruction: z.string().min(1).max(16000),
  reportVersion: z.number().int().min(1),
  reportDigest: ApprovalTextSha256Schema,
  configVersion: DevSignedCommandV2Schema.shape.configVersion,
  keyVersion: DevSignedCommandV2Schema.shape.keyVersion,
  limits: z.strictObject({
    maxDurationSeconds: z.number().int().positive(),
    maxAttempts: z.number().int().positive(),
    maxTasks: z.number().int().positive(),
  }),
}).refine((job) => sameCapabilityScope(job.scope, job.session.scope), {
  message: 'Session scope must match job scope', path: ['session', 'scope'],
});
export type DevProductionJob = z.infer<typeof DevProductionJobSchema>;

/**
 * S3 must compute/compare reportDigest as SHA-256 of this string's UTF-8 bytes
 * before A11 verification and before effects. A supplied digest is not authoritative;
 * this reversible report format neither signs the job nor replaces the A11 verifier.
 */
export function canonicalizeDevProductionReport(rawJob: unknown): string {
  const parsed = DevProductionJobSchema.parse(rawJob);
  const job = Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== 'reportDigest'));
  job.session = { ...parsed.session, engines: [...parsed.session.engines].sort() };
  function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value)
        .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
        .map(([key, child]) => [key, sortKeys(child)]));
    }
    return value;
  }
  return JSON.stringify(sortKeys({ domain: 'x9.cap-dev.production-report', version: 1, job }));
}

/**
 * The service must compute and verify the report digest over text, limits and destination
 * before every effect. These bindings identify that snapshot; the bridge does not attest it.
 * Scope and requestId are already canonical fields of the A11 permit.
 */
export function devProductionApprovalBindings(raw: unknown): ApprovalBindings {
  const job = DevProductionJobSchema.parse(raw);
  return ApprovalBindingsSchema.parse({
    jobId: job.jobId,
    projectId: job.projectId,
    sessionId: job.session.sessionId,
    sessionKind: job.session.target.kind,
    sessionTarget: job.session.target.kind === 'local' ? job.session.target.deviceId : job.session.target.connectionRef,
    engines: [...job.session.engines].sort().join(','),
    productKind: job.productKind,
    reportVersion: job.reportVersion,
    reportDigest: job.reportDigest,
    configVersion: job.configVersion,
    keyVersion: job.keyVersion,
  });
}

/** Automation is delivered as code; decks and design use the selected session. */
export function devProductionExecutionMode(raw: unknown): 'night' | 'session' {
  const kind = DevProductionKindSchema.parse(raw);
  return kind === 'code' || kind === 'automation' ? 'night' : 'session';
}
