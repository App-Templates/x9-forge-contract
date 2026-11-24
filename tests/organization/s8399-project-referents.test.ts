import { describe, expect, it } from 'vitest';
import {
  CompanyMapAnyEntrySchema,
  CompanyMapEntrySchema,
  companyMapConfirmedReferentScope,
  companyMapReferentsForProject,
  type CompanyMapEntry,
} from '../../src/organization/company-map.js';

const base = { tenantId: '1', organizationId: 'good-choice', clientId: 'good-choice' };
const scope = { ...base, projectId: 'good-choice-2' };
const stefano = 'stefano-argiolas';
const CLIENT_ROLE = 'Referente per Good Choice';
const PROJECT_ROLE = 'Referente del progetto';

function entry(
  level: 'client' | 'project' | 'business_unit',
  version: number,
  changes: Record<string, unknown> = {},
): CompanyMapEntry {
  return CompanyMapEntrySchema.parse({
    ...base,
    level,
    ...(level !== 'client' ? { projectId: 'good-choice-2' } : {}),
    ...(level === 'business_unit' ? { buSlug: 'design' } : {}),
    kind: 'referent', personRef: stefano, name: 'Stefano Argiolas', role: CLIENT_ROLE,
    email: 'stefano@example.invalid',
    version, ...(version > 1 ? { supersedes: version - 1 } : {}),
    digest: String(version).repeat(64).slice(0, 64).replace(/[^0-9a-f]/g, 'a'),
    source: { kind: 'decision', requestId: 'dec_3544a95d', planVersion: 1 },
    confirmedAt: '2026-11-23T10:00:00Z',
    ...changes,
  });
}

const clientV5 = entry('client', 5);
const projectV2 = entry('project', 2, { role: PROJECT_ROLE });
const ortoFacile = entry('client', 3, {
  clientId: 'orto-facile', personRef: 'anna-orto', name: 'Anna Orto', role: 'Titolare', email: 'anna@example.invalid',
});
const otherClient = entry('client', 9, {
  clientId: 'altro-cliente', personRef: stefano, role: 'Altro ruolo', email: 'altro@example.invalid',
});

const names = (list: CompanyMapEntry[]) => list.map((e) => `${e.personRef}:${e.level}:${e.version}`);

describe('s8399 project write scope', () => {
  it('s8399 project write scope: a client source confirmed inside a project goes to the project only', () => {
    const target = companyMapConfirmedReferentScope({ level: clientV5.level }, 'good-choice-2');
    expect(target).toEqual({ level: 'project', projectId: 'good-choice-2' });
    expect(target).not.toHaveProperty('buSlug');
    // the approved role stays the text the owner read; no client draft appears
    const draft = { ...clientV5, ...target, role: clientV5.role };
    expect(draft.level).toBe('project');
    expect(draft.role).toBe(CLIENT_ROLE);
    expect(clientV5.level).toBe('client');
  });

  it('company confirmation without a project stays at client level', () => {
    expect(companyMapConfirmedReferentScope({ level: 'client' })).toEqual({ level: 'client' });
    expect(companyMapConfirmedReferentScope({ level: 'client' }, undefined)).toEqual({ level: 'client' });
  });

  it('project and business unit are never downgraded', () => {
    expect(companyMapConfirmedReferentScope({ level: 'project', projectId: 'good-choice-2' }, 'good-choice-2'))
      .toEqual({ level: 'project', projectId: 'good-choice-2' });
    expect(companyMapConfirmedReferentScope({ level: 'project', projectId: 'good-choice-2' }))
      .toEqual({ level: 'project', projectId: 'good-choice-2' });
    expect(companyMapConfirmedReferentScope({ level: 'business_unit', projectId: 'good-choice-2', buSlug: 'design' }, 'good-choice-2'))
      .toEqual({ level: 'business_unit', projectId: 'good-choice-2', buSlug: 'design' });
  });

  it('a source of another project is an error, never relabelled', () => {
    expect(() => companyMapConfirmedReferentScope({ level: 'project', projectId: 'good-choice-1' }, 'good-choice-2')).toThrow();
    expect(() => companyMapConfirmedReferentScope({ level: 'business_unit', projectId: 'good-choice-1', buSlug: 'design' }, 'good-choice-2')).toThrow();
  });

  it('invalid scopes are refused by the existing level rules', () => {
    expect(() => companyMapConfirmedReferentScope({ level: 'project' }, 'good-choice-2')).toThrow();
    expect(() => companyMapConfirmedReferentScope({ level: 'business_unit', projectId: 'good-choice-2' })).toThrow();
    expect(() => companyMapConfirmedReferentScope({ level: 'client', buSlug: 'design' }, 'good-choice-2')).toThrow();
    expect(() => companyMapConfirmedReferentScope({ level: 'client' }, '')).toThrow();
  });

  it('does not move or alter the source entry, its schema, JSON or digest', () => {
    const frozen = Object.freeze({ ...clientV5 });
    const before = JSON.stringify(frozen);
    const parsedBefore = CompanyMapAnyEntrySchema.parse(JSON.parse(before));
    companyMapConfirmedReferentScope(frozen, 'good-choice-2');
    expect(JSON.stringify(frozen)).toBe(before);
    expect(CompanyMapAnyEntrySchema.parse(JSON.parse(before))).toEqual(parsedBefore);
    expect(frozen.digest).toBe(clientV5.digest);
    expect(frozen.level).toBe('client');
    expect(frozen.projectId).toBeUndefined();
  });
});

describe('s8399 project beats client', () => {
  const pool = [clientV5, projectV2, ortoFacile, otherClient];

  it('s8399 project beats client: v2 of the project wins over v5 of the client, in both orders', () => {
    for (const entries of [pool, [...pool].reverse()]) {
      const result = companyMapReferentsForProject({ entries, scope });
      expect(result).toEqual([projectV2]);
      expect(result[0]).toBe(projectV2);
    }
  });

  it('falls back to the client entry when the person has no project entry', () => {
    const extra = entry('client', 4, { personRef: 'luca-bianchi', name: 'Luca Bianchi', email: 'luca@example.invalid' });
    const result = companyMapReferentsForProject({ entries: [extra, clientV5, projectV2], scope });
    expect(names(result)).toEqual(['luca-bianchi:client:4', `${stefano}:project:2`]);
    expect(result[0]).toBe(extra);
    expect(companyMapReferentsForProject({ entries: [clientV5], scope })).toEqual([clientV5]);
  });

  it('highest version only inside the same level', () => {
    const projectV3 = entry('project', 3, { role: 'Responsabile' });
    const result = companyMapReferentsForProject({ entries: [projectV2, projectV3, clientV5], scope });
    expect(result).toEqual([projectV3]);
    const clientV6 = entry('client', 6);
    expect(companyMapReferentsForProject({ entries: [clientV5, clientV6], scope })).toEqual([clientV6]);
  });

  it('two projects of the same company stay isolated', () => {
    const projectOne = entry('project', 7, { projectId: 'good-choice-1', role: 'Altro progetto' });
    const entries = [projectOne, projectV2, clientV5];
    expect(companyMapReferentsForProject({ entries, scope })).toEqual([projectV2]);
    expect(companyMapReferentsForProject({ entries, scope: { ...scope, projectId: 'good-choice-1' } })).toEqual([projectOne]);
    expect(companyMapReferentsForProject({ entries, scope: { ...scope, projectId: 'good-choice-3' } })).toEqual([clientV5]);
  });

  it('excludes other tenants, organizations, clients and business units', () => {
    const bu = entry('business_unit', 8, { role: 'Design' });
    const otherTenant = entry('client', 9, { tenantId: '2' });
    const otherOrg = entry('client', 9, { organizationId: 'altra-org' });
    expect(companyMapReferentsForProject({ entries: [bu, otherTenant, otherOrg, otherClient, ortoFacile], scope })).toEqual([]);
    expect(companyMapReferentsForProject({ entries: [bu, projectV2], scope })).toEqual([projectV2]);
  });

  it('sorts stably by personRef and does not mutate its input', () => {
    const zed = entry('client', 1, { personRef: 'zed', name: 'Zed', email: 'zed@example.invalid' });
    const abe = entry('project', 1, { personRef: 'abe', name: 'Abe', email: 'abe@example.invalid' });
    const entries = Object.freeze([zed, clientV5, abe]);
    const before = JSON.stringify(entries);
    expect(names(companyMapReferentsForProject({ entries, scope }))).toEqual(['abe:project:1', `${stefano}:client:5`, 'zed:client:1']);
    expect(JSON.stringify(entries)).toBe(before);
    expect(companyMapReferentsForProject({ entries: [], scope })).toEqual([]);
  });

  it('the client v5 entry stays valid and identical', () => {
    const json = JSON.stringify(clientV5);
    companyMapReferentsForProject({ entries: [clientV5, projectV2], scope });
    expect(JSON.stringify(clientV5)).toBe(json);
    expect(CompanyMapEntrySchema.parse(JSON.parse(json))).toEqual(clientV5);
    expect(clientV5.role).toBe(CLIENT_ROLE);
  });
});
