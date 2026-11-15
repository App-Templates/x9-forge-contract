import { describe, expect, it } from 'vitest';
import { businessUnitLeadAgentId } from '../../src/organization/business-unit-lead.js';
import {
  SharedMailboxLabelSchema,
  SharedMailboxSchema,
  businessUnitLeadMailboxLabel,
  decideSharedMailboxRoute,
  formatSharedMailboxSubjectLabel,
  parseSharedMailboxSubjectLabel,
} from '../../src/organization/shared-mailbox.js';

const leadId = (unit: string, projectId: string): string => (
  businessUnitLeadAgentId(unit, { ownerId: '1', companyId: 'good-choice', projectId })
);
const label = (unit: string, projectId: string): string => (
  businessUnitLeadMailboxLabel({ agentId: leadId(unit, projectId), businessUnit: unit, projectId })
);

describe('s7044 etichetta-capo-casella', () => {
  it('(a) keeps the unit alone for a historical lead or without a project', () => {
    expect(businessUnitLeadMailboxLabel({ agentId: 'capo-dati', businessUnit: 'dati', projectId: 'dispensa-pronta' })).toBe('dati');
    expect(businessUnitLeadMailboxLabel({ agentId: leadId('dati', 'dispensa-pronta'), businessUnit: 'dati' })).toBe('dati');
  });

  it('(b) names unit and project for a lead born for a project', () => {
    const a = label('dati', 'dispensa-pronta');
    const b = label('dati', 'good-choice');
    expect(a).toBe('dati dispensa-pronta');
    expect(b).toBe('dati good-choice');
    expect(a.toLowerCase()).not.toBe(b.toLowerCase());
  });

  it('(c) the production case: same unit label is refused, the function label is accepted', () => {
    const base = {
      mailboxId: 'm1', tenantId: 'tenant-1', companyId: 'good-choice', providerInboxId: 'inbox-1', address: 'casella@example.com',
      defaultAgentId: 'capo-dati',
    };
    const newId = leadId('dati', 'dispensa-pronta');
    const holders = (newLabel: string) => [
      { agentId: 'capo-dati', label: 'dati', displayName: 'Capo dati' },
      { agentId: newId, label: newLabel, displayName: 'Capo dati nuovo' },
    ];
    const refused = SharedMailboxSchema.safeParse({ ...base, holders: holders('dati') });
    expect(refused.success).toBe(false);
    expect(JSON.stringify(refused.error?.issues)).toContain('unique ignoring case');
    const ok = SharedMailboxSchema.safeParse({ ...base, holders: holders(label('dati', 'dispensa-pronta')) });
    expect(ok.success).toBe(true);
  });

  it('(d) cleans characters, reads back from the subject and routes by label', () => {
    for (const projectId of ['Dispensa_Pronta.2', 'città nuova']) {
      const l = label('dati', projectId);
      expect(SharedMailboxLabelSchema.safeParse(l).success).toBe(true);
      expect(parseSharedMailboxSubjectLabel(formatSharedMailboxSubjectLabel(l))).toBe(l);
    }
    const newId = leadId('dati', 'dispensa-pronta');
    const mailbox = SharedMailboxSchema.parse({
      mailboxId: 'm1', tenantId: 'tenant-1', companyId: 'good-choice', providerInboxId: 'inbox-1', address: 'casella@example.com',
      defaultAgentId: 'capo-dati',
      holders: [
        { agentId: 'capo-dati', label: 'dati', displayName: 'Capo dati' },
        { agentId: newId, label: label('dati', 'dispensa-pronta'), displayName: 'Capo dati nuovo' },
      ],
    });
    expect(decideSharedMailboxRoute({ mailbox, threads: [], subject: '[dati dispensa-pronta] x' }))
      .toEqual({ agentId: newId, via: 'label' });
    expect(decideSharedMailboxRoute({ mailbox, threads: [], subject: '[dati] x' }))
      .toEqual({ agentId: 'capo-dati', via: 'label' });
  });

  it('(e) a long project gives a deterministic label of at most 40 characters, unique per project', () => {
    const common = 'progetto-molto-lungo-con-un-nome-che-non-finisce-mai-';
    const p1 = `${common}abcd`;
    const p2 = `${common}wxyz`;
    expect(p1.length).toBe(57);
    const l1 = label('dati', p1);
    const l2 = label('dati', p2);
    for (const l of [l1, l2]) {
      expect(l.length).toBeLessThanOrEqual(40);
      expect(SharedMailboxLabelSchema.safeParse(l).success).toBe(true);
    }
    expect(l1.toLowerCase()).not.toBe(l2.toLowerCase());
    expect(label('dati', p1)).toBe(l1);
  });

  it('(f) an invalid unit throws as today', () => {
    for (const businessUnit of ['', 'dati!']) {
      expect(() => businessUnitLeadMailboxLabel({ agentId: leadId('dati', 'dispensa-pronta'), businessUnit, projectId: 'dispensa-pronta' })).toThrow();
    }
  });
});
