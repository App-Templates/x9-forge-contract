import { z } from 'zod';
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
export declare const AuthorizedActionsSchema: z.ZodObject<{
    can_search_context: z.ZodDefault<z.ZodBoolean>;
    can_get_calendar_availability: z.ZodDefault<z.ZodBoolean>;
    can_check_calendar_conflicts: z.ZodDefault<z.ZodBoolean>;
    can_release_calendar_block: z.ZodDefault<z.ZodBoolean>;
    can_draft_email: z.ZodDefault<z.ZodBoolean>;
    can_notify_stefano: z.ZodDefault<z.ZodBoolean>;
    can_update_calendar: z.ZodDefault<z.ZodBoolean>;
    can_create_calendar_event: z.ZodDefault<z.ZodBoolean>;
    can_block_calendar_slot: z.ZodDefault<z.ZodBoolean>;
    can_send_email_recap: z.ZodDefault<z.ZodBoolean>;
    can_create_reminder: z.ZodDefault<z.ZodBoolean>;
    can_commit_costs: z.ZodDefault<z.ZodBoolean>;
    can_cancel_services: z.ZodDefault<z.ZodBoolean>;
    can_accept_contract_terms: z.ZodDefault<z.ZodBoolean>;
    can_share_sensitive_pii: z.ZodDefault<z.ZodBoolean>;
    can_act_outside_brief: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type AuthorizedActions = z.infer<typeof AuthorizedActionsSchema>;
//# sourceMappingURL=authorized-actions.d.ts.map