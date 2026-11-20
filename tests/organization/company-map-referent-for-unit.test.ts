import { describe, expect, it } from 'vitest';
import { MODEL_TIERS } from '../../src/model-router/model-tier.js';
import {
  BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
  BusinessUnitLeadBirthRequestSchema,
  CompanyMapEntrySchema,
  REFERENT_FOR_UNIT_REFUSALS,
  referentForUnit,
} from '../../src/organization/index.js';

const base = {
  tenantId: '1',
  organizationId: 'good-choice',
  clientId: 'orto-facile-srl',
  kind: 'referent',
  personRef: 'maria-verdi',
  name: 'Maria Verdi',
  role: 'Owner',
  email: 'maria@example.com',
  source: { kind: 'seed' },
  confirmedAt: '2026-11-11T10:00:00+01:00',
  version: 1,
  digest: 'a'.repeat(64),
};
const clientEntry = (extra = {}) => CompanyMapEntrySchema.parse({ ...base, level: 'client', ...extra });
const projectEntry = (extra = {}) =>
  CompanyMapEntrySchema.parse({ ...base, level: 'project', projectId: 'orto-facile', ...extra });
const buEntry = (buSlug: string, extra = {}) =>
  CompanyMapEntrySchema.parse({ ...base, level: 'business_unit', projectId: 'orto-facile', buSlug, ...extra });

const scope = (buSlug: string) => ({
  tenantId: '1',
  organizationId: 'good-choice',
  clientId: 'orto-facile-srl',
  projectId: 'orto-facile',
  buSlug,
});
const referent = { personRef: 'maria-verdi' };

describe('referentForUnit', () => {
  it('s6347 referente-unico: finds the referent at business unit, then project, then client level', () => {
    const p = projectEntry();
    for (const bu of ['orto-web', 'orto-design']) {
      const r = referentForUnit({ entries: [p], scope: scope(bu), referent });
      expect(r).toMatchObject({ ok: true, level: 'project' });
    }
    const b = buEntry('orto-web');
    expect(referentForUnit({ entries: [p, b], scope: scope('orto-web'), referent })).toMatchObject({ ok: true, level: 'business_unit', entry: b });
    expect(referentForUnit({ entries: [p, b], scope: scope('orto-design'), referent })).toMatchObject({ ok: true, level: 'project' });
    expect(referentForUnit({ entries: [clientEntry()], scope: scope('orto-web'), referent })).toMatchObject({ ok: true, level: 'client' });
    expect(referentForUnit({ entries: [clientEntry(), p], scope: scope('orto-web'), referent })).toMatchObject({ level: 'project' });
  });

  it('refuses with a named code', () => {
    expect(REFERENT_FOR_UNIT_REFUSALS).toEqual(['referent_not_in_map', 'referent_superseded']);
    const notInMap = { ok: false, code: 'referent_not_in_map' };
    expect(referentForUnit({ entries: [projectEntry()], scope: scope('orto-web'), referent: { personRef: 'altro' } })).toEqual(notInMap);
    for (const other of [
      projectEntry({ projectId: 'altro-progetto' }),
      projectEntry({ organizationId: 'altra-org' }),
      projectEntry({ tenantId: '2' }),
      projectEntry({ clientId: 'altro-cliente' }),
    ]) {
      expect(referentForUnit({ entries: [other], scope: scope('orto-web'), referent })).toEqual(notInMap);
    }
    const v2 = projectEntry({ version: 2, supersedes: 1 });
    expect(referentForUnit({ entries: [v2], scope: scope('orto-web'), referent: { ...referent, entryVersion: 1 } })).toEqual({
      ok: false,
      code: 'referent_superseded',
    });
    expect(referentForUnit({ entries: [v2], scope: scope('orto-web'), referent })).toMatchObject({ ok: true });
    expect(referentForUnit({ entries: [v2], scope: scope('orto-web'), referent: { ...referent, entryVersion: 2 } })).toMatchObject({ ok: true });
  });

  it('takes the highest version in a level and ignores other units', () => {
    const v1 = projectEntry();
    const v2 = projectEntry({ version: 2, supersedes: 1 });
    const r = referentForUnit({ entries: [v2, v1], scope: scope('orto-web'), referent });
    expect(r).toMatchObject({ ok: true, entry: { version: 2 } });
    const other = buEntry('orto-design', { version: 5 });
    expect(referentForUnit({ entries: [v1, other], scope: scope('orto-web'), referent })).toMatchObject({ level: 'project' });
  });
});

describe('birth request projectId', () => {
  const request = {
    requestId: 'birth-capo-orto-web-1',
    tenantId: '1',
    ownerId: 'owner-1',
    organizationId: 'good-choice',
    company: { companyId: 'orto-facile-srl', name: 'Orto Facile' },
    businessUnit: {
      slug: 'orto-web',
      typeId: 'ricerca-mercato',
      name: 'Orto web',
      briefSection: 'Build the web shop for the company brief.',
      competencies: ['web'],
      referents: [{ referentRef: 'maria-verdi', name: 'Maria Verdi', role: 'Owner', email: 'maria@example.com' }],
    },
    profileTemplate: BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
    model: { tier: MODEL_TIERS[0] },
    capabilities: ['cap-ricerca'],
    paperclipParticipant: { participantId: 'participant-1', roles: ['lead'] },
  };
  it('accepts the request with projectId, still accepts it without, rejects an empty one', () => {
    expect(BusinessUnitLeadBirthRequestSchema.parse({ ...request, projectId: 'orto-facile' }).projectId).toBe('orto-facile');
    expect('projectId' in BusinessUnitLeadBirthRequestSchema.parse(request)).toBe(false);
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({ ...request, projectId: '' }).success).toBe(false);
  });
});
