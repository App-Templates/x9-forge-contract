import { describe, expect, it } from 'vitest';
import {
  PLATFORM_PRESET_SOURCE_IDENTITY,
  isPlatformPresetSourceIdentity,
} from '../../src/model-router/index.js';

const x9 = { runtimeAgentId: 'x9', managementAgentId: 'x9-staging' };

describe('isPlatformPresetSourceIdentity', () => {
  it('riconosce l’identità salvata di X9, con e senza vaultAgentId', () => {
    expect(isPlatformPresetSourceIdentity(x9)).toBe(true);
    expect(isPlatformPresetSourceIdentity({ ...x9, vaultAgentId: 1 })).toBe(true);
  });

  it('rifiuta un erede con runtime x9 e management diverso', () => {
    expect(isPlatformPresetSourceIdentity({ runtimeAgentId: 'x9', managementAgentId: 'x9-erede' })).toBe(false);
  });

  it('rifiuta management x9-staging con runtime diverso', () => {
    expect(isPlatformPresetSourceIdentity({ runtimeAgentId: 'altro', managementAgentId: 'x9-staging' })).toBe(false);
  });

  it.each([
    [{ runtimeAgentId: 'X9', managementAgentId: 'x9-staging' }],
    [{ runtimeAgentId: ' x9', managementAgentId: 'x9-staging' }],
    [{ runtimeAgentId: 'x9', managementAgentId: 'x9-staging-2' }],
  ])('nessun confronto approssimato: %j', (identity) => {
    expect(isPlatformPresetSourceIdentity(identity)).toBe(false);
  });

  it.each([[null], [{}], ['x9'], [undefined], [42]])('input non valido %j → falso senza eccezioni', (input) => {
    expect(isPlatformPresetSourceIdentity(input)).toBe(false);
  });

  it('la costante è congelata', () => {
    expect(Object.isFrozen(PLATFORM_PRESET_SOURCE_IDENTITY)).toBe(true);
    expect(PLATFORM_PRESET_SOURCE_IDENTITY).toEqual(x9);
  });
});
