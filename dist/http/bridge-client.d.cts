import type { AuthInternalSecret, AuthInternalToken, AuthNone, EndpointAuthType } from "../auth/auth-headers.cjs";
import type { BridgeErrorResponse } from "./response.cjs";
import type { ListAgentsResponse } from "./endpoints/internal-agents-list.cjs";
import { type ReloadAgentResponse } from "./endpoints/internal-agents-reload.cjs";
import { type StopAgentResponse } from "./endpoints/internal-agents-stop.cjs";
import { type InternalTurnRequest, type InternalTurnResponse } from "./endpoints/internal-turn.cjs";
import { type InternalQueryRequest, type InternalQueryResponse } from "./endpoints/internal-query.cjs";
import { type PostCallPayload, type PostCallResponse } from "./endpoints/webhook-post-call.cjs";
import { type VoiceRegisterRequest, type VoiceRegisterResponse } from "./endpoints/voice-register.cjs";
import { type CapManifestResponse } from "./endpoints/cap-manifest.cjs";
import { type CapEnvSchemaResponse } from "./endpoints/cap-env-schema.cjs";
import { type CapHealthResponse } from "./endpoints/cap-health.cjs";
import type { ParsedSseEvent } from "./sse-parser.cjs";
/**
 * Maps an EndpointAuthType string to the required auth header type.
 * This is the core compile-time enforcement mechanism:
 * - 'secret' endpoints require AuthInternalSecret headers
 * - 'token' endpoints require AuthInternalToken headers
 * - 'none' endpoints require no auth headers
 */
export type AuthForEndpoint<T extends EndpointAuthType> = T extends 'secret' ? AuthInternalSecret : T extends 'token' ? AuthInternalToken : T extends 'none' ? AuthNone : never;
/**
 * Configuration for creating a bridge client instance.
 */
export interface BridgeClientConfig<A extends 'secret' | 'token' | 'none'> {
    /** Base URL of the target service (e.g., 'http://agent-core:4100') */
    baseUrl: string;
    /** Auth headers to attach to every request. Type determines which endpoints are callable. */
    auth: AuthForEndpoint<A>;
}
/**
 * Request options for a bridge client call.
 */
export interface BridgeRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}
/**
 * Error thrown when a bridge HTTP call fails.
 */
export declare class BridgeHttpError extends Error {
    readonly status: number;
    readonly response: BridgeErrorResponse | null;
    constructor(status: number, response: BridgeErrorResponse | null);
}
/**
 * Base bridge client shared between secret, token, and noauth variants.
 * Exposes the generic `request<T>()` method plus auth type introspection.
 */
export interface BaseBridgeClient<A extends 'secret' | 'token' | 'none'> {
    /**
     * Generic request method. Returns parsed JSON body.
     * Throws BridgeHttpError on non-2xx status.
     */
    request<T = unknown>(options: BridgeRequestOptions): Promise<T>;
    /** The auth type this client was constructed with, for runtime inspection. */
    readonly authType: A;
}
/**
 * Secret-auth bridge client — used for Forge -> X9 agent-core /internal/* routes.
 * Exposes typed methods for every secret-auth endpoint contract.
 *
 * Compile-time guarantee: only secret-auth endpoints are callable; attempting
 * to call a token-auth method (e.g. `voiceRegister`) is a TS error.
 *
 * The `internalTurnStream()` method opens an SSE connection to
 * /internal/turn/stream and returns an AsyncGenerator of typed SSE frames
 * (see sse-frames.ts + sse-parser.ts).
 */
export interface SecretBridgeClient extends BaseBridgeClient<'secret'> {
    listAgents(): Promise<ListAgentsResponse>;
    reloadAgent(agentId: string): Promise<ReloadAgentResponse>;
    stopAgent(agentId: string): Promise<StopAgentResponse>;
    internalTurn(body: InternalTurnRequest): Promise<InternalTurnResponse>;
    internalQuery(body: InternalQueryRequest): Promise<InternalQueryResponse>;
    internalTurnStream(body: InternalTurnRequest, signal?: AbortSignal): Promise<AsyncGenerator<ParsedSseEvent>>;
}
/**
 * Token-auth bridge client — used for cross-repo voice/webhook flows.
 * Exposes typed methods for every token-auth endpoint contract.
 *
 * Compile-time guarantee: only token-auth endpoints are callable; attempting
 * to call a secret-auth method (e.g. `listAgents`) is a TS error.
 */
export interface TokenBridgeClient extends BaseBridgeClient<'token'> {
    postCallWebhook(body: PostCallPayload): Promise<PostCallResponse>;
    voiceRegister(body: VoiceRegisterRequest): Promise<VoiceRegisterResponse>;
}
/**
 * No-auth bridge client — used for capability discovery endpoints
 * (`GET /manifest`, `GET /env-schema`, `GET /health`). Each capability service
 * mounts these routes at root, so the capability identity is conveyed by the
 * caller's `baseUrl` (e.g. `http://cap-voice:3500`), not a path segment.
 *
 * Compile-time guarantee: only noauth endpoints are callable; attempting to
 * call a secret- or token-auth method (e.g. `listAgents`, `voiceRegister`) is
 * a TS error.
 */
export interface NoAuthBridgeClient extends BaseBridgeClient<'none'> {
    capManifest(signal?: AbortSignal): Promise<CapManifestResponse>;
    capEnvSchema(signal?: AbortSignal): Promise<CapEnvSchemaResponse>;
    capHealth(signal?: AbortSignal): Promise<CapHealthResponse>;
}
/**
 * Conditional client type: `createBridgeClient<'secret'>` returns a
 * `SecretBridgeClient`, `<'token'>` returns a `TokenBridgeClient`,
 * `<'none'>` returns a `NoAuthBridgeClient`.
 *
 * The discriminated return type is what enforces Bug #15 at compile-time:
 * you cannot call `voiceRegister` on a secret client, `listAgents` on a
 * token client, or any auth'd method on a noauth client.
 */
export type BridgeClient<A extends 'secret' | 'token' | 'none' = 'secret' | 'token' | 'none'> = A extends 'secret' ? SecretBridgeClient : A extends 'token' ? TokenBridgeClient : A extends 'none' ? NoAuthBridgeClient : never;
/**
 * Typed HTTP client for cross-repo bridge calls.
 * Zero external dependencies — uses native fetch.
 *
 * Auth enforcement: the client is parameterized by auth type at construction.
 * A 'secret'-client can only be created with AuthInternalSecret headers.
 * A 'token'-client can only be created with AuthInternalToken headers.
 * Phase 4 adds endpoint-specific methods that further constrain which
 * client type can call which endpoint.
 *
 * Requirement: HTTP-12 (skeleton, Phase 3), HTTP-01..HTTP-11 (typed methods,
 * Phase 4), AUTH-04 (compile-time enforcement).
 *
 * @example
 * ```typescript
 * // Secret-auth client for agent-core /internal/* routes
 * const client = createBridgeClient({
 *   baseUrl: 'http://agent-core:4100',
 *   auth: { 'X-Internal-Secret': process.env.X9_INTERNAL_SECRET! },
 * });
 * await client.listAgents();              // ✓ OK
 * await client.reloadAgent('stefano');    // ✓ OK
 * // await client.voiceRegister({...});   // ✗ TS2339
 *
 * // Token-auth client for voice webhook forwarding
 * const voiceClient = createBridgeClient({
 *   baseUrl: 'http://cap-voice:3500',
 *   auth: { 'X-Internal-Token': x9InternalSecret },
 * });
 * await voiceClient.postCallWebhook(payload);  // ✓ OK
 * // await voiceClient.listAgents();           // ✗ TS2339
 *
 * // No-auth client for capability discovery (manifest / env-schema / health)
 * const capClient = createBridgeClient<'none'>({
 *   baseUrl: 'http://cap-voice:3500',
 *   auth: {},
 * });
 * await capClient.capManifest();               // ✓ OK
 * // await capClient.listAgents();             // ✗ TS2339
 * ```
 */
export declare function createBridgeClient<A extends 'secret' | 'token' | 'none'>(config: BridgeClientConfig<A>): BridgeClient<A>;
//# sourceMappingURL=bridge-client.d.ts.map