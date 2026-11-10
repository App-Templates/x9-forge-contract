import { describe, expect, it } from 'vitest';
import {
  VIDEO_STUDIO_ACCESS_TTL_SECONDS,
  VIDEO_STUDIO_SESSION_TTL_SECONDS,
  VideoStudioOpenResponseSchema,
  VideoStudioOpenToolInputSchema,
} from '../../../src/capability/video/index.js';

const response = {
  url: `https://x9-officina-studio.srv1485914.hstgr.cloud/accesso/${'a'.repeat(43)}`,
  expiresAt: '2026-11-10T18:15:00.000Z',
  sessionHours: 12,
};

describe('video_studio_open input', () => {
  it('accepts an empty input with identity supplied by the envelope', () => {
    expect(VideoStudioOpenToolInputSchema.parse({})).toEqual({});
  });

  it.each([
    ['tenantId', { tenantId: '1' }],
    ['url', { url: 'x' }],
  ])('rejects model-supplied %s', (_name, input) => {
    expect(VideoStudioOpenToolInputSchema.safeParse(input).success).toBe(false);
  });
});

describe('video_studio_open response', () => {
  it('accepts an HTTPS access link with a 43-character base64url token', () => {
    expect(VideoStudioOpenResponseSchema.parse(response)).toEqual(response);
  });

  it('accepts an expiry with an explicit timezone offset', () => {
    expect(VideoStudioOpenResponseSchema.safeParse({
      ...response,
      expiresAt: '2026-11-10T19:15:00.000+01:00',
    }).success).toBe(true);
  });

  it.each([
    ['HTTP access link', { ...response, url: response.url.replace('https://', 'http://') }],
    ['URL over 500 characters', { ...response, url: `https://example.com/${'a'.repeat(500)}` }],
    ['expiry without timezone', { ...response, expiresAt: '2026-11-10T18:15:00.000' }],
    ['24-hour session', { ...response, sessionHours: 24 }],
    ['extra field', { ...response, extra: true }],
  ])('rejects %s', (_name, input) => {
    expect(VideoStudioOpenResponseSchema.safeParse(input).success).toBe(false);
  });

  it('pins the access and session lifetimes', () => {
    expect(VIDEO_STUDIO_ACCESS_TTL_SECONDS).toBe(900);
    expect(VIDEO_STUDIO_SESSION_TTL_SECONDS).toBe(12 * 3600);
  });
});
