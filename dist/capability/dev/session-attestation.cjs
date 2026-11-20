"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_SESSION_VERDICT_PROBLEMS = exports.DevSessionManifestAttestationSchema = exports.DevSessionAttestationSchema = exports.DevSessionAttestationEntrySchema = exports.DEV_SESSION_ATTESTATION_MAX_ENTRIES = exports.DEV_SESSION_RESPONSIBLES = exports.DEV_SESSION_PROOF_ORIGINS = exports.DEV_SESSION_ATTESTATION_STATUSES = exports.DEV_SESSION_ATTESTATION_FILE = void 0;
exports.devSessionAcceptanceVerdict = devSessionAcceptanceVerdict;
const zod_1 = require("zod");
const session_acceptance_js_1 = require("./session-acceptance.cjs");
const session_acceptance_catalog_js_1 = require("./session-acceptance-catalog.cjs");
const session_acceptance_templates_js_1 = require("./session-acceptance-templates.cjs");
const session_assignment_js_1 = require("./session-assignment.cjs");
// Location of the session's own register inside the delivery folder `.consegna/<n>/`.
exports.DEV_SESSION_ATTESTATION_FILE = 'ATTESTAZIONE.json';
// There is no "impossible" status: a requirement that cannot be met is `non_soddisfatto`, with an owner and a next action.
exports.DEV_SESSION_ATTESTATION_STATUSES = ['soddisfatto', 'non_soddisfatto', 'da_revisionare'];
// Where the executed check lives: in the base commit, in the executor program, or written by the session itself.
exports.DEV_SESSION_PROOF_ORIGINS = ['base', 'esecutore', 'sessione'];
exports.DEV_SESSION_RESPONSIBLES = ['sessione', 'capo', 'referente', 'director'];
// Entries also cover the form requirements of the template, so Paperclip's criteria limit alone does not cut them.
exports.DEV_SESSION_ATTESTATION_MAX_ENTRIES = session_acceptance_js_1.DEV_SESSION_ACCEPTANCE_MAX_CRITERIA + Object.keys(session_acceptance_catalog_js_1.DEV_SESSION_ACCEPTANCE_CATALOG).length;
const ReasonSchema = zod_1.z.string().trim().min(1).max(session_acceptance_js_1.DEV_SESSION_CRITERION_TEXT_MAX);
const EntryCommon = {
    criterionId: session_acceptance_js_1.DevSessionCriterionSchema.shape.id,
    attempt: zod_1.z.number().int().min(1),
    templateVersion: zod_1.z.number().int().min(1),
    contractDigest: session_assignment_js_1.DevSessionDeliveredFileSchema.shape.sha256,
};
// No "complete/incomplete" key exists anywhere: that is a judgement of the contract, never of the session.
exports.DevSessionAttestationEntrySchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        ...EntryCommon,
        status: zod_1.z.literal(exports.DEV_SESSION_ATTESTATION_STATUSES[0]),
        proof: zod_1.z.strictObject({ path: session_assignment_js_1.DevSessionDeliveredFileSchema.shape.path, sha256: session_assignment_js_1.DevSessionDeliveredFileSchema.shape.sha256 }),
        proofOrigin: zod_1.z.enum(exports.DEV_SESSION_PROOF_ORIGINS),
    }),
    zod_1.z.strictObject({
        ...EntryCommon,
        status: zod_1.z.literal(exports.DEV_SESSION_ATTESTATION_STATUSES[1]),
        reason: ReasonSchema,
        responsible: zod_1.z.enum(exports.DEV_SESSION_RESPONSIBLES),
        nextAction: ReasonSchema,
    }),
    zod_1.z.strictObject({
        ...EntryCommon,
        status: zod_1.z.literal(exports.DEV_SESSION_ATTESTATION_STATUSES[2]),
        reason: ReasonSchema,
    }),
]);
exports.DevSessionAttestationSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    entries: zod_1.z.array(exports.DevSessionAttestationEntrySchema).max(exports.DEV_SESSION_ATTESTATION_MAX_ENTRIES),
});
// Manifest part: the digest of the file as read before deletion, its content and the indexed proof files.
exports.DevSessionManifestAttestationSchema = zod_1.z.strictObject({
    sha256: session_assignment_js_1.DevSessionDeliveredFileSchema.shape.sha256,
    attestation: exports.DevSessionAttestationSchema,
    proofs: zod_1.z.array(session_assignment_js_1.DevSessionDeliveredFileSchema).max(100),
});
exports.DEV_SESSION_VERDICT_PROBLEMS = [
    'requirements_unresolved', 'criterion_unknown', 'attestor_not_session', 'attestor_not_executor',
    'entry_duplicate', 'attempt_stale', 'template_version_mismatch', 'contract_digest_mismatch',
    'proof_missing', 'proof_modified', 'proof_origin_session', 'entry_missing', 'executor_result_missing',
];
/**
 * Pure verdict on the session's and the executor's share of the requirements. It never throws and never says
 * "accepted": the final judgement belongs to Paperclip and to the referente. `attestation` is the session's file
 * (or null), `results` come from the executor for ITS requirements only, `proofs` are the manifest files.
 */
function devSessionAcceptanceVerdict(input) {
    const resolved = (0, session_acceptance_templates_js_1.devSessionRequirements)(input.acceptance);
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