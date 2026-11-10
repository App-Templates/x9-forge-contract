import { describe, expect, it } from 'vitest';
import { CapabilityAgentRouteErrorSchema } from '../../src/http/endpoints/internal-capability-agent.js';

describe('capability agent research minimum', () => {
  it('s6161 minimo-ricerca-muto: CapabilityAgentRouteErrorSchema keeps an optional positive minimumUsd on budget_below_minimum and refuses it on any other error', () => {
    const response = { ok: false, error: 'budget_below_minimum', minimumUsd: 7.12 };
    expect(CapabilityAgentRouteErrorSchema.parse(response)).toEqual(response);

    for (const error of ['invalid_request', 'agent_mismatch', 'not_configured', 'invalid_config', 'unknown_model_rate']) {
      expect(CapabilityAgentRouteErrorSchema.safeParse({ ...response, error }).success, error).toBe(false);
      expect(CapabilityAgentRouteErrorSchema.parse({ ok: false, error })).toEqual({ ok: false, error });
    }
  });

  it('s6161 a budget_below_minimum without minimumUsd still parses', () => {
    const response = JSON.parse('{"ok":false,"error":"budget_below_minimum"}');
    expect(CapabilityAgentRouteErrorSchema.parse(response)).toEqual(response);
  });

  it('s6161 zero, negative or infinite minimumUsd is refused', () => {
    for (const minimumUsd of [0, -0.01, Infinity, -Infinity, NaN]) {
      expect(CapabilityAgentRouteErrorSchema.safeParse({
        ok: false,
        error: 'budget_below_minimum',
        minimumUsd,
      }).success, String(minimumUsd)).toBe(false);
    }
  });
});
