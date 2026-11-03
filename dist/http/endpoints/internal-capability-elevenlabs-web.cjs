"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELEVENLABS_WEB_PUBLIC_PAGE_PATH = exports.elevenLabsWebSessionContract = exports.elevenLabsWebCatalogContract = exports.elevenLabsWebPolicyContract = exports.elevenLabsWebSnapshotContract = void 0;
exports.capElevenLabsWebPath = capElevenLabsWebPath;
exports.capElevenLabsWebSessionPath = capElevenLabsWebSessionPath;
exports.elevenLabsWebPublicPath = elevenLabsWebPublicPath;
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const internal_capability_elevenlabs_js_1 = require("./internal-capability-elevenlabs.cjs");
const web_channel_js_1 = require("../../capability/agent-elevenlabs/web-channel.cjs");
const web_session_js_1 = require("../../capability/agent-elevenlabs/web-session.cjs");
const web_catalog_js_1 = require("../../capability/agent-elevenlabs/web-catalog.cjs");
/** Forge -> existing cap-agent-elevenlabs; service auth is mandatory, never browser-supplied authority. */
const internal = { authType: 'secret', paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema };
exports.elevenLabsWebSnapshotContract = { ...internal, method: 'GET', path: '/internal/capability/agents/:agentId/elevenlabs/web', responseSchema: web_session_js_1.ElevenLabsWebAdmissionSnapshotSchema };
exports.elevenLabsWebPolicyContract = { ...internal, method: 'PUT', path: '/internal/capability/agents/:agentId/elevenlabs/web/policy', bodySchema: web_channel_js_1.ElevenLabsWebPolicyChangeSchema, responseSchema: web_channel_js_1.ElevenLabsWebPolicyResultSchema };
exports.elevenLabsWebCatalogContract = { ...internal, method: 'GET', path: '/internal/capability/agents/:agentId/elevenlabs/web/catalog', responseSchema: web_catalog_js_1.ElevenLabsWebCatalogSchema };
exports.elevenLabsWebSessionContract = { ...internal, method: 'POST', path: '/internal/capability/agents/:agentId/elevenlabs/web/session', bodySchema: web_session_js_1.ElevenLabsWebSessionRequestSchema, responseSchema: web_session_js_1.ElevenLabsWebSessionResultSchema };
function capElevenLabsWebPath(agentId) { return (0, internal_capability_elevenlabs_js_1.capElevenLabsAgentPath)(agentId) + '/web'; }
function capElevenLabsWebSessionPath(agentId) { return capElevenLabsWebPath(agentId) + '/session'; }
exports.ELEVENLABS_WEB_PUBLIC_PAGE_PATH = '/parla/:linkId';
function elevenLabsWebPublicPath(linkId) { return exports.ELEVENLABS_WEB_PUBLIC_PAGE_PATH.replace(':linkId', encodeURIComponent(agent_management_js_1.AgentManagementRequestIdSchema.parse(linkId))); }
//# sourceMappingURL=internal-capability-elevenlabs-web.js.map