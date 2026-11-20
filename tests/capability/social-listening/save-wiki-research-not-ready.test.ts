import { describe, it, expect } from 'vitest';
import { SocialTopicWikiToolErrorSchema } from '../../../src/capability/social-listening/index';

describe('social_topic_save_wiki research readiness errors', () => {
  it('(a) appends research_not_ready to the existing errors in order', () => {
    expect(SocialTopicWikiToolErrorSchema.options).toEqual([
      'invalid_request',
      'not_configured',
      'unknown_topic',
      'nothing_to_save',
      'lab_not_enabled',
      'research_not_ready',
    ]);
  });

  it('(b) accepts research_not_ready', () => {
    expect(SocialTopicWikiToolErrorSchema.parse('research_not_ready')).toBe('research_not_ready');
  });

  it('(c) rejects the generic cap-lab not_ready error', () => {
    expect(() => SocialTopicWikiToolErrorSchema.parse('not_ready')).toThrow();
  });
});
