"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizedActionsSchema = void 0;
const zod_1 = require("zod");
/**
 * Server-enforced per-call authorization matrix (ADR §10 / D-13).
 *
 * Safe defaults:
 *   - read-only tools (search_context, calendar availability/conflicts, release_calendar_block,
 *     draft_recap_email, notify_stefano) default TRUE;
 *   - mutating tools (create/update calendar, block slot, send email, commit/cancel,
 *     accept contracts, share sensitive PII, act outside brief) default FALSE;
 *
 * The model sees these flags in the brief (D-13 step 1 — disclosed trust),
 * but enforcement is server-side (D-13 step 2 — the only real boundary).
 *
 * W-06 revision (2026-04-19): `can_share_sensitive_pii` and `can_act_outside_brief`
 * added so Plan 04 ALWAYS_FORBIDDEN_UNLESS_EXPLICIT dict can reference bridge flags
 * (not inline literals). Both default FALSE per D-13 always-forbidden policy.
 *
 * @see docs/adr/ADR-cap-voice.md §10 (duplicate authorization)
 * @see docs/adr/ADR-cap-voice.md §10.5 (always-forbidden unless explicit)
 */
exports.AuthorizedActionsSchema = zod_1.z.object({
    // -- read-only defaults TRUE -------------------------------------------
    can_search_context: zod_1.z.boolean().default(true),
    can_get_calendar_availability: zod_1.z.boolean().default(true),
    can_check_calendar_conflicts: zod_1.z.boolean().default(true),
    can_release_calendar_block: zod_1.z.boolean().default(true),
    can_draft_email: zod_1.z.boolean().default(true),
    can_notify_stefano: zod_1.z.boolean().default(true),
    // -- mutating defaults FALSE -------------------------------------------
    can_update_calendar: zod_1.z.boolean().default(false),
    can_create_calendar_event: zod_1.z.boolean().default(false),
    can_block_calendar_slot: zod_1.z.boolean().default(false),
    can_send_email_recap: zod_1.z.boolean().default(false),
    can_create_reminder: zod_1.z.boolean().default(false),
    // -- always-forbidden-unless-explicit defaults FALSE -------------------
    can_commit_costs: zod_1.z.boolean().default(false),
    can_cancel_services: zod_1.z.boolean().default(false),
    can_accept_contract_terms: zod_1.z.boolean().default(false),
    /**
     * W-06 (2026-04-19): D-13 always-forbidden — share sensitive PII (financial,
     * medical, legal, credentials). Plan 04 references this flag by name in
     * ALWAYS_FORBIDDEN_UNLESS_EXPLICIT dict instead of a string literal.
     */
    can_share_sensitive_pii: zod_1.z.boolean().default(false),
    /**
     * W-06 (2026-04-19): D-13 always-forbidden — perform actions outside the
     * stated brief goal (promise follow-ups or commitments not in the brief).
     */
    can_act_outside_brief: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=authorized-actions.js.map