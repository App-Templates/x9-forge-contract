import { describe, expect, it } from 'vitest';
import {
  InternalPaperclipSeatNativeWakeResponseSchema,
  InternalPaperclipSeatReplyWakeResponseSchema,
  InternalPaperclipSeatWakeErrorResponseSchema,
  internalPaperclipSeatNativeWakeContract,
  internalPaperclipSeatReplyWakeContract,
} from '../src/http/endpoints/internal-paperclip-seats.js';

const contracts = [
  ['reply-wake', internalPaperclipSeatReplyWakeContract, InternalPaperclipSeatReplyWakeResponseSchema],
  ['native-wake', internalPaperclipSeatNativeWakeContract, InternalPaperclipSeatNativeWakeResponseSchema],
] as const;

describe('s6351 sveglia-tempo-scaduto: seat wake error body', () => {
  for (const [name, contract] of contracts) {
    it(`${name} accepts wake_timeout and today's paperclip_unavailable body`, () => {
      const schema = contract.errorResponseSchema;
      expect(schema.safeParse({ ok: false, error: 'wake_timeout' }).success).toBe(true);
      expect(schema.safeParse({ ok: false, error: 'paperclip_unavailable' }).success).toBe(true);
    });

    it(`${name} rejects invented codes, ok:true, extra keys and a missing error`, () => {
      const schema = contract.errorResponseSchema;
      expect(schema.safeParse({ ok: false, error: 'timeout' }).success).toBe(false);
      expect(schema.safeParse({ ok: true, error: 'wake_timeout' }).success).toBe(false);
      expect(schema.safeParse({ ok: false, error: 'wake_timeout', detail: 'x' }).success).toBe(false);
      expect(schema.safeParse({ ok: false }).success).toBe(false);
    });

    it(`${name} keeps method, auth and success response`, () => {
      expect(contract.method).toBe('POST');
      expect(contract.authType).toBe('secret');
    });
  }

  it('both contracts share one error schema and keep their success schemas', () => {
    expect(internalPaperclipSeatReplyWakeContract.errorResponseSchema).toBe(InternalPaperclipSeatWakeErrorResponseSchema);
    expect(internalPaperclipSeatNativeWakeContract.errorResponseSchema).toBe(InternalPaperclipSeatWakeErrorResponseSchema);
    for (const [, contract, success] of contracts) expect(contract.responseSchema).toBe(success);
    expect(internalPaperclipSeatReplyWakeContract.path).not.toBe(internalPaperclipSeatNativeWakeContract.path);
  });
});
