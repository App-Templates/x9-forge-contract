import { describe, expect, it } from 'vitest';
import { IncomingMessageEnvelopeSchema } from '../../src/messaging/incoming-message-envelope.js';

const baseValid = {
  message_id: 'agentmail-msg-abc-123',
  channel: 'email' as const,
  provider: 'agentmail' as const,
  agent_id: null,
  owner_id: null,
  tenant_id: null,
  session_id: null,
  from: 'stefano@gmail.com',
  to: 'giovanni.bellini@agentmail.to',
  body_text: 'Ciao Giovanni, ho ricevuto il tuo messaggio.',
  body_html: null,
  attachments: [],
  reply_to_message_id: null,
  received_at: '2026-05-27T12:00:00+00:00',
  provider_event_hash: 'a'.repeat(64),
  signature_valid: true as const,
  raw_provider_event: { type: 'event', eventType: 'message.received' },
};

describe('IncomingMessageEnvelopeSchema — happy paths', () => {
  it('parses minimal email envelope (all resolution fields null)', () => {
    expect(IncomingMessageEnvelopeSchema.safeParse(baseValid).success).toBe(true);
  });

  it('parses resolved envelope (agent_id/owner_id/tenant_id/session_id all set)', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      agent_id: 'agent-bellini-001',
      owner_id: 'owner-stefano',
      tenant_id: 'tenant-mvp',
      session_id: 'email-inbox123-thread456',
    });
    expect(r.success).toBe(true);
  });

  it('parses telegram envelope with chatId string from', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      channel: 'telegram',
      provider: 'telegram',
      from: 'tg:6244251507',
      to: 'tg:parallel_char_bellini_giov_bot',
      session_id: 'tg-router-bellini-6244251507',
    });
    expect(r.success).toBe(true);
  });

  it('parses with one image attachment + body_html', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      body_html: '<p>Ciao Giovanni</p>',
      attachments: [
        {
          mime: 'image/jpeg',
          filename: 'sketch.jpg',
          size_bytes: 200_000,
          url: 'https://api.agentmail.to/files/x.jpg',
          inline_b64: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });
});

describe('IncomingMessageEnvelopeSchema — STRICT boundary enforcement', () => {
  it('rejects signature_valid=false (boundary contract: only validated events propagate)', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      signature_valid: false,
    });
    expect(r.success).toBe(false);
  });

  it('rejects unknown channel', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({ ...baseValid, channel: 'fax' });
    expect(r.success).toBe(false);
  });

  it('rejects unknown provider', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      provider: 'sendgrid',
    });
    expect(r.success).toBe(false);
  });

  it('rejects missing body_text (always required)', () => {
    const { body_text: _omit, ...rest } = baseValid;
    void _omit;
    expect(IncomingMessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty message_id', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({ ...baseValid, message_id: '' });
    expect(r.success).toBe(false);
  });

  it('rejects body_text >65536 chars', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      body_text: 'a'.repeat(65_537),
    });
    expect(r.success).toBe(false);
  });

  it('rejects session_id violating /^[a-z0-9-]{1,64}$/ (length>64)', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      session_id: 'a'.repeat(65),
    });
    expect(r.success).toBe(false);
  });

  it('rejects malformed received_at (no offset)', () => {
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      received_at: '2026-05-27T12:00:00',
    });
    expect(r.success).toBe(false);
  });

  it('rejects attachments >20', () => {
    const tooMany = Array.from({ length: 21 }, () => ({
      mime: 'image/jpeg',
      filename: null,
      size_bytes: null,
      url: 'https://x.test/a.jpg',
      inline_b64: null,
    }));
    const r = IncomingMessageEnvelopeSchema.safeParse({
      ...baseValid,
      attachments: tooMany,
    });
    expect(r.success).toBe(false);
  });
});
