import { z } from 'zod';
export declare const PAPERCLIP_PROTOCOLLO_RUOLI: readonly ["capo", "lab", "ricerca"];
export declare const PaperclipProtocolloRuoloSchema: z.ZodEnum<{
    ricerca: "ricerca";
    lab: "lab";
    capo: "capo";
}>;
export declare const PaperclipProtocolloAgenteSchema: z.ZodObject<{
    paperclipAgentId: z.ZodGUID;
    ruolo: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        capo: "capo";
    }>;
    x9AgentId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    puoAffidareA: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        capo: "capo";
    }>>>;
}, z.core.$strict>;
export declare const PaperclipProtocolloAgentiSchema: z.ZodObject<{
    versione: z.ZodLiteral<1>;
    agenti: z.ZodArray<z.ZodObject<{
        paperclipAgentId: z.ZodGUID;
        ruolo: z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
            capo: "capo";
        }>;
        x9AgentId: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        puoAffidareA: z.ZodDefault<z.ZodArray<z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
            capo: "capo";
        }>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type PaperclipProtocolloRuolo = z.infer<typeof PaperclipProtocolloRuoloSchema>;
export type PaperclipProtocolloAgente = z.infer<typeof PaperclipProtocolloAgenteSchema>;
export type PaperclipProtocolloAgenti = z.infer<typeof PaperclipProtocolloAgentiSchema>;
//# sourceMappingURL=agenti.d.ts.map