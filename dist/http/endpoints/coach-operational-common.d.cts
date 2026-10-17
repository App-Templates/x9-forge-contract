import { z } from 'zod';
export declare const COACH_OPERATIONAL_PREFIX = "/internal/capability/agents/:agentId/coach/v2";
export declare const COACH_OPERATIONAL_AUTH_HEADER: "X-Internal-Secret";
export declare const CoachOperationalAgentParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strict>;
export declare const CoachOperationalSessionParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    sessionId: z.ZodString;
}, z.core.$strict>;
export declare const CoachOperationalProgramParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    programId: z.ZodString;
    programVersion: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
}, z.core.$strict>;
export declare const COACH_OPERATIONAL_ERROR_STATUS: {
    readonly invalid_request: 400;
    readonly unauthorized: 401;
    readonly scope_mismatch: 403;
    readonly not_found: 404;
    readonly program_not_found: 404;
    readonly strategy_unavailable: 422;
    readonly stale_revision: 409;
    readonly stale_program_version: 409;
    readonly idempotency_conflict: 409;
    readonly budget_exhausted: 429;
    readonly budget_unavailable: 503;
    readonly authority_unavailable: 503;
    readonly source_unavailable: 503;
};
export declare const CoachOperationalErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        idempotency_conflict: "idempotency_conflict";
        source_unavailable: "source_unavailable";
        budget_exhausted: "budget_exhausted";
        not_found: "not_found";
        program_not_found: "program_not_found";
        scope_mismatch: "scope_mismatch";
        authority_unavailable: "authority_unavailable";
        unauthorized: "unauthorized";
        strategy_unavailable: "strategy_unavailable";
        stale_revision: "stale_revision";
        stale_program_version: "stale_program_version";
        budget_unavailable: "budget_unavailable";
    }>;
    currentRevision: z.ZodOptional<z.ZodNumber>;
    currentProgramVersion: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type CoachOperationalError = z.infer<typeof CoachOperationalErrorSchema>;
export declare function isCoachOpeningForSessionRoute(raw: unknown, rawParams: unknown): boolean;
export declare function isCoachProgramForRevisionRoute(raw: unknown, rawParams: unknown): boolean;
export declare function operationalAgentPath(agentId: string): string;
export declare function operationalSessionPath(agentId: string, sessionId: string): string;
//# sourceMappingURL=coach-operational-common.d.ts.map