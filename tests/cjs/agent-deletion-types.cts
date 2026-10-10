import { AgentDeletionCommandSchema, AgentDeletionResultSchema, isAgentDeletionResultCurrent, type AgentDeletionCommand, type AgentDeletionResult, type AgentDeletionPiece } from '@x9-forge/contracts/agent';
import { agentDeletionContract, agentDeletionPath, AgentDeletionErrorResponseSchema, type AgentDeletionErrorResponse } from '@x9-forge/contracts/http';
declare const raw: unknown;
const command: AgentDeletionCommand = AgentDeletionCommandSchema.parse(raw);
const result: AgentDeletionResult = AgentDeletionResultSchema.parse(raw);
const current: boolean = isAgentDeletionResultCurrent('forge-child', command, result);
const error: AgentDeletionErrorResponse = AgentDeletionErrorResponseSchema.parse(raw);
const method: 'POST' = agentDeletionContract.method;
const auth: 'secret' = agentDeletionContract.authType;
const path: string = agentDeletionPath(command.identity.managementAgentId);
const piece: AgentDeletionPiece = { step: 'runtime', outcome: 'failed', reason: 'timeout' };
// @ts-expect-error Complete is the deletion outcome, not the lifecycle "ok" outcome.
const wrongOutcome: AgentDeletionResult['outcome'] = 'ok';
// @ts-expect-error Shared resources never belong to this deletion contract.
const shared: AgentDeletionPiece = { step: 'shared-container', outcome: 'completed' };
// @ts-expect-error Failed pieces require a sanitized reason code.
const noReason: AgentDeletionPiece = { step: 'runtime', outcome: 'failed' };
void [current, error, method, auth, path, piece, wrongOutcome, shared, noReason];
