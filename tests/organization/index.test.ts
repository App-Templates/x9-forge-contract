import { describe, expect, it } from 'vitest';
import * as organization from '../../src/organization/index.js';
import * as root from '../../src/index.js';
import * as runContext from '../../src/organization/run-context.js';
import * as runOutcome from '../../src/organization/run-outcome.js';
import * as operations from '../../src/organization/operations.js';

describe('organization subpath', () => {
  it('exports the canonical schemas and every organization runtime symbol', () => {
    expect(organization.OrganizationRunContextSchema).toBe(runContext.OrganizationRunContextSchema);
    expect(organization.RunAttemptSchema).toBe(runOutcome.RunAttemptSchema);
    expect(organization.RunOutcomeSchema).toBe(runOutcome.RunOutcomeSchema);
    expect(organization.OrganizationOperationSchema).toBe(operations.OrganizationOperationSchema);
    expect(Object.keys(organization).sort()).toEqual(
      Object.keys({ ...runContext, ...runOutcome, ...operations }).sort(),
    );
  });

  it('preserves the original run context literal without changing its shape', () => {
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

    expect(organization.OrganizationRunContextSchema.parse(context)).toEqual(context);
  });

  it('keeps every organization runtime symbol out of the package root', () => {
    for (const name of Object.keys({ ...runContext, ...runOutcome, ...operations })) {
      expect(root).not.toHaveProperty(name);
    }
  });
});
