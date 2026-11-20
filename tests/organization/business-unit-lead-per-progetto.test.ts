import { describe, expect, it } from 'vitest';
import {
  BUSINESS_UNIT_LEAD_BIRTH_REFUSAL,
  businessUnitLeadAgentId,
  businessUnitLeadProjectCode,
  businessUnitLeadProjectCodeOfAgentId,
  businessUnitSlugOfLeadAgentId,
} from '../../src/organization/business-unit-lead.js';

const scope = (projectId: string, ownerId = '1', companyId = 'good-choice') => ({ ownerId, companyId, projectId });
const LIVE = ['app', 'backend', 'brand', 'business-brand', 'conformita', 'contenuti', 'dati', 'dati-prodotto', 'design',
  'design-ux-ui', 'engineering', 'legale-privacy', 'nutrizione', 'orto-design', 'orto-web', 'product-ownership', 'qa', 'qa-feedback'];

describe('s6856 capo-per-progetto', () => {
  it('(a) gives the four known codes and another owner another code', () => {
    expect(businessUnitLeadProjectCode(scope('scelta-giusta'))).toBe('en1qj');
    expect(businessUnitLeadProjectCode(scope('good-choice'))).toBe('aphf8');
    expect(businessUnitLeadProjectCode(scope('orto-facile'))).toBe('y866a');
    expect(businessUnitLeadProjectCode(scope('scelta-giusta', '2'))).toBe('bl0nq');
  });
  it('(b) differs by company and project, same triple same code', () => {
    const base = businessUnitLeadProjectCode(scope('scelta-giusta'));
    expect(businessUnitLeadProjectCode(scope('scelta-giusta', '1', 'other'))).not.toBe(base);
    expect(businessUnitLeadProjectCode(scope('other'))).not.toBe(base);
    expect(businessUnitLeadProjectCode(scope('scelta-giusta'))).toBe(base);
  });
  it('(c) is 5 characters [a-z0-9]', () => {
    for (let i = 0; i < 200; i += 1) expect(businessUnitLeadProjectCode(scope(`p${i}`))).toMatch(/^[a-z0-9]{5}$/);
  });
  it('(d) lengths', () => {
    expect(businessUnitLeadAgentId('product-ownership', scope('scelta-giusta'))).toHaveLength(29);
    expect(businessUnitLeadAgentId('a'.repeat(18), scope('scelta-giusta'))).toHaveLength(30);
    expect(businessUnitLeadAgentId('engineering', scope('scelta-giusta'))).toBe('capo-engineering--en1qj');
    expect(businessUnitLeadAgentId('engineering', scope('good-choice'))).toBe('capo-engineering--aphf8');
  });
  it('(e) a 19-character unit throws with a project, not without', () => {
    expect(() => businessUnitLeadAgentId('a'.repeat(19), scope('scelta-giusta'))).toThrow();
    expect(businessUnitLeadAgentId('a'.repeat(19))).toBe(`capo-${'a'.repeat(19)}`);
  });
  it('(f) reads the unit in both forms for the 18 live ids', () => {
    for (const unit of LIVE) {
      expect(businessUnitSlugOfLeadAgentId(`capo-${unit}`)).toBe(unit);
      expect(businessUnitSlugOfLeadAgentId(`capo-${unit}--en1qj`)).toBe(unit);
    }
    expect(businessUnitSlugOfLeadAgentId('capo-engineering--')).toBeNull();
    expect(businessUnitSlugOfLeadAgentId('capo-engineering--en1qj')).toBe('engineering');
  });
  it('(g) null cases', () => {
    for (const id of ['capo-engineering--', 'capo-engineering--EN1QJ', 'capo-engineering--en1q', 'capo--en1qj',
      'capo-a--bbbbb--ccccc', `capo-${'a'.repeat(19)}--en1qj`, 'director-good-choice']) {
      expect(businessUnitSlugOfLeadAgentId(id)).toBeNull();
    }
  });
  it('(h) reads the project code', () => {
    expect(businessUnitLeadProjectCodeOfAgentId('capo-engineering--en1qj')).toBe('en1qj');
    expect(businessUnitLeadProjectCodeOfAgentId('capo-engineering')).toBeNull();
    expect(businessUnitLeadProjectCodeOfAgentId('director-good-choice')).toBeNull();
  });
  it('(i) round trip', () => {
    for (const unit of LIVE) expect(businessUnitSlugOfLeadAgentId(businessUnitLeadAgentId(unit, scope('scelta-giusta')))).toBe(unit);
  });
  it('(j) refusal codes', () => {
    expect(BUSINESS_UNIT_LEAD_BIRTH_REFUSAL).toEqual({
      projectMissing: 'progetto_mancante',
      unitTooLongForProject: 'reparto_troppo_lungo_per_progetto',
      leadWithoutProjectGroup: 'capo_senza_gruppo_progetto',
      projectGroupMissing: 'gruppo_progetto_assente',
    });
  });
  it('(k) no collisions among 503 projects', () => {
    const projects = ['scelta-giusta', 'good-choice', 'orto-facile', ...Array.from({ length: 500 }, (_, i) => `p${i}`)];
    expect(new Set(projects.map((p) => businessUnitLeadProjectCode(scope(p)))).size).toBe(503);
  });
});
