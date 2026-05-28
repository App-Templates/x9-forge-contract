import { z } from 'zod';
/**
 * Request to the cap-voice `/call/voice_prepare_call` endpoint (VORIG-02 /
 * D-04). The agent/LLM caller sends a raw natural-language instruction and
 * an optional recipient hint; cap-voice composes the structured brief
 * server-side — zero LLM content hallucination is allowed. The LLM provides
 * intent hints via `raw_instruction` only; it never asserts authoritative
 * fields (recipient email, calendar slot, etc.) directly.
 *
 * @see .planning/phases/46.0-bridge-voice-origination/46.0-CONTEXT.md §D-04
 */
export declare const VoicePrepareCallRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    raw_instruction: z.ZodString;
    requested_contact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type VoicePrepareCallRequest = z.infer<typeof VoicePrepareCallRequestSchema>;
/**
 * Response from the cap-voice `/call/voice_prepare_call` endpoint (VORIG-02 /
 * D-04). Contains the server-composed brief, the authorization matrix, the
 * classified intent, the full provenance chain, and an optional markdown
 * preview for Telegram confirm-step (Q6 deterministic template).
 *
 * `preview_markdown` is optional at the bridge level to allow graceful
 * degradation if the 46.1 composer fails template rendering; consumers
 * must handle the undefined case.
 *
 * @see .planning/phases/46.0-bridge-voice-origination/46.0-CONTEXT.md §D-04
 */
export declare const VoicePrepareCallResponseSchema: z.ZodObject<{
    brief: z.ZodObject<{
        call_id: z.ZodString;
        agent_id: z.ZodString;
        owner_id: z.ZodString;
        tenant_id: z.ZodOptional<z.ZodString>;
        call_goal_short: z.ZodString;
        recipient_name: z.ZodString;
        recipient_email: z.ZodOptional<z.ZodString>;
        recipient_context: z.ZodString;
        timezone: z.ZodDefault<z.ZodString>;
        constraints: z.ZodDefault<z.ZodObject<{
            available_slots: z.ZodOptional<z.ZodArray<z.ZodObject<{
                start_iso: z.ZodString;
                end_iso: z.ZodString;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
        intent: z.ZodOptional<z.ZodEnum<{
            reminder: "reminder";
            information: "information";
            sales: "sales";
            legal: "legal";
            logistics: "logistics";
            social: "social";
            other: "other";
        }>>;
        memory_context: z.ZodOptional<z.ZodString>;
        relationship_context: z.ZodOptional<z.ZodString>;
        provenance: z.ZodOptional<z.ZodArray<z.ZodObject<{
            source: z.ZodString;
            ref_id: z.ZodOptional<z.ZodString>;
            summary: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    authorized_actions: z.ZodObject<{
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
    intent: z.ZodEnum<{
        reminder: "reminder";
        information: "information";
        sales: "sales";
        legal: "legal";
        logistics: "logistics";
        social: "social";
        other: "other";
    }>;
    intent_confidence: z.ZodOptional<z.ZodNumber>;
    provenance: z.ZodArray<z.ZodObject<{
        source: z.ZodString;
        ref_id: z.ZodOptional<z.ZodString>;
        summary: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    preview_markdown: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type VoicePrepareCallResponse = z.infer<typeof VoicePrepareCallResponseSchema>;
//# sourceMappingURL=prepare-call.d.ts.map