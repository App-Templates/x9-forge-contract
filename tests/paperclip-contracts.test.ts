import { describe, it, expect } from 'vitest';
import {
  PaperclipMaterialEventSchema as Event, PaperclipRoutingConfigSchema as Config,
  PaperclipResolvedRouteSchema as Route, PaperclipHandoffSchema as Handoff,
  PaperclipHandoffReceiptSchema as Receipt, PaperclipDecisionRecordSchema as Decision,
} from '../src/capability/paperclip/index.js';

const event = {
  eventId: 'event-1', unitId: 'unit-1', incrementId: 'increment-1', eventType: 'board_ready',
  materialVersion: 'version-1', summary: 'Material ready', materialLinks: ['material:board-1'],
  occurredAt: '2026-10-09T15:00:00+02:00', decisionId: null, test: true,
};
const route = { routingRevision: 'revision-1', roleRef: 'spokesperson', agentRef: 'agent-1',
  referentRef: 'referent-1', channel: 'email', address: 'referent@example.test' };
const config = { schemaVersion: 1, revision: 'revision-1', units: { 'unit-1': {
  events: { board_ready: 'spokesperson' }, roles: { spokesperson: {
    agentRef: 'agent-1', referentRef: 'referent-1', channel: 'email',
  } }, referents: { 'referent-1': { verified: true,
    channels: { email: { address: 'referent@example.test' } },
  } },
} } };
const handoff = { schemaVersion: 1, handoffId: 'f13dd515-1bad-4e0d-a697-7d19bfac6100', event, route };
const receipt = { handoffId: handoff.handoffId, agentRef: 'agent-1', status: 'accepted', receiptId: 'receipt-1' };
const decision = { communicationId: 'communication-1', materialVersion: 'version-1', referentId: 'referent-1',
  outcome: 'approved', changes: '', operatorId: 'operator-1', humanEvidence: 'Human confirmed in the review',
  authorization: 'manual_attestation', paperclipUpdated: false, recordedAt: event.occurredAt };

function changed<T>(value: T, path: string[], replacement?: unknown, remove = false): T {
  const result = structuredClone(value);
  let cursor = result as Record<string, unknown>;
  for (const segment of path.slice(0, -1)) cursor = cursor[segment] as Record<string, unknown>;
  const key = path.at(-1)!;
  if (remove) delete cursor[key]; else cursor[key] = replacement;
  return result;
}

describe('canonical cap-paperclip boundary', () => {
  it('round-trips existing E1/E2 envelopes without adding fields', () => {
    for (const [schema, value] of [[Event, event], [Config, config], [Handoff, handoff], [Receipt, receipt], [Decision, decision]] as const) {
      expect(schema.safeParse(value).success).toBe(true); expect(schema.parse(value)).toEqual(value);
    }
  });
  it('allows every material event and absent optional evidence fields', () => {
    for (const eventType of ['moodboard_ready', 'board_ready', 'plan_verified', 'decision_needed', 'release_delivered']) {
      const { decisionId: _decision, test: _test, ...minimal } = event;
      expect(Event.safeParse({ ...minimal, eventType }).success).toBe(true);
      expect(Event.parse({ ...minimal, eventType }).eventType).toBe(eventType);
    }
  });
  it('allows another channel and unverified configuration without declaring it resolved', () => {
    const candidate = changed(config, ['units', 'unit-1', 'referents', 'referent-1'], {
      verified: false, channels: { inbox: { address: 'inbox:referent-1' } },
    }); candidate.units['unit-1'].roles.spokesperson.channel = 'inbox';
    expect(Config.safeParse(candidate).success).toBe(true);
    expect(Config.parse(candidate)).toEqual(candidate);
    expect(Route.safeParse({ ...route, channel: 'inbox', address: 'inbox:referent-1' }).success).toBe(true);
    expect(Route.parse({ ...route, channel: 'inbox', address: 'inbox:referent-1' }).channel).toBe('inbox');
    expect(Decision.parse({ ...decision, outcome: 'changes_requested', changes: 'Clarify the board' }).changes).toBe('Clarify the board');
  });
  const invalid = [
    ['event extra recipient', Event, { ...event, to: 'injected@example.test' }],
    ['blank identifier', Event, { ...event, eventId: '   ' }],
    ['oversized summary', Event, { ...event, summary: 'x'.repeat(4097) }],
    ['missing links', Event, changed(event, ['materialLinks'], undefined, true)],
    ['blank link', Event, { ...event, materialLinks: [' '] }],
    ['event kind', Event, { ...event, eventType: 'send_email' }],
    ['timestamp without timezone', Event, { ...event, occurredAt: '2026-10-09T15:00:00' }],
    ['invalid timestamp', Event, { ...event, occurredAt: '2026-02-30T15:00:00Z' }],
    ['test boolean', Event, { ...event, test: 'true' }],
    ['decision reference', Event, { ...event, decisionId: '' }],
    ['config version', Config, { ...config, schemaVersion: 2 }],
    ['config injection', Config, { ...config, fallback: 'agent-1' }],
    ['unknown config event', Config, changed(config, ['units', 'unit-1', 'events', 'send_email'], 'spokesperson')],
    ['role injection', Config, changed(config, ['units', 'unit-1', 'roles', 'spokesperson', 'credentials'], {})],
    ['referent verification boolean', Config, changed(config, ['units', 'unit-1', 'referents', 'referent-1', 'verified'], 'yes')],
    ['config invalid email', Config, changed(config, ['units', 'unit-1', 'referents', 'referent-1', 'channels', 'email', 'address'], '@example.test')],
    ['route invalid email', Route, { ...route, address: '@example.test' }],
    ['route display name', Route, { ...route, address: 'Referent <referent@example.test>' }],
    ['route injection', Route, { ...route, secret: 'fixture-only' }],
    ['handoff version', Handoff, { ...handoff, schemaVersion: true }],
    ['handoff identifier', Handoff, { ...handoff, handoffId: 'not-a-uuid' }],
    ['receipt status', Receipt, { ...receipt, status: 'email_sent' }],
    ['receipt blank id', Receipt, { ...receipt, receiptId: '' }],
    ['decision automated authorization', Decision, { ...decision, authorization: 'model_guess' }],
    ['decision mutation claim', Decision, { ...decision, paperclipUpdated: true }],
    ['decision missing evidence', Decision, { ...decision, humanEvidence: ' ' }],
    ['decision missing changes', Decision, { ...decision, outcome: 'changes_requested', changes: ' ' }],
    ['decision unknown outcome', Decision, { ...decision, outcome: 'pending' }],
    ['decision extra effect', Decision, { ...decision, applyToIssue: true }],
  ] as const;
  it.each(invalid)('refuses %s', (_name, schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});
