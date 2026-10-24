import { z } from 'zod';
export declare const MANDATE_RECONCILIATION_OUTCOMES: readonly ["agrees", "conflict", "missing"];
export declare const MandateReconciliationOutcomeSchema: z.ZodEnum<{
    conflict: "conflict";
    missing: "missing";
    agrees: "agrees";
}>;
export type MandateReconciliationOutcome = z.infer<typeof MandateReconciliationOutcomeSchema>;
export declare const MANDATE_SOURCES: readonly ["plan_section", "decision", "referent", "notebook_page"];
export declare const MandateSourceSchema: z.ZodEnum<{
    decision: "decision";
    referent: "referent";
    plan_section: "plan_section";
    notebook_page: "notebook_page";
}>;
export type MandateSource = z.infer<typeof MandateSourceSchema>;
/** Result of comparing the approved plan, decision, referent and notebook pages. */
export declare const MandateReconciliationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type MandateReconciliation = z.infer<typeof MandateReconciliationSchema>;
/** Versioned sources and their reconciliation, embedded in a business unit brief. */
export declare const ReconciledMandateSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    planSection: z.ZodObject<{
        planId: z.ZodString;
        planVersion: z.ZodNumber;
        planDigest: z.ZodString;
        businessUnit: z.ZodObject<{
            buSlug: z.ZodString;
            typeId: z.ZodEnum<{
                dati: "dati";
                design: "design";
                sviluppo: "sviluppo";
                finanza: "finanza";
                marketing: "marketing";
            }>;
            mandate: z.ZodString;
            competencies: z.ZodArray<z.ZodString>;
            lead: z.ZodObject<{
                role: z.ZodLiteral<"capo-bu">;
            }, z.core.$strict>;
            reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                buSlug: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                role: z.ZodLiteral<"director">;
            }, z.core.$strict>]>>;
            executor: z.ZodEnum<{
                agent: "agent";
                night: "night";
                dev_session: "dev_session";
            }>;
            referent: z.ZodObject<{
                personRef: z.ZodString;
                entryVersion: z.ZodNumber;
            }, z.core.$strict>;
            firstActivities: z.ZodArray<z.ZodString>;
            roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                role: z.ZodString;
                competencies: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>>;
            start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"now">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"planned">;
                unlockedBy: z.ZodObject<{
                    milestone: z.ZodNumber;
                    delivery: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>;
    }, z.core.$strict>;
    decision: z.ZodObject<{
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>;
    referent: z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
    }, z.core.$strict>;
    notebookPages: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>;
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
    reconciledAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ReconciledMandate = z.infer<typeof ReconciledMandateSchema>;
//# sourceMappingURL=business-unit-mandate.d.ts.map