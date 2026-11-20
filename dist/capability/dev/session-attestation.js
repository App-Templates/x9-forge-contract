import { z } from 'zod';
import { DEV_SESSION_ACCEPTANCE_MAX_CRITERIA, DEV_SESSION_CRITERION_TEXT_MAX, DevSessionCriterionSchema, } from "./session-acceptance.js";
import { DEV_SESSION_ACCEPTANCE_CATALOG } from "./session-acceptance-catalog.js";
import { devSessionRequirements } from "./session-acceptance-templates.js";
import { DevSessionDeliveredFileSchema } from "./session-assignment.js";
// Location of the session's own register inside the delivery folder `.consegna/<n>/`.
export const DEV_SESSION_ATTESTATION_FILE = 'ATTESTAZIONE.json';
// There is no "impossible" status: a requirement that cannot be met is `non_soddisfatto`, with an owner and a next action.
export const DEV_SESSION_ATTESTATION_STATUSES = ['soddisfatto', 'non_soddisfatto', 'da_revisionare'];
// Where the executed check lives: in the base commit, in the executor program, or written by the session itself.
export const DEV_SESSION_PROOF_ORIGINS = ['base', 'esecutore', 'sessione'];
export const DEV_SESSION_RESPONSIBLES = ['sessione', 'capo', 'referente', 'director'];
// Entries also cover the form requirements of the template, so Paperclip's criteria limit alone does not cut them.
export const DEV_SESSION_ATTESTATION_MAX_ENTRIES = DEV_SESSION_ACCEPTANCE_MAX_CRITERIA + Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG).length;
const ReasonSchema = z.string().trim().min(1).max(DEV_SESSION_CRITERION_TEXT_MAX);
const EntryCommon = {
    criterionId: DevSessionCriterionSchema.shape.id,
    attempt: z.number().int().min(1),
    templateVersion: z.number().int().min(1),
    contractDigest: DevSessionDeliveredFileSchema.shape.sha256,
};
// No "complete/incomplete" key exists anywhere: that is a judgement of the contract, never of the session.
export const DevSessionAttestationEntrySchema = z.discriminatedUnion('status', [
    z.strictObject({
        ...EntryCommon,
        status: z.literal(DEV_SESSION_ATTESTATION_STATUSES[0]),
        proof: z.strictObject({ path: DevSessionDeliveredFileSchema.shape.path, sha256: DevSessionDeliveredFileSchema.shape.sha256 }),
        proofOrigin: z.enum(DEV_SESSION_PROOF_ORIGINS),
    }),
    z.strictObject({
        ...EntryCommon,
        status: z.literal(DEV_SESSION_ATTESTATION_STATUSES[1]),
        reason: ReasonSchema,
        responsible: z.enum(DEV_SESSION_RESPONSIBLES),
        nextAction: ReasonSchema,
    }),
    z.strictObject({
        ...EntryCommon,
        status: z.literal(DEV_SESSION_ATTESTATION_STATUSES[2]),
        reason: ReasonSchema,
    }),
]);
export const DevSessionAttestationSchema = z.strictObject({
    version: z.literal(1),
    entries: z.array(DevSessionAttestationEntrySchema).max(DEV_SESSION_ATTESTATION_MAX_ENTRIES),
});
// Manifest part: the digest of the file as read before deletion, its content and the indexed proof files.
export const DevSessionManifestAttestationSchema = z.strictObject({
    sha256: DevSessionDeliveredFileSchema.shape.sha256,
    attestation: DevSessionAttestationSchema,
    proofs: z.array(DevSessionDeliveredFileSchema).max(100),
});
export const DEV_SESSION_VERDICT_PROBLEMS = [
    'requirements_unresolved', 'criterion_unknown', 'attestor_not_session', 'attestor_not_executor',
    'entry_duplicate', 'attempt_stale', 'template_version_mismatch', 'contract_digest_mismatch',
    'proof_missing', 'proof_modified', 'proof_origin_session', 'entry_missing', 'executor_result_missing',
];
/**
 * Pure verdict on the session's and the executor's share of the requirements. It never throws and never says
 * "accepted": the final judgement belongs to Paperclip and to the referente. `attestation` is the session's file
 * (or null), `results` come from the executor for ITS requirements only, `proofs` are the manifest files.
 */
export function devSessionAcceptanceVerdict(input) {
    const resolved = devSessionRequirements(input.acceptance);
    if (!resolved.ok) {
        return { sessionComplete: false, awaiting: [], criteria: [], problems: [{ code: 'requirements_unresolved', criterionId: null }] };
    }
    const requirements = resolved.requirements;
    const byId = new Map(requirements.map((requirement) => [requirement.id, requirement]));
    const problems = [];
    // Judges one source; the first entry per id counts, later ones are duplicates and cannot repair it.
    const judge = (entries, expected) => {
        const judged = new Map();
        for (const entry of entries) {
            const id = entry.criterionId;
            const requirement = byId.get(id);
            if (requirement === undefined) {
                problems.push({ code: 'criterion_unknown', criterionId: id });
                continue;
            }
            // A requirement of another business unit belongs to nobody in this session.
            if (requirement.unit !== undefined || requirement.attestor !== expected) {
                if (expected === 'sessione')
                    problems.push({ code: 'attestor_not_session', criterionId: id });
                else
                    problems.push({ code: 'attestor_not_executor', criterionId: id });
                continue;
            }
            if (judged.has(id)) {
                problems.push({ code: 'entry_duplicate', criterionId: id });
                continue;
            }
            let accepted = true;
            let downgraded = false;
            if (entry.attempt !== input.attempt) {
                problems.push({ code: 'attempt_stale', criterionId: id });
                accepted = false;
            }
            if (entry.templateVersion !== input.acceptance.template.version) {
                problems.push({ code: 'template_version_mismatch', criterionId: id });
                accepted = false;
            }
            if (entry.contractDigest !== input.contractDigest) {
                problems.push({ code: 'contract_digest_mismatch', criterionId: id });
                accepted = false;
            }
            if (entry.status === 'soddisfatto') {
                const proof = entry.proof;
                const file = input.proofs.find(({ path }) => path === proof.path);
                if (file === undefined) {
                    problems.push({ code: 'proof_missing', criterionId: id });
                    accepted = false;
                }
                else if (proof.sha256 !== file.sha256) {
                    problems.push({ code: 'proof_modified', criterionId: id });
                    accepted = false;
                }
            }
            // A10: a check written by whoever produces the work is not a full green for an executor requirement.
            if (expected === 'esecutore' && entry.status === 'soddisfatto' && entry.proofOrigin === 'sessione') {
                problems.push({ code: 'proof_origin_session', criterionId: id });
                accepted = false;
                downgraded = true;
            }
            judged.set(id, { entry, accepted, downgraded });
        }
        return judged;
    };
    const fromSession = judge(input.attestation?.entries ?? [], 'sessione');
    const fromExecutor = judge(input.results, 'esecutore');
    const ownedBySession = (requirement) => requirement.unit === undefined && requirement.attestor === 'sessione';
    const ownedByExecutor = (requirement) => requirement.unit === undefined && requirement.attestor === 'esecutore';
    for (const requirement of requirements) {
        if (ownedBySession(requirement) && fromSession.get(requirement.id)?.accepted !== true) {
            problems.push({ code: 'entry_missing', criterionId: requirement.id });
        }
    }
    for (const requirement of requirements) {
        if (ownedByExecutor(requirement) && fromExecutor.get(requirement.id)?.accepted !== true) {
            problems.push({ code: 'executor_result_missing', criterionId: requirement.id });
        }
    }
    const criteria = requirements.map((requirement) => {
        const head = {
            id: requirement.id, attestor: requirement.attestor, origin: requirement.origin,
            ...(requirement.unit === undefined ? {} : { unit: requirement.unit }),
        };
        const owned = ownedBySession(requirement) || ownedByExecutor(requirement);
        const judged = !owned ? undefined : (ownedBySession(requirement) ? fromSession : fromExecutor).get(requirement.id);
        if (judged === undefined || (!judged.accepted && !judged.downgraded))
            return { ...head, status: 'in_attesa' };
        const entry = judged.entry;
        if (judged.downgraded && entry.status === 'soddisfatto') {
            return { ...head, status: 'da_revisionare', proofPath: entry.proof.path, proofOrigin: entry.proofOrigin };
        }
        if (entry.status === 'soddisfatto') {
            return { ...head, status: entry.status, proofPath: entry.proof.path, proofOrigin: entry.proofOrigin };
        }
        if (entry.status === 'non_soddisfatto') {
            return { ...head, status: entry.status, reason: entry.reason, responsible: entry.responsible, nextAction: entry.nextAction };
        }
        return { ...head, status: entry.status, reason: entry.reason };
    });
    const awaiting = requirements
        .filter(({ unit, attestor }) => unit !== undefined || attestor === 'revisore' || attestor === 'referente')
        .map(({ id, attestor, unit }) => ({ id, attestor, ...(unit === undefined ? {} : { unit }) }));
    // Awaiting items of other parties never block the session's own share.
    const sessionComplete = problems.length === 0 && requirements.every((requirement, index) => {
        if (!ownedBySession(requirement) && !ownedByExecutor(requirement))
            return true;
        return criteria[index]?.status === 'soddisfatto';
    });
    return { sessionComplete, awaiting, criteria, problems };
}
//# sourceMappingURL=session-attestation.js.map