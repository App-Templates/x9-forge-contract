import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ForgeElevenLabsWebParamsSchema as Params,
  forgeElevenLabsWebMetadataContract as Metadata, forgeElevenLabsWebSessionContract as Session,
  forgeElevenLabsWebMetadataPath, forgeElevenLabsWebSessionPath, isElevenLabsWebBrowserRequestForLink as matches,
} from '../../../src/http/endpoints/forge-elevenlabs-web.js';
import {
  ElevenLabsWebBrowserRequestSchema as Request, ElevenLabsWebBrowserSessionSchema as BrowserSession,
  ElevenLabsWebBrowserMetadataSchema as BrowserMetadata, ElevenLabsWebBrowserErrorResponseSchema as BrowserError,
} from '../../../src/capability/agent-elevenlabs/web-browser.js';
const request = { requestId: 'browser-request', linkId: 'browser-link' };

describe('Forge canonical ElevenLabs browser facade', () => {
  it('describes only the canonical metadata and session paths with server policy and no caching', () => {
    expect(Metadata).toMatchObject({ method: 'GET', path: '/api/parla/:linkId', authentication: 'optional-forge-session', authorization: 'server-web-policy', cacheControl: 'no-store' });
    expect(Session).toMatchObject({ method: 'POST', path: '/api/parla/:linkId/session', authentication: 'optional-forge-session', authorization: 'server-web-policy', cacheControl: 'no-store' });
    expect(Metadata).not.toHaveProperty('bodySchema');
    expect(Metadata).not.toHaveProperty('authType');
    expect(Session).not.toHaveProperty('authType');
  });
  it('reuses existing canonical browser schemas and the shared strict params', () => {
    expect(Metadata.paramsSchema).toBe(Params); expect(Session.paramsSchema).toBe(Params);
    expect(Metadata.responseSchema).toBe(BrowserMetadata); expect(Session.responseSchema).toBe(BrowserSession);
    expect(Session.bodySchema).toBe(Request); expect(Metadata.errorResponseSchema).toBe(BrowserError); expect(Session.errorResponseSchema).toBe(BrowserError);
    expect(Params.shape.linkId).toBe(Request.shape.linkId);
    expect(Params.safeParse({ linkId: request.linkId, viewer: {} }).success).toBe(false);
  });
  it('builds encoded paths from the exact canonical link identifier', () => {
    const linkId = 'browser:link.0001';
    expect(forgeElevenLabsWebMetadataPath(linkId)).toBe('/api/parla/browser%3Alink.0001');
    expect(forgeElevenLabsWebSessionPath(linkId)).toBe('/api/parla/browser%3Alink.0001/session');
    expect(forgeElevenLabsWebMetadataPath(request.linkId)).toBe('/api/parla/browser-link');
  });
  it.each(['', 'short', '../another-link', 'browser/link', 'browser%2Flink', 'browser?link', 'browser#link', 'x'.repeat(129), null, {}])('refuses invalid link paths (%j)', linkId => {
    expect(() => forgeElevenLabsWebMetadataPath(linkId as string)).toThrow();
    expect(() => forgeElevenLabsWebSessionPath(linkId as string)).toThrow();
  });
  it('correlates the exact parsed body link with the path link without deriving authorization', () => {
    expect(matches(request, request.linkId)).toBe(true);
    expect(matches({ ...request, linkId: 'different-link' }, request.linkId)).toBe(false);
    expect(matches(request, 'different-link')).toBe(false);
    expect(matches(request, undefined)).toBe(false);
    expect(matches(null, request.linkId)).toBe(false);
    expect(matches({ ...request, requestId: 'short' }, request.linkId)).toBe(false);
    expect(matches({ ...request, linkId: '../browser-link' }, '../browser-link')).toBe(false);
  });
  it.each(['viewer', 'scope', 'agentIdentity', 'mapping', 'signedUrl', 'credentials', 'invitation'])('accepts no browser authority or transport field %s', key => {
    const raw = { ...request, [key]: {} };
    expect(Session.bodySchema.safeParse(raw).success).toBe(false);
    expect(matches(raw, request.linkId)).toBe(false);
  });
  it('keeps the existing public lease strict and transport-only', () => {
    const at = Date.parse('2026-10-10T12:00:00.000Z');
    const lease = { ok: true, ...request, issuedAt: new Date(at).toISOString(), expiresAt: new Date(at + 60_000).toISOString(),
      signedUrl: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-agent&conversation_signature=${randomUUID()}` };
    expect(Session.responseSchema.safeParse(lease).success).toBe(true);
    for (const key of ['viewer', 'scope', 'mapping', 'apiKey', 'bearer', 'credentials']) {
      expect(Session.responseSchema.safeParse({ ...lease, [key]: {} }).success).toBe(false);
    }
    expect(Session.responseSchema.safeParse({ ...lease, signedUrl: 'wss://foreign.example/socket' }).success).toBe(false);
    expect(Session.responseSchema.safeParse({ ...lease, expiresAt: lease.issuedAt }).success).toBe(false);
  });
});
