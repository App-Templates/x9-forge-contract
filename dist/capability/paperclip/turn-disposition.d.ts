import { z } from 'zod';
import { type OrganizationAdmissionRefusalCode } from "../../http/endpoints/internal-agent-turn.js";
import { type PaperclipDisposizioneCorpo } from "../paperclip-protocollo/wire-scritture.js";
/**
 * What stays written on Paperclip when an organization turn ends is decided here and only here: a «not now» refusal
 * (spend cap, R&D pause, infrastructure not ready) is a wait Paperclip re-checks by itself, never a failed run.
 * A turn stopped by a limit while working also schedules a re-check and succeeds, preserving work already done.
 */
export type AdmissionRefusalClass = 'definitive' | 'not_now';
/** A code added to ORGANIZATION_ADMISSION_REFUSAL_CODES without a class here does not compile. */
export declare const ADMISSION_REFUSAL_CLASS: {
    readonly organization_context_missing: "definitive";
    readonly organization_context_invalid: "definitive";
    readonly organization_attempt_invalid: "definitive";
    readonly run_correlation_mismatch: "definitive";
    readonly issuer_not_authorized: "definitive";
    readonly context_expired: "definitive";
    readonly organization_binding_unavailable: "not_now";
    readonly organization_binding_missing: "definitive";
    readonly organization_binding_ambiguous: "definitive";
    readonly tenant_mismatch: "definitive";
    readonly owner_mismatch: "definitive";
    readonly agent_identity_mismatch: "definitive";
    readonly agent_target_mismatch: "definitive";
    readonly organization_admission_unavailable: "not_now";
    readonly organization_tenant_unknown: "definitive";
    readonly budget_exhausted: "not_now";
    readonly rd_paused: "not_now";
};
export declare const NOT_NOW_DEFAULT_RETRY_SECONDS = 3600;
export declare const LIMIT_WAIT_SERVICE_NAME = "X9 company spend cap";
export declare const TURN_STOP_CODES: readonly ["budget_exhausted", "run_expired"];
export declare const TurnStopCodeSchema: z.ZodEnum<{
    budget_exhausted: "budget_exhausted";
    run_expired: "run_expired";
}>;
export type TurnStopCode = z.infer<typeof TurnStopCodeSchema>;
export declare const TURN_DISPOSITION_TEXT: {
    readonly checkNote: (code: OrganizationAdmissionRefusalCode) => string;
    readonly stoppedNote: (code: TurnStopCode) => string;
    readonly notExecutedComment: () => string;
    readonly unblockAction: (code: OrganizationAdmissionRefusalCode) => string;
};
export declare const TurnEndSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"succeeded">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"refused">;
    code: z.ZodEnum<{
        organization_context_missing: "organization_context_missing";
        organization_context_invalid: "organization_context_invalid";
        organization_attempt_invalid: "organization_attempt_invalid";
        run_correlation_mismatch: "run_correlation_mismatch";
        issuer_not_authorized: "issuer_not_authorized";
        context_expired: "context_expired";
        organization_binding_unavailable: "organization_binding_unavailable";
        organization_binding_missing: "organization_binding_missing";
        organization_binding_ambiguous: "organization_binding_ambiguous";
        tenant_mismatch: "tenant_mismatch";
        owner_mismatch: "owner_mismatch";
        agent_identity_mismatch: "agent_identity_mismatch";
        agent_target_mismatch: "agent_target_mismatch";
        organization_admission_unavailable: "organization_admission_unavailable";
        organization_tenant_unknown: "organization_tenant_unknown";
        budget_exhausted: "budget_exhausted";
        rd_paused: "rd_paused";
    }>;
    message: z.ZodOptional<z.ZodString>;
    retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"failed">;
    failureCode: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"uncertain">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"unavailable">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"cancelled">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"stopped">;
    code: z.ZodEnum<{
        budget_exhausted: "budget_exhausted";
        run_expired: "run_expired";
    }>;
    retryAfterSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>], "kind">;
export type TurnEnd = z.infer<typeof TurnEndSchema>;
export declare const TurnDispositionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"leave">;
    runSucceeds: z.ZodLiteral<true>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"check_later">;
    runSucceeds: z.ZodLiteral<true>;
    afterSeconds: z.ZodNumber;
    notes: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"close_not_executed">;
    runSucceeds: z.ZodLiteral<true>;
    comment: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"block_for_owner">;
    runSucceeds: z.ZodLiteral<true>;
    action: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"fail_run">;
    runSucceeds: z.ZodLiteral<false>;
}, z.core.$strict>], "kind">;
export type TurnDisposition = z.infer<typeof TurnDispositionSchema>;
/** Only failed, uncertain and unavailable ends fail the run; refusals and limit stops never do. */
export declare function dispositionForTurnEnd(end: TurnEnd): TurnDisposition;
/** Read the stored monitor tolerantly: Paperclip adds fields and nullable values to its policy. */
export declare function waitsOnLimit(policy: unknown): boolean;
/** The write to make on the Paperclip issue, or null when nothing is written. The time enters only from `ctx.now`. */
export declare function paperclipBodyForDisposition(d: TurnDisposition, ctx: {
    now: Date;
    agentId: string;
    currentExecutionPolicy?: Record<string, unknown> | null;
}): PaperclipDisposizioneCorpo | null;
//# sourceMappingURL=turn-disposition.d.ts.map