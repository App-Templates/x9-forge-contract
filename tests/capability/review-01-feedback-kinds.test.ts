import { describe, expect, it } from 'vitest';
import { feedback, schema } from './review-fixtures.js';
describe('review R1 feedback kinds', () => {
  it.each(['rating', 'approval'])('exports kind %s', kind => {
    expect(schema('CapabilityFeedbackKindSchema').parse(kind)).toBe(kind);
  });
  it.each([1, 10])('retains rating boundary %s', rating => {
    const value = { ...feedback, kind: 'rating', rating };
    expect(schema('CapabilityFeedbackSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each(['approved', 'changes_requested'])('retains approval %s', decision => {
    const value = { ...feedback, kind: 'approval', decision };
    expect(schema('CapabilityFeedbackSchema').safeParse(value)).toMatchObject({ success: true, data: value });
    expect(schema('CapabilityFeedbackDecisionSchema').parse(decision)).toBe(decision);
    const declaration = { label: 'Revisioni', kind: 'approval', attachments: false, sources: ['project_view'] };
    expect(schema('CapabilityFeedbackDeclarationSchema').safeParse(declaration)).toMatchObject({ success: true, data: declaration });
  });
  it.each([
    { ...feedback, rating: 8 }, { ...feedback, kind: 'other', rating: 8 },
    { ...feedback, kind: 'rating', rating: 0 }, { ...feedback, kind: 'rating', rating: 11 },
    { ...feedback, kind: 'rating', rating: 1.5 }, { ...feedback, kind: 'approval' },
    { ...feedback, kind: 'approval', decision: 'rejected' },
    { ...feedback, kind: 'approval', decision: 'approved', rating: 8 },
    { ...feedback, kind: 'rating', rating: 8, decision: 'approved' },
  ])('rejects wrong feedback branch %#', value => {
    expect(schema('CapabilityFeedbackSchema').safeParse(value).success).toBe(false);
  });
});
