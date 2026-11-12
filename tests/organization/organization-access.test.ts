import { describe, expect, it } from 'vitest';
import {
  ORGANIZATION_ACCESS_NEEDS,
  ORGANIZATION_ACCESS_REFUSALS,
  OrganizationAccessDecisionSchema,
  organizationAccess,
} from '../../src/organization/organization-access.js';
import {
  ParticipantBindingReceiptSchema,
  ParticipantBindingSchema,
} from '../../src/organization/participant-binding.js';
import type { AgentRole } from '../../src/organization/agent-role.js';

const TENANT = 'tenant-1';
const OWNER = 'owner-1';
const ORG = 'azienda-agentica';

const identities = {
  director: { managementAgentId: 'director-good-choice', runtimeAgentId: 'director-good-choice', vaultAgentId: 11 },
  design: { managementAgentId: 'capo-design', runtimeAgentId: 'capo-design', vaultAgentId: 12 },
  sviluppo: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 13 },
};

function entry(
  identity: (typeof identities)[keyof typeof identities],
  options: { role?: AgentRole; org?: string; withdrawn?: boolean; tenant?: string; owner?: string } = {},
) {
  const org = options.org ?? ORG;
  const tenant = options.tenant ?? TENANT;
  const owner = options.owner ?? OWNER;
  const binding = ParticipantBindingSchema.parse({
    tenantId: tenant,
    ownerId: owner,
    agentIdentity: identity,
    participantId: `participant-${identity.vaultAgentId}`,
    personRef: 'person-1',
    roles: ['member'],
    ...(options.role ? { agentRole: options.role } : {}),
    recipients: [
      { kind: 'organization', id: org },
      { kind: 'project', id: 'orto-facile' },
    ],
    appliedVersion: 3,
    appliedAt: '2026-11-10T10:00:00.000Z',
  });
  const receipt = ParticipantBindingReceiptSchema.parse({
    key: { tenantId: tenant, ownerId: owner, agentIdentity: identity, organizationId: org, personRef: 'person-1' },
    appliedVersion: 3,
    digest: 'd'.repeat(16),
    appliedAt: '2026-11-10T10:00:00.000Z',
    ...(options.withdrawn ? { withdrawnAt: '2026-11-11T10:00:00.000Z' } : {}),
  });
  return { binding, receipt };
}

function ask(
  identity: (typeof identities)[keyof typeof identities],
  need: 'read' | 'manage',
  bindings: ReturnType<typeof entry>[],
  resource: Partial<{ tenantId: string; ownerId: string; organizationId: string }> = {},
) {
  return organizationAccess({
    actor: { tenantId: TENANT, ownerId: OWNER, agentIdentity: identity },
    resource: { tenantId: TENANT, ownerId: OWNER, organizationId: ORG, ...resource },
    need,
    bindings,
  });
}

describe('organizationAccess', () => {
  it('s6324 accesso-organizzazione: the Director reads and manages, a business unit lead only reads', () => {
    const director = [entry(identities.director, { role: 'director' })];
    expect(ask(identities.director, 'read', director)).toEqual({
      allowed: true, level: 'read', grant: 'allow_organization_member', role: 'director',
    });
    expect(ask(identities.director, 'manage', director)).toEqual({
      allowed: true, level: 'manage', grant: 'allow_organization_director', role: 'director',
    });

    const design = [entry(identities.design, { role: 'capo-bu' })];
    expect(ask(identities.design, 'read', design)).toMatchObject({ allowed: true, level: 'read', role: 'capo-bu' });
    expect(ask(identities.design, 'manage', design)).toMatchObject({ allowed: false, refusal: 'director_only' });
    const sviluppo = [entry(identities.sviluppo, { role: 'capo-bu' })];
    expect(ask(identities.sviluppo, 'manage', sviluppo)).toMatchObject({ allowed: false, refusal: 'director_only' });
  });

  it('reads without a role, refuses to manage when the role is missing or ambiguous', () => {
    const legacy = [entry(identities.design)];
    expect(ask(identities.design, 'read', legacy)).toMatchObject({ allowed: true, role: null });
    expect(ask(identities.design, 'manage', legacy)).toMatchObject({ allowed: false, refusal: 'role_unknown' });

    const mixed = [
      entry(identities.director, { role: 'director' }),
      entry(identities.director, { role: 'capo-bu' }),
    ];
    expect(ask(identities.director, 'read', mixed)).toMatchObject({ allowed: true, role: null });
    expect(ask(identities.director, 'manage', mixed)).toMatchObject({ allowed: false, refusal: 'role_ambiguous' });

    const partlyMissing = [entry(identities.director, { role: 'director' }), entry(identities.director)];
    expect(ask(identities.director, 'manage', partlyMissing)).toMatchObject({ refusal: 'role_unknown' });
  });

  it('refuses foreign tenant, foreign owner, foreign organization and non members', () => {
    const director = [entry(identities.director, { role: 'director' })];
    expect(ask(identities.director, 'read', director, { tenantId: 'tenant-2' })).toMatchObject({
      refusal: 'foreign_tenant',
    });
    expect(ask(identities.director, 'read', director, { ownerId: 'owner-2' })).toMatchObject({
      refusal: 'foreign_owner',
    });
    expect(ask(identities.director, 'read', director, { organizationId: 'altra' })).toMatchObject({
      refusal: 'foreign_organization',
    });
    expect(ask(identities.director, 'read', [])).toMatchObject({ refusal: 'not_member' });
    expect(
      ask(identities.director, 'read', [entry(identities.director, { role: 'director', withdrawn: true })]),
    ).toMatchObject({ refusal: 'not_member' });

    const other = { ...identities.director, vaultAgentId: 99 };
    expect(ask(identities.director, 'read', [entry(other, { role: 'director' })])).toMatchObject({
      refusal: 'not_member',
    });
  });

  it('does not count withdrawn bindings toward the role', () => {
    const bindings = [
      entry(identities.director, { role: 'director' }),
      entry(identities.director, { role: 'capo-bu', withdrawn: true }),
    ];
    expect(ask(identities.director, 'manage', bindings)).toMatchObject({ allowed: true, level: 'manage' });
  });

  it('refuses a binding of another owner mixed into the list', () => {
    const bindings = [
      entry(identities.director, { role: 'director' }),
      entry(identities.director, { role: 'director', owner: 'owner-2' }),
    ];
    expect(ask(identities.director, 'manage', bindings)).toMatchObject({ refusal: 'not_member' });
  });

  it('schema accepts the two forms and rejects an invented refusal', () => {
    expect(ORGANIZATION_ACCESS_NEEDS).toEqual(['read', 'manage']);
    expect(ORGANIZATION_ACCESS_REFUSALS).toHaveLength(7);
    for (const refusal of ORGANIZATION_ACCESS_REFUSALS) {
      expect(OrganizationAccessDecisionSchema.safeParse({ allowed: false, refusal, reason: 'x' }).success).toBe(true);
    }
    expect(
      OrganizationAccessDecisionSchema.safeParse({ allowed: false, refusal: 'because', reason: 'x' }).success,
    ).toBe(false);
    expect(
      OrganizationAccessDecisionSchema.safeParse({
        allowed: true, level: 'manage', grant: 'allow_organization_director', role: 'director',
      }).success,
    ).toBe(true);
    expect(
      OrganizationAccessDecisionSchema.safeParse({
        allowed: true, level: 'manage', grant: 'allow_everyone', role: null,
      }).success,
    ).toBe(false);
  });
});
