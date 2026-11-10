import { AgentRuntimeIdentitySchema } from "../agent/agent-runtime-identity.js";
/**
 * Fonte del preset generale decisa da Stefano il 07/11 («prendi X9 …»): è l'identità
 * salvata di X9 (fotografia di produzione del 03/11). `vaultAgentId` non ne fa parte:
 * è la chiave del database di Forge, la controlla chi legge la riga.
 */
export const PLATFORM_PRESET_SOURCE_IDENTITY = Object.freeze({
    runtimeAgentId: 'x9',
    managementAgentId: 'x9-staging',
});
/** Vero solo se l'identità salvata è quella di X9: entrambi gli id uguali, nessun confronto approssimato. */
export function isPlatformPresetSourceIdentity(identity) {
    const parsed = AgentRuntimeIdentitySchema.safeParse(identity);
    return (parsed.success &&
        parsed.data.runtimeAgentId === PLATFORM_PRESET_SOURCE_IDENTITY.runtimeAgentId &&
        parsed.data.managementAgentId === PLATFORM_PRESET_SOURCE_IDENTITY.managementAgentId);
}
//# sourceMappingURL=preset-source.js.map