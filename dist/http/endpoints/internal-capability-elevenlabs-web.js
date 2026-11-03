import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { capElevenLabsAgentPath } from "./internal-capability-elevenlabs.js";
import { ElevenLabsWebPolicyChangeSchema, ElevenLabsWebPolicyResultSchema } from "../../capability/agent-elevenlabs/web-channel.js";
import { ElevenLabsWebAdmissionSnapshotSchema, ElevenLabsWebSessionRequestSchema, ElevenLabsWebSessionResultSchema } from "../../capability/agent-elevenlabs/web-session.js";
import { ElevenLabsWebCatalogSchema } from "../../capability/agent-elevenlabs/web-catalog.js";
/** Forge -> existing cap-agent-elevenlabs; service auth is mandatory, never browser-supplied authority. */
const internal = { authType: 'secret', paramsSchema: CapabilityAgentParamsSchema };
export const elevenLabsWebSnapshotContract = { ...internal, method: 'GET', path: '/internal/capability/agents/:agentId/elevenlabs/web', responseSchema: ElevenLabsWebAdmissionSnapshotSchema };
export const elevenLabsWebPolicyContract = { ...internal, method: 'PUT', path: '/internal/capability/agents/:agentId/elevenlabs/web/policy', bodySchema: ElevenLabsWebPolicyChangeSchema, responseSchema: ElevenLabsWebPolicyResultSchema };
export const elevenLabsWebCatalogContract = { ...internal, method: 'GET', path: '/internal/capability/agents/:agentId/elevenlabs/web/catalog', responseSchema: ElevenLabsWebCatalogSchema };
export const elevenLabsWebSessionContract = { ...internal, method: 'POST', path: '/internal/capability/agents/:agentId/elevenlabs/web/session', bodySchema: ElevenLabsWebSessionRequestSchema, responseSchema: ElevenLabsWebSessionResultSchema };
export function capElevenLabsWebPath(agentId) { return capElevenLabsAgentPath(agentId) + '/web'; }
export function capElevenLabsWebSessionPath(agentId) { return capElevenLabsWebPath(agentId) + '/session'; }
export const ELEVENLABS_WEB_PUBLIC_PAGE_PATH = '/parla/:linkId';
export function elevenLabsWebPublicPath(linkId) { return ELEVENLABS_WEB_PUBLIC_PAGE_PATH.replace(':linkId', encodeURIComponent(AgentManagementRequestIdSchema.parse(linkId))); }
//# sourceMappingURL=internal-capability-elevenlabs-web.js.map