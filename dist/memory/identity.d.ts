import { z } from 'zod';
/**
 * MemoryIdentityEnvelope — identità multi-tenant associata a una memoria.
 *
 * Modello a 4 livelli:
 * - `tenantId`: OBBLIGATORIO. Unità di isolamento top (multi-tenant SaaS).
 * - `ownerId`: opzionale. Proprietario dell'agente (ruolo "customer" in Forge).
 *   Assente = memoria platform-scope (es. configurazioni globali).
 * - `agentId`: opzionale. Un agente specifico. Assente = memoria cross-agent
 *   dentro lo stesso owner/tenant.
 * - `userId`: opzionale. Utente finale (chatter). Assente = memoria non legata a
 *   una chat utente specifica.
 *
 * **Regola di consistenza semantica** (enforced off-envelope, lato consumer):
 * - MemoryScope=platform → solo tenantId significativo
 * - MemoryScope=owner → tenantId + ownerId
 * - MemoryScope=agent → tenantId + ownerId + agentId
 * - MemoryScope=user → tenantId + ownerId + agentId + userId
 *
 * Il bridge NON enforce questa regola nella shape (tutti i campi tranne tenantId
 * sono opzionali). La regola è un contratto business che vive negli estrattori
 * e nel recall orchestrator.
 */
export declare const MemoryIdentityEnvelopeSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type MemoryIdentityEnvelope = z.infer<typeof MemoryIdentityEnvelopeSchema>;
//# sourceMappingURL=identity.d.ts.map