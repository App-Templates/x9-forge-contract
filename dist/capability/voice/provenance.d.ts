import { z } from 'zod';
/**
 * Single provenance entry tracking one data source that contributed to
 * a composed VoiceCallBrief (VORIG-03 / D-03 minimal shape).
 *
 * Conservative by design: only `source` is required. Every other field is
 * optional so 46.1+ can widen the shape additively without breaking pre-
 * v1.6.0 consumers.
 *
 * Typical `source` values observed: 'strategic_file' | 'cap_contacts' |
 * 'memory_v2' | 'cap_calendar' | 'cap_rag_stub'. String kept open for
 * 46.1 composer additions; a future phase may pin an enum if usage
 * stabilizes.
 *
 * Lives in its own module (not co-located with `prepare-call.ts`) so
 * `brief.ts` can import it without creating a module-initialization cycle:
 * `brief.ts` → `provenance.ts` is safe; `prepare-call.ts` imports both
 * `brief.ts` and `provenance.ts` (one-direction fan-in).
 *
 * @see .planning/phases/46.0-bridge-voice-origination/46.0-CONTEXT.md §D-03
 * @see .planning/phases/46.0-bridge-voice-origination/46.0-RESEARCH.md §12 pitfall #2
 */
export declare const VoiceCallProvenanceEntrySchema: z.ZodObject<{
    source: z.ZodString;
    ref_id: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type VoiceCallProvenanceEntry = z.infer<typeof VoiceCallProvenanceEntrySchema>;
//# sourceMappingURL=provenance.d.ts.map