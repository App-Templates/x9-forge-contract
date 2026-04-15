import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import {
  createBridgeClient,
  BridgeHttpError,
  type NoAuthBridgeClient,
} from '../../src/http/bridge-client.js';
import { capManifestContract } from '../../src/http/endpoints/cap-manifest.js';
import { capEnvSchemaContract } from '../../src/http/endpoints/cap-env-schema.js';
import { capHealthContract } from '../../src/http/endpoints/cap-health.js';

// --- Fixtures (shapes derived from src/capability/*.ts schema definitions) ---

const manifestFixture = {
  name: 'voice',
  version: '0.0.1',
  endpoint: 'http://cap-voice:3500',
  tools: [
    {
      name: 'voice_say',
      description: 'Speak text',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
};

const envSchemaFixture = {
  required: [
    {
      key: 'ELEVENLABS_API_KEY',
      description: 'ElevenLabs API key',
      secret: true,
      required: true,
    },
  ],
  optional: [],
};

const healthFixture = {
  status: 'healthy' as const,
  service: 'cap-voice',
  version: '0.0.1',
  uptime: 42,
  timestamp: '2026-04-15T12:00:00.000Z',
};

// --- fetch() mock helpers ---

function mockFetchOnce(body: unknown, status = 200): void {
  const res = new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => res),
  );
}

function captureFetch(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const spy = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', spy);
  return spy;
}

describe('NoAuthBridgeClient', () => {
  let client: NoAuthBridgeClient;

  beforeEach(() => {
    client = createBridgeClient<'none'>({
      baseUrl: 'http://cap-voice:3500',
      auth: {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes authType === "none"', () => {
    expect(client.authType).toBe('none');
  });

  it('capManifest() returns parsed CapabilityManifest from /manifest', async () => {
    const spy = captureFetch(manifestFixture);
    const result = await client.capManifest();
    expect(result.name).toBe('voice');
    expect(result.tools).toHaveLength(1);
    // Verify wire path
    const call = spy.mock.calls[0];
    expect(call?.[0]).toBe('http://cap-voice:3500/manifest');
    const init = call?.[1] as RequestInit | undefined;
    expect(init?.method).toBe('GET');
  });

  it('capEnvSchema() returns parsed EnvSchemaDoc from /env-schema', async () => {
    const spy = captureFetch(envSchemaFixture);
    const result = await client.capEnvSchema();
    expect(result.required).toHaveLength(1);
    expect(result.required[0]?.key).toBe('ELEVENLABS_API_KEY');
    expect(spy.mock.calls[0]?.[0]).toBe('http://cap-voice:3500/env-schema');
  });

  it('capHealth() returns parsed HealthStatus from /health', async () => {
    const spy = captureFetch(healthFixture);
    const result = await client.capHealth();
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('cap-voice');
    expect(spy.mock.calls[0]?.[0]).toBe('http://cap-voice:3500/health');
  });

  it('propagates AbortSignal on capManifest()', async () => {
    const spy = captureFetch(manifestFixture);
    const controller = new AbortController();
    await client.capManifest(controller.signal);
    const init = spy.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.signal).toBe(controller.signal);
  });

  it('throws ZodError when server returns invalid response shape', async () => {
    mockFetchOnce({ name: 'voice' /* missing version/endpoint/tools */ });
    await expect(client.capManifest()).rejects.toBeInstanceOf(z.ZodError);
  });

  it('throws BridgeHttpError on 500 with structured error body', async () => {
    mockFetchOnce(
      { ok: false, code: 'INTERNAL', message: 'boom' },
      500,
    );
    await expect(client.capHealth()).rejects.toBeInstanceOf(BridgeHttpError);
  });

  it('does NOT send X-Internal-Secret / X-Internal-Token headers', async () => {
    const spy = captureFetch(manifestFixture);
    await client.capManifest();
    const init = spy.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.['X-Internal-Secret']).toBeUndefined();
    expect(headers?.['X-Internal-Token']).toBeUndefined();
  });
});

describe('NoAuthBridgeClient — compile-time guards', () => {
  const noauthClient = createBridgeClient<'none'>({
    baseUrl: 'http://cap-voice:3500',
    auth: {},
  });

  it('noauth client rejects secret-only and token-only methods', () => {
    // These permanent @ts-expect-error directives fail `tsc` if the noauth
    // client ever accidentally gains secret/token methods. Turning a valid
    // property access into `@ts-expect-error` flips it to "unused directive".

    // @ts-expect-error — secret-only method not callable on noauth client
    const _noListAgents: typeof noauthClient.listAgents = undefined;
    // @ts-expect-error — secret-only method not callable on noauth client
    const _noReload: typeof noauthClient.reloadAgent = undefined;
    // @ts-expect-error — secret-only method not callable on noauth client
    const _noInternalTurn: typeof noauthClient.internalTurn = undefined;
    // @ts-expect-error — token-only method not callable on noauth client
    const _noVoiceRegister: typeof noauthClient.voiceRegister = undefined;
    // @ts-expect-error — token-only method not callable on noauth client
    const _noPostCall: typeof noauthClient.postCallWebhook = undefined;

    void _noListAgents;
    void _noReload;
    void _noInternalTurn;
    void _noVoiceRegister;
    void _noPostCall;

    expect(typeof noauthClient.capManifest).toBe('function');
    expect(typeof noauthClient.capEnvSchema).toBe('function');
    expect(typeof noauthClient.capHealth).toBe('function');
  });

  it('endpoint contract paths equal the real wire paths', () => {
    // Guards against re-introduction of the ':cap' path-prefix typo.
    // Capability services mount these routes at root; capability identity
    // is conveyed by the caller's baseUrl (Docker hostname).
    expect(capManifestContract.path).toBe('/manifest');
    expect(capEnvSchemaContract.path).toBe('/env-schema');
    expect(capHealthContract.path).toBe('/health');
  });
});
