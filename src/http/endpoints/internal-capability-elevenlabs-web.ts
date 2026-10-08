// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration generation.
import { z } from 'zod';
import { AgentManagementRequestIdSchema } from '../../agent/agent-management.js';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import { capElevenLabsAgentPath } from './internal-capability-elevenlabs.js';
import { ElevenLabsWebPolicyChangeSchema, ElevenLabsWebPolicyResultSchema } from '../../capability/agent-elevenlabs/web-channel.js';
import { ElevenLabsWebAdmissionSnapshotSchema, ElevenLabsWebSessionRequestSchema, ElevenLabsWebSessionResultSchema } from '../../capability/agent-elevenlabs/web-session.js';
import { ElevenLabsWebCatalogSchema } from '../../capability/agent-elevenlabs/web-catalog.js';

/** Forge -> existing cap-agent-elevenlabs; service auth is mandatory, never browser-supplied authority. */
const internal = { authType: 'secret' as const, paramsSchema: CapabilityAgentParamsSchema };
export const elevenLabsWebSnapshotContract = { ...internal, method: 'GET' as const, path: '/internal/capability/agents/:agentId/elevenlabs/web' as const, responseSchema: ElevenLabsWebAdmissionSnapshotSchema } as const;
export const elevenLabsWebPolicyContract = { ...internal, method: 'PUT' as const, path: '/internal/capability/agents/:agentId/elevenlabs/web/policy' as const, bodySchema: ElevenLabsWebPolicyChangeSchema, responseSchema: ElevenLabsWebPolicyResultSchema } as const;
export const elevenLabsWebCatalogContract = { ...internal, method: 'GET' as const, path: '/internal/capability/agents/:agentId/elevenlabs/web/catalog' as const, responseSchema: ElevenLabsWebCatalogSchema } as const;
export const elevenLabsWebSessionContract = { ...internal, method: 'POST' as const, path: '/internal/capability/agents/:agentId/elevenlabs/web/session' as const, bodySchema: ElevenLabsWebSessionRequestSchema, responseSchema: ElevenLabsWebSessionResultSchema } as const;
export function capElevenLabsWebPath(agentId: string): string { return capElevenLabsAgentPath(agentId) + '/web'; }
export function capElevenLabsWebSessionPath(agentId: string): string { return capElevenLabsWebPath(agentId) + '/session'; }

export const ELEVENLABS_WEB_PUBLIC_PAGE_PATH = '/parla/:linkId' as const;
export function elevenLabsWebPublicPath(linkId: string): string { return ELEVENLABS_WEB_PUBLIC_PAGE_PATH.replace(':linkId', encodeURIComponent(AgentManagementRequestIdSchema.parse(linkId))); }
