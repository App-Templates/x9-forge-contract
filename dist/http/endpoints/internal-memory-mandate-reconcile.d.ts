import { z } from 'zod';
/** Minimal reconciliation of a mandate's sources in memory A (F3X-03), called before a brief opens (F3P-01). */
export declare const INTERNAL_MEMORY_MANDATE_RECONCILE_PATH: "/internal/memory/company-map/reconcile";
/** Sources of a mandate: the approved decision, the referent of the map and the notebook pages, each with its version. */
export declare const MandateReconcileRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    buSlug: z.ZodOptional<z.ZodString>;
    decision: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>>;
    referent: z.ZodOptional<z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
    }, z.core.$strict>>;
    notebookPages: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
        contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            target: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            target: z.ZodLiteral<"map_entry">;
            kind: z.ZodEnum<{
                access: "access";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
                asset: "asset";
            }>;
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>], "target">]>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type MandateReconcileRequest = z.infer<typeof MandateReconcileRequestSchema>;
export declare const MandateReconcileResponseSchema: z.ZodObject<{
    reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"agrees">;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"conflict">;
        conflicts: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                decision: "decision";
                referent: "referent";
                plan_section: "plan_section";
                notebook_page: "notebook_page";
            }>;
            ref: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"missing">;
        missing: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                decision: "decision";
                referent: "referent";
                plan_section: "plan_section";
                notebook_page: "notebook_page";
            }>;
            ref: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>], "outcome">;
    checkedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type MandateReconcileResponse = z.infer<typeof MandateReconcileResponseSchema>;
export declare const internalMemoryMandateReconcileContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/company-map/reconcile";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodOptional<z.ZodString>;
        decision: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>>;
        referent: z.ZodOptional<z.ZodObject<{
            personRef: z.ZodString;
            entryVersion: z.ZodNumber;
        }, z.core.$strict>>;
        notebookPages: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            version: z.ZodNumber;
            contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                target: z.ZodLiteral<"decision">;
                requestId: z.ZodString;
                planVersion: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                target: z.ZodLiteral<"map_entry">;
                kind: z.ZodEnum<{
                    access: "access";
                    referent: "referent";
                    person: "person";
                    responsibility: "responsibility";
                    asset: "asset";
                }>;
                key: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>], "target">]>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"agrees">;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"conflict">;
            conflicts: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    decision: "decision";
                    referent: "referent";
                    plan_section: "plan_section";
                    notebook_page: "notebook_page";
                }>;
                ref: z.ZodString;
                reason: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"missing">;
            missing: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    decision: "decision";
                    referent: "referent";
                    plan_section: "plan_section";
                    notebook_page: "notebook_page";
                }>;
                ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>], "outcome">;
        checkedAt: z.ZodISODateTime;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-mandate-reconcile.d.ts.map