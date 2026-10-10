import { describe, expect, it } from 'vitest';
import { AgentCredentialsSchema, KNOWN_CREDENTIAL_KEYS, getAgentCredentialServiceMetadata,
  AgentCredentialServiceMetadataSchema, AgentCredentialServiceSchema } from '../../src/agent/index.js';

const additions = [
  'GOOGLE_CONTACTS_CLIENT_ID', 'GOOGLE_CONTACTS_CLIENT_SECRET', 'GOOGLE_CONTACTS_REFRESH_TOKEN',
  'NETATMO_CLIENT_ID', 'NETATMO_CLIENT_SECRET', 'NETATMO_REFRESH_TOKEN', 'NETATMO_ACCESS_TOKEN', 'NETATMO_PASSWORD',
] as const;
const credentials = ['GOOGLE_CALENDAR_CLIENT_ID', ...additions] as const;

describe('Provider credentials available to the existing Master import', () => {
  it.each(additions)('declares %s as a known key', key => {
    expect([...KNOWN_CREDENTIAL_KEYS]).toContain(key);
  });
  it.each(additions)('declares %s as an explicit optional string', key => {
    expect(Object.keys(AgentCredentialsSchema.shape)).toContain(key);
    const field = AgentCredentialsSchema.shape[key as keyof typeof AgentCredentialsSchema.shape];
    expect(field.safeParse(undefined).success).toBe(true);
    expect(field.safeParse('synthetic-provider-value').success).toBe(true);
    expect(field.safeParse(7).success).toBe(false);
  });
  it.each(credentials)('attests importable canonical metadata for %s', key => {
    const entry = getAgentCredentialServiceMetadata(key);
    expect(entry).not.toBeNull();
    expect(entry).toMatchObject({ key, kind: 'credential', secret: !key.endsWith('_CLIENT_ID'),
      service: { type: 'commercial', id: key.startsWith('NETATMO_') ? 'netatmo' : 'google' } });
    expect(AgentCredentialServiceMetadataSchema.safeParse(entry).success).toBe(true);
    expect(AgentCredentialServiceSchema.safeParse(entry!.service).success).toBe(true);
    expect(Object.keys(entry!).sort()).toEqual(['key', 'kind', 'label', 'secret', 'service']);
  });
});
