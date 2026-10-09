import { z } from 'zod';
/** Native process observations. Parsing does not prove native execution or assignment. */
export const PaperclipNativeRunIdentitySchema = z.strictObject({
    companyId: z.uuid(),
    paperclipAgentId: z.uuid(),
    runId: z.uuid(),
    issueId: z.uuid(),
});
/** Fresh host-generated 32-byte random challenge, not a credential or a native lease. */
export const PaperclipAdmissionChallengeSchema = z.string().regex(/^[a-f0-9]{64}$/);
const HostTimestamp = z.iso.datetime({ offset: true });
const AdmissionFields = {
    ...PaperclipNativeRunIdentitySchema.shape,
    admissionId: z.uuid(),
    challenge: PaperclipAdmissionChallengeSchema,
    hostIssuedAt: HostTimestamp,
    hostDeadlineAt: HostTimestamp,
};
function orderedHostWindow(value) {
    return Date.parse(value.hostIssuedAt) < Date.parse(value.hostDeadlineAt);
}
const HostWindowIssue = { message: 'Host deadline must follow issuance', path: ['hostDeadlineAt'] };
/** Host-issued metadata shared by prepare, immutable receipt and server dispatch. */
export const PaperclipAdmissionMetadataSchema = z.strictObject(AdmissionFields).refine(orderedHostWindow, HostWindowIssue);
/** Exactly one immutable stdout record, echoed from prepare and read through native JSONL. */
export const PaperclipNativeRunReceiptSchema = z.strictObject({
    kind: z.literal('paperclip.x9-run-binding'),
    schemaVersion: z.literal(1),
    ...AdmissionFields,
}).refine(orderedHostWindow, HostWindowIssue);
/** Same per-agent turn endpoint, dedicated authenticated native caller; no caller scope/revision. */
export const PaperclipAdmissionRequestSchema = z.discriminatedUnion('phase', [
    z.strictObject({ phase: z.literal('prepare'), native: PaperclipNativeRunIdentitySchema }),
    z.strictObject({ phase: z.literal('commit'), admissionId: z.uuid() }),
]);
export const PaperclipAdmissionPreparedSchema = z.strictObject({
    phase: z.literal('prepared'),
    ...AdmissionFields,
}).refine(orderedHostWindow, HostWindowIssue);
export const PaperclipAdmissionCommittedSchema = z.strictObject({
    phase: z.literal('committed'), admissionId: z.uuid(), runId: z.uuid(),
});
export const PaperclipAdmissionResponseSchema = z.discriminatedUnion('phase', [
    PaperclipAdmissionPreparedSchema, PaperclipAdmissionCommittedSchema,
]);
/** Exact echo correspondence only; the host still verifies the single immutable native log record. */
export function matchesPaperclipReceipt(rawPrepared, rawReceipt) {
    const prepared = PaperclipAdmissionPreparedSchema.safeParse(rawPrepared);
    const receipt = PaperclipNativeRunReceiptSchema.safeParse(rawReceipt);
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