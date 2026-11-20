import { describe, expect, it } from 'vitest';
import {
  SOCIAL_LISTENING_CAPABILITY_NAME,
  SOCIAL_LISTENING_PARAMETERS,
  socialListeningConfigFromOrdinary,
  socialListeningOrdinaryWriteIssues,
} from '../../../src/capability/social-listening/index';
import {
  CapabilityOrdinaryConfigurationSchema,
  type CapabilityOrdinaryConfiguration,
} from '../../../src/capability/ordinary-configuration';
import { CapabilityOrdinaryDeclarationSchema } from '../../../src/capability/ordinary-declaration';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };

function configuration(): CapabilityOrdinaryConfiguration {
  return CapabilityOrdinaryConfigurationSchema.parse({
    format: 'ordinary-v2',
    scope,
    capability: 'social-listening',
    version: 3,
    parameters: SOCIAL_LISTENING_PARAMETERS.parameters.map(parameter => {
      const choice = parameter.key === 'round.runsOn' ? 'mac'
        : parameter.key === 'round.fallbackToServer' ? true : undefined;
      return {
        parameter,
        origin: { kind: choice === undefined ? 'platform_default' : 'agent_override' },
        value: choice ?? parameter.platformDefault,
      };
    }),
  });
}

function withValue(key: string, value: string | number | boolean): CapabilityOrdinaryConfiguration {
  const config = configuration();
  return CapabilityOrdinaryConfigurationSchema.parse({
    ...config,
    parameters: config.parameters.map(entry => entry.parameter.key === key
      ? { ...entry, origin: { kind: 'agent_override' }, value } : entry),
  });
}

describe('social listening ordinary configuration', () => {
  it('(a) accepts the real B1 declaration and the ordinary-v2 configuration', () => {
    expect(CapabilityOrdinaryDeclarationSchema.safeParse(SOCIAL_LISTENING_PARAMETERS).success).toBe(true);
    expect(CapabilityOrdinaryConfigurationSchema.safeParse(configuration()).success).toBe(true);
    expect(configuration().parameters).toHaveLength(7);
  });

  it('(b) reads owner choices and platform defaults with the original scope and version', () => {
    expect(SOCIAL_LISTENING_CAPABILITY_NAME).toBe('social-listening');
    expect(socialListeningConfigFromOrdinary(configuration(), 'Europe/Rome')).toEqual({
      ok: true,
      scope,
      config: {
        agentId: 'x9',
        version: 3,
        round: {
          runsOn: 'mac', fallbackToServer: true, localTime: '07:00',
          fallbackTime: '08:00', serverDailyCapUsd: 2, timezone: 'Europe/Rome',
        },
        research: { maxUsdPerResearch: 0.3, dailyCapUsd: 1 },
      },
    });
  });

  it('(c) reports needs_choice and absent rows in declared key order', () => {
    const config = configuration();
    config.parameters = config.parameters.filter(entry => entry.parameter.key !== 'round.fallbackToServer')
      .map<CapabilityOrdinaryConfiguration['parameters'][number]>(entry => entry.parameter.key === 'round.runsOn'
        ? { parameter: entry.parameter, origin: { kind: 'needs_choice' } } : entry)
      .reverse();
    expect(CapabilityOrdinaryConfigurationSchema.safeParse(config).success).toBe(true);
    expect(socialListeningConfigFromOrdinary(config, 'Europe/Rome')).toEqual({
      ok: false, reason: 'needs_choice', keys: ['round.runsOn', 'round.fallbackToServer'],
    });
  });

  it('(d) rejects another capability before interpreting its values', () => {
    expect(socialListeningConfigFromOrdinary({ ...configuration(), capability: 'ricerca' }, 'Europe/Rome'))
      .toEqual({ ok: false, reason: 'wrong_capability' });
  });

  it('(d) returns errors for invalid configurations and timezones without throwing', () => {
    for (const invalid of [{}, null, undefined, { ...configuration(), scope: { agentId: 'x9' } }]) {
      expect(socialListeningConfigFromOrdinary(invalid, 'Europe/Rome'))
        .toEqual({ ok: false, reason: 'invalid_configuration' });
    }
    for (const timezone of ['Marte/Base', null, 123]) {
      expect(socialListeningConfigFromOrdinary(configuration(), timezone))
        .toEqual({ ok: false, reason: 'invalid_timezone' });
    }
  });

  it.each(['06:30', '07:00'])('(e) rejects fallbackTime %s on read and write', fallbackTime => {
    const config = withValue('round.fallbackTime', fallbackTime);
    expect(socialListeningConfigFromOrdinary(config, 'Europe/Rome')).toEqual({
      ok: false, reason: 'invalid_values', paths: ['round.fallbackTime'],
    });
    expect(socialListeningOrdinaryWriteIssues(config)).toEqual(['round.fallbackTime']);
  });

  it('(f) rejects per-research spend above the daily cap on read and write', () => {
    const config = withValue('research.maxUsdPerResearch', 2);
    expect(socialListeningConfigFromOrdinary(config, 'Europe/Rome')).toEqual({
      ok: false, reason: 'invalid_values', paths: ['research.maxUsdPerResearch'],
    });
    expect(socialListeningOrdinaryWriteIssues(config)).toEqual(['research.maxUsdPerResearch']);
  });

  it('(f) accepts valid values and equal research caps', () => {
    expect(socialListeningOrdinaryWriteIssues(configuration())).toEqual([]);
    const config = withValue('research.maxUsdPerResearch', 1);
    expect(socialListeningOrdinaryWriteIssues(config)).toEqual([]);
    expect(socialListeningConfigFromOrdinary(config, 'Europe/Rome')).toMatchObject({ ok: true });
  });

  it('checks only present pairs and reports both conflicts in stable order', () => {
    const config = withValue('round.fallbackTime', '06:30');
    const research = withValue('research.maxUsdPerResearch', 2).parameters
      .find(entry => entry.parameter.key === 'research.maxUsdPerResearch')!;
    config.parameters = config.parameters.map(entry => entry.parameter.key === research.parameter.key ? research : entry);
    expect(socialListeningOrdinaryWriteIssues(config))
      .toEqual(['round.fallbackTime', 'research.maxUsdPerResearch']);
    config.parameters = config.parameters.filter(entry =>
      entry.parameter.key !== 'round.localTime' && entry.parameter.key !== 'research.dailyCapUsd');
    expect(socialListeningOrdinaryWriteIssues(config)).toEqual([]);
  });
});
