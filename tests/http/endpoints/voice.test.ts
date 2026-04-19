import { describe, it, expect } from 'vitest';
import {
  FORGE_VOICE_WEBHOOK_POST_CALL_PATH,
  FORGE_VOICE_WEBHOOK_POST_CALL_METHOD,
  CAP_VOICE_INTERNAL_POST_CALL_PATH,
  CAP_VOICE_INTERNAL_POST_CALL_METHOD,
  CAP_VOICE_CALL_START_PATH,
  CAP_VOICE_CALL_START_METHOD,
  CAP_VOICE_CALL_TOOL_PATH,
  CAP_VOICE_CALL_TOOL_METHOD,
  CAP_VOICE_CALL_TOOL_PATHS,
} from '../../../src/http/endpoints/voice.js';
import { VoiceToolNameSchema } from '../../../src/capability/voice/tools.js';

describe('Phase 42 voice endpoint constants — R-14 compliance', () => {
  it('FORGE_VOICE_WEBHOOK_POST_CALL_PATH matches ADR §6.1 default', () => {
    expect(FORGE_VOICE_WEBHOOK_POST_CALL_PATH).toBe('/webhooks/elevenlabs/post-call');
  });

  it('FORGE_VOICE_WEBHOOK_POST_CALL_METHOD is POST', () => {
    expect(FORGE_VOICE_WEBHOOK_POST_CALL_METHOD).toBe('POST');
  });

  it('CAP_VOICE_INTERNAL_POST_CALL_PATH matches ADR §6.2 default', () => {
    expect(CAP_VOICE_INTERNAL_POST_CALL_PATH).toBe('/internal/voice/post-call');
  });

  it('CAP_VOICE_INTERNAL_POST_CALL_METHOD is POST', () => {
    expect(CAP_VOICE_INTERNAL_POST_CALL_METHOD).toBe('POST');
  });

  it('CAP_VOICE_CALL_START_PATH is /call-start', () => {
    expect(CAP_VOICE_CALL_START_PATH).toBe('/call-start');
  });

  it('CAP_VOICE_CALL_START_METHOD is POST', () => {
    expect(CAP_VOICE_CALL_START_METHOD).toBe('POST');
  });
});

describe('CAP_VOICE_CALL_TOOL_PATH builder (R-14 typed)', () => {
  it('produces /call/search_context for search_context', () => {
    expect(CAP_VOICE_CALL_TOOL_PATH('search_context')).toBe('/call/search_context');
  });

  it('produces /call/create_calendar_event for create_calendar_event', () => {
    expect(CAP_VOICE_CALL_TOOL_PATH('create_calendar_event')).toBe('/call/create_calendar_event');
  });

  it('method is POST', () => {
    expect(CAP_VOICE_CALL_TOOL_METHOD).toBe('POST');
  });
});

describe('CAP_VOICE_CALL_TOOL_PATHS frozen map (all 12 D-16 tools)', () => {
  it('contains a path for every VoiceToolName enum option', () => {
    for (const tool of VoiceToolNameSchema.options) {
      expect(CAP_VOICE_CALL_TOOL_PATHS[tool]).toBe(`/call/${tool}`);
    }
  });

  it('has exactly 12 entries', () => {
    expect(Object.keys(CAP_VOICE_CALL_TOOL_PATHS)).toHaveLength(12);
  });

  it('is frozen (no runtime mutation)', () => {
    expect(Object.isFrozen(CAP_VOICE_CALL_TOOL_PATHS)).toBe(true);
  });
});
