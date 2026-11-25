import { z } from 'zod';
/** cap-video -> Parallel canon-orchestrator: export characters. Internal, INTERNAL_SECRET_HEADER. */
export declare const parallelCharacterExportContract: {
    readonly method: "GET";
    readonly path: "/companion/export-characters";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        communityId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        communityId: z.ZodString;
        groups: z.ZodArray<z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            characters: z.ZodArray<z.ZodObject<{
                characterId: z.ZodString;
                name: z.ZodString;
                backstory: z.ZodString;
                style: z.ZodObject<{
                    toneGuidelines: z.ZodString;
                    styleTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    wardrobeRules: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
                portraits: z.ZodArray<z.ZodObject<{
                    imageId: z.ZodString;
                    assetUrl: z.ZodURL;
                    contentType: z.ZodEnum<{
                        "image/png": "image/png";
                        "image/jpeg": "image/jpeg";
                    }>;
                    sizeBytes: z.ZodNumber;
                    view: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                        frontale: "frontale";
                        tre_quarti: "tre_quarti";
                        profilo: "profilo";
                        figura_intera: "figura_intera";
                    }>>>;
                    sha256: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                personType: z.ZodOptional<z.ZodObject<{
                    role: z.ZodNullable<z.ZodString>;
                    archetype: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                        engineer: "engineer";
                        fixer: "fixer";
                        challenger: "challenger";
                        diplomat: "diplomat";
                        networker: "networker";
                    }>>>;
                    ladder: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                        R0: "R0";
                        R1: "R1";
                        R2: "R2";
                        R3: "R3";
                        R4: "R4";
                        R5: "R5";
                    }>>>;
                    hobbies: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    motivations: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    flaws: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    languages: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>>;
                appearance: z.ZodOptional<z.ZodObject<{
                    hairColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    hairStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    eyeColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    build: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    facialHair: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    distinguishingFeatures: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    skinTone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    heritage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    offDutyStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strict>>;
                voice: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    provider: z.ZodEnum<{
                        elevenlabs: "elevenlabs";
                        segnaposto: "segnaposto";
                    }>;
                    voiceId: z.ZodString;
                    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strict>>>;
                consent: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    scope: z.ZodLiteral<"officina-video">;
                    grantedBy: z.ZodString;
                    grantedAt: z.ZodString;
                    revokedAt: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>>>;
                version: z.ZodOptional<z.ZodString>;
                missing: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    version: "version";
                    voice: "voice";
                    wardrobeRules: "wardrobeRules";
                    portraitViews: "portraitViews";
                    portraitDigest: "portraitDigest";
                    styleLabels: "styleLabels";
                    consent: "consent";
                }>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly errorSchema: z.ZodObject<{
        error: z.ZodEnum<{
            comunita_non_trovata: "comunita_non_trovata";
            comunita_non_pronta: "comunita_non_pronta";
            non_autorizzato: "non_autorizzato";
        }>;
    }, z.core.$strict>;
    readonly responseStatus: 200;
};
/** cap-video -> engine: import a Parallel character. Identity in the query. Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoParallelImportContract: {
    readonly method: "POST";
    readonly path: "/api/modelle/da-parallel";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        requestedBy: z.ZodString;
        communityId: z.ZodString;
        characterId: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        modelId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly responseStatus: 201;
};
//# sourceMappingURL=parallel-personaggi.d.ts.map