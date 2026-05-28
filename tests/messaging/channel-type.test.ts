import { describe, expect, it } from 'vitest';
import { ChannelTypeSchema } from '../../src/messaging/channel-type.js';

describe('ChannelTypeSchema', () => {
  it.each(['telegram', 'email', 'voice', 'whatsapp'])('accepts canonical channel %s', (ch) => {
    expect(ChannelTypeSchema.safeParse(ch).success).toBe(true);
  });

  it.each(['sms', 'discord', 'fax', '', 'TELEGRAM', 'Email'])(
    'rejects non-canonical channel %s',
    (ch) => {
      expect(ChannelTypeSchema.safeParse(ch).success).toBe(false);
    },
  );

  it('rejects non-string inputs', () => {
    expect(ChannelTypeSchema.safeParse(null).success).toBe(false);
    expect(ChannelTypeSchema.safeParse(42).success).toBe(false);
    expect(ChannelTypeSchema.safeParse({}).success).toBe(false);
  });
});
