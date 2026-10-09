import { z } from 'zod';
import { CapabilityCallIdentitySchema } from '../../capability/capability-call-context.js';
import { ToolCallSuccessResponseSchema, ToolCallErrorResponseSchema } from '../../capability/tool-call.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';
import { ResearchExecuteInputSchema, RICERCA_INTERNAL_TOOLS } from '../../capability/ricerca/tools.js';
import { VoiceLiveWebSessionRequestSchema } from '../../capability/voice-live/index.js';
import type { KnownCredentialKey } from '../../agent/agent-credentials.js';
import { AGENT_CREDENTIAL_SERVICE_KEYS, getAgentCredentialServiceMetadata } from '../../agent/agent-credential-services.js';
import { PLATFORM_INTERNAL_CREDENTIAL_KEYS } from '../../vault/platform-internal-credentials.js';
import { capToolCallPath } from './cap-tool-call.js';

const text = z.string().min(1).max(32_000);
const telegramInput = z.strictObject({ chatId: z.union([z.number().int(), z.string().min(1).max(64)]), text });
const sessionInput = z.strictObject({ sessionId: z.string().min(1).max(256) });
const voiceInput = z.strictObject({ toNumber: z.string().regex(/^\+[1-9]\d{7,14}$/), callBrief: text, contactName: z.string().min(1).max(256) });
function registration<const C extends string, const T extends string, S extends z.ZodType>(
  capability: C, tool: T, inputSchema: S, credentialKeys: readonly KnownCredentialKey[],
  identifierKeys: readonly KnownCredentialKey[] = [], settingKeys: readonly KnownCredentialKey[] = [],
) {
  return Object.freeze({ target: 'capability' as const, capability, tool, path: capToolCallPath(tool), inputSchema,
    credentialKeys: Object.freeze([...credentialKeys]), identifierKeys: Object.freeze([...identifierKeys]), settingKeys: Object.freeze([...settingKeys]), modelVisible: false as const });
}
/** Fixed internal adapters only. Never add these entries to an LLM-visible capability manifest.
 * Required fields remain subject to the installed manifest and chosen provider/model policy.
 * Settings and identifiers are separate from secrets; none are selected by the caller.
 */
export const INTERNAL_AGENT_EXECUTIONS = Object.freeze({
  scheduler_voice_call: registration('voice', 'voice_call', voiceInput,
    ['ELEVENLABS_API_KEY', 'OPENAI_API_KEY', 'TELNYX_API_KEY', 'TELNYX_PUBLIC_KEY'],
    ['ELEVENLABS_MINDFULNESS_AGENT_ID', 'TELNYX_CONNECTION_ID', 'TELNYX_FROM_NUMBER'],
    ['VOICE_CALL_PROVIDER', 'OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
  scheduler_telegram_text: Object.freeze({ target: 'builtin' as const, tool: 'telegram_text' as const, inputSchema: telegramInput, credentialKeys: Object.freeze(['TELEGRAM_BOT_TOKEN'] as const), identifierKeys: Object.freeze([] as const), settingKeys: Object.freeze([] as const), modelVisible: false as const }),
  scheduler_telegram_voice: Object.freeze({ target: 'builtin' as const, tool: 'telegram_voice' as const, inputSchema: telegramInput,
    credentialKeys: Object.freeze(['TELEGRAM_BOT_TOKEN', 'ELEVENLABS_API_KEY', 'OPENAI_API_KEY'] as const), identifierKeys: Object.freeze(['ELEVENLABS_VOICE_ID'] as const),
    settingKeys: Object.freeze(['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID', 'OPENAI_TTS_MODEL', 'OPENAI_TTS_VOICE'] as const), modelVisible: false as const }),
  scheduler_briefing_generate: registration('briefing', 'briefing_generate', z.strictObject({}),
    ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'TELEGRAM_BOT_TOKEN'], ['ELEVENLABS_VOICE_ID'], ['ELEVENLABS_MODEL_ID']),
  research_execute: registration('ricerca', RICERCA_INTERNAL_TOOLS.execute, ResearchExecuteInputSchema, ['OPENAI_API_KEY']),
  glasses_session_admit: registration('glasses', 'glasses_session_admit', sessionInput,
    ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID'], ['ELEVENLABS_MODEL_ID']),
  websocket_session_admit: registration('websocket', 'websocket_session_admit', sessionInput,
    ['ELEVENLABS_API_KEY'], ['ELEVENLABS_VOICE_ID', 'ELEVENLABS_MINDFULNESS_AGENT_ID'], ['ELEVENLABS_MODEL_ID']),
  voice_web_session_admit: registration('voice-live', 'voice_web_session_admit', VoiceLiveWebSessionRequestSchema.omit({ agent_id: true }),
    ['OPENAI_API_KEY'], [], ['OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL']),
});
export const InternalAgentExecutionSchema = z.enum(Object.keys(INTERNAL_AGENT_EXECUTIONS) as [keyof typeof INTERNAL_AGENT_EXECUTIONS, ...(keyof typeof INTERNAL_AGENT_EXECUTIONS)[]]);
export type InternalAgentExecution = z.infer<typeof InternalAgentExecutionSchema>;

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
  if (!parsed.success) ctx.addIssue({ code: 'custom', path: ['input'], message: 'Invalid input for the fixed internal execution' });
});
export type InternalAgentToolDispatchRequest = z.infer<typeof InternalAgentToolDispatchRequestSchema>;

const forbiddenResultFields = new Set<string>(['credentials', 'credentialVersions', 'context', 'env',
  ...AGENT_CREDENTIAL_SERVICE_KEYS.filter(key => getAgentCredentialServiceMetadata(key)?.kind === 'credential'),
  ...PLATFORM_INTERNAL_CREDENTIAL_KEYS]);
function isResultOnly(value: unknown): boolean {
  const pending: unknown[] = [value]; let visited = 0;
  while (pending.length) {
    if (++visited > 10_000) return false;
    const item = pending.pop();
    if (item && typeof item === 'object') {
      for (const [key, child] of Object.entries(item)) {
        if (forbiddenResultFields.has(key)) return false;
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
export type InternalAgentToolDispatchResponse = z.infer<typeof InternalAgentToolDispatchResponseSchema>;
export const InternalAgentToolDispatchParamsSchema = AgentManagementParamsSchema;
export function internalAgentToolDispatchPath(agentId: string): string {
  const params = InternalAgentToolDispatchParamsSchema.parse({ agentId });
  return `/internal/agents/${params.agentId}/tools/dispatch`;
}
export const internalAgentToolDispatchContract = {
  method: 'POST' as const, path: '/internal/agents/:agentId/tools/dispatch' as const,
  authType: 'secret' as const, paramsSchema: InternalAgentToolDispatchParamsSchema,
  bodySchema: InternalAgentToolDispatchRequestSchema, responseSchema: InternalAgentToolDispatchResponseSchema,
} as const;
