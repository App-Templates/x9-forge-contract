import type { AuthInternalSecret, AuthInternalToken, AuthNone, EndpointAuthType } from '../auth/auth-headers.js';
import type { BridgeErrorResponse } from './response.js';
import type { ListAgentsResponse } from './endpoints/internal-agents-list.js';
import { ReloadAgentParamsSchema, ReloadAgentResponseSchema, type ReloadAgentResponse } from './endpoints/internal-agents-reload.js';
import { StopAgentParamsSchema, StopAgentResponseSchema, type StopAgentResponse } from './endpoints/internal-agents-stop.js';
import { InternalTurnRequestSchema, InternalTurnResponseSchema, type InternalTurnRequest, type InternalTurnResponse } from './endpoints/internal-turn.js';
import { InternalQueryRequestSchema, InternalQueryResponseSchema, type InternalQueryRequest, type InternalQueryResponse } from './endpoints/internal-query.js';
import { PostCallPayloadSchema, PostCallResponseSchema, type PostCallPayload, type PostCallResponse } from './endpoints/webhook-post-call.js';
import { VoiceRegisterRequestSchema, VoiceRegisterResponseSchema, type VoiceRegisterRequest, type VoiceRegisterResponse } from './endpoints/voice-register.js';
import { parseSseStream } from './sse-parser.js';
import type { ParsedSseEvent } from './sse-parser.js';

/**
 * Maps an EndpointAuthType string to the required auth header type.
 * This is the core compile-time enforcement mechanism:
 * - 'secret' endpoints require AuthInternalSecret headers
 * - 'token' endpoints require AuthInternalToken headers
 * - 'none' endpoints require no auth headers
 */
export type AuthForEndpoint<T extends EndpointAuthType> =
  T extends 'secret' ? AuthInternalSecret :
  T extends 'token' ? AuthInternalToken :
  T extends 'none' ? AuthNone :
  never;

/**
 * Configuration for creating a bridge client instance.
 */
export interface BridgeClientConfig<A extends 'secret' | 'token'> {
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
export class BridgeHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly response: BridgeErrorResponse | null,
  ) {
    super(
      response
        ? `Bridge HTTP ${status}: [${response.code}] ${response.message}`
        : `Bridge HTTP ${status}`,
    );
    this.name = 'BridgeHttpError';
  }
}

/**
 * Base bridge client shared between secret and token variants. Exposes the
 * generic `request<T>()` method plus auth type introspection.
 */
export interface BaseBridgeClient<A extends 'secret' | 'token'> {
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
  internalTurnStream(
    body: InternalTurnRequest,
    signal?: AbortSignal,
  ): Promise<AsyncGenerator<ParsedSseEvent>>;
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
 * Conditional client type: `createBridgeClient<'secret'>` returns a
 * `SecretBridgeClient`, `<'token'>` returns a `TokenBridgeClient`.
 *
 * The discriminated return type is what enforces Bug #15 at compile-time:
 * you cannot call `voiceRegister` on a secret client, nor `listAgents` on
 * a token client.
 */
export type BridgeClient<A extends 'secret' | 'token' = 'secret' | 'token'> =
  A extends 'secret' ? SecretBridgeClient :
  A extends 'token' ? TokenBridgeClient :
  never;

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
 * ```
 */
export function createBridgeClient<A extends 'secret' | 'token'>(
  config: BridgeClientConfig<A>,
): BridgeClient<A> {
  const { baseUrl, auth } = config;

  async function request<T = unknown>(options: BridgeRequestOptions): Promise<T> {
    const url = `${baseUrl.replace(/\/+$/, '')}${options.path}`;
    const headers: Record<string, string> = {
      ...auth,
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    };

    const init: RequestInit = {
      method: options.method,
      headers,
    };
    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }
    if (options.signal !== undefined) {
      init.signal = options.signal;
    }

    const res = await fetch(url, init);

    if (!res.ok) {
      let errorBody: BridgeErrorResponse | null = null;
      try {
        errorBody = (await res.json()) as BridgeErrorResponse;
      } catch {
        // Response body is not JSON — errorBody stays null
      }
      throw new BridgeHttpError(res.status, errorBody);
    }

    return (await res.json()) as T;
  }

  const isSecret = 'X-Internal-Secret' in auth;

  if (isSecret) {
    const secretClient: SecretBridgeClient = {
      request,
      get authType(): 'secret' {
        return 'secret';
      },
      async listAgents(): Promise<ListAgentsResponse> {
        return request<ListAgentsResponse>({ method: 'GET', path: '/internal/agents' });
      },
      async reloadAgent(agentId: string): Promise<ReloadAgentResponse> {
        const { agentId: safe } = ReloadAgentParamsSchema.parse({ agentId });
        const raw = await request<unknown>({
          method: 'POST',
          path: `/internal/agents/${safe}/reload`,
        });
        return ReloadAgentResponseSchema.parse(raw);
      },
      async stopAgent(agentId: string): Promise<StopAgentResponse> {
        const { agentId: safe } = StopAgentParamsSchema.parse({ agentId });
        const raw = await request<unknown>({
          method: 'POST',
          path: `/internal/agents/${safe}/stop`,
        });
        return StopAgentResponseSchema.parse(raw);
      },
      async internalTurn(body: InternalTurnRequest): Promise<InternalTurnResponse> {
        const safeBody = InternalTurnRequestSchema.parse(body);
        const raw = await request<unknown>({ method: 'POST', path: '/internal/turn', body: safeBody });
        return InternalTurnResponseSchema.parse(raw);
      },
      async internalQuery(body: InternalQueryRequest): Promise<InternalQueryResponse> {
        const safeBody = InternalQueryRequestSchema.parse(body);
        const raw = await request<unknown>({ method: 'POST', path: '/internal/query', body: safeBody });
        return InternalQueryResponseSchema.parse(raw);
      },
      async internalTurnStream(
        body: InternalTurnRequest,
        signal?: AbortSignal,
      ): Promise<AsyncGenerator<ParsedSseEvent>> {
        const url = `${baseUrl.replace(/\/+$/, '')}/internal/turn/stream`;
        const headers: Record<string, string> = {
          ...auth,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };

        const init: RequestInit = {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        };
        if (signal !== undefined) {
          init.signal = signal;
        }

        const res = await fetch(url, init);

        if (!res.ok) {
          let errorBody: BridgeErrorResponse | null = null;
          try {
            errorBody = (await res.json()) as BridgeErrorResponse;
          } catch {
            // Response body is not JSON — errorBody stays null
          }
          throw new BridgeHttpError(res.status, errorBody);
        }

        if (!res.body) {
          throw new Error('SSE response has no body stream');
        }

        return parseSseStream(res.body);
      },
    };
    return secretClient as BridgeClient<A>;
  }

  const tokenClient: TokenBridgeClient = {
    request,
    get authType(): 'token' {
      return 'token';
    },
    async postCallWebhook(body: PostCallPayload): Promise<PostCallResponse> {
      const safeBody = PostCallPayloadSchema.parse(body);
      const raw = await request<unknown>({ method: 'POST', path: '/webhook/post-call', body: safeBody });
      return PostCallResponseSchema.parse(raw);
    },
    async voiceRegister(body: VoiceRegisterRequest): Promise<VoiceRegisterResponse> {
      const safeBody = VoiceRegisterRequestSchema.parse(body);
      const raw = await request<unknown>({
        method: 'POST',
        path: '/api/voice/register',
        body: safeBody,
      });
      return VoiceRegisterResponseSchema.parse(raw);
    },
  };
  return tokenClient as BridgeClient<A>;
}
