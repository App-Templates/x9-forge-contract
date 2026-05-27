import { describe, expect, it } from 'vitest';
import {
  webhookInboundTelegramContract,
  WebhookInboundTelegramResponseSchema,
} from '../../src/http/endpoints/webhook-inbound-telegram.js';
import {
  webhookInboundEmailContract,
  WebhookInboundEmailResponseSchema,
} from '../../src/http/endpoints/webhook-inbound-email.js';

describe('webhookInboundTelegramContract', () => {
  it('declares method+path+authType', () => {
    expect(webhookInboundTelegramContract.method).toBe('POST');
    expect(webhookInboundTelegramContract.path).toBe('/webhook/inbound/telegram');
    expect(webhookInboundTelegramContract.authType).toBe('external_provider');
  });

  it('accepts arbitrary unknown body (lenient external Telegram Update shape)', () => {
    const r = webhookInboundTelegramContract.bodySchema.safeParse({
      update_id: 999,
      message: { message_id: 1, from: { id: 6244251507 }, text: 'ciao' },
    });
    expect(r.success).toBe(true);
  });

  it('response schema requires received:true literal', () => {
    expect(WebhookInboundTelegramResponseSchema.safeParse({ received: true }).success).toBe(true);
    expect(WebhookInboundTelegramResponseSchema.safeParse({ received: false }).success).toBe(false);
  });
});

describe('webhookInboundEmailContract', () => {
  it('declares method+path+authType', () => {
    expect(webhookInboundEmailContract.method).toBe('POST');
    expect(webhookInboundEmailContract.path).toBe('/webhook/agentmail/inbound');
    expect(webhookInboundEmailContract.authType).toBe('external_provider');
  });

  it('accepts arbitrary unknown body (lenient external AgentMail event shape)', () => {
    const r = webhookInboundEmailContract.bodySchema.safeParse({
      type: 'event',
      eventType: 'message.received',
      eventId: 'evt_abc',
      message: { inboxId: 'inbox_x', from: 'a@b.test', to: ['c@d.test'] },
    });
    expect(r.success).toBe(true);
  });

  it('response schema requires received:true literal', () => {
    expect(WebhookInboundEmailResponseSchema.safeParse({ received: true }).success).toBe(true);
    expect(WebhookInboundEmailResponseSchema.safeParse({ received: false }).success).toBe(false);
  });
});
