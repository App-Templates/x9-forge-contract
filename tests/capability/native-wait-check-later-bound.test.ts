import { expect, it } from 'vitest';
import {
  PAPERCLIP_CHECK_LATER_MAX_SECONDS,
  PaperclipCheckLaterInputSchema,
  PaperclipCheckLaterSchema,
} from '../../src/capability/paperclip/native-wait.js';

const monitor = {
  notes: 'Check the external job result.',
  serviceName: 'external-job',
};
const issueId = '11111111-1111-4111-8111-111111111111';

it('s6183 attesa-piu-lunga-di-un-ora: PaperclipCheckLaterSchema accepts afterSeconds up to 604800 and refuses 604801', () => {
  for (const afterSeconds of [7200, 604800]) {
    const input = { ...monitor, afterSeconds };
    expect(PaperclipCheckLaterSchema.parse(input)).toEqual(input);
  }
  expect(PAPERCLIP_CHECK_LATER_MAX_SECONDS).toBe(604800);
  expect(PaperclipCheckLaterSchema.safeParse({ ...monitor, afterSeconds: 604801 }).success).toBe(false);
});

it('s6183 PaperclipCheckLaterInputSchema has the same bound', () => {
  for (const afterSeconds of [30, 7200, 604800]) {
    const input = { ...monitor, issueId, afterSeconds };
    expect(PaperclipCheckLaterInputSchema.parse(input)).toEqual(input);
  }
  expect(PaperclipCheckLaterInputSchema.safeParse({ ...monitor, issueId, afterSeconds: 604801 }).success).toBe(false);
});

it('s6183 29 seconds is still refused, 3600 still accepted', () => {
  for (const afterSeconds of [30, 1800, 3600]) {
    const reviewCheck = { ...monitor, afterSeconds };
    const toolInput = { ...reviewCheck, issueId };
    expect(PaperclipCheckLaterSchema.parse(reviewCheck)).toEqual(reviewCheck);
    expect(PaperclipCheckLaterInputSchema.parse(toolInput)).toEqual(toolInput);
  }
  expect(PaperclipCheckLaterSchema.safeParse({ ...monitor, afterSeconds: 29 }).success).toBe(false);
  expect(PaperclipCheckLaterInputSchema.safeParse({ ...monitor, issueId, afterSeconds: 29 }).success).toBe(false);
});
