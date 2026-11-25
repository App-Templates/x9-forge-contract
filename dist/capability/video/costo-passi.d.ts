import { z } from 'zod';
export declare const VideoCostUnitSchema: z.ZodEnum<{
    token: "token";
    char: "char";
    second: "second";
    image: "image";
    clip: "clip";
}>;
export type VideoCostUnit = z.infer<typeof VideoCostUnitSchema>;
export declare const VideoCostBasisSchema: z.ZodEnum<{
    misurato: "misurato";
    stimato: "stimato";
    "non-misurato": "non-misurato";
}>;
export type VideoCostBasis = z.infer<typeof VideoCostBasisSchema>;
export declare const VideoCostEntrySchema: z.ZodObject<{
    step: z.ZodEnum<{
        video: "video";
        ricerca: "ricerca";
        bozza: "bozza";
        capitoli: "capitoli";
        fotogrammi: "fotogrammi";
    }>;
    provider: z.ZodString;
    model: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodEnum<{
        token: "token";
        char: "char";
        second: "second";
        image: "image";
        clip: "clip";
    }>;
    costUsd: z.ZodNumber;
    basis: z.ZodEnum<{
        misurato: "misurato";
        stimato: "stimato";
        "non-misurato": "non-misurato";
    }>;
    at: z.ZodString;
}, z.core.$strict>;
export type VideoCostEntry = z.infer<typeof VideoCostEntrySchema>;
export declare const VideoCostStepSchema: z.ZodObject<{
    step: z.ZodEnum<{
        video: "video";
        ricerca: "ricerca";
        bozza: "bozza";
        capitoli: "capitoli";
        fotogrammi: "fotogrammi";
    }>;
    estimatedUsd: z.ZodNumber;
    confirmedUsd: z.ZodNumber;
    entries: z.ZodArray<z.ZodObject<{
        step: z.ZodEnum<{
            video: "video";
            ricerca: "ricerca";
            bozza: "bozza";
            capitoli: "capitoli";
            fotogrammi: "fotogrammi";
        }>;
        provider: z.ZodString;
        model: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodEnum<{
            token: "token";
            char: "char";
            second: "second";
            image: "image";
            clip: "clip";
        }>;
        costUsd: z.ZodNumber;
        basis: z.ZodEnum<{
            misurato: "misurato";
            stimato: "stimato";
            "non-misurato": "non-misurato";
        }>;
        at: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoCostStep = z.infer<typeof VideoCostStepSchema>;
/** The engine keeps usdPerMinute null until a finished video is available. */
export declare const VideoCostByStepSchema: z.ZodObject<{
    projectId: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        step: z.ZodEnum<{
            video: "video";
            ricerca: "ricerca";
            bozza: "bozza";
            capitoli: "capitoli";
            fotogrammi: "fotogrammi";
        }>;
        estimatedUsd: z.ZodNumber;
        confirmedUsd: z.ZodNumber;
        entries: z.ZodArray<z.ZodObject<{
            step: z.ZodEnum<{
                video: "video";
                ricerca: "ricerca";
                bozza: "bozza";
                capitoli: "capitoli";
                fotogrammi: "fotogrammi";
            }>;
            provider: z.ZodString;
            model: z.ZodString;
            quantity: z.ZodNumber;
            unit: z.ZodEnum<{
                token: "token";
                char: "char";
                second: "second";
                image: "image";
                clip: "clip";
            }>;
            costUsd: z.ZodNumber;
            basis: z.ZodEnum<{
                misurato: "misurato";
                stimato: "stimato";
                "non-misurato": "non-misurato";
            }>;
            at: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    totalUsd: z.ZodNumber;
    finishedSeconds: z.ZodNullable<z.ZodNumber>;
    usdPerMinute: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoCostByStep = z.infer<typeof VideoCostByStepSchema>;
//# sourceMappingURL=costo-passi.d.ts.map