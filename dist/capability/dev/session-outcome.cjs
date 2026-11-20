"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSessionPaperclipProductsInputSchema = exports.DevSessionProofAttachmentSchema = exports.DEV_SESSION_PROOF_ATTACHMENT_MAX_BYTES = exports.DEV_SESSION_PAPERCLIP_WORK_STATUS = exports.DEV_SESSION_PAPERCLIP_OPEN_STATUS = exports.DEV_SESSION_PAPERCLIP_STATE = exports.DevSessionAnswerSchema = exports.DevSessionGitRefSchema = exports.DEV_SESSION_ANSWER_KINDS = exports.DEV_SESSION_ANSWER_BLOCK_MARKER = exports.DevSessionOutcomeSchema = exports.DEV_SESSION_OUTCOME_REASONS = exports.DEV_SESSION_OUTCOME_STATES = exports.DEV_SESSION_OUTCOME_BLOCK_MARKER = void 0;
exports.devSessionOutcomeCanonicalJson = devSessionOutcomeCanonicalJson;
exports.renderDevSessionOutcomeBlock = renderDevSessionOutcomeBlock;
exports.parseDevSessionOutcomeBlock = parseDevSessionOutcomeBlock;
exports.devSessionAnswerCanonicalJson = devSessionAnswerCanonicalJson;
exports.renderDevSessionAnswerBlock = renderDevSessionAnswerBlock;
exports.parseDevSessionAnswerBlock = parseDevSessionAnswerBlock;
exports.devSessionProofAttachmentDecision = devSessionProofAttachmentDecision;
exports.devSessionPaperclipProducts = devSessionPaperclipProducts;
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
const tool_error_disposition_js_1 = require("../tool-error-disposition.cjs");
const session_assignment_js_1 = require("./session-assignment.cjs");
exports.DEV_SESSION_OUTCOME_BLOCK_MARKER = 'x9:dev-session-outcome:v1';
exports.DEV_SESSION_OUTCOME_STATES = ['delivered', 'failed', 'discarded', 'waiting_materials', 'waiting_answer'];
exports.DEV_SESSION_OUTCOME_REASONS = {
    delivered: ['tests_green', 'no_tests_declared'],
    failed: ['tests_red', 'session_error', 'executor_error', 'not_published', 'materials_not_obtained', 'outcome_not_recorded'],
    discarded: ['cancelled_by_answer', 'closed_on_board', 'duplicate_assignment', 'assignment_refused'],
    waiting_materials: ['materials_requested'],
    waiting_answer: ['answer_requested', 'retry_or_cancel_requested'],
};
/** Machine-readable outcome; free text never determines the session state. */
exports.DevSessionOutcomeSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    sessionId: session_assignment_js_1.DevSessionResultSchema.shape.sessionId,
    attempt: zod_1.z.number().int().min(1).max(50),
    state: zod_1.z.enum(exports.DEV_SESSION_OUTCOME_STATES),
    reason: zod_1.z.strictObject({
        code: zod_1.z.enum([
            ...exports.DEV_SESSION_OUTCOME_REASONS.delivered,
            ...exports.DEV_SESSION_OUTCOME_REASONS.failed,
            ...exports.DEV_SESSION_OUTCOME_REASONS.discarded,
            ...exports.DEV_SESSION_OUTCOME_REASONS.waiting_materials,
            ...exports.DEV_SESSION_OUTCOME_REASONS.waiting_answer,
        ]),
        text: zod_1.z.string().min(1).max(500).refine((text) => !/[\r\n\u2028\u2029]/.test(text), { message: 'Reason text must be a single line' }),
    }),
    disposition: tool_error_disposition_js_1.ToolErrorDispositionSchema.optional(),
    missingMaterials: zod_1.z.array(zod_1.z.strictObject({
        ref: zod_1.z.string().min(1).max(512),
        error: zod_1.z.string().min(1).max(300),
    })).max(session_assignment_js_1.DEV_SESSION_MAX_MATERIALS).optional(),
    commit: session_assignment_js_1.DevSessionCommitSchema.optional(),
    executorVersion: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    createdAt: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((outcome, ctx) => {
    if (!exports.DEV_SESSION_OUTCOME_REASONS[outcome.state].some((code) => code === outcome.reason.code)) {
        ctx.addIssue({ code: 'custom', path: ['reason', 'code'], message: 'Reason code does not belong to this state' });
    }
    if ((outcome.state !== 'delivered') !== (outcome.disposition !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['disposition'], message: 'Disposition is required exactly for non-delivered outcomes' });
    }
    if (outcome.commit !== undefined && outcome.state !== 'delivered') {
        ctx.addIssue({ code: 'custom', path: ['commit'], message: 'Only delivered outcomes may name a commit' });
    }
    const needsMaterials = outcome.reason.code === 'materials_requested' || outcome.reason.code === 'materials_not_obtained';
    if (needsMaterials ? !outcome.missingMaterials?.length : outcome.missingMaterials !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['missingMaterials'], message: 'Missing materials are required only for material requests or failed retrievals' });
    }
    const cancelled = outcome.reason.code === 'cancelled_by_answer' || outcome.reason.code === 'closed_on_board';
    if (cancelled !== (outcome.disposition?.nature === 'cancelled')) {
        ctx.addIssue({ code: 'custom', path: ['disposition', 'nature'], message: 'Cancelled nature is reserved for cancellation by answer or board closure' });
    }
});
exports.DEV_SESSION_ANSWER_BLOCK_MARKER = 'x9:dev-session-answer:v1';
exports.DEV_SESSION_ANSWER_KINDS = ['riprova', 'annulla', 'usa_ramo', 'materiale', 'decisione', 'chiarimento'];
/** A complete commit hash or a full branch/tag reference, never a prose fragment. */
exports.DevSessionGitRefSchema = zod_1.z.string().max(255)
    .regex(/^(?:[0-9a-fA-F]{40}|refs\/(?:heads|tags)\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/)
    .refine((ref) => !ref.includes('..') && !/\s/.test(ref), { message: 'Git references must not contain .. or whitespace' });
const AnswerBase = { version: zod_1.z.literal(1), sessionId: session_assignment_js_1.DevSessionResultSchema.shape.sessionId };
const NoteSchema = zod_1.z.string().trim().min(1).max(500);
const TextAnswer = { text: zod_1.z.string().min(1).max(4000), block: zod_1.z.string().regex(/^[a-z0-9-]{3,40}$/).optional() };
exports.DevSessionAnswerSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ ...AnswerBase, kind: zod_1.z.literal(exports.DEV_SESSION_ANSWER_KINDS[0]), note: NoteSchema.optional() }),
    zod_1.z.strictObject({ ...AnswerBase, kind: zod_1.z.literal(exports.DEV_SESSION_ANSWER_KINDS[1]) }),
    zod_1.z.strictObject({ ...AnswerBase, kind: zod_1.z.literal(exports.DEV_SESSION_ANSWER_KINDS[2]), repo: session_assignment_js_1.DevSessionRepoSchema, ref: exports.DevSessionGitRefSchema, note: NoteSchema.optional() }),
    zod_1.z.strictObject({ ...AnswerBase, kind: zod_1.z.literal(exports.DEV_SESSION_ANSWER_KINDS[3]), materials: zod_1.z.array(session_assignment_js_1.DevSessionMaterialSchema).min(1).max(10), note: NoteSchema.optional() }),
    zod_1.z.strictObject({ ...AnswerBase, kind: zod_1.z.literal(exports.DEV_SESSION_ANSWER_KINDS[4]), ...TextAnswer }),
    zod_1.z.strictObject({ ...AnswerBase, kind: zod_1.z.literal(exports.DEV_SESSION_ANSWER_KINDS[5]), ...TextAnswer }),
]);
/** Shared codec: the service computes and verifies the digest, the bridge only carries it. */
function sessionBlockCodec(schema, marker, domain, key, invalidReason) {
    const markerPattern = new RegExp(`^<!-- ${marker} sha256:([0-9a-f]{64}) -->$`);
    function sortKeys(value) {
        if (Array.isArray(value))
            return value.map(sortKeys);
        if (value !== null && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value)
                .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
                .map(([name, child]) => [name, sortKeys(child)]));
        }
        return value;
    }
    return {
        canonicalJson(raw) {
            return JSON.stringify(sortKeys({ domain, [key]: schema.parse(raw) }));
        },
        render(raw, digest) {
            if (!/^[0-9a-f]{64}$/.test(digest))
                throw new Error('digest must be 64 lowercase hex digits');
            const json = JSON.stringify(sortKeys(schema.parse(raw))).replace(/</g, '\\u003c');
            return [`<!-- ${marker} sha256:${digest} -->`, '```json', json, '```'].join('\n');
        },
        parse(body) {
            const lines = body.replace(/\r\n/g, '\n').split('\n');
            const at = lines.flatMap((line, index) => markerPattern.test(line) ? [index] : []);
            if (at.length === 0)
                return { ok: false, reason: 'absent' };
            if (at.length > 1)
                return { ok: false, reason: 'multiple' };
            const start = at[0];
            if (lines[start + 1] !== '```json' || lines[start + 3] !== '```' || lines[start + 2] === undefined) {
                return { ok: false, reason: 'malformed' };
            }
            let value;
            try {
                value = JSON.parse(lines[start + 2]);
            }
            catch {
                return { ok: false, reason: 'invalid_json' };
            }
            const parsed = schema.safeParse(value);
            if (!parsed.success)
                return { ok: false, reason: invalidReason };
            return { ok: true, value: parsed.data, digest: markerPattern.exec(lines[start])[1] };
        },
    };
}
const outcomeCodec = sessionBlockCodec(exports.DevSessionOutcomeSchema, exports.DEV_SESSION_OUTCOME_BLOCK_MARKER, 'x9.cap-dev.session-outcome', 'outcome', 'invalid_outcome');
const answerCodec = sessionBlockCodec(exports.DevSessionAnswerSchema, exports.DEV_SESSION_ANSWER_BLOCK_MARKER, 'x9.cap-dev.session-answer', 'answer', 'invalid_answer');
function devSessionOutcomeCanonicalJson(raw) {
    return outcomeCodec.canonicalJson(raw);
}
function renderDevSessionOutcomeBlock(raw, digest) {
    return outcomeCodec.render(raw, digest);
}
function parseDevSessionOutcomeBlock(body) {
    const parsed = outcomeCodec.parse(body);
    return parsed.ok ? { ok: true, outcome: parsed.value, digest: parsed.digest } : parsed;
}
function devSessionAnswerCanonicalJson(raw) {
    return answerCodec.canonicalJson(raw);
}
function renderDevSessionAnswerBlock(raw, digest) {
    return answerCodec.render(raw, digest);
}
function parseDevSessionAnswerBlock(body) {
    const parsed = answerCodec.parse(body);
    return parsed.ok ? { ok: true, answer: parsed.value, digest: parsed.digest } : parsed;
}
// ---------------------------------------------------------------------------
// Paperclip mapping (task 8034): the outcome state as the Paperclip issue sees it.
// ---------------------------------------------------------------------------
/**
 * Where each outcome state lands on the child issue, whether it carries a yes/no question and which
 * wake reaches the lead. Every write by the executor needs a live run of the executor itself
 * (`in_progress` lives only as long as the run; with a finished run Paperclip answers 409); a retry
 * is a new child, a closed one is never reopened.
 */
exports.DEV_SESSION_PAPERCLIP_STATE = {
    delivered: { status: 'done', question: false, wakesLead: 'issue_children_completed' },
    failed: { status: 'cancelled', question: false, wakesLead: 'issue_children_completed' },
    discarded: { status: 'cancelled', question: false, wakesLead: 'issue_children_completed' },
    waiting_materials: { status: 'in_review', question: true, wakesLead: 'interaction_pending' },
    waiting_answer: { status: 'in_review', question: true, wakesLead: 'interaction_pending' },
};
/** `todo` is the default for an assigned issue (execution-semantics.md:536-538). */
exports.DEV_SESSION_PAPERCLIP_OPEN_STATUS = 'todo';
/** Only while the run lives: a finished run can no longer write it. */
exports.DEV_SESSION_PAPERCLIP_WORK_STATUS = 'in_progress';
/** Paperclip refuses attachments above 10 MiB by default (attachment-types.ts:164-165, PAPERCLIP_ATTACHMENT_MAX_BYTES). */
exports.DEV_SESSION_PROOF_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
exports.DevSessionProofAttachmentSchema = zod_1.z.strictObject({
    attachmentId: zod_1.z.guid(),
    name: zod_1.z.string().min(1).max(255),
    mediaType: zod_1.z.string().min(1).max(255),
    sha256: asset_js_1.AssetSha256Schema,
    sizeBytes: zod_1.z.number().int().min(1),
});
/** A file above the limit stays only in the git branch and the outcome says so. */
function devSessionProofAttachmentDecision(sizeBytes, maxBytes = exports.DEV_SESSION_PROOF_ATTACHMENT_MAX_BYTES) {
    return sizeBytes > maxBytes ? { attach: false, reason: 'too_large' } : { attach: true };
}
exports.DevSessionPaperclipProductsInputSchema = zod_1.z.strictObject({
    repo: session_assignment_js_1.DevSessionRepoSchema,
    branch: exports.DevSessionGitRefSchema,
    commit: session_assignment_js_1.DevSessionCommitSchema,
    manifestSha256: asset_js_1.AssetSha256Schema,
    proofs: zod_1.z.array(exports.DevSessionProofAttachmentSchema).max(session_assignment_js_1.DEV_SESSION_MAX_FILES),
});
/** Work products of a delivery in order: branch, commit, then one artifact per proof. */
function devSessionPaperclipProducts(input) {
    const base = `https://github.com/${input.repo}`;
    return [
        { type: 'branch', provider: 'github', externalId: input.branch, title: input.branch, url: `${base}/tree/${input.branch}` },
        {
            type: 'commit', provider: 'github', externalId: input.commit, title: input.commit.slice(0, 12), url: `${base}/commit/${input.commit}`,
            metadata: { repo: input.repo, manifestSha256: input.manifestSha256 },
        },
        ...input.proofs.map((proof) => ({ type: 'artifact', provider: 'paperclip', externalId: proof.attachmentId, title: proof.name, metadata: { attachmentId: proof.attachmentId } })),
    ];
}
//# sourceMappingURL=session-outcome.js.map