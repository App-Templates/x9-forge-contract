import { z } from 'zod';
/**
 * Request sent by X9 (agent-core or cap-voice tool layer) to cap-voice to
 * initiate an outbound call. cap-voice then composes dynamic variables and
 * hands off to ElevenLabs.
 *
 * @see docs/adr/ADR-cap-voice.md §13 (tool surface)
 * @see docs/adr/ADR-cap-voice.md §9 (dynamic variables)
 */
export declare const VoiceCallStartRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    recipient_phone: z.ZodString;
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
    prompt_version: z.ZodString;
    locale: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type VoiceCallStartRequest = z.infer<typeof VoiceCallStartRequestSchema>;
/**
 * Response from cap-voice after the outbound call is initiated (ElevenLabs
 * acknowledged + voice_sessions row registered in Forge).
 */
export declare const VoiceCallStartResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    conversation_id: z.ZodString;
    elevenlabs_agent_id: z.ZodString;
    started_at: z.ZodString;
}, z.core.$strip>;
export type VoiceCallStartResponse = z.infer<typeof VoiceCallStartResponseSchema>;
//# sourceMappingURL=call-start.d.ts.map