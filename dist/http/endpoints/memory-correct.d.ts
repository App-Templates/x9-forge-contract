/**
 * POST /internal/memory/correct — corrective action endpoint contract.
 * Direction: Forge factory-svc -> X9/memory-svc
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER)
 * Phase 18 D3 — Option A bridge extension.
 *
 * Security: `authType: 'secret' as const` narrows the literal type so a
 * consumer destructuring `{authType}` and pairing with the wrong header
 * (e.g. INTERNAL_TOKEN_HEADER) mismatches the literal at compile time
 * (T-18-00-03 mitigation). Const-narrowing only — no structural `satisfies`
 * check, matching repo precedent in voice-register.ts and vault-resolve.ts.
 */
import { z } from 'zod';
export declare const memoryCorrectContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/correct";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
        user_id: z.ZodOptional<z.ZodString>;
        actor_type: z.ZodEnum<{
            system: "system";
            forge_user: "forge_user";
            forge_superadmin: "forge_superadmin";
        }>;
        actor_id: z.ZodString;
        action: z.ZodEnum<{
            invalidate: "invalidate";
            forget: "forget";
            redact: "redact";
            pin: "pin";
            promote: "promote";
            demote: "demote";
            merge_entity: "merge_entity";
            split_entity: "split_entity";
            mark_sensitive: "mark_sensitive";
            change_retention: "change_retention";
        }>;
        target_type: z.ZodEnum<{
            episode: "episode";
            fact: "fact";
            rule: "rule";
            entity: "entity";
            alias: "alias";
        }>;
        target_id: z.ZodString;
        destination_entity_id: z.ZodOptional<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        feedback_id: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=memory-correct.d.ts.map