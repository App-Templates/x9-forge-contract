"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPresetAttachmentRecordSchema = exports.PresetAttachmentRecordSourceSchema = exports.PRESET_ATTACHMENT_RECORD_SOURCES = void 0;
exports.presetAttachmentRecordFromBirth = presetAttachmentRecordFromBirth;
exports.presetAttachmentAuthorityOf = presetAttachmentAuthorityOf;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_model_configuration_values_js_1 = require("./agent-model-configuration-values.cjs");
const model_preset_js_1 = require("./model-preset.cjs");
exports.PRESET_ATTACHMENT_RECORD_SOURCES = ['nascita', 'riallineamento'];
exports.PresetAttachmentRecordSourceSchema = zod_1.z.enum(exports.PRESET_ATTACHMENT_RECORD_SOURCES);
/**
 * Ciò che Forge salva per un agente senza configurazione Modelli: identità completa e ambito
 * dichiarato, con l'origine del salvataggio. Nessun segreto, nessun modello.
 */
exports.AgentPresetAttachmentRecordSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    identity: agent_model_configuration_values_js_1.CompleteModelIdentitySchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    source: exports.PresetAttachmentRecordSourceSchema,
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
function presetAttachmentRecordFromBirth(attachment, ownerId) {
    const parsed = model_preset_js_1.AgentPresetAttachmentSchema.parse(attachment);
    return exports.AgentPresetAttachmentRecordSchema.parse({
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
function presetAttachmentAuthorityOf(record, agent) {
    const parsed = exports.AgentPresetAttachmentRecordSchema.safeParse(record);
    if (!parsed.success || agent.ownerId === null)
        return null;
    const { identity, scope } = parsed.data;
    if (identity.vaultAgentId !== agent.id || identity.managementAgentId !== agent.slug || scope.ownerId !== String(agent.ownerId))
        return null;
    return { identity, scope };
}
//# sourceMappingURL=preset-attachment-record.js.map