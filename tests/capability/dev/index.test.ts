import { describe, expect, it } from 'vitest';
import * as dev from '../../../src/capability/dev/index.js';
import * as capability from '../../../src/capability/index.js';
import * as signedCommand from '../../../src/capability/dev/signed-command.js';
import * as configState from '../../../src/capability/dev/config-state.js';
import * as productionJob from '../../../src/capability/dev/production-job.js';
import * as productionResult from '../../../src/capability/dev/production-result.js';

const allSymbols = { ...signedCommand, ...configState, ...productionJob, ...productionResult };

describe('capability/dev subpath', () => {
  it('re-exports every symbol of signed-command, config-state, production-job and production-result', () => {
    expect(dev.DevSignedCommandV2Schema).toBe(signedCommand.DevSignedCommandV2Schema);
    expect(dev.DEV_SIGNED_COMMAND_V2_DOMAIN).toBe(signedCommand.DEV_SIGNED_COMMAND_V2_DOMAIN);
    expect(dev.canonicalizeDevSignedCommandV2).toBe(signedCommand.canonicalizeDevSignedCommandV2);
    expect(dev.DevBindingSchema).toBe(configState.DevBindingSchema);
    expect(dev.DevAgentConfigSchema).toBe(configState.DevAgentConfigSchema);
    expect(dev.DevAgentStatusSchema).toBe(configState.DevAgentStatusSchema);
    expect(dev.DevAgentStateSchema).toBe(configState.DevAgentStateSchema);
    expect(dev.DevAgentConfigStateSchema).toBe(configState.DevAgentConfigStateSchema);
    for (const name of Object.keys(productionJob) as (keyof typeof productionJob)[]) {
      expect(dev[name]).toBe(productionJob[name]);
    }
    for (const name of Object.keys(productionResult) as (keyof typeof productionResult)[]) {
      expect(dev[name]).toBe(productionResult[name]);
    }
    expect(Object.keys(dev).sort()).toEqual(Object.keys(allSymbols).sort());
  });

  it('exposes the expected set of keys (mutation guard: a dropped re-export fails)', () => {
    expect(Object.keys(dev).sort()).toEqual(
      [
        'DEV_SIGNED_COMMAND_V2_DOMAIN',
        'DevAgentConfigSchema',
        'DevAgentConfigStateSchema',
        'DevAgentStateSchema',
        'DevAgentStatusSchema',
        'DevBindingSchema',
        'DevSignedCommandV2Schema',
        'DevProductionKindSchema',
        'DevProductionJobSchema',
        'DevProductionArtifactSchema',
        'DevProductionResultSchema',
        'isDevProductionResultForJob',
        'devProductionApprovalBindings',
        'devProductionExecutionMode',
        'canonicalizeDevSignedCommandV2',
      ].sort(),
    );
  });

  it('keeps every dev symbol out of the capability index', () => {
    for (const name of Object.keys(allSymbols)) {
      expect(capability).not.toHaveProperty(name);
    }
  });
});
