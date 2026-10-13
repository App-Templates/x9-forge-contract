import { type ModelCatalog } from "./model-catalog.cjs";
import type { AgentModelsConfiguration } from "./agent-model-configuration-values.cjs";
/** Exact agent-core public-content fingerprint; observation times and its previous token do not participate. */
export declare function modelCatalogContentVersion(catalog: ModelCatalog): string;
/** Saved content includes identity/provenance; only its sequence and per-slot catalog observation tokens are omitted. */
export declare function modelConfigurationContentVersion(configuration: AgentModelsConfiguration): string;
/** One content version for the catalog/configuration pair. */
export declare function modelsVersion(input: {
    catalogVersion: string;
    configurationVersion: string;
}): string;
/** Stamp the token of the catalog object just validated, without mutating the caller's selection. */
export declare function withCatalogVersion<S extends {
    settings: {
        catalogVersion: string;
    };
}>(selection: S, catalog: {
    version: string;
}): S;
//# sourceMappingURL=models-version.d.ts.map