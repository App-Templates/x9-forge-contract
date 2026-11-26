import { z } from 'zod';
export declare const VIDEO_MODEL_PRODUCTION_MIN_SECONDS = 18;
export declare const VIDEO_MODEL_PRODUCTION_MAX_SECONDS = 60;
/** The look is the binary body; identity and production metadata are text query values. */
export declare const VideoModelProductionQuerySchema: z.ZodObject<{
    videoProjectId: z.ZodString;
    modelId: z.ZodString;
    modelVersion: z.ZodString;
    purpose: z.ZodString;
    name: z.ZodString;
    durationSeconds: z.ZodString;
    budgetUsd: z.ZodString;
    fileName: z.ZodString;
    lookNote: z.ZodOptional<z.ZodString>;
    environmentId: z.ZodOptional<z.ZodString>;
    environmentVersion: z.ZodOptional<z.ZodString>;
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoModelProductionQuery = z.infer<typeof VideoModelProductionQuerySchema>;
export declare const VideoModelProductionCreatedSchema: z.ZodObject<{
    engineProjectId: z.ZodString;
    lookSha256: z.ZodString;
    modelDigest: z.ZodString;
}, z.core.$strict>;
export type VideoModelProductionCreated = z.infer<typeof VideoModelProductionCreatedSchema>;
export declare const VideoModelSimilarityOutcomeSchema: z.ZodEnum<{
    ok: "ok";
    da_rivedere: "da_rivedere";
    respinto: "respinto";
}>;
export type VideoModelSimilarityOutcome = z.infer<typeof VideoModelSimilarityOutcomeSchema>;
export declare const VideoModelSimilarityReasonSchema: z.ZodEnum<{
    confermata: "confermata";
    sotto_soglia: "sotto_soglia";
    volto_non_rilevato: "volto_non_rilevato";
    modello_non_disponibile: "modello_non_disponibile";
    riferimenti_insufficienti: "riferimenti_insufficienti";
}>;
export type VideoModelSimilarityReason = z.infer<typeof VideoModelSimilarityReasonSchema>;
export declare const VideoModelSimilaritySchema: z.ZodObject<{
    outcome: z.ZodEnum<{
        ok: "ok";
        da_rivedere: "da_rivedere";
        respinto: "respinto";
    }>;
    reason: z.ZodEnum<{
        confermata: "confermata";
        sotto_soglia: "sotto_soglia";
        volto_non_rilevato: "volto_non_rilevato";
        modello_non_disponibile: "modello_non_disponibile";
        riferimenti_insufficienti: "riferimenti_insufficienti";
    }>;
    score: z.ZodNullable<z.ZodNumber>;
    threshold: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoModelSimilarity = z.infer<typeof VideoModelSimilaritySchema>;
export declare const VideoModelFrameStatusSchema: z.ZodEnum<{
    in_corso: "in_corso";
    fallito: "fallito";
    assente: "assente";
    pronto: "pronto";
}>;
export type VideoModelFrameStatus = z.infer<typeof VideoModelFrameStatusSchema>;
export declare const VideoModelFrameStateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        in_corso: "in_corso";
        fallito: "fallito";
        assente: "assente";
        pronto: "pronto";
    }>;
    frameUrl: z.ZodNullable<z.ZodString>;
    frameSha256: z.ZodNullable<z.ZodString>;
    similarity: z.ZodNullable<z.ZodObject<{
        outcome: z.ZodEnum<{
            ok: "ok";
            da_rivedere: "da_rivedere";
            respinto: "respinto";
        }>;
        reason: z.ZodEnum<{
            confermata: "confermata";
            sotto_soglia: "sotto_soglia";
            volto_non_rilevato: "volto_non_rilevato";
            modello_non_disponibile: "modello_non_disponibile";
            riferimenti_insufficienti: "riferimenti_insufficienti";
        }>;
        score: z.ZodNullable<z.ZodNumber>;
        threshold: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    approvedAt: z.ZodNullable<z.ZodString>;
    approvedBy: z.ZodNullable<z.ZodLiteral<"persona">>;
    reviewConfirmed: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoModelFrameState = z.infer<typeof VideoModelFrameStateSchema>;
export declare const VideoModelProductionStateSchema: z.ZodObject<{
    modelId: z.ZodString;
    modelVersion: z.ZodNumber;
    modelDigest: z.ZodString;
    lookSha256: z.ZodString;
    purpose: z.ZodString;
    regiaApplied: z.ZodBoolean;
    frame: z.ZodObject<{
        status: z.ZodEnum<{
            in_corso: "in_corso";
            fallito: "fallito";
            assente: "assente";
            pronto: "pronto";
        }>;
        frameUrl: z.ZodNullable<z.ZodString>;
        frameSha256: z.ZodNullable<z.ZodString>;
        similarity: z.ZodNullable<z.ZodObject<{
            outcome: z.ZodEnum<{
                ok: "ok";
                da_rivedere: "da_rivedere";
                respinto: "respinto";
            }>;
            reason: z.ZodEnum<{
                confermata: "confermata";
                sotto_soglia: "sotto_soglia";
                volto_non_rilevato: "volto_non_rilevato";
                modello_non_disponibile: "modello_non_disponibile";
                riferimenti_insufficienti: "riferimenti_insufficienti";
            }>;
            score: z.ZodNullable<z.ZodNumber>;
            threshold: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        approvedAt: z.ZodNullable<z.ZodString>;
        approvedBy: z.ZodNullable<z.ZodLiteral<"persona">>;
        reviewConfirmed: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoModelProductionState = z.infer<typeof VideoModelProductionStateSchema>;
export declare const VideoModelFrameRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
}, z.core.$strict>;
export type VideoModelFrameRequest = z.infer<typeof VideoModelFrameRequestSchema>;
/** Approval binds the person's explicit review to the exact frame shown. */
export declare const VideoModelFrameApproveRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
    frameSha256: z.ZodString;
    confirmReview: z.ZodBoolean;
}, z.core.$strict>;
export type VideoModelFrameApproveRequest = z.infer<typeof VideoModelFrameApproveRequestSchema>;
//# sourceMappingURL=produzione-modella.d.ts.map