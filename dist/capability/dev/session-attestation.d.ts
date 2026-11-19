import { z } from 'zod';
import { type DevSessionAcceptance, type DevSessionAttestor } from "./session-acceptance.js";
import { devSessionRequirements } from "./session-acceptance-templates.js";
import { type DevSessionDeliveredFile } from "./session-assignment.js";
export declare const DEV_SESSION_ATTESTATION_FILE = "ATTESTAZIONE.json";
export declare const DEV_SESSION_ATTESTATION_STATUSES: readonly ["soddisfatto", "non_soddisfatto", "da_revisionare"];
export declare const DEV_SESSION_PROOF_ORIGINS: readonly ["base", "esecutore", "sessione"];
export declare const DEV_SESSION_RESPONSIBLES: readonly ["sessione", "capo", "referente", "director"];
export declare const DEV_SESSION_ATTESTATION_MAX_ENTRIES: number;
export declare const DevSessionAttestationEntrySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"soddisfatto">;
    proof: z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>;
    proofOrigin: z.ZodEnum<{
        sessione: "sessione";
        esecutore: "esecutore";
        base: "base";
    }>;
    criterionId: z.ZodString;
    attempt: z.ZodNumber;
    templateVersion: z.ZodNumber;
    contractDigest: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"non_soddisfatto">;
    reason: z.ZodString;
    responsible: z.ZodEnum<{
        director: "director";
        capo: "capo";
        sessione: "sessione";
        referente: "referente";
    }>;
    nextAction: z.ZodString;
    criterionId: z.ZodString;
    attempt: z.ZodNumber;
    templateVersion: z.ZodNumber;
    contractDigest: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"da_revisionare">;
    reason: z.ZodString;
    criterionId: z.ZodString;
    attempt: z.ZodNumber;
    templateVersion: z.ZodNumber;
    contractDigest: z.ZodString;
}, z.core.$strict>], "status">;
export type DevSessionAttestationEntry = z.infer<typeof DevSessionAttestationEntrySchema>;
export declare const DevSessionAttestationSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    entries: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"soddisfatto">;
        proof: z.ZodObject<{
            path: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
        proofOrigin: z.ZodEnum<{
            sessione: "sessione";
            esecutore: "esecutore";
            base: "base";
        }>;
        criterionId: z.ZodString;
        attempt: z.ZodNumber;
        templateVersion: z.ZodNumber;
        contractDigest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"non_soddisfatto">;
        reason: z.ZodString;
        responsible: z.ZodEnum<{
            director: "director";
            capo: "capo";
            sessione: "sessione";
            referente: "referente";
        }>;
        nextAction: z.ZodString;
        criterionId: z.ZodString;
        attempt: z.ZodNumber;
        templateVersion: z.ZodNumber;
        contractDigest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"da_revisionare">;
        reason: z.ZodString;
        criterionId: z.ZodString;
        attempt: z.ZodNumber;
        templateVersion: z.ZodNumber;
        contractDigest: z.ZodString;
    }, z.core.$strict>], "status">>;
}, z.core.$strict>;
export type DevSessionAttestation = z.infer<typeof DevSessionAttestationSchema>;
export declare const DevSessionManifestAttestationSchema: z.ZodObject<{
    sha256: z.ZodString;
    attestation: z.ZodObject<{
        version: z.ZodLiteral<1>;
        entries: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"soddisfatto">;
            proof: z.ZodObject<{
                path: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            proofOrigin: z.ZodEnum<{
                sessione: "sessione";
                esecutore: "esecutore";
                base: "base";
            }>;
            criterionId: z.ZodString;
            attempt: z.ZodNumber;
            templateVersion: z.ZodNumber;
            contractDigest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"non_soddisfatto">;
            reason: z.ZodString;
            responsible: z.ZodEnum<{
                director: "director";
                capo: "capo";
                sessione: "sessione";
                referente: "referente";
            }>;
            nextAction: z.ZodString;
            criterionId: z.ZodString;
            attempt: z.ZodNumber;
            templateVersion: z.ZodNumber;
            contractDigest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"da_revisionare">;
            reason: z.ZodString;
            criterionId: z.ZodString;
            attempt: z.ZodNumber;
            templateVersion: z.ZodNumber;
            contractDigest: z.ZodString;
        }, z.core.$strict>], "status">>;
    }, z.core.$strict>;
    proofs: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionManifestAttestation = z.infer<typeof DevSessionManifestAttestationSchema>;
export declare const DEV_SESSION_VERDICT_PROBLEMS: readonly ["requirements_unresolved", "criterion_unknown", "attestor_not_session", "attestor_not_executor", "entry_duplicate", "attempt_stale", "template_version_mismatch", "contract_digest_mismatch", "proof_missing", "proof_modified", "proof_origin_session", "entry_missing", "executor_result_missing"];
export type DevSessionVerdictProblemCode = (typeof DEV_SESSION_VERDICT_PROBLEMS)[number];
type Requirement = Extract<ReturnType<typeof devSessionRequirements>, {
    ok: true;
}>['requirements'][number];
type VerdictProblem = {
    code: DevSessionVerdictProblemCode;
    criterionId: string | null;
};
type VerdictCriterion = {
    id: string;
    attestor: DevSessionAttestor;
    origin: Requirement['origin'];
    status: DevSessionAttestationEntry['status'] | 'in_attesa';
    proofPath?: string;
    proofOrigin?: (typeof DEV_SESSION_PROOF_ORIGINS)[number];
    reason?: string;
    responsible?: (typeof DEV_SESSION_RESPONSIBLES)[number];
    nextAction?: string;
    unit?: string;
};
export type DevSessionAcceptanceVerdict = {
    sessionComplete: boolean;
    awaiting: {
        id: string;
        attestor: DevSessionAttestor;
        unit?: string;
    }[];
    criteria: VerdictCriterion[];
    problems: VerdictProblem[];
};
/**
 * Pure verdict on the session's and the executor's share of the requirements. It never throws and never says
 * "accepted": the final judgement belongs to Paperclip and to the referente. `attestation` is the session's file
 * (or null), `results` come from the executor for ITS requirements only, `proofs` are the manifest files.
 */
export declare function devSessionAcceptanceVerdict(input: {
    acceptance: DevSessionAcceptance;
    attestation: DevSessionAttestation | null;
    results: readonly DevSessionAttestationEntry[];
    attempt: number;
    contractDigest: string;
    proofs: readonly DevSessionDeliveredFile[];
}): DevSessionAcceptanceVerdict;
export {};
//# sourceMappingURL=session-attestation.d.ts.map