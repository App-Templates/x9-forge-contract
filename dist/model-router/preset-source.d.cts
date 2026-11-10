/**
 * Fonte del preset generale decisa da Stefano il 07/11 («prendi X9 …»): è l'identità
 * salvata di X9 (fotografia di produzione del 03/11). `vaultAgentId` non ne fa parte:
 * è la chiave del database di Forge, la controlla chi legge la riga.
 */
export declare const PLATFORM_PRESET_SOURCE_IDENTITY: Readonly<{
    runtimeAgentId: "x9";
    managementAgentId: "x9-staging";
}>;
/** Vero solo se l'identità salvata è quella di X9: entrambi gli id uguali, nessun confronto approssimato. */
export declare function isPlatformPresetSourceIdentity(identity: unknown): boolean;
//# sourceMappingURL=preset-source.d.ts.map