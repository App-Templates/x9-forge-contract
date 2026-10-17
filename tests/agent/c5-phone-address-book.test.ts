import { describe, expect, it } from 'vitest';
import { AgentChannelAddressBookSchema as Book, isEmailSenderAdmitted } from '../../src/agent/agent-channel-access.js';

const binding = { scope: { tenantId: 'tenant-test', ownerId: 'owner-test', agentId: 'runtime-test' },
  identity: { managementAgentId: 'management-test', runtimeAgentId: 'runtime-test', vaultAgentId: 101 } };
const observedAt = '2026-10-08T12:00:00.000Z';
const legacy = { ...binding, status: 'complete', version: 4, observedAt, emails: ['allowed@example.test'] };
const phone = '+390212345678';
const book = { ...legacy, phones: [phone] };

describe('C5 additive canonical telephone address book', () => {
  it('preserves the exact legacy email-only shape without fabricating phones', () => {
    expect(Book.parse(legacy)).toEqual(legacy);
    expect(Book.parse(legacy)).not.toHaveProperty('phones');
    expect(isEmailSenderAdmitted({ kind: 'email', mode: 'address-book' }, 'allowed@example.test', legacy, binding, Date.parse(observedAt))).toBe(true);
  });
  it('roundtrips exact phone numbers alongside email entries', () => {
    expect(Book.parse(book)).toEqual(book);
    expect(isEmailSenderAdmitted({ kind: 'email', mode: 'address-book' }, 'allowed@example.test', book, binding, Date.parse(observedAt))).toBe(true);
  });
  it('distinguishes empty and unobserved telephone lists from an absent legacy field', () => {
    expect(Book.parse({ ...book, phones: [] })).toEqual({ ...book, phones: [] });
    expect(Book.parse({ ...legacy, phones: null })).toEqual({ ...legacy, phones: null });
  });
  it('roundtrips a scoped unavailable telephone source without admitting partial entries', () => {
    const unavailable = { ...legacy, status: 'unavailable', version: null, observedAt: null, emails: null, phones: null };
    expect(Book.parse(unavailable)).toEqual(unavailable);
    expect(Book.parse({ ...unavailable, status: 'partial', version: 4, observedAt })).toEqual({ ...unavailable, status: 'partial', version: 4, observedAt });
  });
  it.each(['partial', 'unavailable'])('rejects a %s source publishing telephone entries', status => {
    expect(Book.safeParse({ ...book, status, emails: null }).success).toBe(false);
    expect(Book.safeParse({ ...book, status, emails: null, phones: [] }).success).toBe(false);
  });
  it.each(['12345678', '+012345678', '+3902 12345678', '+390212345678 ', ' +390212345678', '+1234567', '+1234567890123456', '*', 'tel:+390212345678'])('rejects noncanonical phone %s', value => {
    expect(Book.safeParse({ ...book, phones: [value] }).success).toBe(false);
  });
  it('rejects duplicate canonical phone numbers', () => {
    expect(Book.safeParse({ ...book, phones: [phone, phone] }).success).toBe(false);
  });
  it('limits each scoped list independently to 2048 exact entries', () => {
    const phones = Array.from({ length: 2048 }, (_, i) => `+391000${String(i).padStart(4, '0')}`);
    expect(Book.safeParse({ ...book, phones }).success).toBe(true);
    expect(Book.safeParse({ ...book, phones: [...phones, '+392000000000'] }).success).toBe(false);
  });
  it.each(['version', 'observedAt', 'emails'])('telephone data cannot repair missing complete-source %s', field => {
    expect(Book.safeParse({ ...book, [field]: null }).success).toBe(false);
  });
  it('rejects private metadata and unknown phone containers', () => {
    expect(Book.safeParse({ ...book, credentials: {} }).success).toBe(false);
    expect(Book.safeParse({ ...book, phones: [{ number: phone }] }).success).toBe(false);
  });
});
