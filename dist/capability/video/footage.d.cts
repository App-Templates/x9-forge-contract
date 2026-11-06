import { z } from 'zod';
/** Id of one shot of the footage archive on the engine (e.g. `piante-02`). Never a path. */
export declare const VideoFootageIdSchema: z.ZodString;
export type VideoFootageId = z.infer<typeof VideoFootageIdSchema>;
/** One or two shots of the same place (a single shot, or the wide/narrow pair of `ibrido-alternato`). */
export declare const VideoFootageChoiceSchema: z.ZodArray<z.ZodString>;
export type VideoFootageChoice = z.infer<typeof VideoFootageChoiceSchema>;
/** Largest shot the engine takes in one upload. */
export declare const VIDEO_FOOTAGE_MAX_BYTES: number;
/** Containers the engine reads. */
export declare const VIDEO_FOOTAGE_MEDIA_TYPES: readonly ["video/mp4", "video/quicktime", "video/x-m4v"];
/** Riprese al massimo per tenant e persona, comprese quelle già nell'archivio. */
export declare const VIDEO_FOOTAGE_MAX_PER_PERSON = 20;
/** Who is filmed: a slug, never a path. */
export declare const VideoFootagePersonSchema: z.ZodString;
export type VideoFootagePerson = z.infer<typeof VideoFootagePersonSchema>;
/** Where it was filmed; the shot id `<place>-NN` stays a `VideoFootageIdSchema`. */
export declare const VideoFootagePlaceSchema: z.ZodString;
export type VideoFootagePlace = z.infer<typeof VideoFootagePlaceSchema>;
/** Values of `archivio.json`. */
export declare const VideoFootageFramingSchema: z.ZodEnum<{
    largo: "largo";
    medio: "medio";
    stretto: "stretto";
}>;
export type VideoFootageFraming = z.infer<typeof VideoFootageFramingSchema>;
export declare const VideoFootageFileNameSchema: z.ZodString;
export type VideoFootageFileName = z.infer<typeof VideoFootageFileNameSchema>;
/** Query of `POST /api/footage`: the identity and the metadata of the shot; the body is the video itself. */
export declare const VideoFootageAddQuerySchema: z.ZodObject<{
    person: z.ZodString;
    place: z.ZodString;
    outfit: z.ZodString;
    group: z.ZodOptional<z.ZodString>;
    framing: z.ZodEnum<{
        largo: "largo";
        medio: "medio";
        stretto: "stretto";
    }>;
    note: z.ZodOptional<z.ZodString>;
    fileName: z.ZodString;
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoFootageAddQuery = z.infer<typeof VideoFootageAddQuerySchema>;
/** Id of a footage job on the engine. */
export declare const VideoFootageJobIdSchema: z.ZodString;
export type VideoFootageJobId = z.infer<typeof VideoFootageJobIdSchema>;
export declare const VideoFootageJobAcceptedSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strict>;
export type VideoFootageJobAccepted = z.infer<typeof VideoFootageJobAcceptedSchema>;
/** Why the engine refuses a shot (`motivo` of `RipresaRifiutata`, `archivio.py`). */
export declare const VideoFootageRejectionReasonSchema: z.ZodEnum<{
    doppione: "doppione";
    illeggibile: "illeggibile";
    troppo_corta: "troppo_corta";
    risoluzione_bassa: "risoluzione_bassa";
    senza_volto: "senza_volto";
    nessuna_scena: "nessuna_scena";
}>;
export type VideoFootageRejectionReason = z.infer<typeof VideoFootageRejectionReasonSchema>;
/** Synchronous 422 (a duplicate): the reason is `code`; it is also a valid `VideoEngineErrorSchema`. */
export declare const VideoEngineFootageRejectedSchema: z.ZodObject<{
    error: z.ZodString;
    operation_state: z.ZodLiteral<"rejected">;
    code: z.ZodEnum<{
        doppione: "doppione";
        illeggibile: "illeggibile";
        troppo_corta: "troppo_corta";
        risoluzione_bassa: "risoluzione_bassa";
        senza_volto: "senza_volto";
        nessuna_scena: "nessuna_scena";
    }>;
}, z.core.$strict>;
export type VideoEngineFootageRejected = z.infer<typeof VideoEngineFootageRejectedSchema>;
export declare const VideoFootageAddedSchema: z.ZodObject<{
    id: z.ZodString;
    scenes: z.ZodNumber;
    durationSeconds: z.ZodNumber;
}, z.core.$strict>;
export type VideoFootageAdded = z.infer<typeof VideoFootageAddedSchema>;
/** State of one footage job: `queued`/`running` = in progress, `completed` = done, `rejected` = refused with a reason. */
export declare const VideoFootageJobSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"queued">;
    jobId: z.ZodString;
    fileName: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"running">;
    jobId: z.ZodString;
    fileName: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"completed">;
    footage: z.ZodObject<{
        id: z.ZodString;
        scenes: z.ZodNumber;
        durationSeconds: z.ZodNumber;
    }, z.core.$strict>;
    jobId: z.ZodString;
    fileName: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rejected">;
    code: z.ZodEnum<{
        doppione: "doppione";
        illeggibile: "illeggibile";
        troppo_corta: "troppo_corta";
        risoluzione_bassa: "risoluzione_bassa";
        senza_volto: "senza_volto";
        nessuna_scena: "nessuna_scena";
    }>;
    error: z.ZodString;
    jobId: z.ZodString;
    fileName: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"failed">;
    error: z.ZodString;
    jobId: z.ZodString;
    fileName: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"interrupted">;
    error: z.ZodString;
    jobId: z.ZodString;
    fileName: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoFootageJob = z.infer<typeof VideoFootageJobSchema>;
export declare const VideoFootageJobQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoFootageJobQuery = z.infer<typeof VideoFootageJobQuerySchema>;
//# sourceMappingURL=footage.d.ts.map