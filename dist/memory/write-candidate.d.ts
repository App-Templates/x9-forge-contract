import { z } from 'zod';
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
export declare const MemorySourceSchema: z.ZodObject<{
    kind: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
    capturedAt: z.ZodString;
}, z.core.$strip>;
export type MemorySource = z.infer<typeof MemorySourceSchema>;
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
export declare const MemoryPrivacyFlagsSchema: z.ZodObject<{
    containsPii: z.ZodBoolean;
    containsSensitive: z.ZodBoolean;
    shareability: z.ZodEnum<{
        "tenant-only": "tenant-only";
        aggregable: "aggregable";
        "platform-visible": "platform-visible";
    }>;
}, z.core.$strip>;
export type MemoryPrivacyFlags = z.infer<typeof MemoryPrivacyFlagsSchema>;
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
export declare const MemoryWriteCandidateSchema: z.ZodObject<{
    scope: z.ZodEnum<{
        user: "user";
        platform: "platform";
        owner: "owner";
        agent: "agent";
    }>;
    type: z.ZodEnum<{
        profile: "profile";
        procedural: "procedural";
        episodic: "episodic";
        relationship: "relationship";
    }>;
    subtype: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
    content: z.ZodUnknown;
    identity: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodOptional<z.ZodString>;
        agentId: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    temporal: z.ZodObject<{
        validAt: z.ZodString;
        invalidAt: z.ZodOptional<z.ZodString>;
        supersedes: z.ZodOptional<z.ZodString>;
        supersededBy: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    source: z.ZodObject<{
        kind: z.ZodString;
        ref: z.ZodOptional<z.ZodString>;
        capturedAt: z.ZodString;
    }, z.core.$strip>;
    privacy: z.ZodObject<{
        containsPii: z.ZodBoolean;
        containsSensitive: z.ZodBoolean;
        shareability: z.ZodEnum<{
            "tenant-only": "tenant-only";
            aggregable: "aggregable";
            "platform-visible": "platform-visible";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type MemoryWriteCandidate = z.infer<typeof MemoryWriteCandidateSchema>;
//# sourceMappingURL=write-candidate.d.ts.map