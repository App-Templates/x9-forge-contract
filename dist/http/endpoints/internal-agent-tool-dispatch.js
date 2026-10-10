import { z } from 'zod';
import { CapabilityCallIdentitySchema } from "../../capability/capability-call-context.js";
import { ToolCallSuccessResponseSchema, ToolCallErrorResponseSchema } from "../../capability/tool-call.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
import { ResearchExecuteInputSchema, RICERCA_INTERNAL_TOOLS } from "../../capability/ricerca/tools.js";
import { LabExecuteInputSchema, LAB_INTERNAL_TOOLS } from "../../capability/lab/tools.js";
import { VoiceLiveWebSessionRequestSchema } from "../../capability/voice-live/index.js";
import { AGENT_CREDENTIAL_SERVICE_KEYS, getAgentCredentialServiceMetadata } from "../../agent/agent-credential-services.js";
import { PLATFORM_INTERNAL_CREDENTIAL_KEYS } from "../../vault/platform-internal-credentials.js";
import { capToolCallPath } from "./cap-tool-call.js";
const text = z.string().min(1).max(32_000);
const telegramInput = z.strictObject({ chatId: z.union([z.number().int(), z.string().min(1).max(64)]), text });
const sessionInput = z.strictObject({ sessionId: z.string().min(1).max(256) });
const voiceInput = z.strictObject({ toNumber: z.string().regex(/^\+[1-9]\d{7,14}$/), callBrief: text, contactName: z.string().min(1).max(256) });
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
    scheduler_briefing_generate: registration('briefing', 'briefing_generate', z.strictObject({}), ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'TELEGRAM_BOT_TOKEN', 'GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN'], ['ELEVENLABS_VOICE_ID'], ['ELEVENLABS_MODEL_ID']),
    news_digest: registration('news', 'news_digest', z.strictObject({
        categories: z.array(z.string().min(1).max(200)).max(100).optional(),
        skipCategories: z.array(z.string().min(1).max(200)).max(100).optional(),
    }), ['OPENAI_API_KEY']),
    news_digest_topic: registration('news', 'news_digest_topic', z.strictObject({ topic: z.string().min(1).max(200).optional() }), ['OPENAI_API_KEY']),
    calendar_today: registration('calendar', 'calendar_today', z.strictObject({ date: z.iso.date().optional() }), ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN']),
    calendar_week: registration('calendar', 'calendar_week', z.strictObject({ targetDate: z.iso.date().optional(), weekOffset: z.number().int().min(-4).max(4).optional() }), ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN']),
    lab_execute: registration('lab', LAB_INTERNAL_TOOLS.execute, LabExecuteInputSchema, ['OPENAI_API_KEY']),
    research_execute: registration('ricerca', RICERCA_INTERNAL_TOOLS.execute, ResearchExecuteInputSchema, ['OPENAI_API_KEY']),
    glasses_session_admit: registration('glasses', 'glasses_session_admit', sessionInput, ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID'], ['ELEVENLABS_MODEL_ID']),
    websocket_session_admit: registration('websocket', 'websocket_session_admit', sessionInput, ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID', 'ELEVENLABS_MINDFULNESS_AGENT_ID'], ['ELEVENLABS_MODEL_ID']),
    voice_web_session_admit: registration('voice-live', 'voice_web_session_admit', VoiceLiveWebSessionRequestSchema.omit({ agent_id: true }), ['OPENAI_API_KEY'], [], ['OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
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