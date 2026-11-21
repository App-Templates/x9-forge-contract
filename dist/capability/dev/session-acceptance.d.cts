import { z } from 'zod';
export declare const DEV_SESSION_ACCEPTANCE_MAX_CRITERIA = 20;
export declare const DEV_SESSION_CRITERION_TEXT_MAX = 500;
export declare const DEV_SESSION_ATTESTORS: readonly ["sessione", "esecutore", "revisore", "referente"];
export declare const DEV_SESSION_CRITERION_ORIGINS: readonly ["mandato", "capo", "ritorno"];
export declare const DEV_SESSION_INPUT_DATA: readonly ["veri", "di_prova", "da_inventare"];
export declare const DEV_SESSION_INPUT_STATES: readonly ["pieno", "vuoto", "errore", "caricamento"];
export declare const DEV_SESSION_INPUT_FORMATS: readonly ["telefono", "computer"];
export declare const DEV_SESSION_INPUT_VISUAL_SOURCES: readonly ["figma", "tavola_approvata", "nessuna"];
export declare const DEV_SESSION_ACCEPTANCE_SCHEMA_ISSUES: readonly ["reference_iff_return", "executor_only_from_catalog", "mandate_not_session", "unit_only_mandate", "proof_script_name", "screens_not_unique", "behaviors_not_unique", "list_not_unique", "visual_reference_rule", "criterion_ids_not_unique"];
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
export declare const DEV_SESSION_LOOK_KINDS: readonly ["prototipo", "immagine", "documento"];
export declare const DevSessionLookKindSchema: z.ZodEnum<{
    prototipo: "prototipo";
    immagine: "immagine";
    documento: "documento";
}>;
export type DevSessionLookKind = z.infer<typeof DevSessionLookKindSchema>;
export declare const DevSessionLookSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        prototipo: "prototipo";
        immagine: "immagine";
        documento: "documento";
    }>;
    tryPath: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type DevSessionLook = z.infer<typeof DevSessionLookSchema>;
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
        pieno: "pieno";
        vuoto: "vuoto";
        errore: "errore";
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
    look: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            prototipo: "prototipo";
            immagine: "immagine";
            documento: "documento";
        }>;
        tryPath: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
            pieno: "pieno";
            vuoto: "vuoto";
            errore: "errore";
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
        look: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                prototipo: "prototipo";
                immagine: "immagine";
                documento: "documento";
            }>;
            tryPath: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
export declare const DEV_SESSION_LOOK_LABELS: {
    readonly prototipo: "Apri il prototipo da provare";
    readonly immagine: "Guarda l'immagine dello schermo";
    readonly documento: "Apri il documento";
};
export declare function devSessionLookKindOfBytes(bytes: Uint8Array): DevSessionLookKind | null;
export declare function devSessionLookKindOfMediaType(mediaType: string): DevSessionLookKind | null;
export declare const DEV_SESSION_LOOK_PROTOTYPE_TEMPLATES: readonly ["sviluppo-pezzo-app", "design-sito", "design-schermata-app"];
export declare const DEV_SESSION_LOOK_OPENING_PROBLEMS: readonly ["look_missing", "look_not_prototype", "look_path_missing"];
export type DevSessionLookOpeningProblemCode = (typeof DEV_SESSION_LOOK_OPENING_PROBLEMS)[number];
export declare function devSessionLookOpeningProblem(acceptance: DevSessionAcceptance): {
    code: DevSessionLookOpeningProblemCode;
} | null;
export declare const DEV_SESSION_LOOK_DELIVERY_PROBLEMS: readonly ["look_file_empty", "look_kind_unknown", "look_kind_mismatch"];
export type DevSessionLookDeliveryProblemCode = (typeof DEV_SESSION_LOOK_DELIVERY_PROBLEMS)[number];
export declare function devSessionLookDeliveryProblem(look: DevSessionLook, bytes: Uint8Array): {
    code: DevSessionLookDeliveryProblemCode;
    actual?: DevSessionLookKind;
} | null;
//# sourceMappingURL=session-acceptance.d.ts.map