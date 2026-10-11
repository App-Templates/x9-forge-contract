import { describe, expect, it } from 'vitest';
import { NewsBriefingCommandSchema, NewsBriefingStateSchema } from '../../src/capability/configuration/news-briefing.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const base = { scope, requestId: 'request-1', expectedVersion: 1 };
const feed = { url: 'https://example.org/feed', category: 'science' };
const rule = { condition: { type: 'always' }, action: { type: 'skip_category', category: 'science' }, description: 'Skip science' };
const settings = { feeds: [feed], hoursBack: 26, cronSchedule: '0 6 * * *', rules: [] };

describe('News/Briefing commands', () => {
  it.each([
    ['news', { type: 'settings.patch', settings: { hoursBack: 12 } }],
    ['news', { type: 'feeds.replace', feeds: [feed] }],
    ['news', { type: 'rule.add', rule }],
    ['news', { type: 'rule.update', id: 'ec539288-d49b-44ec-a7cb-e12fa562e137', rule }],
    ['news', { type: 'rule.remove', id: 'ec539288-d49b-44ec-a7cb-e12fa562e137' }],
    ['briefing', { type: 'settings.patch', settings: { tone: 'terse', structure: ['news'] } }],
    ['briefing', { type: 'feeds.replace', feeds: [{ ...feed, weight: 2 }] }],
    ['briefing', { type: 'rule.add', rule: { ...rule, action: { type: 'set_tone', tone: 'friendly' } } }],
  ])('accepts %s %j without producer metadata', (family, change) => {
    const input = { ...base, family, changes: [change] };
    expect(NewsBriefingCommandSchema.parse(input)).toEqual(input);
  });

  it.each([
    { family: 'security', changes: [{ type: 'feeds.replace', feeds: [] }] },
    { family: 'netatmo', changes: [{ type: 'feeds.replace', feeds: [] }] },
    { family: 'news', changes: [{ type: 'settings.patch', settings: {} }] },
    { family: 'news', changes: [{ type: 'settings.patch', settings: { hoursBack: 0 } }] },
    { family: 'news', changes: [{ type: 'settings.patch', settings: { hoursBack: true } }] },
    { family: 'briefing', changes: [{ type: 'settings.patch', settings: { recipients: [] } }] },
    { family: 'news', changes: [{ type: 'feeds.replace', feeds: [{ ...feed, source: 'default' }] }] },
    { family: 'news', changes: [{ type: 'feeds.replace', feeds: [feed, feed] }] },
    { family: 'news', changes: [{ type: 'feeds.replace', feeds: [{ ...feed, url: 'not a URL' }] }] },
    { family: 'news', changes: [{ type: 'feeds.replace', feeds: [{ ...feed, url: 'file:///etc/config' }] }] },
    { family: 'news', changes: [{ type: 'feeds.replace', feeds: [{ ...feed, url: 'https://name:password@example.org/feed' }] }] },
    { family: 'news', changes: [{ type: 'rule.add', rule: { ...rule, created_by: 'operator' } }] },
    { family: 'news', changes: [{ type: 'rule.add', rule: { ...rule, priority: 0 } }] },
    { family: 'news', changes: [{ type: 'rule.add', rule: { ...rule, action: { type: 'auto_light_on', module_id: 'device' } } }] },
    { family: 'news', changes: [{ type: 'rule.add', rule: { ...rule, action: { type: 'set_tone', tone: 'terse' } } }] },
    { family: 'briefing', changes: [{ type: 'rule.add', rule }] },
    { family: 'news', changes: [] },
  ])('rejects unsupported or authority-bearing payload %j', input => {
    expect(NewsBriefingCommandSchema.safeParse({ ...base, ...input }).success).toBe(false);
  });
});

describe('News/Briefing canonical readback', () => {
  const saved = { family: 'news', scope, version: 2, settings, effective: null, execution: 'stopped' };
  it('does not equate a saved revision with an effective revision', () => {
    expect(NewsBriefingStateSchema.parse(saved)).toEqual(saved);
  });
  it('attests exact settings from the same revision', () => {
    const value = { ...saved, execution: 'running', effective: { version: 2, settings, observedAt: '2026-10-11T17:30:00Z' } };
    expect(NewsBriefingStateSchema.parse(value)).toEqual(value);
  });
  it.each([
    { ...saved, effective: { version: 3, settings, observedAt: '2026-10-11T17:30:00Z' } },
    { ...saved, effective: { version: 2, settings: { ...settings, hoursBack: 12 }, observedAt: '2026-10-11T17:30:00Z' } },
    { ...saved, effective: { version: 2, settings, observedAt: null } },
    { ...saved, family: 'briefing' },
    { ...saved, settings: { ...settings, recipients: [] } },
  ])('rejects false evidence or wrong family %j', value => {
    expect(NewsBriefingStateSchema.safeParse(value).success).toBe(false);
  });
});

it('preserves the existing News capacity of one hundred user feeds plus default feeds', () => {
  const feeds = Array.from({ length: 115 }, (_, index) => ({ ...feed, url: `https://example.org/feed/${index}` }));
  expect(NewsBriefingCommandSchema.parse({ ...base, family: 'news', changes: [{ type: 'feeds.replace', feeds }] }).changes[0]).toEqual({ type: 'feeds.replace', feeds });
});

it('carries an explicit producer adoption command and visible per-field provenance', () => {
  const command = { ...base, family: 'news', changes: [{ type: 'legacy.adopt' }] };
  expect(NewsBriefingCommandSchema.parse(command)).toEqual(command);
  const state = { family: 'news', scope, version: 2, settings, effective: null, execution: 'stopped', adoption: { version: 2, requestId: base.requestId, fields: [{ key: 'feeds', source: 'legacy-file' }, { key: 'hoursBack', source: 'declared-default', reason: 'invalid-legacy-value' }] } };
  expect(NewsBriefingStateSchema.parse(state)).toEqual(state);
  expect(NewsBriefingStateSchema.safeParse({ ...state, adoption: { ...state.adoption, version: 3 } }).success).toBe(false);
});
