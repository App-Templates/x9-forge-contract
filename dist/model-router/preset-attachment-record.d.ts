import { z } from 'zod';
import { type AgentPresetAttachment } from "./model-preset.js";
export declare const PRESET_ATTACHMENT_RECORD_SOURCES: readonly ["nascita", "riallineamento"];
export declare const PresetAttachmentRecordSourceSchema: z.ZodEnum<{
    nascita: "nascita";
    riallineamento: "riallineamento";
}>;
export type PresetAttachmentRecordSource = z.infer<typeof PresetAttachmentRecordSourceSchema>;
/**
 * Ciò che Forge salva per un agente senza configurazione Modelli: identità completa e ambito
 * dichiarato, con l'origine del salvataggio. Nessun segreto, nessun modello.
 */
export declare const AgentPresetAttachmentRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    source: z.ZodEnum<{
        nascita: "nascita";
        riallineamento: "riallineamento";
    }>;
}, z.core.$strict>;
export type AgentPresetAttachmentRecord = z.infer<typeof AgentPresetAttachmentRecordSchema>;
/** Il record salvato alla nascita: l'ambito viene dall'aggancio e dal proprietario; lancia se non valido. */
export declare function presetAttachmentRecordFromBirth(attachment: AgentPresetAttachment, ownerId: string): AgentPresetAttachmentRecord;
/**
 * Identità e ambito di un agente senza configurazione, ricavati dal record salvato (R-33).
 * Vale solo se il record nomina esattamente la riga dell'agente: nessun confronto approssimato.
 */
export declare function presetAttachmentAuthorityOf(record: unknown, agent: {
    id: number;
    slug: string;
    ownerId: number | null;
}): Pick<AgentPresetAttachmentRecord, 'identity' | 'scope'> | null;
//# sourceMappingURL=preset-attachment-record.d.ts.map