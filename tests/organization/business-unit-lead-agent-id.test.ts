import { describe, expect, it } from 'vitest';
import {
  BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX,
  businessUnitLeadAgentId,
  businessUnitSlugOfLeadAgentId,
} from '../../src/organization/business-unit-lead.js';

describe('business unit lead agent id', () => {
  it('Forge names the lead capo-<slug> and the slug is recovered from it', () => {
    expect(BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX).toBe('capo-');
    expect(businessUnitLeadAgentId('sviluppo')).toBe('capo-sviluppo');
    expect(businessUnitSlugOfLeadAgentId('capo-sviluppo')).toBe('sviluppo');
    expect(businessUnitSlugOfLeadAgentId('capo-design-2')).toBe('design-2');
  });

  it.each([
    ['the personal agent', 'x9'],
    ['the director', 'director-good-choice'],
    ['a prefix with no slug', 'capo-'],
    ['an uppercase slug', 'capo-Sviluppo'],
    ['a slug with an underscore', 'capo-svi_luppo'],
    ['a slug of more than 30 characters', `capo-${'a'.repeat(31)}`],
    ['a doubled prefix', 'capo-capo-sviluppo-'],
    ['an empty id', ''],
    ['the prefix not at the start', 'x-capo-sviluppo'],
  ])('is null for %s', (_label, id) => {
    expect(businessUnitSlugOfLeadAgentId(id)).toBeNull();
  });

  it('refuses to build the id of an invalid slug', () => {
    expect(() => businessUnitLeadAgentId('Sviluppo')).toThrow();
    expect(() => businessUnitLeadAgentId('')).toThrow();
  });

  it('round-trips', () => {
    for (const slug of ['dati', 'design', 'sviluppo', 'finanza', 'marketing-eu']) {
      expect(businessUnitSlugOfLeadAgentId(businessUnitLeadAgentId(slug))).toBe(slug);
    }
  });
});
