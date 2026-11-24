import { z } from 'zod';
/** Lifetime of a «parlane a voce» link; same as DEV_DELIVERY_LINK_TTL_MS. */
export declare const COLLOQUIO_LINK_TTL_MS: number;
export declare const COLLOQUIO_TOPIC_SUBJECT_MAX = 300;
export declare const COLLOQUIO_TOPIC_EXCERPT_MAX = 500;
export declare const COLLOQUIO_LINK_CODE_PATTERN: RegExp;
export declare const COLLOQUIO_LINK_REFUSALS: readonly ["capability_disabled", "identity_mismatch", "recipient_not_referente", "unavailable"];
export declare const ColloquioLinkRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    recipient: z.ZodEmail;
    email: z.ZodObject<{
        threadKey: z.ZodOptional<z.ZodString>;
        messageId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    projectId: z.ZodOptional<z.ZodString>;
    topic: z.ZodObject<{
        subject: z.ZodString;
        excerpt: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ColloquioLinkRequest = z.infer<typeof ColloquioLinkRequestSchema>;
export declare const ColloquioLinkResponseSchema: z.ZodObject<{
    url: z.ZodURL;
    code: z.ZodString;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ColloquioLinkResponse = z.infer<typeof ColloquioLinkResponseSchema>;
export declare const ColloquioLinkRefusalSchema: z.ZodObject<{
    error: z.ZodEnum<{
        unavailable: "unavailable";
        capability_disabled: "capability_disabled";
        identity_mismatch: "identity_mismatch";
        recipient_not_referente: "recipient_not_referente";
    }>;
}, z.core.$strict>;
export type ColloquioLinkRefusal = z.infer<typeof ColloquioLinkRefusalSchema>;
/**
 * Link «parlane a voce» for the referent of a mail: cap-email asks cap-colloquio.
 * cap-email calls with the bridge INTERNAL_SECRET_HEADER header (never a literal).
 * cap-colloquio compares `scope` with `params.agentId` and with the capability
 * context of the agent (sameCapabilityScope, R-33): the body is a declaration to
 * verify. A disabled or not installed capability answers `capability_disabled`;
 * a recipient that is not the referent of the project/thread answers
 * `recipient_not_referente`. The link is valid for COLLOQUIO_LINK_TTL_MS
 * (30 days, as DEV_DELIVERY_LINK_TTL_MS). For cap-email a refusal, a response that
 * does not parse or a network error mean only «no link»: the mail goes out unchanged.
 */
export declare const colloquioLinkContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/colloquio/links";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        recipient: z.ZodEmail;
        email: z.ZodObject<{
            threadKey: z.ZodOptional<z.ZodString>;
            messageId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        projectId: z.ZodOptional<z.ZodString>;
        topic: z.ZodObject<{
            subject: z.ZodString;
            excerpt: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        url: z.ZodURL;
        code: z.ZodString;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly refusalSchema: z.ZodObject<{
        error: z.ZodEnum<{
            unavailable: "unavailable";
            capability_disabled: "capability_disabled";
            identity_mismatch: "identity_mismatch";
            recipient_not_referente: "recipient_not_referente";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-colloquio-links.d.ts.map