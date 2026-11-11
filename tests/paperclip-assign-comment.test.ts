import { it, expect } from 'vitest';
import { PaperclipAssignInputSchema as Assign } from '../src/capability/paperclip/tools.js';

const issueId = '9daf445f-265a-4b72-a976-48bd571a2155';

it('s6288 assegna-con-nota: accepts an optional comment', () => {
  const value = {
    issueId, roleRef: 'rd-lab',
    comment: 'Il servizio del Lab è stato ripristinato alle 01:49Z: riprendi il dossier di Orto Facile.',
  };
  expect(Assign.safeParse(value).success).toBe(true);
});
it('still accepts today\'s input without comment', () => {
  expect(Assign.safeParse({ issueId, roleRef: 'rd-lab' }).success).toBe(true);
});
it('accepts a comment of exactly 4000 characters', () => {
  expect(Assign.safeParse({ issueId, roleRef: 'rd-lab', comment: 'a'.repeat(4000) }).success).toBe(true);
});
it('rejects empty, blank, oversized comments and unknown fields', () => {
  for (const comment of ['', '   ', 'a'.repeat(4001)]) {
    expect(Assign.safeParse({ issueId, roleRef: 'rd-lab', comment }).success).toBe(false);
  }
  expect(Assign.safeParse({ issueId, roleRef: 'rd-lab', note: 'x' }).success).toBe(false);
});
