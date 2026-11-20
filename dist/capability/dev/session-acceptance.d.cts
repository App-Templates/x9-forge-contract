import { z } from 'zod';
export declare const DEV_SESSION_ACCEPTANCE_MAX_CRITERIA = 20;
export declare const DEV_SESSION_CRITERION_TEXT_MAX = 500;
export declare const DEV_SESSION_ATTESTORS: readonly ["sessione", "esecutore", "revisore", "referente"];
export declare const DEV_SESSION_CRITERION_ORIGINS: readonly ["mandato", "capo", "ritorno"];
export declare const DEV_SESSION_INPUT_DATA: readonly ["veri", "di_prova", "da_inventare"];
export declare const DEV_SESSION_INPUT_STATES: readonly ["pieno", "vuoto", "errore", "caricamento"];
export declare const DEV_SESSION_INPUT_FORMATS: readonly ["telefono", "computer"];
export declare const DEV_SESSION_INPUT_VISUAL_SOURCES: readonly ["figma", "tavola_approvata", "nessuna"];
export declare const DevSessionAttestorSchema: z.ZodEnum<{
    sessione: "sessione";
    esecutore: "esecutore";
    revisore: "revisore";
    referente: "referente";
}>;
export type DevSessionAttestor = z.infer<typeof DevSessionAttestorSchema>;
export declare const DevSessionCriterionOriginSchema: z.ZodEnum<{
    capo: "capo";
    mandato: "mandato";
    ritorno: "ritorno";
}>;
export type DevSessionCriterionOrigin = z.infer<typeof DevSessionCriterionOriginSchema>;
export declare const DevSessionCriterionSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    attestor: z.ZodEnum<{
        sessione: "sessione";
        esecutore: "esecutore";
        revisore: "revisore";
        referente: "referente";
    }>;
    proof: z.ZodString;
    origin: z.ZodEnum<{
        capo: "capo";
        mandato: "mandato";
        ritorno: "ritorno";
    }>;
    reference: z.ZodOptional<z.ZodString>;
    unit: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type DevSessionCriterion = z.infer<typeof DevSessionCriterionSchema>;
export declare const DevSessionAcceptanceInputSchema: z.ZodObject<{
    userPath: z.ZodOptional<z.ZodArray<z.ZodString>>;
    data: z.ZodOptional<z.ZodEnum<{
        veri: "veri";
        di_prova: "di_prova";
        da_inventare: "da_inventare";
    }>>;
    proofScripts: z.ZodOptional<z.ZodArray<z.ZodString>>;
    screens: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        purpose: z.ZodString;
    }, z.core.$strict>>>;
    behaviors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    states: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        errore: "errore";
        pieno: "pieno";
        vuoto: "vuoto";
        caricamento: "caricamento";
    }>>>;
    formats: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        telefono: "telefono";
        computer: "computer";
    }>>>;
    visualSource: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            figma: "figma";
            tavola_approvata: "tavola_approvata";
            nessuna: "nessuna";
        }>;
        reference: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    retouch: z.ZodOptional<z.ZodObject<{
        target: z.ZodString;
        defect: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionAcceptanceInput = z.infer<typeof DevSessionAcceptanceInputSchema>;
export declare const DevSessionAcceptanceSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    template: z.ZodObject<{
        id: z.ZodString;
        version: z.ZodNumber;
        optionalIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    input: z.ZodObject<{
        userPath: z.ZodOptional<z.ZodArray<z.ZodString>>;
        data: z.ZodOptional<z.ZodEnum<{
            veri: "veri";
            di_prova: "di_prova";
            da_inventare: "da_inventare";
        }>>;
        proofScripts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        screens: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            purpose: z.ZodString;
        }, z.core.$strict>>>;
        behaviors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        states: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            errore: "errore";
            pieno: "pieno";
            vuoto: "vuoto";
            caricamento: "caricamento";
        }>>>;
        formats: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            telefono: "telefono";
            computer: "computer";
        }>>>;
        visualSource: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                figma: "figma";
                tavola_approvata: "tavola_approvata";
                nessuna: "nessuna";
            }>;
            reference: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        retouch: z.ZodOptional<z.ZodObject<{
            target: z.ZodString;
            defect: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    criteria: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        attestor: z.ZodEnum<{
            sessione: "sessione";
            esecutore: "esecutore";
            revisore: "revisore";
            referente: "referente";
        }>;
        proof: z.ZodString;
        origin: z.ZodEnum<{
            capo: "capo";
            mandato: "mandato";
            ritorno: "ritorno";
        }>;
        reference: z.ZodOptional<z.ZodString>;
        unit: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DevSessionAcceptance = z.infer<typeof DevSessionAcceptanceSchema>;
//# sourceMappingURL=session-acceptance.d.ts.map