import { describe, expect, it } from 'vitest';
import {
  BUSINESS_UNIT_LEAD_PROJECT_VERDICTS,
  businessUnitLeadProjectCode,
  businessUnitLeadProjectVerdict,
  type BusinessUnitLeadProjectScope,
} from '../../src/organization/business-unit-lead.js';

const scope = (projectId: string, ownerId = '1', companyId = 'good-choice'): BusinessUnitLeadProjectScope => (
  { ownerId, companyId, projectId }
);

describe('s7036 capo-di-un-progetto', () => {
  it('(a) matches each birth code only to its project among four projects', () => {
    expect(BUSINESS_UNIT_LEAD_PROJECT_VERDICTS).toEqual(['same_project', 'other_project', 'not_proven']);
    const projects = [
      { project: scope('scelta-giusta'), code: 'en1qj' },
      { project: scope('good-choice'), code: 'aphf8' },
      { project: scope('orto-facile'), code: 'y866a' },
      { project: scope('quarto-progetto'), code: businessUnitLeadProjectCode(scope('quarto-progetto')) },
    ];
    expect(new Set(projects.map(({ code }) => code)).size).toBe(4);
    for (const lead of projects) {
      for (const target of projects) {
        expect(businessUnitLeadProjectVerdict({
          agentId: `capo-dati--${lead.code}`,
          project: target.project,
        })).toBe(lead.project.projectId === target.project.projectId ? 'same_project' : 'other_project');
      }
    }
  });

  it('(b) rejects another owner or company for the same unit and project id', () => {
    for (const project of [scope('scelta-giusta', '2'), scope('scelta-giusta', '1', 'other')]) {
      expect(businessUnitLeadProjectVerdict({ agentId: 'capo-dati--en1qj', project })).toBe('other_project');
    }
  });

  it('(c) uses the historical lead project recipient', () => {
    const input = { agentId: 'capo-dati', recipientProjectIds: ['good-choice'] };
    expect(businessUnitLeadProjectVerdict({ ...input, project: scope('good-choice') })).toBe('same_project');
    expect(businessUnitLeadProjectVerdict({ ...input, project: scope('scelta-giusta') })).toBe('other_project');
  });

  it('(d) accepts either of two historical project recipients', () => {
    const recipientProjectIds: readonly string[] = ['good-choice', 'orto-facile'];
    for (const projectId of recipientProjectIds) {
      expect(businessUnitLeadProjectVerdict({
        agentId: 'capo-contenuti', project: scope(projectId), recipientProjectIds,
      })).toBe('same_project');
    }
  });

  it('(e) leaves a historical lead unproven with empty or absent recipients', () => {
    const input = { agentId: 'capo-dati', project: scope('good-choice') };
    expect(businessUnitLeadProjectVerdict({ ...input, recipientProjectIds: [] })).toBe('not_proven');
    expect(businessUnitLeadProjectVerdict(input)).toBe('not_proven');
  });

  it('(f) leaves non-lead ids unproven even with a matching recipient', () => {
    for (const agentId of ['director-good-choice', 'lab-good-choice', '']) {
      expect(businessUnitLeadProjectVerdict({
        agentId, project: scope('good-choice'), recipientProjectIds: ['good-choice'],
      })).toBe('not_proven');
    }
  });

  it('(g) lets the birth code prevail over conflicting recipients', () => {
    for (const recipientProjectIds of [['p:good-choice'], ['good-choice']]) {
      const input = { agentId: 'capo-dati--en1qj', recipientProjectIds };
      expect(businessUnitLeadProjectVerdict({ ...input, project: scope('good-choice') })).toBe('other_project');
      expect(businessUnitLeadProjectVerdict({ ...input, project: scope('scelta-giusta') })).toBe('same_project');
    }
  });
});
