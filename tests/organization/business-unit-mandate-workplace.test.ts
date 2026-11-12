import { describe, expect, it } from 'vitest';
import {
  MandateAttemptObservationSchema,
  MandateWorkModeSchema,
  MandateWorkplaceSchema,
  ReconciledMandateSchema,
  type MandateWorkMode,
  type MandateWorkplace,
  type ReconciledMandate,
} from '../../src/organization/business-unit-mandate.js';

// Production-shaped saved mandate from 11 November, with synthetic repository names.
function savedMandate(): ReconciledMandate {
  return {
    tenantId: '1',
    organizationId: 'good-choice',
    clientId: 'good-choice',
    projectId: 'orto-facile',
    planSection: {
      planId: 'plan_orto_001',
      planVersion: 2,
      planDigest: 'a'.repeat(64),
      businessUnit: {
        buSlug: 'orto-web',
        typeId: 'sviluppo',
        mandate: 'Build the Orto Facile website from the approved plan.',
        competencies: ['web development'],
        lead: { role: 'capo-bu' },
        executor: 'dev_session',
        referent: { personRef: 'stefano', entryVersion: 3 },
        firstActivities: ['Read the project brief'],
        start: { kind: 'now' },
      },
    },
    decision: { requestId: 'decision_orto_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 },
    notebookPages: [{ slug: 'orto-web-brief', version: 4 }],
    reconciliation: { outcome: 'agrees' },
    reconciledAt: '2026-11-11T10:00:00+01:00',
  };
}

const workplace: MandateWorkplace = {
  repository: { host: 'github', repo: 'acme/orto-facile' },
  folder: 'sito',
  sessionBoard: { repo: 'acme/sessioni' },
};
const workMode: MandateWorkMode = {
  executor: 'dev_session',
  allowedTools: ['dev_session_open', 'dev_session_status', 'dev_session_answer', 'dev_session_result'],
  excludedTools: ['dev_repo_read'],
};

describe('mandate workplace and work mode', () => {
  it('s6345 mandato-luogo-e-modo: preserves the configured repository, folder, session board and tools', () => {
    const value = { ...savedMandate(), workplace, workMode };
    expect(ReconciledMandateSchema.parse(value)).toEqual(value);
  });

  it('rejects a work mode executor different from the approved plan (M1)', () => {
    const result = ReconciledMandateSchema.safeParse({
      ...savedMandate(), workplace, workMode: { ...workMode, executor: 'agent' },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['workMode', 'executor'] }),
    ]);
  });

  it('requires a session board and GitHub repository for development sessions without a workplace', () => {
    const result = ReconciledMandateSchema.safeParse({ ...savedMandate(), workMode });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['workplace', 'sessionBoard'] }),
      expect.objectContaining({ path: ['workplace', 'repository', 'host'] }),
    ]);
  });

  it('requires a session board even when the GitHub workplace is present', () => {
    const result = ReconciledMandateSchema.safeParse({
      ...savedMandate(), workMode, workplace: { repository: workplace.repository },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['workplace', 'sessionBoard'] }),
    ]);
  });

  it('rejects a Bitbucket development session with a valid session board', () => {
    const result = ReconciledMandateSchema.safeParse({
      ...savedMandate(), workMode,
      workplace: { ...workplace, repository: { ...workplace.repository, host: 'bitbucket' } },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['workplace', 'repository', 'host'] }),
    ]);
  });

  it.each(['agent', 'night'] as const)('accepts %s mode without a workplace', (executor) => {
    const saved = savedMandate();
    const value = {
      ...saved,
      planSection: {
        ...saved.planSection,
        businessUnit: { ...saved.planSection.businessUnit, executor },
      },
      workMode: { executor, allowedTools: ['dev_repo_read'] },
    };
    expect(ReconciledMandateSchema.parse(value)).toEqual(value);
  });

  it('preserves the saved 11 November mandate and reconciled observation without optional keys (M2)', () => {
    const saved = savedMandate();
    const parsed = ReconciledMandateSchema.parse(saved);
    expect(parsed).toEqual(saved);
    expect(parsed).not.toHaveProperty('workplace');
    expect(parsed).not.toHaveProperty('workMode');
    const observation = {
      observationId: 'attempt_orto_001',
      scope: {
        tenantId: saved.tenantId,
        organizationId: saved.organizationId,
        clientId: saved.clientId,
        projectId: saved.projectId,
        buSlug: 'orto-web',
        agent: { managementAgentId: 'orto-web', runtimeAgentId: 'orto-web', vaultAgentId: 42 },
      },
      events: [{
        eventId: 'event_orto_001', kind: 'reconciled', at: saved.reconciledAt, mandate: saved,
      }],
    };
    const parsedObservation = MandateAttemptObservationSchema.parse(observation);
    expect(parsedObservation).toEqual(observation);
    expect(parsedObservation.events[0]).not.toHaveProperty('mandate.workplace');
    expect(parsedObservation.events[0]).not.toHaveProperty('mandate.workMode');
  });

  it.each([
    { allowedTools: [] },
    { allowedTools: ['dev_session_open', 'dev_session_open'] },
    { excludedTools: ['dev_repo_read', 'dev_repo_read'] },
    { excludedTools: ['dev_session_open'] },
    { allowedTools: ['ab'] },
    { allowedTools: ['Dev_session'] },
    { allowedTools: ['dev-session'] },
    { allowedTools: ['a'.repeat(65)] },
    { excludedTools: ['invalid tool'] },
    { allowedTools: Array.from({ length: 41 }, (_, index) => `tool_${index}`) },
    { excludedTools: Array.from({ length: 41 }, (_, index) => `tool_${index}`) },
    { executor: 'unknown' },
    { extra: true },
  ])('rejects invalid work mode %j', (change) => {
    expect(MandateWorkModeSchema.safeParse({ ...workMode, ...change }).success).toBe(false);
  });

  it('accepts tool name and list boundaries and an empty excluded list', () => {
    const value = {
      executor: 'agent',
      allowedTools: ['abc', 'a'.repeat(64), ...Array.from({ length: 38 }, (_, index) => `tool_${index}`)],
      excludedTools: Array.from({ length: 40 }, (_, index) => `excluded_${index}`),
    };
    expect(MandateWorkModeSchema.parse(value)).toEqual(value);
    expect(MandateWorkModeSchema.parse({ ...value, excludedTools: [] })).toEqual({ ...value, excludedTools: [] });
    expect(MandateWorkModeSchema.parse({ executor: 'agent', allowedTools: ['abc'] })).toEqual({
      executor: 'agent', allowedTools: ['abc'],
    });
  });

  it.each(['', '..', '../sito', 'sito/../src', '/sito', 'sito/', 'sito//src', 'sito\\src', 'C:/sito', 'a'.repeat(513)])(
    'rejects invalid relative folder %j', (folder) => {
      expect(MandateWorkplaceSchema.safeParse({ ...workplace, folder }).success).toBe(false);
    },
  );

  it.each([
    { repository: { host: 'github', repo: 'missing-slash' } },
    { repository: { host: 'github', repo: 'acme/..' } },
    { repository: { host: 'gitlab', repo: 'acme/orto-facile' } },
    { repository: { ...workplace.repository, extra: true } },
    { sessionBoard: { repo: 'missing-slash' } },
    { sessionBoard: { repo: 'acme/sessioni', host: 'github' } },
    { extra: true },
  ])('rejects invalid workplace %j', (change) => {
    expect(MandateWorkplaceSchema.safeParse({ ...workplace, ...change }).success).toBe(false);
  });

  it('accepts both hosts, optional location fields and folder length boundaries', () => {
    for (const host of ['github', 'bitbucket'] as const) {
      const value = { repository: { host, repo: 'acme/orto-facile' } };
      expect(MandateWorkplaceSchema.parse(value)).toEqual(value);
      for (const folder of ['a', 'sito/src', 'a'.repeat(512)]) {
        expect(MandateWorkplaceSchema.parse({ ...value, folder })).toEqual({ ...value, folder });
      }
    }
  });
});
