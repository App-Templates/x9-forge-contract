"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipAdmissionResponseSchema = exports.PaperclipAdmissionCommittedSchema = exports.PaperclipAdmissionPreparedSchema = exports.PaperclipAdmissionRequestSchema = exports.PaperclipNativeRunReceiptSchema = exports.PaperclipAdmissionMetadataSchema = exports.PaperclipAdmissionChallengeSchema = exports.PaperclipNativeRunIdentitySchema = void 0;
exports.matchesPaperclipReceipt = matchesPaperclipReceipt;
const zod_1 = require("zod");
/** Native process observations. Parsing does not prove native execution or assignment. */
exports.PaperclipNativeRunIdentitySchema = zod_1.z.strictObject({
    companyId: zod_1.z.uuid(),
    paperclipAgentId: zod_1.z.uuid(),
    runId: zod_1.z.uuid(),
    issueId: zod_1.z.uuid(),
});
/** Fresh host-generated 32-byte random challenge, not a credential or a native lease. */
exports.PaperclipAdmissionChallengeSchema = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
const HostTimestamp = zod_1.z.iso.datetime({ offset: true });
const AdmissionFields = {
    ...exports.PaperclipNativeRunIdentitySchema.shape,
    admissionId: zod_1.z.uuid(),
    challenge: exports.PaperclipAdmissionChallengeSchema,
    hostIssuedAt: HostTimestamp,
    hostDeadlineAt: HostTimestamp,
};
function orderedHostWindow(value) {
    return Date.parse(value.hostIssuedAt) < Date.parse(value.hostDeadlineAt);
}
const HostWindowIssue = { message: 'Host deadline must follow issuance', path: ['hostDeadlineAt'] };
/** Host-issued metadata shared by prepare, immutable receipt and server dispatch. */
exports.PaperclipAdmissionMetadataSchema = zod_1.z.strictObject(AdmissionFields).refine(orderedHostWindow, HostWindowIssue);
/** Exactly one immutable stdout record, echoed from prepare and read through native JSONL. */
exports.PaperclipNativeRunReceiptSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('paperclip.x9-run-binding'),
    schemaVersion: zod_1.z.literal(1),
    ...AdmissionFields,
}).refine(orderedHostWindow, HostWindowIssue);
/** Same per-agent turn endpoint, dedicated authenticated native caller; no caller scope/revision. */
exports.PaperclipAdmissionRequestSchema = zod_1.z.discriminatedUnion('phase', [
    zod_1.z.strictObject({ phase: zod_1.z.literal('prepare'), native: exports.PaperclipNativeRunIdentitySchema }),
    zod_1.z.strictObject({ phase: zod_1.z.literal('commit'), admissionId: zod_1.z.uuid() }),
]);
exports.PaperclipAdmissionPreparedSchema = zod_1.z.strictObject({
    phase: zod_1.z.literal('prepared'),
    ...AdmissionFields,
}).refine(orderedHostWindow, HostWindowIssue);
exports.PaperclipAdmissionCommittedSchema = zod_1.z.strictObject({
    phase: zod_1.z.literal('committed'), admissionId: zod_1.z.uuid(), runId: zod_1.z.uuid(),
});
exports.PaperclipAdmissionResponseSchema = zod_1.z.discriminatedUnion('phase', [
    exports.PaperclipAdmissionPreparedSchema, exports.PaperclipAdmissionCommittedSchema,
]);
/** Exact echo correspondence only; the host still verifies the single immutable native log record. */
function matchesPaperclipReceipt(rawPrepared, rawReceipt) {
    const prepared = exports.PaperclipAdmissionPreparedSchema.safeParse(rawPrepared);
    const receipt = exports.PaperclipNativeRunReceiptSchema.safeParse(rawReceipt);
    if (!prepared.success || !receipt.success)
        return false;
    const wanted = prepared.data;
    const actual = receipt.data;
    return wanted.admissionId === actual.admissionId
        && wanted.challenge === actual.challenge
        && wanted.companyId === actual.companyId
        && wanted.paperclipAgentId === actual.paperclipAgentId
        && wanted.runId === actual.runId
        && wanted.issueId === actual.issueId
        && wanted.hostIssuedAt === actual.hostIssuedAt
        && wanted.hostDeadlineAt === actual.hostDeadlineAt;
}
//# sourceMappingURL=native-admission.js.map