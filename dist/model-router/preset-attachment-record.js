import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability/capability-call-context.js";
import { CompleteModelIdentitySchema } from "./agent-model-configuration-values.js";
import { AgentPresetAttachmentSchema } from "./model-preset.js";
export const PRESET_ATTACHMENT_RECORD_SOURCES = ['nascita', 'riallineamento'];
export const PresetAttachmentRecordSourceSchema = z.enum(PRESET_ATTACHMENT_RECORD_SOURCES);
/**
 * Ciò che Forge salva per un agente senza configurazione Modelli: identità completa e ambito
 * dichiarato, con l'origine del salvataggio. Nessun segreto, nessun modello.
 */
export const AgentPresetAttachmentRecordSchema = z.object({
    schemaVersion: z.literal(1),
    identity: CompleteModelIdentitySchema,
    scope: CapabilityAgentScopeSchema,
    source: PresetAttachmentRecordSourceSchema,
}).strict().superRefine((record, ctx) => {
    if (record.scope.agentId !== record.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['scope', 'agentId'], message: 'Attachment scope must name the declared runtime' });
    }
    for (const key of ['agentId', 'ownerId', 'tenantId']) {
        if (record.scope[key].trim().length === 0) {
            ctx.addIssue({ code: 'custom', path: ['scope', key], message: 'Attachment scope must not be blank' });
        }
    }
});
/** Il record salvato alla nascita: l'ambito viene dall'aggancio e dal proprietario; lancia se non valido. */
export function presetAttachmentRecordFromBirth(attachment, ownerId) {
    const parsed = AgentPresetAttachmentSchema.parse(attachment);
    return AgentPresetAttachmentRecordSchema.parse({
        schemaVersion: 1,
        identity: parsed.identity,
        scope: { agentId: parsed.identity.runtimeAgentId, ownerId, tenantId: parsed.tenantId },
        source: 'nascita',
    });
}
/**
 * Identità e ambito di un agente senza configurazione, ricavati dal record salvato (R-33).
 * Vale solo se il record nomina esattamente la riga dell'agente: nessun confronto approssimato.
 */
export function presetAttachmentAuthorityOf(record, agent) {
    const parsed = AgentPresetAttachmentRecordSchema.safeParse(record);
    if (!parsed.success || agent.ownerId === null)
        return null;
    const { identity, scope } = parsed.data;
    if (identity.vaultAgentId !== agent.id || identity.managementAgentId !== agent.slug || scope.ownerId !== String(agent.ownerId))
        return null;
    return { identity, scope };
}
//# sourceMappingURL=preset-attachment-record.js.map