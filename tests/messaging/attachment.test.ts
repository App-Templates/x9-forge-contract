import { describe, expect, it } from 'vitest';
import { IncomingMessageAttachmentSchema } from '../../src/messaging/attachment.js';

describe('IncomingMessageAttachmentSchema', () => {
  it('parses url-mode attachment', () => {
    const r = IncomingMessageAttachmentSchema.safeParse({
      mime: 'image/jpeg',
      filename: 'photo.jpg',
      size_bytes: 12345,
      url: 'https://api.agentmail.to/files/abc.jpg',
      inline_b64: null,
    });
    expect(r.success).toBe(true);
  });

  it('parses inline_b64-mode attachment', () => {
    const r = IncomingMessageAttachmentSchema.safeParse({
      mime: 'audio/ogg',
      filename: null,
      size_bytes: null,
      url: null,
      inline_b64: 'T2dnUwACAAAAAAAAAAA...',
    });
    expect(r.success).toBe(true);
  });

  it('does NOT enforce mutual exclusivity at schema level (consumer-side concern)', () => {
    // Documented behavior — IncomingMessageAttachmentSchema accepts both url
    // and inline_b64 set; downstream parsers (router-svc / cap-email) decide
    // strictness. Test pins the contract so future changes are intentional.
    const r = IncomingMessageAttachmentSchema.safeParse({
      mime: 'image/png',
      filename: null,
      size_bytes: 100,
      url: 'https://example.com/x.png',
      inline_b64: 'iVBORw0KGgo...',
    });
    expect(r.success).toBe(true);
  });

  it('rejects empty mime', () => {
    const r = IncomingMessageAttachmentSchema.safeParse({
      mime: '',
      filename: null,
      size_bytes: null,
      url: 'https://x.test/y',
      inline_b64: null,
    });
    expect(r.success).toBe(false);
  });

  it('rejects negative size_bytes', () => {
    const r = IncomingMessageAttachmentSchema.safeParse({
      mime: 'image/jpeg',
      filename: null,
      size_bytes: -1,
      url: 'https://x.test/y',
      inline_b64: null,
    });
    expect(r.success).toBe(false);
  });

  it('rejects non-URL strings for url', () => {
    const r = IncomingMessageAttachmentSchema.safeParse({
      mime: 'image/jpeg',
      filename: null,
      size_bytes: null,
      url: 'not-a-url',
      inline_b64: null,
    });
    expect(r.success).toBe(false);
  });
});
