import { describe, expect, it } from 'vitest';
import { feedback, schema } from './review-fixtures.js';
const base = { ...feedback, reviewerName: 'Stefano', kind: 'rating', rating: 8 };
const urls = Array.from({ length: 10 }, (_, i) => 'https://example.com/photo-' + i + '.jpg');
describe('review R2 reviewer name and photos', () => {
  it.each([undefined, [], urls])('accepts bounded optional attachments %#', attachments => {
    const value = { ...base, attachments };
    expect(schema('CapabilityFeedbackSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it('shares name and attachments with approval feedback', () => {
    const value = { ...feedback, kind: 'approval', decision: 'approved', reviewerName: 'Stefano', attachments: [urls[0]] };
    expect(schema('CapabilityFeedbackSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it('accepts the reviewer name at its limit', () => {
    expect(schema('CapabilityFeedbackSchema').safeParse({ ...base, reviewerName: 'N'.repeat(200) }).success).toBe(true);
  });
  it.each([
    { ...base, reviewerName: undefined }, { ...base, reviewerName: ' ' },
    { ...base, reviewerName: 'N'.repeat(201) }, { ...base, attachments: [...urls, urls[0]] },
    ...['file:///photo', 'javascript:alert(1)', 'data:image/png;base64,AA', 'ftp://example.com/p', 'bad', 'https://example.com/' + 'x'.repeat(2000)]
      .map(url => ({ ...base, attachments: [url] })),
    { ...base, attachments: [null] }, { ...base, attachments: 'https://example.com/photo.jpg' },
  ])('rejects invalid reviewer or attachments %#', value => {
    expect(schema('CapabilityFeedbackSchema').safeParse(value).success).toBe(false);
  });
  it.each([false, true])('declares whether photos are supported %s', attachments => {
    const value = { label: 'Assaggi', kind: 'rating', sources: ['project_view'], attachments };
    expect(schema('CapabilityFeedbackDeclarationSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([undefined, 'yes'])('requires an explicit boolean attachments declaration %#', attachments => {
    expect(schema('CapabilityFeedbackDeclarationSchema').safeParse({ label: 'Assaggi', kind: 'rating', sources: ['project_view'], attachments }).success).toBe(false);
  });
});
