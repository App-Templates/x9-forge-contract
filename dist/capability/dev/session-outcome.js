import { z } from 'zod';
import { ToolErrorDispositionSchema } from "../tool-call.js";
import { DEV_SESSION_MAX_MATERIALS, DevSessionCommitSchema, DevSessionMaterialSchema, DevSessionRepoSchema, DevSessionResultSchema, } from "./session-assignment.js";
export const DEV_SESSION_OUTCOME_BLOCK_MARKER = 'x9:dev-session-outcome:v1';
export const DEV_SESSION_OUTCOME_STATES = ['delivered', 'failed', 'discarded', 'waiting_materials', 'waiting_answer'];
export const DEV_SESSION_OUTCOME_REASONS = {
    delivered: ['tests_green', 'no_tests_declared'],
    failed: ['tests_red', 'session_error', 'executor_error', 'not_published', 'materials_not_obtained', 'outcome_not_recorded'],
    discarded: ['cancelled_by_answer', 'closed_on_board', 'duplicate_assignment', 'assignment_refused'],
    waiting_materials: ['materials_requested'],
    waiting_answer: ['answer_requested', 'retry_or_cancel_requested'],
};
/** Machine-readable outcome; free text never determines the session state. */
export const DevSessionOutcomeSchema = z.strictObject({
    version: z.literal(1),
    sessionId: DevSessionResultSchema.shape.sessionId,
    attempt: z.number().int().min(1).max(50),
    state: z.enum(DEV_SESSION_OUTCOME_STATES),
    reason: z.strictObject({
        code: z.enum([
            ...DEV_SESSION_OUTCOME_REASONS.delivered,
            ...DEV_SESSION_OUTCOME_REASONS.failed,
            ...DEV_SESSION_OUTCOME_REASONS.discarded,
            ...DEV_SESSION_OUTCOME_REASONS.waiting_materials,
            ...DEV_SESSION_OUTCOME_REASONS.waiting_answer,
        ]),
        text: z.string().min(1).max(500).refine((text) => !/[\r\n\u2028\u2029]/.test(text), { message: 'Reason text must be a single line' }),
    }),
    disposition: ToolErrorDispositionSchema.optional(),
    missingMaterials: z.array(z.strictObject({
        ref: z.string().min(1).max(512),
        error: z.string().min(1).max(300),
    })).max(DEV_SESSION_MAX_MATERIALS).optional(),
    commit: DevSessionCommitSchema.optional(),
    executorVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    createdAt: z.iso.datetime({ offset: true }),
}).superRefine((outcome, ctx) => {
    if (!DEV_SESSION_OUTCOME_REASONS[outcome.state].some((code) => code === outcome.reason.code)) {
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
export const DEV_SESSION_ANSWER_BLOCK_MARKER = 'x9:dev-session-answer:v1';
export const DEV_SESSION_ANSWER_KINDS = ['riprova', 'annulla', 'usa_ramo', 'materiale', 'decisione', 'chiarimento'];
/** A complete commit hash or a full branch/tag reference, never a prose fragment. */
export const DevSessionGitRefSchema = z.string().max(255)
    .regex(/^(?:[0-9a-fA-F]{40}|refs\/(?:heads|tags)\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/)
    .refine((ref) => !ref.includes('..') && !/\s/.test(ref), { message: 'Git references must not contain .. or whitespace' });
const AnswerBase = { version: z.literal(1), sessionId: DevSessionResultSchema.shape.sessionId };
const NoteSchema = z.string().trim().min(1).max(500);
const TextAnswer = { text: z.string().min(1).max(4000), block: z.string().regex(/^[a-z0-9-]{3,40}$/).optional() };
export const DevSessionAnswerSchema = z.discriminatedUnion('kind', [
    z.strictObject({ ...AnswerBase, kind: z.literal(DEV_SESSION_ANSWER_KINDS[0]), note: NoteSchema.optional() }),
    z.strictObject({ ...AnswerBase, kind: z.literal(DEV_SESSION_ANSWER_KINDS[1]) }),
    z.strictObject({ ...AnswerBase, kind: z.literal(DEV_SESSION_ANSWER_KINDS[2]), repo: DevSessionRepoSchema, ref: DevSessionGitRefSchema, note: NoteSchema.optional() }),
    z.strictObject({ ...AnswerBase, kind: z.literal(DEV_SESSION_ANSWER_KINDS[3]), materials: z.array(DevSessionMaterialSchema).min(1).max(10), note: NoteSchema.optional() }),
    z.strictObject({ ...AnswerBase, kind: z.literal(DEV_SESSION_ANSWER_KINDS[4]), ...TextAnswer }),
    z.strictObject({ ...AnswerBase, kind: z.literal(DEV_SESSION_ANSWER_KINDS[5]), ...TextAnswer }),
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
const outcomeCodec = sessionBlockCodec(DevSessionOutcomeSchema, DEV_SESSION_OUTCOME_BLOCK_MARKER, 'x9.cap-dev.session-outcome', 'outcome', 'invalid_outcome');
const answerCodec = sessionBlockCodec(DevSessionAnswerSchema, DEV_SESSION_ANSWER_BLOCK_MARKER, 'x9.cap-dev.session-answer', 'answer', 'invalid_answer');
export function devSessionOutcomeCanonicalJson(raw) {
    return outcomeCodec.canonicalJson(raw);
}
export function renderDevSessionOutcomeBlock(raw, digest) {
    return outcomeCodec.render(raw, digest);
}
export function parseDevSessionOutcomeBlock(body) {
    const parsed = outcomeCodec.parse(body);
    return parsed.ok ? { ok: true, outcome: parsed.value, digest: parsed.digest } : parsed;
}
export function devSessionAnswerCanonicalJson(raw) {
    return answerCodec.canonicalJson(raw);
}
export function renderDevSessionAnswerBlock(raw, digest) {
    return answerCodec.render(raw, digest);
}
export function parseDevSessionAnswerBlock(body) {
    const parsed = answerCodec.parse(body);
    return parsed.ok ? { ok: true, answer: parsed.value, digest: parsed.digest } : parsed;
}
//# sourceMappingURL=session-outcome.js.map