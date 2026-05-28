"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceCallProvenanceEntrySchema = void 0;
const zod_1 = require("zod");
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
exports.VoiceCallProvenanceEntrySchema = zod_1.z.object({
    /** Source identifier (e.g. 'strategic_file', 'cap_contacts', 'memory_v2'). */
    source: zod_1.z.string().min(1),
    /** Optional reference ID within that source (contact id, memory id, etc.) */
    ref_id: zod_1.z.string().optional(),
    /** Optional human-readable summary of what this source contributed. */
    summary: zod_1.z.string().max(500).optional(),
    /** RFC-3339 timestamp when this source was queried. */
    timestamp: zod_1.z.string().datetime({ offset: true }).optional(),
});
//# sourceMappingURL=provenance.js.map