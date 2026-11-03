import { describe, it, expect } from 'vitest';
import { OrganizationOperationSchema } from '../../src/organization/operations.js';

const context = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};

const variants: Record<string, Record<string, unknown>> = {
  assign_work: {
    operation: 'assign_work',
    context,
    assigneeAgentId: 'agent-2',
    title: 'Write the report',
    instructionRef: 'ref://instructions/1',
  },
  report_outcome: {
    operation: 'report_outcome',
    context,
    attemptId: 'att-1',
    outcomeRef: 'ref://outcomes/1',
  },
  request_stop: { operation: 'request_stop', context, reason: 'budget' },
  acknowledge_stop: { operation: 'acknowledge_stop', context, stoppedAt: '2026-10-14T10:30:00.000Z' },
  submit_deliverable: {
    operation: 'submit_deliverable',
    context,
    deliverableRef: 'ref://deliverables/1',
    visibility: 'team',
  },
};

const parse = (v: unknown) => OrganizationOperationSchema.safeParse(v).success;

describe('OrganizationOperationSchema', () => {
  it.each(Object.keys(variants))('accepts a valid %s', (name) => {
    expect(parse(variants[name])).toBe(true);
  });

  it('rejects an unknown operation', () => {
    expect(parse({ ...variants.assign_work, operation: 'delete_everything' })).toBe(false);
  });

  it.each(Object.keys(variants))('rejects %s without context', (name) => {
    const { context: _omitted, ...rest } = variants[name]!;
    expect(parse(rest)).toBe(false);
  });

  it.each(Object.keys(variants))('rejects %s with an extra field', (name) => {
    expect(parse({ ...variants[name], extra: 'x' })).toBe(false);
  });

  it.each(Object.keys(variants))('rejects %s with expiresAt <= issuedAt', (name) => {
    const bad = { ...context, expiresAt: context.issuedAt };
    expect(parse({ ...variants[name], context: bad })).toBe(false);
    const before = { ...context, expiresAt: '2026-10-14T09:00:00.000Z' };
    expect(parse({ ...variants[name], context: before })).toBe(false);
  });

  it('rejects visibility public', () => {
    expect(parse({ ...variants.submit_deliverable, visibility: 'public' })).toBe(false);
  });

  it('accepts visibility private', () => {
    expect(parse({ ...variants.submit_deliverable, visibility: 'private' })).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(parse({ ...variants.assign_work, title: '' })).toBe(false);
  });

  it('accepts a title of 200 characters and rejects 201', () => {
    expect(parse({ ...variants.assign_work, title: 'a'.repeat(200) })).toBe(true);
    expect(parse({ ...variants.assign_work, title: 'a'.repeat(201) })).toBe(false);
  });

  it('rejects an empty instructionRef', () => {
    expect(parse({ ...variants.assign_work, instructionRef: '' })).toBe(false);
  });

  it('rejects an empty outcomeRef and attemptId', () => {
    expect(parse({ ...variants.report_outcome, outcomeRef: '' })).toBe(false);
    expect(parse({ ...variants.report_outcome, attemptId: '' })).toBe(false);
  });

  it('rejects a stop reason outside the list', () => {
    expect(parse({ ...variants.request_stop, reason: 'boredom' })).toBe(false);
  });

  it('rejects a non-ISO stoppedAt', () => {
    expect(parse({ ...variants.acknowledge_stop, stoppedAt: 'now' })).toBe(false);
  });

  it('rejects an empty deliverableRef', () => {
    expect(parse({ ...variants.submit_deliverable, deliverableRef: '' })).toBe(false);
  });
});
