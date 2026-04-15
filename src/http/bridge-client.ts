import type { AuthInternalSecret, AuthInternalToken, AuthNone, EndpointAuthType } from '../auth/auth-headers.js';
import type { BridgeErrorResponse } from './response.js';

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
 * Typed HTTP client for cross-repo bridge calls.
 * Zero external dependencies — uses native fetch.
 *
 * Auth enforcement: the client is parameterized by auth type at construction.
 * A 'secret'-client can only be created with AuthInternalSecret headers.
 * A 'token'-client can only be created with AuthInternalToken headers.
 * Phase 4 adds endpoint-specific methods that further constrain which
 * client type can call which endpoint.
 *
 * Requirement: HTTP-12 (skeleton), AUTH-04 (compile-time enforcement).
 *
 * @example
 * ```typescript
 * // Secret-auth client for agent-core /internal/* routes
 * const client = createBridgeClient({
 *   baseUrl: 'http://agent-core:4100',
 *   auth: { 'X-Internal-Secret': process.env.X9_INTERNAL_SECRET! },
 * });
 *
 * // Token-auth client for voice webhook forwarding
 * const voiceClient = createBridgeClient({
 *   baseUrl: 'http://cap-voice:3500',
 *   auth: { 'X-Internal-Token': x9InternalSecret },
 * });
 * ```
 */
export function createBridgeClient<A extends 'secret' | 'token'>(
  config: BridgeClientConfig<A>,
) {
  const { baseUrl, auth } = config;

  return {
    /**
     * Generic request method. Phase 4 adds endpoint-typed wrappers on top.
     * Returns parsed JSON body. Throws BridgeHttpError on non-2xx status.
     */
    async request<T = unknown>(options: BridgeRequestOptions): Promise<T> {
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
    },

    /** The auth type this client was constructed with, for runtime inspection. */
    get authType(): A {
      if ('X-Internal-Secret' in auth) return 'secret' as A;
      return 'token' as A;
    },
  };
}

/**
 * Type alias for the return type of createBridgeClient.
 * Useful for typing function parameters that accept a bridge client.
 */
export type BridgeClient<A extends 'secret' | 'token' = 'secret' | 'token'> = ReturnType<typeof createBridgeClient<A>>;
