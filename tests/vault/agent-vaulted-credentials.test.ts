import { describe, it, expect } from 'vitest';
import { AgentCredentialsSchema } from '../../src/agent/agent-credentials.js';
import { AgentVaultedCredentialsSchema } from '../../src/vault/agent-vaulted-credentials.js';
import type { AgentCredentials } from '../../src/agent/agent-credentials.js';
import type { AgentVaultedCredentials } from '../../src/vault/agent-vaulted-credentials.js';

describe('AgentVaultedCredentialsSchema', () => {
  it('is the same reference as AgentCredentialsSchema (I11 referential equality)', () => {
    expect(AgentVaultedCredentialsSchema).toBe(AgentCredentialsSchema);
  });

  it('parses a small fixture identically under both schemas', () => {
    const fixture = {
      OPENAI_API_KEY: 'REDACTED',
      X9_INTERNAL_SECRET: 'REDACTED',
    };
    const a = AgentCredentialsSchema.parse(fixture);
    const b = AgentVaultedCredentialsSchema.parse(fixture);
    expect(a).toEqual(b);
  });

  it('type-level bidirectional assignability (verified at tsc --noEmit)', () => {
    // If these aren't assignable both directions, tsc will fail.
    const a: AgentCredentials = {} as AgentVaultedCredentials;
    const b: AgentVaultedCredentials = {} as AgentCredentials;
    void a;
    void b;
    expect(true).toBe(true);
  });
});
