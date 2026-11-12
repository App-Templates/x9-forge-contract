import { expect, it } from 'vitest';
import { EmailMessageCodeSchema, emailMessageCode, sameEmailMessage } from '../../src/messaging/message-code.js';

const id = '010001a1ca7de3f4-0a1b2c3d-0000@email.amazonses.com';
const code = `<${id}>`;

it('s6341 emailMessageCode turns a bare production message id into the bracketed code', () => {
  expect(emailMessageCode(id)).toBe(code);
  expect(emailMessageCode(code)).toBe(code);
});

it('trims surrounding whitespace for bare IDs and complete codes', () => {
  expect(emailMessageCode(` \t${id}\n`)).toBe(code);
  expect(emailMessageCode(` \t${code}\n`)).toBe(code);
  expect(emailMessageCode(' a@b ')).toBe('<a@b>');
});

it('leaves other text formats unchanged after trimming', () => {
  for (const text of ['no-at-sign', '<a@b', 'a@b>', 'a@@b', 'a b@c', 'Name <a@b>', '']) {
    expect(emailMessageCode(text)).toBe(text);
  }
  expect(emailMessageCode(' text without at sign ')).toBe('text without at sign');
});

it('compares normalized message references without conflating different messages', () => {
  expect(sameEmailMessage(id, code)).toBe(true);
  expect(sameEmailMessage(` ${code} `, id)).toBe(true);
  expect(sameEmailMessage(id, 'another@email.amazonses.com')).toBe(false);
  expect(sameEmailMessage('a@b', '<A@b>')).toBe(false);
});

it('accepts complete message codes up to exactly 998 characters', () => {
  expect(EmailMessageCodeSchema.parse(code)).toBe(code);
  const longest = `<${'a'.repeat(994)}@b>`;
  expect(longest.length).toBe(998);
  expect(EmailMessageCodeSchema.parse(longest)).toBe(longest);
  expect(EmailMessageCodeSchema.safeParse(`<${'a'.repeat(995)}@b>`).success).toBe(false);
});

it('rejects bare IDs, whitespace and malformed bracketed message codes', () => {
  for (const value of [id, 'plain text', '<a@@b>', '<a b@c>', '<@b>', '<a@>', '<<a@b>>', `${code} `, `${code}\n`]) {
    expect(EmailMessageCodeSchema.safeParse(value).success, value).toBe(false);
  }
});
