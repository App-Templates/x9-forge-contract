import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  InternalAgentTurnErrorResponseSchema,
  InternalAgentTurnRunErrorResponseSchema,
  ORGANIZATION_ADMISSION_REFUSAL_CODES,
  OrganizationAdmissionRefusalCodeSchema,
} from '../../src/http/endpoints/internal-agent-turn.js';

const require = createRequire(import.meta.url);

describe('organization_binding_ambiguous', () => {
  it('s5905 organization_binding_ambiguous is an admission refusal code', () => {
    expect(ORGANIZATION_ADMISSION_REFUSAL_CODES).toContain('organization_binding_ambiguous');
    expect(OrganizationAdmissionRefusalCodeSchema.safeParse('organization_binding_ambiguous').success).toBe(true);
    expect(OrganizationAdmissionRefusalCodeSchema.safeParse('organization_binding_unknown').success).toBe(false);
  });

  it('s5905 a refused turn response with organization_binding_ambiguous parses', () => {
    // production shape of the agent-core 403 of 09/11, with the old and the new code
    for (const error of ['organization_binding_missing', 'organization_binding_ambiguous']) {
      const body = { ok: false, error };
      expect(InternalAgentTurnErrorResponseSchema.parse(body)).toEqual(body);
      const refused = InternalAgentTurnRunErrorResponseSchema.parse(body);
      expect(OrganizationAdmissionRefusalCodeSchema.safeParse(refused.error).success).toBe(true);
    }
  });

  it('s5905 the CommonJS dist lists organization_binding_ambiguous', () => {
    const commonJs = require('../../dist/http/endpoints/internal-agent-turn.cjs');
    expect(commonJs.ORGANIZATION_ADMISSION_REFUSAL_CODES).toContain('organization_binding_ambiguous');
  });
});
