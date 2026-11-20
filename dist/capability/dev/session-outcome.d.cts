import { z } from 'zod';
import type { PaperclipStatoIncarico } from "../paperclip-protocollo/wire-letture.cjs";
export declare const DEV_SESSION_OUTCOME_BLOCK_MARKER: "x9:dev-session-outcome:v1";
export declare const DEV_SESSION_OUTCOME_STATES: readonly ["delivered", "failed", "discarded", "waiting_materials", "waiting_answer"];
export type DevSessionOutcomeState = typeof DEV_SESSION_OUTCOME_STATES[number];
export declare const DEV_SESSION_OUTCOME_REASONS: {
    readonly delivered: readonly ["tests_green", "no_tests_declared"];
    readonly failed: readonly ["tests_red", "session_error", "executor_error", "not_published", "materials_not_obtained", "outcome_not_recorded"];
    readonly discarded: readonly ["cancelled_by_answer", "closed_on_board", "duplicate_assignment", "assignment_refused"];
    readonly waiting_materials: readonly ["materials_requested"];
    readonly waiting_answer: readonly ["answer_requested", "retry_or_cancel_requested"];
};
/** Machine-readable outcome; free text never determines the session state. */
export declare const DevSessionOutcomeSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
    attempt: z.ZodNumber;
    state: z.ZodEnum<{
        failed: "failed";
        delivered: "delivered";
        discarded: "discarded";
        waiting_materials: "waiting_materials";
        waiting_answer: "waiting_answer";
    }>;
    reason: z.ZodObject<{
        code: z.ZodEnum<{
            session_error: "session_error";
            tests_green: "tests_green";
            no_tests_declared: "no_tests_declared";
            tests_red: "tests_red";
            executor_error: "executor_error";
            not_published: "not_published";
            materials_not_obtained: "materials_not_obtained";
            outcome_not_recorded: "outcome_not_recorded";
            cancelled_by_answer: "cancelled_by_answer";
            closed_on_board: "closed_on_board";
            duplicate_assignment: "duplicate_assignment";
            assignment_refused: "assignment_refused";
            materials_requested: "materials_requested";
            answer_requested: "answer_requested";
            retry_or_cancel_requested: "retry_or_cancel_requested";
        }>;
        text: z.ZodString;
    }, z.core.$strict>;
    disposition: z.ZodOptional<z.ZodObject<{
        nature: z.ZodEnum<{
            cancelled: "cancelled";
            invalid_request: "invalid_request";
            technical_failure: "technical_failure";
            permission_refused: "permission_refused";
            limit_reached: "limit_reached";
            missing_data: "missing_data";
        }>;
        retry: z.ZodEnum<{
            never: "never";
            next_turn: "next_turn";
            after_delay: "after_delay";
        }>;
        retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
        nextMove: z.ZodEnum<{
            stop: "stop";
            retry_same: "retry_same";
            fix_input: "fix_input";
            ask_director: "ask_director";
            ask_referent: "ask_referent";
            ask_owner: "ask_owner";
            wait_event: "wait_event";
        }>;
    }, z.core.$strict>>;
    missingMaterials: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ref: z.ZodString;
        error: z.ZodString;
    }, z.core.$strict>>>;
    commit: z.ZodOptional<z.ZodString>;
    executorVersion: z.ZodString;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevSessionOutcome = z.infer<typeof DevSessionOutcomeSchema>;
export declare const DEV_SESSION_ANSWER_BLOCK_MARKER: "x9:dev-session-answer:v1";
export declare const DEV_SESSION_ANSWER_KINDS: readonly ["riprova", "annulla", "usa_ramo", "materiale", "decisione", "chiarimento"];
/** A complete commit hash or a full branch/tag reference, never a prose fragment. */
export declare const DevSessionGitRefSchema: z.ZodString;
export declare const DevSessionAnswerSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"riprova">;
    note: z.ZodOptional<z.ZodString>;
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"annulla">;
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"usa_ramo">;
    repo: z.ZodString;
    ref: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"materiale">;
    materials: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"asset">;
        asset: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
            name: z.ZodString;
            mediaType: z.ZodString;
            sizeBytes: z.ZodNumber;
            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                messageId: z.ZodString;
                attachmentName: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"archive">;
                archiveSha256: z.ZodString;
                entryPath: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                sessionId: z.ZodString;
                repo: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                path: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"link">;
                url: z.ZodURL;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>], "kind">;
            tenantId: z.ZodString;
            companyId: z.ZodString;
            projectId: z.ZodString;
            assetType: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            providedBy: z.ZodOptional<z.ZodObject<{
                personRef: z.ZodString;
            }, z.core.$strict>>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"github_link">;
        url: z.ZodString;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "kind">>;
    note: z.ZodOptional<z.ZodString>;
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    text: z.ZodString;
    block: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"decisione">;
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    text: z.ZodString;
    block: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"chiarimento">;
    version: z.ZodLiteral<1>;
    sessionId: z.ZodString;
}, z.core.$strict>], "kind">;
export type DevSessionAnswer = z.infer<typeof DevSessionAnswerSchema>;
type BlockFailure = 'absent' | 'multiple' | 'malformed' | 'invalid_json';
export type DevSessionOutcomeBlockFailure = BlockFailure | 'invalid_outcome';
export type DevSessionAnswerBlockFailure = BlockFailure | 'invalid_answer';
export declare function devSessionOutcomeCanonicalJson(raw: unknown): string;
export declare function renderDevSessionOutcomeBlock(raw: unknown, digest: string): string;
export declare function parseDevSessionOutcomeBlock(body: string): {
    ok: true;
    outcome: DevSessionOutcome;
    digest: string;
} | {
    ok: false;
    reason: DevSessionOutcomeBlockFailure;
};
export declare function devSessionAnswerCanonicalJson(raw: unknown): string;
export declare function renderDevSessionAnswerBlock(raw: unknown, digest: string): string;
export declare function parseDevSessionAnswerBlock(body: string): {
    ok: true;
    answer: DevSessionAnswer;
    digest: string;
} | {
    ok: false;
    reason: DevSessionAnswerBlockFailure;
};
/**
 * Where each outcome state lands on the child issue, whether it carries a yes/no question and which
 * wake reaches the lead. Every write by the executor needs a live run of the executor itself
 * (`in_progress` lives only as long as the run; with a finished run Paperclip answers 409); a retry
 * is a new child, a closed one is never reopened.
 */
export declare const DEV_SESSION_PAPERCLIP_STATE: Readonly<Record<DevSessionOutcomeState, {
    status: PaperclipStatoIncarico;
    question: boolean;
    wakesLead: 'interaction_pending' | 'issue_children_completed';
}>>;
/** `todo` is the default for an assigned issue (execution-semantics.md:536-538). */
export declare const DEV_SESSION_PAPERCLIP_OPEN_STATUS: "todo";
/** Only while the run lives: a finished run can no longer write it. */
export declare const DEV_SESSION_PAPERCLIP_WORK_STATUS: "in_progress";
/** Paperclip refuses attachments above 10 MiB by default (attachment-types.ts:164-165, PAPERCLIP_ATTACHMENT_MAX_BYTES). */
export declare const DEV_SESSION_PROOF_ATTACHMENT_MAX_BYTES: number;
export declare const DevSessionProofAttachmentSchema: z.ZodObject<{
    attachmentId: z.ZodGUID;
    name: z.ZodString;
    mediaType: z.ZodString;
    sha256: z.ZodString;
    sizeBytes: z.ZodNumber;
}, z.core.$strict>;
export type DevSessionProofAttachment = z.infer<typeof DevSessionProofAttachmentSchema>;
/** A file above the limit stays only in the git branch and the outcome says so. */
export declare function devSessionProofAttachmentDecision(sizeBytes: number, maxBytes?: number): {
    attach: true;
} | {
    attach: false;
    reason: 'too_large';
};
export declare const DevSessionPaperclipProductsInputSchema: z.ZodObject<{
    repo: z.ZodString;
    branch: z.ZodString;
    commit: z.ZodString;
    manifestSha256: z.ZodString;
    proofs: z.ZodArray<z.ZodObject<{
        attachmentId: z.ZodGUID;
        name: z.ZodString;
        mediaType: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionPaperclipProductsInput = z.infer<typeof DevSessionPaperclipProductsInputSchema>;
export type DevSessionPaperclipProduct = {
    type: 'branch' | 'commit';
    provider: 'github';
    externalId: string;
    title: string;
    url: string;
    metadata?: {
        repo: string;
        manifestSha256: string;
    };
} | {
    type: 'artifact';
    provider: 'paperclip';
    externalId: string;
    title: string;
    metadata: {
        attachmentId: string;
    };
};
/** Work products of a delivery in order: branch, commit, then one artifact per proof. */
export declare function devSessionPaperclipProducts(input: DevSessionPaperclipProductsInput): DevSessionPaperclipProduct[];
export {};
//# sourceMappingURL=session-outcome.d.ts.map