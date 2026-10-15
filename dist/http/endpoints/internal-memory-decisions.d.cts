import { z } from 'zod';
/**
 * POST /internal/memory/decisions — receipt of one authoritative decision event.
 * Direction: X9 internal (agent-core -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Same answers as the experience ingest: 200 receipt (idempotent on equal
 * digest) or 409 `experience_conflict`. Error bodies are
 * `ExperienceErrorResponseSchema` from internal-memory-experience.
 */
export declare const INTERNAL_MEMORY_DECISIONS_PATH: "/internal/memory/decisions";
export declare const InternalMemoryDecisionRequestSchema: z.ZodObject<{
    kind: z.ZodLiteral<"authoritative_decision">;
    decisionRef: z.ZodString;
    status: z.ZodEnum<{
        approved: "approved";
        revoked: "revoked";
        superseded: "superseded";
    }>;
    approvedBy: z.ZodOptional<z.ZodObject<{
        actorType: z.ZodEnum<{
            service: "service";
            human: "human";
        }>;
        actorId: z.ZodString;
    }, z.core.$strict>>;
    approvalRef: z.ZodOptional<z.ZodString>;
    supersedes: z.ZodOptional<z.ZodNumber>;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    recordId: z.ZodString;
    version: z.ZodNumber;
    occurredAt: z.ZodISODateTime;
    digest: z.ZodString;
    visibility: z.ZodLiteral<"private_to_producer">;
}, z.core.$strict>;
export type InternalMemoryDecisionRequest = z.infer<typeof InternalMemoryDecisionRequestSchema>;
export declare const InternalMemoryDecisionResponseSchema: z.ZodObject<{
    recordId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    disposition: z.ZodEnum<{
        duplicate: "duplicate";
        stored: "stored";
    }>;
}, z.core.$strict>;
export type InternalMemoryDecisionResponse = z.infer<typeof InternalMemoryDecisionResponseSchema>;
export declare const internalMemoryDecisionContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/decisions";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        kind: z.ZodLiteral<"authoritative_decision">;
        decisionRef: z.ZodString;
        status: z.ZodEnum<{
            approved: "approved";
            revoked: "revoked";
            superseded: "superseded";
        }>;
        approvedBy: z.ZodOptional<z.ZodObject<{
            actorType: z.ZodEnum<{
                service: "service";
                human: "human";
            }>;
            actorId: z.ZodString;
        }, z.core.$strict>>;
        approvalRef: z.ZodOptional<z.ZodString>;
        supersedes: z.ZodOptional<z.ZodNumber>;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        recordId: z.ZodString;
        version: z.ZodNumber;
        occurredAt: z.ZodISODateTime;
        digest: z.ZodString;
        visibility: z.ZodLiteral<"private_to_producer">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        recordId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        disposition: z.ZodEnum<{
            duplicate: "duplicate";
            stored: "stored";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-decisions.d.ts.map