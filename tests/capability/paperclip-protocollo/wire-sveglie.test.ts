import { describe, expect, it } from 'vitest';
import * as capability from '../../../src/capability/index.js';
import { PaperclipCorsaSchema } from '../../../src/capability/paperclip-protocollo/corsa.js';
import * as wake from '../../../src/capability/paperclip-protocollo/wire-sveglie.js';

const agentId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const runId = '33333333-3333-4333-8333-333333333333';
const agent = { id: agentId, companyId: otherId };
const run = { id: runId, agentId, companyId: otherId, status: 'queued' };
const skipped = {
  status: 'skipped', reason: 'wakeup_skipped', message: 'Wake not admitted',
  issueId: null, executionRunId: null, executionAgentId: null, executionAgentName: null,
};

describe('Paperclip manual wake and heartbeat', () => {
  it('s7417_corpi_di_oggi_validi', () => {
    const reply = {
      source: 'automation', triggerDetail: 'system', reason: 'x9_referent_reply',
      payload: { issueId: otherId, commentId: runId },
      idempotencyKey: `x9-referent-reply:${otherId}:${runId}`,
    };
    const delivery = {
      reason: `x9-delivery:${runId}:${otherId}`,
      idempotencyKey: `x9-delivery:${runId}:${otherId}`,
    };
    expect(wake.PaperclipWakeupCorpoSchema.parse(reply)).toEqual(reply);
    expect(wake.PaperclipHeartbeatInvokeCorpoSchema.parse(delivery)).toEqual(delivery);
    expect(wake.PaperclipWakeupCorpoSchema.parse({})).toEqual({});
    expect(wake.PaperclipHeartbeatInvokeCorpoSchema.parse({})).toEqual({});
  });

  it('s7417_valori_chiusi', () => {
    expect(wake.PAPERCLIP_WAKE_REASON_MAX).toBe(200);
    expect(wake.PAPERCLIP_WAKE_IDEMPOTENCY_KEY_MAX).toBe(255);
    for (const source of ['timer', 'assignment', 'on_demand', 'automation']) {
      expect(wake.PaperclipWakeupCorpoSchema.parse({ source })).toEqual({ source });
    }
    for (const triggerDetail of ['manual', 'ping', 'callback', 'system']) {
      for (const schema of [wake.PaperclipWakeupCorpoSchema, wake.PaperclipHeartbeatInvokeCorpoSchema]) {
        expect(schema.parse({ triggerDetail })).toEqual({ triggerDetail });
      }
    }
    const boundary = {
      reason: 'r'.repeat(200), idempotencyKey: 'k'.repeat(255),
      forceFreshSession: true, payload: { nested: [null, { value: 1 }] },
    };
    for (const schema of [wake.PaperclipWakeupCorpoSchema, wake.PaperclipHeartbeatInvokeCorpoSchema]) {
      expect(schema.parse(boundary)).toEqual(boundary);
      for (const body of [
        { triggerDetail: 'timer' }, { triggerDetail: 'webhook' },
        { reason: '' }, { reason: 'r'.repeat(201) }, { reason: null },
        { idempotencyKey: '' }, { idempotencyKey: 'k'.repeat(256) },
        { forceFreshSession: 'true' }, { payload: [] }, { payload: 'text' }, { payload: null },
      ]) expect(schema.safeParse(body).success).toBe(false);
    }
    for (const source of ['cron', 'Automation', 'webhook']) {
      expect(wake.PaperclipWakeupCorpoSchema.safeParse({ source }).success).toBe(false);
    }
  });

  it('s7417_campi_board_e_sconosciuti_rifiutati', () => {
    for (const schema of [wake.PaperclipWakeupCorpoSchema, wake.PaperclipHeartbeatInvokeCorpoSchema]) {
      for (const body of [{ failedRunId: runId }, { debug: true }, { extra: 1 }, { wakeOnDemand: true }]) {
        expect(schema.safeParse(body).success).toBe(false);
      }
    }
    expect(wake.PaperclipHeartbeatInvokeCorpoSchema.safeParse({ source: 'on_demand' }).success).toBe(false);
  });

  it('s7417_percorsi', () => {
    expect(wake.paperclipPercorsiSveglie.wakeup(agentId)).toBe(`/api/agents/${agentId}/wakeup`);
    expect(wake.paperclipPercorsiSveglie.heartbeatInvoke(agentId)).toBe(`/api/agents/${agentId}/heartbeat/invoke`);
    expect(Object.keys(wake.paperclipPercorsiSveglie).sort()).toEqual(['heartbeatInvoke', 'wakeup']);
    for (const path of Object.values(wake.paperclipPercorsiSveglie)) {
      for (const invalid of ['rd-lab', `${agentId}/../${otherId}`]) expect(() => path(invalid)).toThrow();
    }
  });

  it('s7417_un_agente_sveglia_solo_se_stesso', () => {
    expect(wake.PAPERCLIP_WAKE_REFUSALS).toEqual(['agent_can_only_invoke_itself']);
    expect(wake.PAPERCLIP_SELF_ONLY_TEXT).toBe('Agent can only invoke itself');
    for (const [request, path] of [
      [wake.paperclipWakeupRequest, wake.paperclipPercorsiSveglie.wakeup],
      [wake.paperclipHeartbeatInvokeRequest, wake.paperclipPercorsiSveglie.heartbeatInvoke],
    ] as const) {
      const body = { reason: 'x9_referent_reply', forceFreshSession: false };
      expect(request({ callerAgentId: agentId, targetAgentId: agentId, body }))
        .toEqual({ ok: true, path: path(agentId), body });
      expect(request({ callerAgentId: agentId, targetAgentId: otherId, body }))
        .toEqual({ ok: false, refusal: 'agent_can_only_invoke_itself' });
      const invalidBody = { ...body, failedRunId: runId };
      expect(() => request({ callerAgentId: agentId, targetAgentId: agentId, body: invalidBody })).toThrow();
      expect(request({ callerAgentId: agentId, targetAgentId: otherId, body: invalidBody }))
        .toEqual({ ok: false, refusal: 'agent_can_only_invoke_itself' });
      expect(() => request({ callerAgentId: 'rd-lab', targetAgentId: 'rd-lab', body })).toThrow();
    }
    expect(wake.isPaperclipSelfOnlyRefusal(403, '  Agent can only invoke itself\n')).toBe(true);
    for (const status of [200, 202, 409, 500]) {
      expect(wake.isPaperclipSelfOnlyRefusal(status, wake.PAPERCLIP_SELF_ONLY_TEXT)).toBe(false);
    }
    for (const text of [null, undefined, '', 'Other error', 'agent can only invoke itself']) {
      expect(wake.isPaperclipSelfOnlyRefusal(403, text)).toBe(false);
    }
  });

  it('s7417_risposta_mai_ricevuta_di_consegna', () => {
    expect(wake.PAPERCLIP_SKIPPED_WAKEUP_REASONS).toEqual([
      'wakeup_skipped', 'execution_reconciliation_required', 'issue_execution_deferred',
    ]);
    for (const status of [200, 202]) {
      expect(wake.classifyPaperclipWakeAnswer(status, run)).toEqual({ kind: 'run', run });
      for (const reason of wake.PAPERCLIP_SKIPPED_WAKEUP_REASONS) {
        const body = { ...skipped, reason, extra: true };
        expect(wake.classifyPaperclipWakeAnswer(status, body)).toEqual({ kind: 'skipped', skipped: body });
      }
      for (const body of [{ ...skipped, reason: 'budget.blocked' }, { ...run, status: 'invented' }, {}, null]) {
        expect(wake.classifyPaperclipWakeAnswer(status, body)).toEqual({ kind: 'unexpected' });
      }
    }
    expect(wake.PaperclipWakeupSaltataSchema.parse({
      ...skipped, issueId: 'PAP-42', executionRunId: runId, executionAgentId: agentId, executionAgentName: 'Agent',
    }).executionRunId).toBe(runId);
    expect(wake.classifyPaperclipWakeAnswer(403, { error: ` ${wake.PAPERCLIP_SELF_ONLY_TEXT} ` }))
      .toEqual({ kind: 'self_only_refused' });
    for (const body of [{ error: 'Other error' }, { error: 403 }, wake.PAPERCLIP_SELF_ONLY_TEXT, null]) {
      expect(wake.classifyPaperclipWakeAnswer(403, body)).toEqual({ kind: 'unexpected' });
    }
    for (const body of [run, skipped, {}, null]) {
      expect(wake.classifyPaperclipWakeAnswer(409, body)).toEqual({ kind: 'conflict' });
    }
    for (const status of [201, 204, 404, 500]) {
      expect(wake.classifyPaperclipWakeAnswer(status, run)).toEqual({ kind: 'unexpected' });
    }
  });

  it('s7417_configurazione_scritta_con_nomi_e_campi_canonici', () => {
    expect(wake.PAPERCLIP_HEARTBEAT_MAX_CONCURRENT_RUNS).toEqual({ default: 20, min: 1, max: 50 });
    for (const body of [
      {}, { maxConcurrentRuns: 1 }, { maxConcurrentRuns: 50 }, { maxDailyRuns: 5 },
      { maxDailyRuns: null, maxDailyCostCents: null },
      { enabled: false, intervalSec: 0, wakeOnDemand: true, skipTimerWhenNoActionableWork: true, maxDailyRuns: 0, maxDailyCostCents: 0 },
    ]) expect(wake.PaperclipRuntimeHeartbeatSchema.parse(body)).toEqual(body);
    for (const maxConcurrentRuns of [0, 51, 1.5, -1, null]) {
      expect(wake.PaperclipRuntimeHeartbeatSchema.safeParse({ maxConcurrentRuns }).success).toBe(false);
    }
    for (const body of [
      { enabled: 'yes' }, { wakeOnAssignment: true }, { wakeOnOnDemand: true }, { wakeOnAutomation: true },
      { dailyRunLimit: 5 }, { requireActionableTimerWork: true }, { extra: true },
      { wakeOnDemand: 'yes' }, { skipTimerWhenNoActionableWork: 1 },
    ]) expect(wake.PaperclipRuntimeHeartbeatSchema.safeParse(body).success).toBe(false);
    for (const field of ['intervalSec', 'maxDailyRuns', 'maxDailyCostCents']) {
      for (const value of [-1, 1.5, '1']) {
        expect(wake.PaperclipRuntimeHeartbeatSchema.safeParse({ [field]: value }).success).toBe(false);
      }
    }
  });

  it('s7417_configurazione_letta_con_tolleranza', () => {
    const heartbeat = {
      enabled: true, intervalSec: 60, wakeOnDemand: false, maxConcurrentRuns: 20,
      skipTimerWhenNoActionableWork: false, maxDailyRuns: null, maxDailyCostCents: 100,
      dailyRunLimit: 5, wakeOnAssignment: true,
    };
    const row = { ...agent, runtimeConfig: { heartbeat, adapter: 'http' }, name: 'Agent' };
    expect(wake.PaperclipAgenteConHeartbeatSchema.parse(row)).toEqual(row);
    expect(wake.PaperclipRuntimeHeartbeatLettoSchema.parse(heartbeat)).toEqual(heartbeat);
    for (const base of [agent, { ...agent, runtimeConfig: null }]) {
      expect(wake.PaperclipAgenteConHeartbeatSchema.parse(base)).toEqual(base);
    }
    expect(wake.PaperclipAgenteConHeartbeatSchema.parse({ ...agent, runtimeConfig: 'bad' }).runtimeConfig)
      .toBeUndefined();
    for (const invalid of [null, 'bad', [], 1]) {
      expect(wake.PaperclipAgenteConHeartbeatSchema.parse({ ...agent, runtimeConfig: { heartbeat: invalid } })
        .runtimeConfig?.heartbeat).toBeUndefined();
    }
    for (const field of ['enabled', 'intervalSec', 'wakeOnDemand', 'maxConcurrentRuns', 'skipTimerWhenNoActionableWork', 'maxDailyRuns', 'maxDailyCostCents']) {
      const parsed = wake.PaperclipAgenteConHeartbeatSchema.parse({
        ...agent, runtimeConfig: { heartbeat: { ...heartbeat, [field]: 'bad' } },
      });
      expect(parsed.runtimeConfig?.heartbeat?.[field]).toBeUndefined();
      expect(parsed.id).toBe(agentId);
      expect(parsed.runtimeConfig?.heartbeat?.dailyRunLimit).toBe(5);
    }
    expect(wake.PaperclipAgenteConHeartbeatSchema.safeParse({ companyId: otherId, runtimeConfig: { heartbeat } }).success).toBe(false);
    expect(wake.PaperclipAgenteConHeartbeatSchema.safeParse({ ...agent, id: 'rd-lab' }).success).toBe(false);
  });

  it('s7417_chiave_di_idempotenza', () => {
    for (const [prefix, parts] of [
      ['x9-referent-reply', [otherId, runId]], ['x9-work_stalled', [agentId, otherId]],
      ['x9-delivery', [runId, otherId]], ['x9-director-ask-resume', [agentId, runId]],
    ] as const) {
      expect(wake.paperclipWakeIdempotencyKey(prefix, ...parts)).toBe([prefix, ...parts].join(':'));
    }
    expect(wake.paperclipWakeIdempotencyKey('x', 'p'.repeat(253))).toHaveLength(255);
    expect(() => wake.paperclipWakeIdempotencyKey('x', 'p'.repeat(254))).toThrow();
    expect(() => wake.paperclipWakeIdempotencyKey('x'.repeat(256))).toThrow();
    for (const prefix of ['', 'X9', 'x 9', '-x9', 'x9:', ' x9', 'x9 ']) {
      expect(() => wake.paperclipWakeIdempotencyKey(prefix, agentId)).toThrow();
    }
    expect(() => wake.paperclipWakeIdempotencyKey('x9', '')).toThrow();
    expect(() => wake.paperclipWakeIdempotencyKey('x9', agentId, '')).toThrow();
  });

  it('s7417_esportazioni', () => {
    for (const [name, value] of Object.entries(wake)) {
      expect(Object.entries(capability).find(([key]) => key === name)?.[1], name).toBe(value);
    }
    expect(capability.PaperclipCorsaSchema).toBe(PaperclipCorsaSchema);
    expect(capability.PaperclipCorsaSchema.parse(run)).toEqual(run);
  });
});
