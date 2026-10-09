import type { AgentModelInitialSource, AgentModelSourceObservation } from '@x9-forge/contracts/model-router';
import { AgentModelInitialSourceSchema, AgentModelsStateSchema, isAgentModelInitialSourceCurrent } from '@x9-forge/contracts';
import { agentModelSourceObservationPath, internalAgentModelSourceObservationContract } from '@x9-forge/contracts/http';

declare const source: AgentModelInitialSource;
declare const observation: AgentModelSourceObservation;
const parsed: AgentModelInitialSource = AgentModelInitialSourceSchema.parse(source);
const current: boolean = isAgentModelInitialSourceCurrent(parsed, observation);
const rolelessKey: keyof AgentModelInitialSource = 'sourceVersion';
const version: AgentModelInitialSource['schemaVersion'] = 1;
const method: 'GET' = internalAgentModelSourceObservationContract.method;
const path: string = agentModelSourceObservationPath(source.identity.managementAgentId);
const response: AgentModelSourceObservation = internalAgentModelSourceObservationContract.responseSchema.parse(observation);
const state = AgentModelsStateSchema.parse({ identity: source.identity, versions: null, saved: null, runtime: null, initialSource: parsed });
const fromState: AgentModelInitialSource | null | undefined = state.initialSource;
void [current, rolelessKey, version, method, path, response, fromState];
