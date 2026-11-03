import { describe, expect, it } from 'vitest';
// Initialize the existing capability graph before importing the public HTTP barrel.
import { DevelopmentSessionBindingSchema, DevelopmentSessionLeaseSchema } from '../../../src/capability/connect/index.js';
import { AuthDeviceSignatureSchema } from '../../../src/auth/device-signature.js';
import * as api from '../../../src/http/index.js';

const binding = {
  scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  sessionId: 'session-1',
  target: { kind: 'local', deviceId: 'device-1' },
  engines: ['claude', 'codex'],
};
const heartbeat = { binding, leaseId: 'lease-1', consentRef: 'consent-1', availableEngines: ['claude'] };

describe('development session heartbeat', () => {
  it('uses POST', () => {
    expect(api.heartbeatDevelopmentSessionContract.method === 'POST').toBe(true);
  });
  it('uses heartbeat path', () => {
    expect(api.heartbeatDevelopmentSessionContract.path === '/connect/development-sessions/:sessionId/heartbeat').toBe(true);
  });
  it('requires device signature', () => {
    expect(api.heartbeatDevelopmentSessionContract.authType === 'device_signature').toBe(true);
  });
  it('reuses public schemas by identity', () => {
    const contract = api.heartbeatDevelopmentSessionContract;
    expect(contract.headersSchema).toBe(AuthDeviceSignatureSchema);
    expect(contract.paramsSchema).toBe(api.DevelopmentSessionParamsSchema);
    expect(contract.bodySchema).toBe(api.DevelopmentSessionHeartbeatSchema);
    expect(contract.responseSchema).toBe(DevelopmentSessionLeaseSchema);
    const shape = api.DevelopmentSessionHeartbeatSchema.shape;
    expect(shape.binding).toBe(DevelopmentSessionBindingSchema);
    expect(shape.leaseId).toBe(DevelopmentSessionLeaseSchema.shape.leaseId);
    expect(shape.consentRef).toBe(DevelopmentSessionLeaseSchema.shape.consentRef);
    expect(shape.availableEngines).toBe(DevelopmentSessionLeaseSchema.shape.availableEngines);
  });
  it('accepts local and cloud presence with zero one or two available engines', () => {
    for (const target of [binding.target, { kind: 'cloud', connectionRef: 'adapter-1' }]) {
      for (const engines of [['claude'], ['codex'], ['claude', 'codex']]) {
        for (const availableEngines of [[], ...engines.map((engine) => [engine]), engines]) {
          const body = { ...heartbeat, binding: { ...binding, target, engines }, availableEngines };
          expect(api.DevelopmentSessionHeartbeatSchema.safeParse(body).success).toBe(true);
        }
      }
    }
  });
  it('rejects client expiry and token', () => {
    expect(['expiresAt', 'token'].every((key) => !api.DevelopmentSessionHeartbeatSchema.safeParse({ ...heartbeat, [key]: 'synthetic' }).success)).toBe(true);
  });
  it('rejects engines outside binding', () => {
    expect(!api.DevelopmentSessionHeartbeatSchema.safeParse({ ...heartbeat, binding: { ...binding, engines: ['codex'] } }).success).toBe(true);
  });
  it('inherits duplicate engine rejection', () => {
    expect(api.DevelopmentSessionHeartbeatSchema.safeParse({ ...heartbeat, availableEngines: ['claude', 'claude'] }).success).toBe(false);
  });
  it('requires all fields and inherits nonempty references', () => {
    for (const key of Object.keys(heartbeat)) {
      const body = { ...heartbeat };
      Reflect.deleteProperty(body, key);
      expect(api.DevelopmentSessionHeartbeatSchema.safeParse(body).success).toBe(false);
    }
    for (const key of ['leaseId', 'consentRef']) {
      expect(api.DevelopmentSessionHeartbeatSchema.safeParse({ ...heartbeat, [key]: '' }).success).toBe(false);
    }
  });
});
