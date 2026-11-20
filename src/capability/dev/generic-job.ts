import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
import { DevSignedCommandV2Schema } from './signed-command.js';

/**
 * Names only: executors map each tool to a fixed command using their subscription.
 * `ig_collect` collects the posts of followed profiles with the executor's fixed command;
 * platform credentials stay on the device and never travel in the job.
 */
export const DEV_GENERIC_JOB_TOOLS = ['mlx_whisper', 'claude_p', 'ig_collect'] as const;
export const DevGenericToolSchema = z.enum(DEV_GENERIC_JOB_TOOLS);
export type DevGenericTool = z.infer<typeof DevGenericToolSchema>;

export const DEV_GENERIC_EXECUTORS = ['laptop', 'server'] as const;
export const DevGenericExecutorSchema = z.enum(DEV_GENERIC_EXECUTORS);
export type DevGenericExecutor = z.infer<typeof DevGenericExecutorSchema>;

export const DEV_GENERIC_INPUT_MAX_BYTES = 32768;
export const DEV_GENERIC_OUTPUT_MAX_BYTES = 131072;

const JsonObjectSchema = z.record(z.string().min(1).max(100), z.json());

/** Large documents must travel through a file channel, outside this job contract. */
export const DevGenericInputSchema = JsonObjectSchema.refine(
  (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= DEV_GENERIC_INPUT_MAX_BYTES,
  { message: 'Input JSON exceeds the UTF-8 byte limit' },
);
export type DevGenericInput = z.infer<typeof DevGenericInputSchema>;

/** Output is untrusted data, never an instruction for the executor or consumer. */
export const DevGenericOutputSchema = JsonObjectSchema.refine(
  (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= DEV_GENERIC_OUTPUT_MAX_BYTES,
  { message: 'Output JSON exceeds the UTF-8 byte limit' },
);
export type DevGenericOutput = z.infer<typeof DevGenericOutputSchema>;

const JobIdSchema = z.string().min(1).max(100);

/** The service binds scope from the authenticated call, never from the executor. */
export const DevGenericJobSchema = z.strictObject({
  version: z.literal(1),
  scope: CapabilityAgentScopeSchema,
  jobId: JobIdSchema,
  capability: z.string().regex(/^[a-z][a-z0-9-]{1,40}$/),
  kind: z.string().regex(/^[a-z][a-z0-9_-]{0,40}$/),
  tool: DevGenericToolSchema,
  executor: DevGenericExecutorSchema,
  input: DevGenericInputSchema,
  configVersion: DevSignedCommandV2Schema.shape.configVersion,
  limits: z.strictObject({
    maxDurationSeconds: z.number().int().min(1).max(3600),
    maxAttempts: z.number().int().min(1).max(5),
  }),
  createdAt: z.iso.datetime({ offset: true }),
});
export type DevGenericJob = z.infer<typeof DevGenericJobSchema>;

export const DevGenericJobResultSchema = z.strictObject({
  version: z.literal(1),
  jobId: JobIdSchema,
  scope: CapabilityAgentScopeSchema,
  tool: DevGenericToolSchema,
  state: z.enum(['done', 'failed']),
  output: DevGenericOutputSchema.optional(),
  error: z.string().min(1).max(500).optional(),
  durationSeconds: z.number().int().min(0),
  finishedAt: z.iso.datetime({ offset: true }),
}).refine((result) => result.state === 'done'
  ? result.output !== undefined && result.error === undefined
  : result.error !== undefined && result.output === undefined, {
  message: 'Done requires only output; failed requires only error',
});
export type DevGenericJobResult = z.infer<typeof DevGenericJobResultSchema>;

/** Correlation of validated contracts only; it does not authorize execution. */
export function devGenericResultMatchesJob(
  job: DevGenericJob,
  result: DevGenericJobResult,
): { ok: true } | { ok: false; error: 'job_mismatch' | 'scope_mismatch' | 'tool_mismatch' } {
  if (job.jobId !== result.jobId) return { ok: false, error: 'job_mismatch' };
  if (!sameCapabilityScope(job.scope, result.scope)) return { ok: false, error: 'scope_mismatch' };
  if (job.tool !== result.tool) return { ok: false, error: 'tool_mismatch' };
  return { ok: true };
}
