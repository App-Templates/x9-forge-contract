import { expect, it } from 'vitest';
import { parseCapabilityOrdinaryLifecycle, parseCapabilityOrdinaryLifecycleReceipt } from '../../src/capability/ordinary-lifecycle.js';
import { projectAgentOrdinaryAuthority } from '../../src/agent/ordinary-authority.js';
import { digestAgentWorkspace } from '../../src/agent/agent-workspace-digest.js';
import { workspace } from '../agent/ordinary-workspace-fixture.js';
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-a' };
const identity = { managementAgentId: 'management-a', runtimeAgentId: 'runtime-a' };
const bundle = { appliedVersion: 7, sha256: 'a'.repeat(64) };
const operation = { action: 'stop', execution: 'stopped' };
const request = { format: 'ordinary-lifecycle-v1', requestId: 'execution-test-1', scope, identity, capability: 'cap-news', phase: 'prepare', transition: { from: bundle, to: bundle }, targetMembership: 'enabled', operation };
const authority = { scope, identity, capability: request.capability, requestId: request.requestId, bundle, current: bundle, membership: 'enabled', configuration: null, transaction: null, operation };
const state = { scope, capability: request.capability, desired: null, runtimeState: 'loaded', applied: null, failed: null, effectiveParameters: [] };
it('uses the retained Core stop/start intent without inventing a new configuration version', () => {
  expect(parseCapabilityOrdinaryLifecycle(request, authority).request).toEqual(request);
  const start = { action: 'start', execution: 'running' };
  expect(parseCapabilityOrdinaryLifecycle({ ...request, operation: start }, { ...authority, operation: start }).request.operation).toEqual(start);
});
it('refuses forged operational authority and changed configuration under a runtime command', () => {
  expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, operation: undefined })).toThrow();
  expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, operation: { action: 'start', execution: 'running' } })).toThrow();
  expect(() => parseCapabilityOrdinaryLifecycle({ ...request, transition: { from: bundle, to: { ...bundle, appliedVersion: 8 } } }, { ...authority, bundle: { ...bundle, appliedVersion: 8 } })).toThrow();
  expect(() => parseCapabilityOrdinaryLifecycle({ ...request, operation: { action: 'stop', execution: 'running' } }, authority)).toThrow();
});
it('applies a new bundle while preserving a stopped runtime and requires actual execution evidence', () => {
  const operation = { action: 'apply-config', execution: 'stopped' };
  const next = { ...bundle, appliedVersion: 8, sha256: 'b'.repeat(64) };
  const prepare = { ...request, transition: { from: bundle, to: next }, operation };
  expect(parseCapabilityOrdinaryLifecycle(prepare, { ...authority, bundle: next, operation }).request).toEqual(prepare);
  const activate = { ...prepare, phase: 'activate' };
  const tx = { request: prepare, state: 'suspended', operationId: 'execution-operation-1', fence: 1, receipts: [], previousState: state, previousMembership: 'enabled', previousExecution: 'stopped' };
  const receipt = { request: activate, operationId: tx.operationId, fence: 1, status: 'complete', outcome: 'ok', replayed: false, ordinaryState: state, membershipEffective: 'enabled', executionEffective: 'stopped', observedAt: '2026-10-10T00:00:00Z' };
  expect(parseCapabilityOrdinaryLifecycleReceipt(receipt, activate as never, tx as never)).toEqual(receipt);
  for (const executionEffective of ['running', undefined]) expect(() => parseCapabilityOrdinaryLifecycleReceipt({ ...receipt, executionEffective }, activate as never, tx as never)).toThrow();
  const rollback = { ...activate, phase: 'rollback' };
  expect(parseCapabilityOrdinaryLifecycleReceipt({ ...receipt, request: rollback }, rollback as never, tx as never).executionEffective).toBe('stopped');
  expect(() => parseCapabilityOrdinaryLifecycleReceipt({ ...receipt, request: rollback, executionEffective: 'running' }, rollback as never, tx as never)).toThrow();
});
it('projects execution intent only from a validated retained management command', async () => {
  const descriptor = workspace(); const bundle = await digestAgentWorkspace(descriptor);
  const input = { descriptor, identity: { managementAgentId: 'forge-1', runtimeAgentId: 'agent-1' }, retainedRequestId: 'execution-test-1', query: { view: 'ordinary-authority', tenantId: 'tenant-1', ownerId: 'owner-1', runtimeAgentId: 'agent-1', capability: 'calendar', requestId: 'execution-test-1', bundleVersion: bundle.appliedVersion, bundleSha256: bundle.sha256 }, command: { action: 'stop', requestId: 'execution-test-1' }, execution: 'stopped' };
  expect((await projectAgentOrdinaryAuthority(input)).operation).toEqual(operation);
  await expect(projectAgentOrdinaryAuthority({ ...input, command: { ...input.command, requestId: 'foreign-command-1' } })).rejects.toThrow();
  await expect(projectAgentOrdinaryAuthority({ ...input, execution: 'running' })).rejects.toThrow();
  await expect(projectAgentOrdinaryAuthority({ ...input, command: { ...input.command, targets: [{ kind: 'runtime', targetId: 'other-agent' }] } })).rejects.toThrow();
});

it('FROM lookup preserves the same Apply intent while validating its retained TO version', async () => {
  const descriptor = workspace(); const bundle = await digestAgentWorkspace(descriptor);
  const input = { descriptor, identity: { managementAgentId: 'forge-1', runtimeAgentId: 'agent-1' }, retainedRequestId: 'execution-test-1', query: { view: 'ordinary-authority', tenantId: 'tenant-1', ownerId: 'owner-1', runtimeAgentId: 'agent-1', capability: 'calendar', requestId: 'execution-test-1', bundleVersion: bundle.appliedVersion, bundleSha256: bundle.sha256 }, command: { action: 'apply-config', requestId: 'execution-test-1', desiredVersion: 8 }, commandBundle: { appliedVersion: 8, sha256: 'b'.repeat(64) }, execution: 'stopped' };
  expect((await projectAgentOrdinaryAuthority(input)).operation).toEqual({ action: 'apply-config', execution: 'stopped' });
  await expect(projectAgentOrdinaryAuthority({ ...input, commandBundle: bundle })).rejects.toThrow();
});
