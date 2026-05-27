import { describe, expect, it } from 'vitest';
import { AgentTelegramBotSchema } from '../../src/messaging/agent-telegram-bot.js';

describe('AgentTelegramBotSchema', () => {
  it('parses canonical per-character bot config', () => {
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'agent-bellini-001',
      bot_username: 'parallel_char_bellini_giov_bot',
      bot_token_ref: 'vault://agent/agent-bellini-001/TELEGRAM_BOT_TOKEN',
      chat_allow_list: ['6244251507', '-1001234567890'],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(true);
  });

  it('rejects bot_username without _bot suffix (BotFather constraint)', () => {
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'parallel_char_bellini_giov', // missing _bot
      bot_token_ref: 'vault://x',
      chat_allow_list: [],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });

  it('rejects bot_username with invalid characters', () => {
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'parallel-char-bot', // dashes forbidden
      bot_token_ref: 'vault://x',
      chat_allow_list: [],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });

  it('rejects bot_username too short', () => {
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'x_bot', // 5 chars, satisfies min — bump to 4 to fail
      bot_token_ref: 'vault://x',
      chat_allow_list: [],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    // x_bot is exactly 5 chars — at the boundary, should pass
    expect(r.success).toBe(true);

    const r2 = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'abot', // 4 chars — below min
      bot_token_ref: 'vault://x',
      chat_allow_list: [],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r2.success).toBe(false);
  });

  it('rejects chat_allow_list entries that are not int strings', () => {
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'valid_bot',
      bot_token_ref: 'vault://x',
      chat_allow_list: ['abc'],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });

  it('accepts supergroup ids beyond Number.MAX_SAFE_INTEGER (string preservation)', () => {
    // Telegram supergroup ids exceed 2^53; verify the schema preserves them
    // as strings without loss.
    const supergroupId = '-100123456789012345';
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'valid_bot',
      bot_token_ref: 'vault://x',
      chat_allow_list: [supergroupId],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.chat_allow_list[0]).toBe(supergroupId);
    }
  });

  it('rejects empty bot_token_ref', () => {
    const r = AgentTelegramBotSchema.safeParse({
      agent_id: 'a',
      bot_username: 'valid_bot',
      bot_token_ref: '',
      chat_allow_list: [],
      created_at: '2026-05-27T08:00:00+00:00',
    });
    expect(r.success).toBe(false);
  });
});
