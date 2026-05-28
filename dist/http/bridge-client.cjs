"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeHttpError = void 0;
exports.createBridgeClient = createBridgeClient;
const internal_agents_reload_js_1 = require("./endpoints/internal-agents-reload.cjs");
const internal_agents_stop_js_1 = require("./endpoints/internal-agents-stop.cjs");
const internal_turn_js_1 = require("./endpoints/internal-turn.cjs");
const internal_query_js_1 = require("./endpoints/internal-query.cjs");
const webhook_post_call_js_1 = require("./endpoints/webhook-post-call.cjs");
const voice_register_js_1 = require("./endpoints/voice-register.cjs");
const cap_manifest_js_1 = require("./endpoints/cap-manifest.cjs");
const cap_env_schema_js_1 = require("./endpoints/cap-env-schema.cjs");
const cap_health_js_1 = require("./endpoints/cap-health.cjs");
const sse_parser_js_1 = require("./sse-parser.cjs");
/**
 * Error thrown when a bridge HTTP call fails.
 */
class BridgeHttpError extends Error {
    status;
    response;
    constructor(status, response) {
        super(response
            ? `Bridge HTTP ${status}: [${response.code}] ${response.message}`
            : `Bridge HTTP ${status}`);
        this.status = status;
        this.response = response;
        this.name = 'BridgeHttpError';
    }
}
exports.BridgeHttpError = BridgeHttpError;
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
function createBridgeClient(config) {
    const { baseUrl, auth } = config;
    async function request(options) {
        const url = `${baseUrl.replace(/\/+$/, '')}${options.path}`;
        const headers = {
            ...options.headers,
            ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...auth,
        };
        const init = {
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
            let errorBody = null;
            try {
                errorBody = (await res.json());
            }
            catch {
                // Response body is not JSON — errorBody stays null
            }
            throw new BridgeHttpError(res.status, errorBody);
        }
        return (await res.json());
    }
    const isSecret = 'X-Internal-Secret' in auth;
    const isToken = 'X-Internal-Token' in auth;
    if (isSecret) {
        const secretClient = {
            request,
            get authType() {
                return 'secret';
            },
            async listAgents() {
                return request({ method: 'GET', path: '/internal/agents' });
            },
            async reloadAgent(agentId) {
                const { agentId: safe } = internal_agents_reload_js_1.ReloadAgentParamsSchema.parse({ agentId });
                const raw = await request({
                    method: 'POST',
                    path: `/internal/agents/${safe}/reload`,
                });
                return internal_agents_reload_js_1.ReloadAgentResponseSchema.parse(raw);
            },
            async stopAgent(agentId) {
                const { agentId: safe } = internal_agents_stop_js_1.StopAgentParamsSchema.parse({ agentId });
                const raw = await request({
                    method: 'POST',
                    path: `/internal/agents/${safe}/stop`,
                });
                return internal_agents_stop_js_1.StopAgentResponseSchema.parse(raw);
            },
            async internalTurn(body) {
                const safeBody = internal_turn_js_1.InternalTurnRequestSchema.parse(body);
                const raw = await request({ method: 'POST', path: '/internal/turn', body: safeBody });
                return internal_turn_js_1.InternalTurnResponseSchema.parse(raw);
            },
            async internalQuery(body) {
                const safeBody = internal_query_js_1.InternalQueryRequestSchema.parse(body);
                const raw = await request({ method: 'POST', path: '/internal/query', body: safeBody });
                return internal_query_js_1.InternalQueryResponseSchema.parse(raw);
            },
            async internalTurnStream(body, signal) {
                const url = `${baseUrl.replace(/\/+$/, '')}/internal/turn/stream`;
                const headers = {
                    ...auth,
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                };
                const init = {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                };
                if (signal !== undefined) {
                    init.signal = signal;
                }
                const res = await fetch(url, init);
                if (!res.ok) {
                    let errorBody = null;
                    try {
                        errorBody = (await res.json());
                    }
                    catch {
                        // Response body is not JSON — errorBody stays null
                    }
                    throw new BridgeHttpError(res.status, errorBody);
                }
                if (!res.body) {
                    throw new Error('SSE response has no body stream');
                }
                return (0, sse_parser_js_1.parseSseStream)(res.body);
            },
        };
        return secretClient;
    }
    if (isToken) {
        const tokenClient = {
            request,
            get authType() {
                return 'token';
            },
            async postCallWebhook(body) {
                const safeBody = webhook_post_call_js_1.PostCallPayloadSchema.parse(body);
                const raw = await request({ method: 'POST', path: '/webhook/post-call', body: safeBody });
                return webhook_post_call_js_1.PostCallResponseSchema.parse(raw);
            },
            async voiceRegister(body) {
                const safeBody = voice_register_js_1.VoiceRegisterRequestSchema.parse(body);
                const raw = await request({
                    method: 'POST',
                    path: '/api/voice/register',
                    body: safeBody,
                });
                return voice_register_js_1.VoiceRegisterResponseSchema.parse(raw);
            },
        };
        return tokenClient;
    }
    // No-auth client: capability discovery endpoints (manifest / env-schema / health).
    // AuthNone = Record<string, never>, so neither secret nor token discriminator matched.
    const noAuthClient = {
        request,
        get authType() {
            return 'none';
        },
        async capManifest(signal) {
            const opts = { method: 'GET', path: '/manifest' };
            if (signal !== undefined)
                opts.signal = signal;
            const raw = await request(opts);
            return cap_manifest_js_1.CapManifestResponseSchema.parse(raw);
        },
        async capEnvSchema(signal) {
            const opts = { method: 'GET', path: '/env-schema' };
            if (signal !== undefined)
                opts.signal = signal;
            const raw = await request(opts);
            return cap_env_schema_js_1.CapEnvSchemaResponseSchema.parse(raw);
        },
        async capHealth(signal) {
            const opts = { method: 'GET', path: '/health' };
            if (signal !== undefined)
                opts.signal = signal;
            const raw = await request(opts);
            return cap_health_js_1.CapHealthResponseSchema.parse(raw);
        },
    };
    return noAuthClient;
}
//# sourceMappingURL=bridge-client.js.map