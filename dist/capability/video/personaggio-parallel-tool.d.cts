import { z } from 'zod';
export declare const VIDEO_CHARACTER_LIST_TOOL = "video_character_list";
export declare const VIDEO_CHARACTER_IMPORT_TOOL = "video_character_import";
export declare const VIDEO_CHARACTER_OUTFIT_STYLE_TOOL = "video_character_outfit_style";
/** Identity (tenant, owner, agent, requestedBy) comes only from the admitted tool envelope (R-33). */
export declare const VideoCharacterListToolInputSchema: z.ZodObject<{
    communityId: z.ZodString;
}, z.core.$strict>;
export type VideoCharacterListToolInput = z.infer<typeof VideoCharacterListToolInputSchema>;
export declare const VideoCharacterImportToolInputSchema: z.ZodObject<{
    communityId: z.ZodString;
    characterId: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoCharacterImportToolInput = z.infer<typeof VideoCharacterImportToolInputSchema>;
export declare const VideoCharacterOutfitStyleToolInputSchema: z.ZodObject<{
    modelId: z.ZodString;
    request: z.ZodString;
}, z.core.$strict>;
export type VideoCharacterOutfitStyleToolInput = z.infer<typeof VideoCharacterOutfitStyleToolInputSchema>;
/** Listing item: never the backstory and never portrait addresses. */
export declare const VideoCharacterListItemSchema: z.ZodObject<{
    characterId: z.ZodString;
    name: z.ZodString;
    version: z.ZodNullable<z.ZodString>;
    consent: z.ZodEnum<{
        assente: "assente";
        valido: "valido";
        revocato: "revocato";
    }>;
    viewsDeclared: z.ZodArray<z.ZodEnum<{
        frontale: "frontale";
        tre_quarti: "tre_quarti";
        profilo: "profilo";
        figura_intera: "figura_intera";
    }>>;
    portraitCount: z.ZodNumber;
    voiceAssigned: z.ZodBoolean;
    missing: z.ZodArray<z.ZodEnum<{
        version: "version";
        voice: "voice";
        wardrobeRules: "wardrobeRules";
        portraitViews: "portraitViews";
        portraitDigest: "portraitDigest";
        styleLabels: "styleLabels";
        consent: "consent";
    }>>;
    alreadyImportedAs: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoCharacterListItem = z.infer<typeof VideoCharacterListItemSchema>;
export declare const VIDEO_CHARACTER_LIST_REASONS: readonly ["parallel_non_collegato", "comunita_non_trovata", "comunita_non_pronta", "non_autorizzato", "nessun_gruppo_per_te", "parallel_non_disponibile", "motore_non_disponibile"];
export declare const VIDEO_CHARACTER_IMPORT_REASONS: readonly ["comunita_non_trovata", "personaggio_non_trovato", "senza_consenso", "ritratto_illeggibile", "nome_esistente", "personaggio_gia_importato", "aspetto_incompleto", "fonte_non_disponibile", "motore_non_disponibile"];
export declare const VIDEO_CHARACTER_OUTFIT_STYLE_REASONS: readonly ["non_da_parallel", "richiesta_non_valida", "modello_sconosciuto", "motore_non_disponibile"];
export declare const VideoCharacterListToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"elenco">;
    communityId: z.ZodString;
    characters: z.ZodArray<z.ZodObject<{
        characterId: z.ZodString;
        name: z.ZodString;
        version: z.ZodNullable<z.ZodString>;
        consent: z.ZodEnum<{
            assente: "assente";
            valido: "valido";
            revocato: "revocato";
        }>;
        viewsDeclared: z.ZodArray<z.ZodEnum<{
            frontale: "frontale";
            tre_quarti: "tre_quarti";
            profilo: "profilo";
            figura_intera: "figura_intera";
        }>>;
        portraitCount: z.ZodNumber;
        voiceAssigned: z.ZodBoolean;
        missing: z.ZodArray<z.ZodEnum<{
            version: "version";
            voice: "voice";
            wardrobeRules: "wardrobeRules";
            portraitViews: "portraitViews";
            portraitDigest: "portraitDigest";
            styleLabels: "styleLabels";
            consent: "consent";
        }>>;
        alreadyImportedAs: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        comunita_non_trovata: "comunita_non_trovata";
        comunita_non_pronta: "comunita_non_pronta";
        non_autorizzato: "non_autorizzato";
        parallel_non_collegato: "parallel_non_collegato";
        nessun_gruppo_per_te: "nessun_gruppo_per_te";
        parallel_non_disponibile: "parallel_non_disponibile";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoCharacterListToolResponse = z.infer<typeof VideoCharacterListToolResponseSchema>;
export declare const VideoCharacterImportToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"importato">;
    result: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        comunita_non_trovata: "comunita_non_trovata";
        personaggio_non_trovato: "personaggio_non_trovato";
        senza_consenso: "senza_consenso";
        ritratto_illeggibile: "ritratto_illeggibile";
        nome_esistente: "nome_esistente";
        personaggio_gia_importato: "personaggio_gia_importato";
        aspetto_incompleto: "aspetto_incompleto";
        fonte_non_disponibile: "fonte_non_disponibile";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoCharacterImportToolResponse = z.infer<typeof VideoCharacterImportToolResponseSchema>;
export declare const VideoCharacterOutfitStyleToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    description: z.ZodString;
    constraints: z.ZodArray<z.ZodString>;
    rules: z.ZodEnum<{
        complete: "complete";
        senza_regole: "senza_regole";
        senza_stile: "senza_stile";
    }>;
    status: z.ZodLiteral<"composta">;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        richiesta_non_valida: "richiesta_non_valida";
        non_da_parallel: "non_da_parallel";
        modello_sconosciuto: "modello_sconosciuto";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoCharacterOutfitStyleToolResponse = z.infer<typeof VideoCharacterOutfitStyleToolResponseSchema>;
//# sourceMappingURL=personaggio-parallel-tool.d.ts.map