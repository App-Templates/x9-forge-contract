import { z } from 'zod';
import { CapabilityCallIdentitySchema } from "../../capability/capability-call-context.js";
import { ToolCallSuccessResponseSchema, ToolCallErrorResponseSchema } from "../../capability/tool-call.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
import { ResearchExecuteInputSchema, RICERCA_INTERNAL_TOOLS } from "../../capability/ricerca/tools.js";
import { VoiceLiveWebSessionRequestSchema } from "../../capability/voice-live/index.js";
import { AGENT_CREDENTIAL_SERVICE_KEYS, getAgentCredentialServiceMetadata } from "../../agent/agent-credential-services.js";
import { PLATFORM_INTERNAL_CREDENTIAL_KEYS } from "../../vault/platform-internal-credentials.js";
import { capToolCallPath } from "./cap-tool-call.js";
const text = z.string().min(1).max(32_000);
const telegramInput = z.strictObject({ chatId: z.union([z.number().int(), z.string().min(1).max(64)]), text });
const sessionInput = z.strictObject({ sessionId: z.string().min(1).max(256) });
const voiceInput = z.strictObject({ toNumber: z.string().regex(/^\+[1-9]\d{7,14}$/), callBrief: text, contactName: z.string().min(1).max(256) });
// Service-to-capability adapters (cap-voice mid-call tools, cap-security alarm/sentinel): the caller names WHAT to do for
// the addressed agent; keys, identifiers and identity are never the caller's. Inputs mirror the native tool schemas.
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const calendarId = z.string().min(1).max(256);
const eventChanges = z.strictObject({
    summary: z.string().min(1).max(1024).optional(), startTime: z.string().min(1).max(64).optional(), endTime: z.string().min(1).max(64).optional(),
    location: z.string().max(1024).optional(), description: z.string().max(8192).optional(),
});
const calendarWeekInput = z.strictObject({ targetDate: isoDay });
const calendarCreateInput = z.strictObject({
    summary: z.string().min(1).max(1024), startTime: z.string().min(1).max(64), endTime: z.string().min(1).max(64),
    location: z.string().max(1024).optional(), description: z.string().max(8192).optional(), calendarId: calendarId.optional(),
});
const calendarUpdateInput = z.strictObject({ eventId: z.string().min(1).max(256), changes: eventChanges, calendarId: calendarId.optional() });
const calendarDeleteInput = z.strictObject({ eventId: z.string().min(1).max(256), calendarId: calendarId.optional() });
const emailSendInput = z.strictObject({ to: z.string().email().max(320), subject: z.string().min(1).max(998), text: z.string().min(1).max(100_000), html: z.string().max(200_000).optional() });
const contactsSearchInput = z.strictObject({ query: z.string().min(1).max(256) });
const lightGroupInput = z.strictObject({ group: z.string().min(1).max(64) });
const lightInput = z.strictObject({ name: z.string().min(1).max(128) });
const noInput = z.strictObject({});
const reminderInput = z.strictObject({
    type: z.literal('one_shot'), scheduledFor: z.string().min(1).max(64),
    action: z.enum(['voice_call', 'telegram_text', 'telegram_voice']),
    recipient: z.strictObject({ name: z.string().min(1).max(256), phone: z.string().max(32).optional(), telegramChatId: z.number().int().optional() }),
    brief: z.string().min(1).max(8000),
});
const GOOGLE_CALENDAR = ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN'];
const NETATMO_OAUTH = ['NETATMO_CLIENT_ID', 'NETATMO_CLIENT_SECRET', 'NETATMO_ACCESS_TOKEN', 'NETATMO_REFRESH_TOKEN'];
function registration(capability, tool, inputSchema, credentialKeys, identifierKeys = [], settingKeys = []) {
    return Object.freeze({ target: 'capability', capability, tool, path: capToolCallPath(tool), inputSchema,
        credentialKeys: Object.freeze([...credentialKeys]), identifierKeys: Object.freeze([...identifierKeys]), settingKeys: Object.freeze([...settingKeys]), modelVisible: false });
}
/** Fixed internal adapters only. Never add these entries to an LLM-visible capability manifest.
 * Required fields remain subject to the installed manifest and chosen provider/model policy.
 * Settings and identifiers are separate from secrets; none are selected by the caller.
 */
export const INTERNAL_AGENT_EXECUTIONS = Object.freeze({
    scheduler_voice_call: registration('voice', 'voice_call', voiceInput, ['ELEVENLABS_API_KEY', 'OPENAI_API_KEY', 'TELNYX_API_KEY', 'TELNYX_PUBLIC_KEY'], ['ELEVENLABS_MINDFULNESS_AGENT_ID', 'TELNYX_CONNECTION_ID', 'TELNYX_FROM_NUMBER'], ['VOICE_CALL_PROVIDER', 'OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
    scheduler_telegram_text: Object.freeze({ target: 'builtin', tool: 'telegram_text', inputSchema: telegramInput, credentialKeys: Object.freeze(['TELEGRAM_BOT_TOKEN']), identifierKeys: Object.freeze([]), settingKeys: Object.freeze([]), modelVisible: false }),
    scheduler_telegram_voice: Object.freeze({ target: 'builtin', tool: 'telegram_voice', inputSchema: telegramInput,
        credentialKeys: Object.freeze(['TELEGRAM_BOT_TOKEN', 'ELEVENLABS_API_KEY', 'OPENAI_API_KEY']), identifierKeys: Object.freeze(['ELEVENLABS_VOICE_ID']),
        settingKeys: Object.freeze(['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID', 'OPENAI_TTS_MODEL', 'OPENAI_TTS_VOICE']), modelVisible: false }),
    scheduler_briefing_generate: registration('briefing', 'briefing_generate', z.strictObject({}), ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'TELEGRAM_BOT_TOKEN', 'GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN'], ['ELEVENLABS_VOICE_ID'], ['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID']),
    research_execute: registration('ricerca', RICERCA_INTERNAL_TOOLS.execute, ResearchExecuteInputSchema, ['OPENAI_API_KEY']),
    glasses_session_admit: registration('glasses', 'glasses_session_admit', sessionInput, ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID'], ['ELEVENLABS_MODEL_ID']),
    websocket_session_admit: registration('websocket', 'websocket_session_admit', sessionInput, ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID', 'ELEVENLABS_MINDFULNESS_AGENT_ID'], ['ELEVENLABS_MODEL_ID']),
    voice_web_session_admit: registration('voice-live', 'voice_web_session_admit', VoiceLiveWebSessionRequestSchema.omit({ agent_id: true }), ['OPENAI_API_KEY'], [], ['OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
    // cap-voice mid-call tools, hold lifecycle and reminders: always the keys of the agent whose call it is.
    voice_calendar_week: registration('calendar', 'calendar_week', calendarWeekInput, GOOGLE_CALENDAR),
    voice_calendar_create: registration('calendar', 'calendar_create', calendarCreateInput, GOOGLE_CALENDAR),
    voice_calendar_update: registration('calendar', 'calendar_update', calendarUpdateInput, GOOGLE_CALENDAR),
    voice_calendar_delete: registration('calendar', 'calendar_delete', calendarDeleteInput, GOOGLE_CALENDAR),
    voice_email_send: registration('email', 'email_send', emailSendInput, ['AGENTMAIL_API_KEY'], ['AGENTMAIL_INBOX_ID']),
    voice_contacts_search: registration('contacts', 'contacts_search', contactsSearchInput, ['GOOGLE_CONTACTS_CLIENT_ID', 'GOOGLE_CONTACTS_CLIENT_SECRET', 'GOOGLE_CONTACTS_REFRESH_TOKEN']),
    voice_schedule_create: registration('scheduler', 'schedule_create', reminderInput, []),
    // cap-security alarm and sentinel: the home of the agent the alarm belongs to.
    security_light_on_group: registration('netatmo', 'light_on_group', lightGroupInput, NETATMO_OAUTH),
    security_light_on: registration('netatmo', 'light_on', lightInput, NETATMO_OAUTH),
    security_come_home: registration('netatmo', 'come_home', noInput, [...NETATMO_OAUTH, 'NETATMO_EMAIL', 'NETATMO_PASSWORD']),
});
export const InternalAgentExecutionSchema = z.enum(Object.keys(INTERNAL_AGENT_EXECUTIONS));
/** Correlation does not authorize side-effect replay: receivers retain native lease/idempotency guards. */
export const InternalAgentToolDispatchRequestSchema = z.strictObject({
    requestId: z.string().min(1).max(256),
    identity: CapabilityCallIdentitySchema,
    execution: InternalAgentExecutionSchema,
    input: z.record(z.string(), z.unknown()),
    /** Total execution deadline; HTTP disconnect cancellation remains transport-owned. */
    timeoutMs: z.number().int().min(1).max(300_000).optional(),
}).superRefine((request, ctx) => {
    const parsed = INTERNAL_AGENT_EXECUTIONS[request.execution].inputSchema.safeParse(request.input);
    if (!parsed.success)
        ctx.addIssue({ code: 'custom', path: ['input'], message: 'Invalid input for the fixed internal execution' });
});
const forbiddenResultFields = new Set(['credentials', 'credentialVersions', 'context', 'env',
    ...AGENT_CREDENTIAL_SERVICE_KEYS.filter(key => getAgentCredentialServiceMetadata(key)?.kind === 'credential'),
    ...PLATFORM_INTERNAL_CREDENTIAL_KEYS]);
function isResultOnly(value) {
    const pending = [value];
    let visited = 0;
    while (pending.length) {
        if (++visited > 10_000)
            return false;
        const item = pending.pop();
        if (item && typeof item === 'object') {
            for (const [key, child] of Object.entries(item)) {
                if (forbiddenResultFields.has(key))
                    return false;
                pending.push(child);
            }
        }
    }
    return true;
}
/** Canonical result variants, with a strict boundary and no credential/context material at any depth. */
export const InternalAgentToolDispatchResponseSchema = z.discriminatedUnion('status', [
    ToolCallSuccessResponseSchema.strict(), ToolCallErrorResponseSchema.strict(),
]).refine(isResultOnly, { message: 'Internal execution returns result data only' });
export const InternalAgentToolDispatchParamsSchema = AgentManagementParamsSchema;
export function internalAgentToolDispatchPath(agentId) {
    const params = InternalAgentToolDispatchParamsSchema.parse({ agentId });
    return `/internal/agents/${params.agentId}/tools/dispatch`;
}
export const internalAgentToolDispatchContract = {
    method: 'POST', path: '/internal/agents/:agentId/tools/dispatch',
    authType: 'secret', paramsSchema: InternalAgentToolDispatchParamsSchema,
    bodySchema: InternalAgentToolDispatchRequestSchema, responseSchema: InternalAgentToolDispatchResponseSchema,
};
//# sourceMappingURL=internal-agent-tool-dispatch.js.map