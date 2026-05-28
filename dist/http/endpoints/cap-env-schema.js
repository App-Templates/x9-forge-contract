import { EnvSchemaDocSchema } from "../../capability/env-schema.js";
/**
 * GET /env-schema — capability env schema discovery.
 * Direction: Forge factory-svc -> X9 capability services
 * Auth: None
 * Requirement: HTTP-09
 *
 * Response is the EnvSchemaDoc schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 */
export const capEnvSchemaContract = {
    method: 'GET',
    path: '/env-schema',
    authType: 'none',
    responseSchema: EnvSchemaDocSchema,
};
export { EnvSchemaDocSchema as CapEnvSchemaResponseSchema };
//# sourceMappingURL=cap-env-schema.js.map