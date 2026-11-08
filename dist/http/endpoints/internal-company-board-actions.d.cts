import { z } from 'zod';
/**
 * Owner actions on the company board (1.116.0): wake a department with a comment, give the go,
 * stop and resume the lead. All POST, internal secret only: the caller has already recognised the owner.
 */
export declare const INTERNAL_COMPANY_BOARD_ACTION_PATH: "/internal/company-board/action";
export declare const INTERNAL_PAPERCLIP_OWNER_ACTION_PATH: "/internal/paperclip/owner-action";
/** The kinds are the keys of the unit actions of the board: one list, never redeclared. */
export declare const OwnerActionKindSchema: z.ZodEnum<{
    sveglia: "sveglia";
    via: "via";
    ferma: "ferma";
    riprendi: "riprendi";
}>;
export type OwnerActionKind = z.infer<typeof OwnerActionKindSchema>;
export declare const OWNER_ACTION_TEXT_MAX = 4000;
export declare const OwnerActionRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    projectId: z.ZodString;
    buSlug: z.ZodString;
    kind: z.ZodEnum<{
        sveglia: "sveglia";
        via: "via";
        ferma: "ferma";
        riprendi: "riprendi";
    }>;
    text: z.ZodOptional<z.ZodString>;
    /** Makes the action repeatable: the same request twice gives the same answer. */
    clientRequestId: z.ZodUUID;
}, z.core.$strict>;
export type OwnerActionRequest = z.infer<typeof OwnerActionRequestSchema>;
export declare const OWNER_ACTION_ERRORS: readonly ["identity_uncertain", "not_owner", "not_director", "actions_off", "not_available", "owner_person_missing", "paperclip_refused", "source_unavailable", "too_many"];
export declare const OwnerActionErrorCodeSchema: z.ZodEnum<{
    source_unavailable: "source_unavailable";
    identity_uncertain: "identity_uncertain";
    not_owner: "not_owner";
    not_director: "not_director";
    actions_off: "actions_off";
    not_available: "not_available";
    owner_person_missing: "owner_person_missing";
    paperclip_refused: "paperclip_refused";
    too_many: "too_many";
}>;
export type OwnerActionErrorCode = z.infer<typeof OwnerActionErrorCodeSchema>;
export declare const OwnerActionErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        source_unavailable: "source_unavailable";
        identity_uncertain: "identity_uncertain";
        not_owner: "not_owner";
        not_director: "not_director";
        actions_off: "actions_off";
        not_available: "not_available";
        owner_person_missing: "owner_person_missing";
        paperclip_refused: "paperclip_refused";
        too_many: "too_many";
    }>;
    /** Why, from the bridge (e.g. the reason of `deriveUnitActions`). */
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type OwnerActionError = z.infer<typeof OwnerActionErrorSchema>;
/** History types already in the board: the shape of the board does not change. */
export declare const OWNER_ACTION_HISTORY_KINDS: {
    readonly sveglia: "messaggio";
    readonly via: "approvazione";
    readonly ferma: "passo";
    readonly riprendi: "passo";
};
export declare const OwnerActionResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    kind: z.ZodEnum<{
        sveglia: "sveglia";
        via: "via";
        ferma: "ferma";
        riprendi: "riprendi";
    }>;
    at: z.ZodISODateTime;
    confirmation: z.ZodString;
    historyEntry: z.ZodObject<{
        at: z.ZodISODateTime;
        kind: z.ZodEnum<{
            ricerca: "ricerca";
            approvazione: "approvazione";
            passo: "passo";
            messaggio: "messaggio";
            materiale: "materiale";
            mandato: "mandato";
            richiesta_modifica: "richiesta_modifica";
            tentativo_fallito: "tentativo_fallito";
        }>;
        text: z.ZodString;
        mine: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>;
export type OwnerActionResult = z.infer<typeof OwnerActionResultSchema>;
export declare const OWNER_ACTION_FAILED_TEXT: "Non \u00E8 partito: il reparto non risponde. Riprova.";
/** Confirmation sentences of the board (tavola §3.10); time in Rome. */
export declare function ownerActionConfirmation(kind: OwnerActionKind, at: string | Date, text?: string): string;
export declare const internalCompanyBoardActionContract: {
    readonly method: "POST";
    readonly path: "/internal/company-board/action";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        kind: z.ZodEnum<{
            sveglia: "sveglia";
            via: "via";
            ferma: "ferma";
            riprendi: "riprendi";
        }>;
        text: z.ZodOptional<z.ZodString>;
        /** Makes the action repeatable: the same request twice gives the same answer. */
        clientRequestId: z.ZodUUID;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        ok: z.ZodLiteral<true>;
        kind: z.ZodEnum<{
            sveglia: "sveglia";
            via: "via";
            ferma: "ferma";
            riprendi: "riprendi";
        }>;
        at: z.ZodISODateTime;
        confirmation: z.ZodString;
        historyEntry: z.ZodObject<{
            at: z.ZodISODateTime;
            kind: z.ZodEnum<{
                ricerca: "ricerca";
                approvazione: "approvazione";
                passo: "passo";
                messaggio: "messaggio";
                materiale: "materiale";
                mandato: "mandato";
                richiesta_modifica: "richiesta_modifica";
                tentativo_fallito: "tentativo_fallito";
            }>;
            text: z.ZodString;
            mine: z.ZodBoolean;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            identity_uncertain: "identity_uncertain";
            not_owner: "not_owner";
            not_director: "not_director";
            actions_off: "actions_off";
            not_available: "not_available";
            owner_person_missing: "owner_person_missing";
            paperclip_refused: "paperclip_refused";
            too_many: "too_many";
        }>;
        /** Why, from the bridge (e.g. the reason of `deriveUnitActions`). */
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>]>;
};
export declare const InternalPaperclipOwnerActionRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    projectId: z.ZodString;
    buSlug: z.ZodString;
    kind: z.ZodEnum<{
        sveglia: "sveglia";
        via: "via";
        ferma: "ferma";
        riprendi: "riprendi";
    }>;
    text: z.ZodOptional<z.ZodString>;
    clientRequestId: z.ZodUUID;
}, z.core.$strict>;
export type InternalPaperclipOwnerActionRequest = z.infer<typeof InternalPaperclipOwnerActionRequestSchema>;
export declare const InternalPaperclipOwnerActionOkSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    at: z.ZodISODateTime;
    issueIdentifier: z.ZodNullable<z.ZodString>;
    runQueued: z.ZodNullable<z.ZodBoolean>;
    leadProjectCount: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export declare const internalPaperclipOwnerActionContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/owner-action";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        kind: z.ZodEnum<{
            sveglia: "sveglia";
            via: "via";
            ferma: "ferma";
            riprendi: "riprendi";
        }>;
        text: z.ZodOptional<z.ZodString>;
        clientRequestId: z.ZodUUID;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodUnion<readonly [z.ZodObject<{
        ok: z.ZodLiteral<true>;
        at: z.ZodISODateTime;
        issueIdentifier: z.ZodNullable<z.ZodString>;
        runQueued: z.ZodNullable<z.ZodBoolean>;
        leadProjectCount: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            source_unavailable: "source_unavailable";
            identity_uncertain: "identity_uncertain";
            not_owner: "not_owner";
            not_director: "not_director";
            actions_off: "actions_off";
            not_available: "not_available";
            owner_person_missing: "owner_person_missing";
            paperclip_refused: "paperclip_refused";
            too_many: "too_many";
        }>;
        /** Why, from the bridge (e.g. the reason of `deriveUnitActions`). */
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>]>;
};
//# sourceMappingURL=internal-company-board-actions.d.ts.map