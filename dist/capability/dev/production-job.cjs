"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevProductionJobSchema = exports.DevProductionKindSchema = void 0;
exports.canonicalizeDevProductionReport = canonicalizeDevProductionReport;
exports.devProductionApprovalBindings = devProductionApprovalBindings;
exports.devProductionExecutionMode = devProductionExecutionMode;
const zod_1 = require("zod");
const index_js_1 = require("../approvals/index.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const development_session_js_1 = require("../connect/development-session.cjs");
const development_session_models_js_1 = require("../../http/endpoints/development-session-models.cjs");
const signed_command_js_1 = require("./signed-command.cjs");
exports.DevProductionKindSchema = zod_1.z.enum(['code', 'automation', 'presentation', 'design']);
/** Additive job domain; it does not change the signed command v2 protocol. */
exports.DevProductionJobSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    jobId: zod_1.z.string().min(1),
    requestId: index_js_1.ApprovalRequestIdSchema,
    projectId: zod_1.z.string().min(1),
    session: development_session_js_1.DevelopmentSessionBindingSchema,
    productKind: exports.DevProductionKindSchema,
    instruction: zod_1.z.string().min(1).max(16000),
    // Owner's explicit per-role choices; absent in earlier payloads, so no default.
    roleModels: development_session_models_js_1.DevProductionRoleModelsSchema.optional(),
    reportVersion: zod_1.z.number().int().min(1),
    reportDigest: index_js_1.ApprovalTextSha256Schema,
    configVersion: signed_command_js_1.DevSignedCommandV2Schema.shape.configVersion,
    keyVersion: signed_command_js_1.DevSignedCommandV2Schema.shape.keyVersion,
    limits: zod_1.z.strictObject({
        maxDurationSeconds: zod_1.z.number().int().positive(),
        maxAttempts: zod_1.z.number().int().positive(),
        maxTasks: zod_1.z.number().int().positive(),
    }),
}).refine((job) => (0, capability_call_context_js_1.sameCapabilityScope)(job.scope, job.session.scope), {
    message: 'Session scope must match job scope', path: ['session', 'scope'],
}).refine((job) => job.roleModels === undefined
    || Object.values(job.roleModels).every((choice) => job.session.engines.includes(choice.engine)), {
    message: 'Role model engines must be selected in the session', path: ['roleModels'],
});
/**
 * S3 must compute/compare reportDigest as SHA-256 of this string's UTF-8 bytes
 * before A11 verification and before effects. A supplied digest is not authoritative;
 * this reversible report format neither signs the job nor replaces the A11 verifier.
 */
function canonicalizeDevProductionReport(rawJob) {
    const parsed = exports.DevProductionJobSchema.parse(rawJob);
    const job = Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== 'reportDigest'));
    job.session = { ...parsed.session, engines: [...parsed.session.engines].sort() };
    function sortKeys(value) {
        if (Array.isArray(value))
            return value.map(sortKeys);
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
function devProductionApprovalBindings(raw) {
    const job = exports.DevProductionJobSchema.parse(raw);
    return index_js_1.ApprovalBindingsSchema.parse({
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
function devProductionExecutionMode(raw) {
    const kind = exports.DevProductionKindSchema.parse(raw);
    return kind === 'code' || kind === 'automation' ? 'night' : 'session';
}
//# sourceMappingURL=production-job.js.map