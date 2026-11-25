import { z } from 'zod';
/** Ask the engine to import a Parallel character as a fixed model. */
export declare const VideoParallelImportRequestSchema: z.ZodObject<{
    requestedBy: z.ZodString;
    communityId: z.ZodString;
    characterId: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    modelId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoParallelImportRequest = z.infer<typeof VideoParallelImportRequestSchema>;
/** Missing views are reported, never invented. */
export declare const VideoParallelImportResultSchema: z.ZodObject<{
    modelId: z.ZodString;
    characterId: z.ZodString;
    sourceVersion: z.ZodNullable<z.ZodString>;
    viewsPresent: z.ZodArray<z.ZodEnum<{
        frontale: "frontale";
        tre_quarti: "tre_quarti";
        profilo: "profilo";
        figura_intera: "figura_intera";
    }>>;
    viewsMissing: z.ZodArray<z.ZodEnum<{
        frontale: "frontale";
        tre_quarti: "tre_quarti";
        profilo: "profilo";
        figura_intera: "figura_intera";
    }>>;
    voiceAssigned: z.ZodBoolean;
    importedAt: z.ZodString;
}, z.core.$strict>;
export type VideoParallelImportResult = z.infer<typeof VideoParallelImportResultSchema>;
export declare const VideoParallelImportErrorSchema: z.ZodObject<{
    error: z.ZodEnum<{
        comunita_non_trovata: "comunita_non_trovata";
        personaggio_non_trovato: "personaggio_non_trovato";
        senza_consenso: "senza_consenso";
        ritratto_illeggibile: "ritratto_illeggibile";
        motore_non_disponibile: "motore_non_disponibile";
    }>;
}, z.core.$strict>;
export type VideoParallelImportError = z.infer<typeof VideoParallelImportErrorSchema>;
//# sourceMappingURL=personaggio-parallel-import.d.ts.map