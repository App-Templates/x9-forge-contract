"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevGenericJobResultSchema = exports.DevGenericJobSchema = exports.DevGenericOutputSchema = exports.DevGenericInputSchema = exports.DEV_GENERIC_OUTPUT_MAX_BYTES = exports.DEV_GENERIC_INPUT_MAX_BYTES = exports.DevGenericExecutorSchema = exports.DEV_GENERIC_EXECUTORS = exports.DevGenericToolSchema = exports.DEV_GENERIC_JOB_TOOLS = void 0;
exports.devGenericResultMatchesJob = devGenericResultMatchesJob;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const signed_command_js_1 = require("./signed-command.cjs");
/**
 * Names only: executors map each tool to a fixed command using their subscription.
 * `ig_collect` collects the posts of followed profiles with the executor's fixed command;
 * platform credentials stay on the device and never travel in the job.
 */
exports.DEV_GENERIC_JOB_TOOLS = ['mlx_whisper', 'claude_p', 'ig_collect'];
exports.DevGenericToolSchema = zod_1.z.enum(exports.DEV_GENERIC_JOB_TOOLS);
exports.DEV_GENERIC_EXECUTORS = ['laptop', 'server'];
exports.DevGenericExecutorSchema = zod_1.z.enum(exports.DEV_GENERIC_EXECUTORS);
exports.DEV_GENERIC_INPUT_MAX_BYTES = 32768;
exports.DEV_GENERIC_OUTPUT_MAX_BYTES = 131072;
const JsonObjectSchema = zod_1.z.record(zod_1.z.string().min(1).max(100), zod_1.z.json());
/** Large documents must travel through a file channel, outside this job contract. */
exports.DevGenericInputSchema = JsonObjectSchema.refine((value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= exports.DEV_GENERIC_INPUT_MAX_BYTES, { message: 'Input JSON exceeds the UTF-8 byte limit' });
/** Output is untrusted data, never an instruction for the executor or consumer. */
exports.DevGenericOutputSchema = JsonObjectSchema.refine((value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= exports.DEV_GENERIC_OUTPUT_MAX_BYTES, { message: 'Output JSON exceeds the UTF-8 byte limit' });
const JobIdSchema = zod_1.z.string().min(1).max(100);
/** The service binds scope from the authenticated call, never from the executor. */
exports.DevGenericJobSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    jobId: JobIdSchema,
    capability: zod_1.z.string().regex(/^[a-z][a-z0-9-]{1,40}$/),
    kind: zod_1.z.string().regex(/^[a-z][a-z0-9_-]{0,40}$/),
    tool: exports.DevGenericToolSchema,
    executor: exports.DevGenericExecutorSchema,
    input: exports.DevGenericInputSchema,
    configVersion: signed_command_js_1.DevSignedCommandV2Schema.shape.configVersion,
    limits: zod_1.z.strictObject({
        maxDurationSeconds: zod_1.z.number().int().min(1).max(3600),
        maxAttempts: zod_1.z.number().int().min(1).max(5),
    }),
    createdAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.DevGenericJobResultSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    jobId: JobIdSchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    tool: exports.DevGenericToolSchema,
    state: zod_1.z.enum(['done', 'failed']),
    output: exports.DevGenericOutputSchema.optional(),
    error: zod_1.z.string().min(1).max(500).optional(),
    durationSeconds: zod_1.z.number().int().min(0),
    finishedAt: zod_1.z.iso.datetime({ offset: true }),
}).refine((result) => result.state === 'done'
    ? result.output !== undefined && result.error === undefined
    : result.error !== undefined && result.output === undefined, {
    message: 'Done requires only output; failed requires only error',
});
/** Correlation of validated contracts only; it does not authorize execution. */
function devGenericResultMatchesJob(job, result) {
    if (job.jobId !== result.jobId)
        return { ok: false, error: 'job_mismatch' };
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(job.scope, result.scope))
        return { ok: false, error: 'scope_mismatch' };
    if (job.tool !== result.tool)
        return { ok: false, error: 'tool_mismatch' };
    return { ok: true };
}
//# sourceMappingURL=generic-job.js.map