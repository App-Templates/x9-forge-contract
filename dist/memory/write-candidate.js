import { z } from 'zod';
import { MemoryScopeSchema, MemoryTypeSchema } from "./enums.js";
import { MemoryIdentityEnvelopeSchema } from "./identity.js";
import { TemporalSemanticsSchema } from "./temporal.js";
/**
 * MemorySource — origine del fatto / pezzo di memoria candidato.
 *
 * - `kind`: tipologia della sorgente. Enum open per permettere estensioni
 *   (es. 'chat-message', 'calendar-event', 'voice-turn', 'external-integration').
 * - `ref`: riferimento opaco alla sorgente (message-id, event-id, ecc.).
 *   Formato NON prescritto dal bridge — stringa generica.
 * - `capturedAt`: timestamp di cattura della fonte (distinto da validAt:
 *   quando è stata captata, non quando è vera).
 */
export const MemorySourceSchema = z.object({
    kind: z.string().min(1),
    ref: z.string().min(1).optional(),
    capturedAt: z.string().datetime({ offset: true }),
});
/**
 * MemoryPrivacyFlags — metadata privacy / compliance a livello di candidate.
 *
 * - `containsPii`: il content include Personal Identifiable Information.
 *   Default: assume `true` se unknown — failsafe.
 * - `containsSensitive`: dato sensibile (salute, religione, orient. politico/sessuale).
 *   GDPR art. 9.
 * - `shareability`: con chi può essere condiviso (stesso tenant vs cross-tenant analytics).
 *   `tenant-only` = default safe, `aggregable` = anonimizzabile per analytics aggregate.
 */
export const MemoryPrivacyFlagsSchema = z.object({
    containsPii: z.boolean(),
    containsSensitive: z.boolean(),
    shareability: z.enum(['tenant-only', 'aggregable', 'platform-visible']),
});
/**
 * MemoryWriteCandidate — payload emesso dall'ESTRATTORE (runtime X9) prima
 * della persistenza nel memory store (gestito da Forge o X9 memory-svc).
 *
 * Contratto stabile tra:
 *  - producer = estrattore X9 (agent-core o capability dedicata)
 *  - consumer = memory-svc (lato store), eventualmente mediato da Forge
 *
 * Non contiene ancora un `id` persistito — l'id viene generato al commit
 * dal memory-svc. Non contiene `status` — le candidate sono sempre `active`
 * per definizione (altri status sono conseguenza di operazioni successive).
 *
 * Campi:
 * - `scope`, `type`: classificazione (enums).
 * - `subtype`: raffinatura libera del type (es. type=profile subtype=preference.timezone).
 *   Stringa opaca — bridge non enforce vocabolario.
 * - `confidence`: 0-1 float. Fiducia dell'estrattore.
 * - `content`: payload testuale/JSON opaco. Il bridge NON tipizza la shape interna
 *   (scelta deliberata — estrattori diversi possono emettere contenuti diversi).
 *   Client lato consumer valida la shape in base a type+subtype.
 * - `identity`: chi è il soggetto.
 * - `temporal`: quando è vero / quando ha smesso.
 * - `source`: da dove viene.
 * - `privacy`: flags compliance.
 */
export const MemoryWriteCandidateSchema = z.object({
    scope: MemoryScopeSchema,
    type: MemoryTypeSchema,
    subtype: z.string().min(1).optional(),
    confidence: z.number().min(0).max(1),
    content: z.unknown(),
    identity: MemoryIdentityEnvelopeSchema,
    temporal: TemporalSemanticsSchema,
    source: MemorySourceSchema,
    privacy: MemoryPrivacyFlagsSchema,
});
//# sourceMappingURL=write-candidate.js.map