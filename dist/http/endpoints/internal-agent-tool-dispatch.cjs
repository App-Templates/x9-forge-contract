"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentToolDispatchContract = exports.InternalAgentToolDispatchParamsSchema = exports.InternalAgentToolDispatchResponseSchema = exports.InternalAgentToolDispatchRequestSchema = exports.InternalAgentExecutionSchema = exports.INTERNAL_AGENT_EXECUTIONS = void 0;
exports.internalAgentToolDispatchPath = internalAgentToolDispatchPath;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const tool_call_js_1 = require("../../capability/tool-call.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
const tools_js_1 = require("../../capability/ricerca/tools.cjs");
const index_js_1 = require("../../capability/voice-live/index.cjs");
const agent_credential_services_js_1 = require("../../agent/agent-credential-services.cjs");
const platform_internal_credentials_js_1 = require("../../vault/platform-internal-credentials.cjs");
const cap_tool_call_js_1 = require("./cap-tool-call.cjs");
const text = zod_1.z.string().min(1).max(32_000);
const telegramInput = zod_1.z.strictObject({ chatId: zod_1.z.union([zod_1.z.number().int(), zod_1.z.string().min(1).max(64)]), text });
const sessionInput = zod_1.z.strictObject({ sessionId: zod_1.z.string().min(1).max(256) });
const voiceInput = zod_1.z.strictObject({ toNumber: zod_1.z.string().regex(/^\+[1-9]\d{7,14}$/), callBrief: text, contactName: zod_1.z.string().min(1).max(256) });
// Service-to-capability adapters (cap-voice mid-call tools, cap-security alarm/sentinel): the caller names WHAT to do for
// the addressed agent; keys, identifiers and identity are never the caller's. Inputs mirror the native tool schemas.
const isoDay = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const calendarId = zod_1.z.string().min(1).max(256);
const eventChanges = zod_1.z.strictObject({
    summary: zod_1.z.string().min(1).max(1024).optional(), startTime: zod_1.z.string().min(1).max(64).optional(), endTime: zod_1.z.string().min(1).max(64).optional(),
    location: zod_1.z.string().max(1024).optional(), description: zod_1.z.string().max(8192).optional(),
});
const calendarWeekInput = zod_1.z.strictObject({ targetDate: isoDay });
const calendarCreateInput = zod_1.z.strictObject({
    summary: zod_1.z.string().min(1).max(1024), startTime: zod_1.z.string().min(1).max(64), endTime: zod_1.z.string().min(1).max(64),
    location: zod_1.z.string().max(1024).optional(), description: zod_1.z.string().max(8192).optional(), calendarId: calendarId.optional(),
});
const calendarUpdateInput = zod_1.z.strictObject({ eventId: zod_1.z.string().min(1).max(256), changes: eventChanges, calendarId: calendarId.optional() });
const calendarDeleteInput = zod_1.z.strictObject({ eventId: zod_1.z.string().min(1).max(256), calendarId: calendarId.optional() });
const emailSendInput = zod_1.z.strictObject({ to: zod_1.z.string().email().max(320), subject: zod_1.z.string().min(1).max(998), text: zod_1.z.string().min(1).max(100_000), html: zod_1.z.string().max(200_000).optional() });
const contactsSearchInput = zod_1.z.strictObject({ query: zod_1.z.string().min(1).max(256) });
const lightGroupInput = zod_1.z.strictObject({ group: zod_1.z.string().min(1).max(64) });
const lightInput = zod_1.z.strictObject({ name: zod_1.z.string().min(1).max(128) });
const noInput = zod_1.z.strictObject({});
const reminderInput = zod_1.z.strictObject({
    type: zod_1.z.literal('one_shot'), scheduledFor: zod_1.z.string().min(1).max(64),
    action: zod_1.z.enum(['voice_call', 'telegram_text', 'telegram_voice']),
    recipient: zod_1.z.strictObject({ name: zod_1.z.string().min(1).max(256), phone: zod_1.z.string().max(32).optional(), telegramChatId: zod_1.z.number().int().optional() }),
    brief: zod_1.z.string().min(1).max(8000),
});
const GOOGLE_CALENDAR = ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN'];
const NETATMO_OAUTH = ['NETATMO_CLIENT_ID', 'NETATMO_CLIENT_SECRET', 'NETATMO_ACCESS_TOKEN', 'NETATMO_REFRESH_TOKEN'];
function registration(capability, tool, inputSchema, credentialKeys, identifierKeys = [], settingKeys = []) {
    return Object.freeze({ target: 'capability', capability, tool, path: (0, cap_tool_call_js_1.capToolCallPath)(tool), inputSchema,
        credentialKeys: Object.freeze([...credentialKeys]), identifierKeys: Object.freeze([...identifierKeys]), settingKeys: Object.freeze([...settingKeys]), modelVisible: false });
}
/** Fixed internal adapters only. Never add these entries to an LLM-visible capability manifest.
 * Required fields remain subject to the installed manifest and chosen provider/model policy.
 * Settings and identifiers are separate from secrets; none are selected by the caller.
 */
exports.INTERNAL_AGENT_EXECUTIONS = Object.freeze({
    scheduler_voice_call: registration('voice', 'voice_call', voiceInput, ['ELEVENLABS_API_KEY', 'OPENAI_API_KEY', 'TELNYX_API_KEY', 'TELNYX_PUBLIC_KEY'], ['ELEVENLABS_MINDFULNESS_AGENT_ID', 'TELNYX_CONNECTION_ID', 'TELNYX_FROM_NUMBER'], ['VOICE_CALL_PROVIDER', 'OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
    scheduler_telegram_text: Object.freeze({ target: 'builtin', tool: 'telegram_text', inputSchema: telegramInput, credentialKeys: Object.freeze(['TELEGRAM_BOT_TOKEN']), identifierKeys: Object.freeze([]), settingKeys: Object.freeze([]), modelVisible: false }),
    scheduler_telegram_voice: Object.freeze({ target: 'builtin', tool: 'telegram_voice', inputSchema: telegramInput,
        credentialKeys: Object.freeze(['TELEGRAM_BOT_TOKEN', 'ELEVENLABS_API_KEY', 'OPENAI_API_KEY']), identifierKeys: Object.freeze(['ELEVENLABS_VOICE_ID']),
        settingKeys: Object.freeze(['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID', 'OPENAI_TTS_MODEL', 'OPENAI_TTS_VOICE']), modelVisible: false }),
    scheduler_briefing_generate: registration('briefing', 'briefing_generate', zod_1.z.strictObject({}), ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'TELEGRAM_BOT_TOKEN', 'GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN'], ['ELEVENLABS_VOICE_ID'], ['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID']),
    research_execute: registration('ricerca', tools_js_1.RICERCA_INTERNAL_TOOLS.execute, tools_js_1.ResearchExecuteInputSchema, ['OPENAI_API_KEY']),
    glasses_session_admit: registration('glasses', 'glasses_session_admit', sessionInput, ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID'], ['ELEVENLABS_MODEL_ID']),
    websocket_session_admit: registration('websocket', 'websocket_session_admit', sessionInput, ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID', 'ELEVENLABS_MINDFULNESS_AGENT_ID'], ['ELEVENLABS_MODEL_ID']),
    voice_web_session_admit: registration('voice-live', 'voice_web_session_admit', index_js_1.VoiceLiveWebSessionRequestSchema.omit({ agent_id: true }), ['OPENAI_API_KEY'], [], ['OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
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
exports.InternalAgentExecutionSchema = zod_1.z.enum(Object.keys(exports.INTERNAL_AGENT_EXECUTIONS));
/** Correlation does not authorize side-effect replay: receivers retain native lease/idempotency guards. */
exports.InternalAgentToolDispatchRequestSchema = zod_1.z.strictObject({
    requestId: zod_1.z.string().min(1).max(256),
    identity: capability_call_context_js_1.CapabilityCallIdentitySchema,
    execution: exports.InternalAgentExecutionSchema,
    input: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    /** Total execution deadline; HTTP disconnect cancellation remains transport-owned. */
    timeoutMs: zod_1.z.number().int().min(1).max(300_000).optional(),
}).superRefine((request, ctx) => {
    const parsed = exports.INTERNAL_AGENT_EXECUTIONS[request.execution].inputSchema.safeParse(request.input);
    if (!parsed.success)
        ctx.addIssue({ code: 'custom', path: ['input'], message: 'Invalid input for the fixed internal execution' });
});
const forbiddenResultFields = new Set(['credentials', 'credentialVersions', 'context', 'env',
    ...agent_credential_services_js_1.AGENT_CREDENTIAL_SERVICE_KEYS.filter(key => (0, agent_credential_services_js_1.getAgentCredentialServiceMetadata)(key)?.kind === 'credential'),
    ...platform_internal_credentials_js_1.PLATFORM_INTERNAL_CREDENTIAL_KEYS]);
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
exports.InternalAgentToolDispatchResponseSchema = zod_1.z.discriminatedUnion('status', [
    tool_call_js_1.ToolCallSuccessResponseSchema.strict(), tool_call_js_1.ToolCallErrorResponseSchema.strict(),
]).refine(isResultOnly, { message: 'Internal execution returns result data only' });
exports.InternalAgentToolDispatchParamsSchema = internal_agents_management_js_1.AgentManagementParamsSchema;
function internalAgentToolDispatchPath(agentId) {
    const params = exports.InternalAgentToolDispatchParamsSchema.parse({ agentId });
    return `/internal/agents/${params.agentId}/tools/dispatch`;
}
exports.internalAgentToolDispatchContract = {
    method: 'POST', path: '/internal/agents/:agentId/tools/dispatch',
    authType: 'secret', paramsSchema: exports.InternalAgentToolDispatchParamsSchema,
    bodySchema: exports.InternalAgentToolDispatchRequestSchema, responseSchema: exports.InternalAgentToolDispatchResponseSchema,
};
//# sourceMappingURL=internal-agent-tool-dispatch.js.map