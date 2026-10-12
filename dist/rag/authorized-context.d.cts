import { z } from 'zod';
export declare const RagAuthorizedPrincipalSchema: z.ZodObject<{
    principal_id: z.ZodString;
    principal_kind: z.ZodEnum<{
        service: "service";
        human: "human";
    }>;
    identity: z.ZodObject<{
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
    }, z.core.$strict>;
    person_id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type RagAuthorizedPrincipal = z.infer<typeof RagAuthorizedPrincipalSchema>;
export declare const RagCorpusAssignmentSchema: z.ZodObject<{
    assignment_id: z.ZodUUID;
    identity: z.ZodObject<{
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
    }, z.core.$strict>;
    corpus_id: z.ZodString;
    corpus_revision: z.ZodString;
    authorization_revision: z.ZodString;
    state: z.ZodEnum<{
        active: "active";
        revoked: "revoked";
    }>;
    observed_at: z.ZodISODateTime;
}, z.core.$strict>;
export type RagCorpusAssignment = z.infer<typeof RagCorpusAssignmentSchema>;
export declare const RagAuthorizedQueryContextSchema: z.ZodObject<{
    principal: z.ZodObject<{
        principal_id: z.ZodString;
        principal_kind: z.ZodEnum<{
            service: "service";
            human: "human";
        }>;
        identity: z.ZodObject<{
            tenant_id: z.ZodString;
            owner_id: z.ZodString;
            agent_id: z.ZodString;
        }, z.core.$strict>;
        person_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    assignment: z.ZodObject<{
        assignment_id: z.ZodUUID;
        identity: z.ZodObject<{
            tenant_id: z.ZodString;
            owner_id: z.ZodString;
            agent_id: z.ZodString;
        }, z.core.$strict>;
        corpus_id: z.ZodString;
        corpus_revision: z.ZodString;
        authorization_revision: z.ZodString;
        state: z.ZodEnum<{
            active: "active";
            revoked: "revoked";
        }>;
        observed_at: z.ZodISODateTime;
    }, z.core.$strict>;
    observed_at: z.ZodISODateTime;
    expires_at: z.ZodISODateTime;
}, z.core.$strict>;
export type RagAuthorizedQueryContext = z.infer<typeof RagAuthorizedQueryContextSchema>;
export declare function isRagAuthorizedContextCurrent(raw: unknown, currentAssignment: unknown, expectedIdentity: unknown, now: Date): boolean;
//# sourceMappingURL=authorized-context.d.ts.map