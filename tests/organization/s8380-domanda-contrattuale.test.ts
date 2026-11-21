import { describe, expect, it } from 'vitest';
import {
  AGENT_QUESTION_TRIED_MIN, AgentQuestionDetailsSchema, AgentRequestSchema,
  PaperclipDirectorCreateInputSchema, PaperclipDirectorNativeCreateInputSchema,
  agentQuestionFreeTextProblem, agentQuestionRecord, parseAgentQuestionRecord,
} from '../../src/organization/agent-request.js';

// Reconstructed contract shape, not an extract of GOO-194 or a production mandate.
const historical = {
  schemaVersion: 1 as const,
  requestId: 'areq_abcdefgh',
  from: { unitId: 'unit-development', paperclipAgentId: '11111111-1111-4111-8111-111111111111' },
  to: { kind: 'director' as const },
  need: 'Serve una decisione sul vincolo di consegna',
  why: 'Il controllo tecnico impedisce la consegna del pezzo',
  mandate: { issueId: '22222222-2222-4222-8222-222222222222', identifier: 'GOO-194' },
  requestedAt: '2026-11-21T10:00:00+01:00',
};
const details = {
  kind: 'technical_fault' as const,
  cause: { kind: 'refusal' as const, code: 'proof_missing', tried: ['Riletto il mandato', 'Controllate le prove del pezzo'] },
};
const request = { ...historical, plan: { planId: 'plan_000004', version: 4 }, details };
const marker = 'x9-agent-question:v1';
const block = (json: string) => '```' + marker + '\n' + json + '\n```';
const create = { title: 'Decisione sul pezzo', description: 'Richiesta del capo', assigneeAgentId: historical.from.paperclipAgentId };

describe('s8380 question contract', () => {
  it('s8380 regressione transports refusal, attempts, origin and plan version 4 unchanged', () => {
    const parsed = AgentRequestSchema.parse(request);
    expect(parsed).toStrictEqual(request);
    expect(parsed.need).not.toBe(parsed.why);
    const record = agentQuestionRecord(parsed);
    expect(record).toBe(block(JSON.stringify(parsed)));
    expect(parseAgentQuestionRecord('Domanda del capo\n\n' + record + '\nFine')).toStrictEqual(request);
    expect(agentQuestionRecord(parseAgentQuestionRecord(record)!)).toBe(record);
  });

  it('s8380 historical requests without details or plan keep every key', () => {
    expect(AgentRequestSchema.parse(historical)).toStrictEqual(historical);
    expect(parseAgentQuestionRecord(agentQuestionRecord(historical))).toStrictEqual(historical);
    expect(parseAgentQuestionRecord('Descrizione storica senza record')).toBeUndefined();
    expect(parseAgentQuestionRecord('')).toBeUndefined();
    const { details: _details, ...withPlan } = request;
    expect(AgentRequestSchema.parse(withPlan)).toStrictEqual(withPlan);
  });

  it('s8380 permits exactly the four declared kinds and the two strict causes', () => {
    for (const kind of ['clarification', 'scope_decision', 'technical_fault', 'clearance']) {
      const question = { kind, cause: { kind: 'question' } };
      expect(AgentQuestionDetailsSchema.parse(question)).toStrictEqual(question);
    }
    for (const invalid of [
      { ...details, kind: 'invented' }, { ...details, status: 'blocked' },
      { ...details, cause: { kind: 'invented' } },
      { ...details, cause: { kind: 'question', code: 'extra' } },
      { ...details, cause: { ...details.cause, extra: true } },
    ]) expect(AgentQuestionDetailsSchema.safeParse(invalid).success).toBe(false);
    expect(AgentRequestSchema.safeParse({ ...request, status: 'blocked' }).success).toBe(false);
  });

  it('s8380 refusal requires at least one attempt through the exported minimum', () => {
    expect(AgentQuestionDetailsSchema.safeParse({ ...details, cause: {
      ...details.cause, tried: Array.from({ length: AGENT_QUESTION_TRIED_MIN }, () => 'Controllata la prova'),
    } }).success).toBe(true);
    const { tried: _tried, ...withoutTried } = details.cause;
    expect(AgentQuestionDetailsSchema.safeParse({ ...details, cause: withoutTried }).success).toBe(false);
    expect(AgentQuestionDetailsSchema.safeParse({ ...details, cause: { ...details.cause, tried: [] } }).success).toBe(false);
  });

  it('s8380 bounds and trims refusal code and attempts', () => {
    const cause = { kind: 'refusal', code: ' x ', tried: [' y '] };
    expect(AgentQuestionDetailsSchema.parse({ ...details, cause })).toStrictEqual({
      ...details, cause: { kind: 'refusal', code: 'x', tried: ['y'] },
    });
    expect(AgentQuestionDetailsSchema.safeParse({ ...details, cause: {
      ...cause, code: 'c'.repeat(120), tried: Array.from({ length: 10 }, () => 't'.repeat(500)),
    } }).success).toBe(true);
    for (const invalid of [
      { ...cause, code: ' ' }, { ...cause, code: 'c'.repeat(121) },
      { ...cause, tried: [' '] }, { ...cause, tried: ['t'.repeat(501)] },
      { ...cause, tried: Array.from({ length: 11 }, () => 'attempt') },
    ]) expect(AgentQuestionDetailsSchema.safeParse({ ...details, cause: invalid }).success).toBe(false);
  });

  it('s8380 details require the structured plan', () => {
    const { plan: _plan, ...withoutPlan } = request;
    const missing = AgentRequestSchema.safeParse(withoutPlan);
    expect(missing.success).toBe(false);
    expect(missing.error?.issues.map(issue => issue.path)).toContainEqual(['plan']);
    expect(AgentRequestSchema.safeParse({ ...request, plan: JSON.stringify(request.plan) }).success).toBe(false);
  });

  it('s8380 composes creation by id with an optional question and keeps native waits', () => {
    expect(PaperclipDirectorCreateInputSchema.parse(create)).toStrictEqual(create);
    expect(PaperclipDirectorCreateInputSchema.parse({ ...create, question: details })).toStrictEqual({ ...create, question: details });
    const native = { ...create, question: details, waitForChild: true, parentIssueId: historical.mandate.issueId };
    expect(PaperclipDirectorNativeCreateInputSchema.parse(native)).toStrictEqual(native);
    expect(PaperclipDirectorNativeCreateInputSchema.parse(create)).toStrictEqual(create);
    expect(PaperclipDirectorNativeCreateInputSchema.safeParse({ ...create, waitForChild: true }).success).toBe(false);
    for (const schema of [PaperclipDirectorCreateInputSchema, PaperclipDirectorNativeCreateInputSchema]) {
      expect(schema.safeParse({ ...create, question: { ...details, kind: 'invented' } }).success).toBe(false);
      expect(schema.safeParse({ ...create, assigneeRoleRef: 'director' }).success).toBe(false);
      expect(schema.safeParse({ ...create, assigneeAgentId: 'director' }).success).toBe(false);
    }
  });

  it('s8380 serialization is deterministic across object key order', () => {
    const reordered = { details: { cause: { tried: details.cause.tried, code: details.cause.code, kind: details.cause.kind }, kind: details.kind },
      plan: { version: 4, planId: request.plan.planId }, ...historical };
    expect(agentQuestionRecord(reordered)).toBe(agentQuestionRecord(request));
  });

  it('s8380 reserved marker is refused in model free text', () => {
    expect(agentQuestionFreeTextProblem('Testo libero normale')).toBeUndefined();
    for (const text of [marker, 'Prefisso ' + marker + ' suffisso', block('{}')]) {
      expect(agentQuestionFreeTextProblem(text)).toEqual(expect.any(String));
    }
    expect(() => agentQuestionRecord({ ...request, need: marker })).toThrow();
  });

  it('s8380 malformed, duplicate and strict-invalid records are errors never absence', () => {
    const record = agentQuestionRecord(request);
    for (const text of [
      record + '\n' + record, block('{broken'), marker,
      '```' + marker + '\n' + JSON.stringify(request),
      block(JSON.stringify({ ...request, extra: true })),
      block(JSON.stringify({ ...request, plan: JSON.stringify(request.plan) })),
      block(JSON.stringify({ ...request, details: { ...details, kind: 'invented' } })),
      record + '\n' + marker,
    ]) expect(() => parseAgentQuestionRecord(text)).toThrow();
  });
});
