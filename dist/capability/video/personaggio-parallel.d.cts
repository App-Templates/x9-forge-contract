import { z } from 'zod';
export declare const VIDEO_PARALLEL_MAX_PORTRAITS = 8;
export declare const VIDEO_PARALLEL_MAX_BACKSTORY = 4000;
export declare const VideoParallelCharacterIdSchema: z.ZodString;
export type VideoParallelCharacterId = z.infer<typeof VideoParallelCharacterIdSchema>;
export declare const VideoParallelCommunityIdSchema: z.ZodString;
export type VideoParallelCommunityId = z.infer<typeof VideoParallelCommunityIdSchema>;
export declare const VideoParallelViewSchema: z.ZodEnum<{
    frontale: "frontale";
    tre_quarti: "tre_quarti";
    profilo: "profilo";
    figura_intera: "figura_intera";
}>;
export type VideoParallelView = z.infer<typeof VideoParallelViewSchema>;
export declare const VideoParallelPortraitSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type VideoParallelPortrait = z.infer<typeof VideoParallelPortraitSchema>;
export declare const VideoParallelPersonTypeSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type VideoParallelPersonType = z.infer<typeof VideoParallelPersonTypeSchema>;
export declare const VideoParallelAppearanceSchema: z.ZodObject<{
    hairColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hairStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    eyeColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    build: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    facialHair: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    distinguishingFeatures: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    skinTone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    heritage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    offDutyStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type VideoParallelAppearance = z.infer<typeof VideoParallelAppearanceSchema>;
export declare const VideoParallelStyleSchema: z.ZodObject<{
    toneGuidelines: z.ZodString;
    styleTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    wardrobeRules: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type VideoParallelStyle = z.infer<typeof VideoParallelStyleSchema>;
export declare const VideoParallelVoiceSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        elevenlabs: "elevenlabs";
        segnaposto: "segnaposto";
    }>;
    voiceId: z.ZodString;
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type VideoParallelVoice = z.infer<typeof VideoParallelVoiceSchema>;
export declare const VideoParallelConsentSchema: z.ZodObject<{
    scope: z.ZodLiteral<"officina-video">;
    grantedBy: z.ZodString;
    grantedAt: z.ZodString;
    revokedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoParallelConsent = z.infer<typeof VideoParallelConsentSchema>;
export declare const VideoParallelMissingSchema: z.ZodEnum<{
    version: "version";
    voice: "voice";
    wardrobeRules: "wardrobeRules";
    portraitViews: "portraitViews";
    portraitDigest: "portraitDigest";
    styleLabels: "styleLabels";
    consent: "consent";
}>;
export type VideoParallelMissing = z.infer<typeof VideoParallelMissingSchema>;
/** Only fields available for every current character are required. */
export declare const VideoParallelCharacterSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type VideoParallelCharacter = z.infer<typeof VideoParallelCharacterSchema>;
export declare const VideoParallelExportQuerySchema: z.ZodObject<{
    communityId: z.ZodString;
}, z.core.$strict>;
export type VideoParallelExportQuery = z.infer<typeof VideoParallelExportQuerySchema>;
export declare const VideoParallelExportSchema: z.ZodObject<{
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
export type VideoParallelExport = z.infer<typeof VideoParallelExportSchema>;
export declare const VideoParallelExportErrorSchema: z.ZodObject<{
    error: z.ZodEnum<{
        comunita_non_trovata: "comunita_non_trovata";
        comunita_non_pronta: "comunita_non_pronta";
        non_autorizzato: "non_autorizzato";
    }>;
}, z.core.$strict>;
export type VideoParallelExportError = z.infer<typeof VideoParallelExportErrorSchema>;
//# sourceMappingURL=personaggio-parallel.d.ts.map