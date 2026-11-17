import { z } from 'zod';
import { type SocialJobInput, type SocialJobResult, type SocialJobResultMatch } from "./job-io.js";
import { type SocialJob, type SocialRound } from "./queue.js";
/** Decode generic channel data only for the exact social queue job and trusted scope. */
export declare function readSocialGenericJob(generic: {
    capability: string;
    kind: string;
    scope: unknown;
    input: unknown;
}, queueJob: SocialJob): {
    ok: true;
    input: SocialJobInput;
} | {
    ok: false;
    error: 'not_social_job' | 'foreign_scope' | 'kind_mismatch' | 'invalid_input' | 'input_mismatch';
};
/** The service attaches identity from the queue job; identity never comes from the executor. */
export declare function readSocialGenericOutput(queueJob: SocialJob, output: unknown): {
    ok: true;
    result: SocialJobResult;
} | {
    ok: false;
    error: 'invalid_result';
} | Extract<SocialJobResultMatch, {
    ok: false;
}>;
/** Build the read-only round path for a validated agent id. */
export declare function socialRoundPath(agentId: string): string;
export declare const SocialRoundQuerySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    verticalId: z.ZodString;
    day: z.ZodString;
}, z.core.$strict>;
export type SocialRoundQuery = z.infer<typeof SocialRoundQuerySchema>;
export declare const SocialRoundReadResponseSchema: z.ZodObject<{
    round: z.ZodNullable<z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        verticalId: z.ZodString;
        day: z.ZodString;
        track: z.ZodEnum<{
            mac: "mac";
            server: "server";
        }>;
        state: z.ZodEnum<{
            failed: "failed";
            done: "done";
            running: "running";
            scheduled: "scheduled";
            cap_reached: "cap_reached";
        }>;
        scheduledFor: z.ZodISODateTime;
        startedAt: z.ZodOptional<z.ZodISODateTime>;
        finishedAt: z.ZodOptional<z.ZodISODateTime>;
        handedToServerAt: z.ZodOptional<z.ZodISODateTime>;
        postsSeen: z.ZodNumber;
        topicsCount: z.ZodNumber;
        spentUsd: z.ZodNumber;
        capUsd: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Accept a complete round response only within the requested scope, vertical and day. */
export declare function selectSocialRound(raw: unknown, query: SocialRoundQuery): {
    ok: true;
    round: SocialRound | null;
} | {
    ok: false;
    error: 'invalid_response' | 'foreign_scope' | 'round_mismatch';
};
/**
 * The internal secret travels in the {@link INTERNAL_SECRET_HEADER} header.
 * The service must compare path agentId with scope.agentId and authorize that scope.
 * Reading an absent round returns null and never creates or enqueues work.
 */
export declare const socialRoundReadContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/social-listening/round";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        verticalId: z.ZodString;
        day: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        round: z.ZodNullable<z.ZodObject<{
            identity: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            verticalId: z.ZodString;
            day: z.ZodString;
            track: z.ZodEnum<{
                mac: "mac";
                server: "server";
            }>;
            state: z.ZodEnum<{
                failed: "failed";
                done: "done";
                running: "running";
                scheduled: "scheduled";
                cap_reached: "cap_reached";
            }>;
            scheduledFor: z.ZodISODateTime;
            startedAt: z.ZodOptional<z.ZodISODateTime>;
            finishedAt: z.ZodOptional<z.ZodISODateTime>;
            handedToServerAt: z.ZodOptional<z.ZodISODateTime>;
            postsSeen: z.ZodNumber;
            topicsCount: z.ZodNumber;
            spentUsd: z.ZodNumber;
            capUsd: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=routes.d.ts.map