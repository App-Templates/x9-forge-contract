// Reproducer: only isolated public copies are mutated.
const scenarios = [
  {
    "title": "startDevelopmentSessionPairingContract method",
    "assertion": "expect(api.startDevelopmentSessionPairingContract.method === 'POST').toBe(true);",
    "anchor": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "replacement": "export const startDevelopmentSessionPairingContract = {\n  method: 'DELETE' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "startDevelopmentSessionPairingContract path",
    "assertion": "expect(api.startDevelopmentSessionPairingContract.path === '/internal/connect/development-sessions/pairings').toBe(true);",
    "anchor": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "replacement": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/wrong-route' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "startDevelopmentSessionPairingContract authType",
    "assertion": "expect(api.startDevelopmentSessionPairingContract.authType === 'secret').toBe(true);",
    "anchor": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "replacement": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'none' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "startDevelopmentSessionPairingContract bodySchema identity",
    "assertion": "expect(Object.is(api.startDevelopmentSessionPairingContract.bodySchema, DevelopmentSessionBindingSchema)).toBe(true);",
    "anchor": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "replacement": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: z.never(),\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "startDevelopmentSessionPairingContract responseSchema identity",
    "assertion": "expect(Object.is(api.startDevelopmentSessionPairingContract.responseSchema, DevelopmentSessionPairingChallengeSchema)).toBe(true);",
    "anchor": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: DevelopmentSessionPairingChallengeSchema,\n",
    "replacement": "export const startDevelopmentSessionPairingContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/pairings' as const,\n  authType: 'secret' as const,\n  bodySchema: DevelopmentSessionBindingSchema,\n  responseSchema: z.never(),\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract method",
    "assertion": "expect(api.consentDevelopmentSessionContract.method === 'POST').toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'DELETE' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract path",
    "assertion": "expect(api.consentDevelopmentSessionContract.path === '/connect/development-sessions/pairings/:pairingId/consent').toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/wrong-route' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract authType",
    "assertion": "expect(api.consentDevelopmentSessionContract.authType === 'device_signature').toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'none' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract bodySchema identity",
    "assertion": "expect(Object.is(api.consentDevelopmentSessionContract.bodySchema, DevelopmentSessionConsentSchema)).toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: z.never(),\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract responseSchema identity",
    "assertion": "expect(Object.is(api.consentDevelopmentSessionContract.responseSchema, DevelopmentSessionLeaseSchema)).toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: z.never(),\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract headersSchema identity",
    "assertion": "expect(Object.is(api.consentDevelopmentSessionContract.headersSchema, AuthDeviceSignatureSchema)).toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: z.never(),\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "consentDevelopmentSessionContract paramsSchema identity",
    "assertion": "expect(Object.is(api.consentDevelopmentSessionContract.paramsSchema, api.DevelopmentSessionPairingParamsSchema)).toBe(true);",
    "anchor": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: DevelopmentSessionPairingParamsSchema,\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const consentDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,\n  authType: 'device_signature' as const,\n  headersSchema: AuthDeviceSignatureSchema,\n  paramsSchema: z.never(),\n  bodySchema: DevelopmentSessionConsentSchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "getDevelopmentSessionStateContract method",
    "assertion": "expect(api.getDevelopmentSessionStateContract.method === 'GET').toBe(true);",
    "anchor": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const getDevelopmentSessionStateContract = {\n  method: 'DELETE' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "getDevelopmentSessionStateContract path",
    "assertion": "expect(api.getDevelopmentSessionStateContract.path === '/internal/connect/development-sessions/:sessionId/state').toBe(true);",
    "anchor": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/wrong-route' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "getDevelopmentSessionStateContract authType",
    "assertion": "expect(api.getDevelopmentSessionStateContract.authType === 'secret').toBe(true);",
    "anchor": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'none' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "getDevelopmentSessionStateContract responseSchema identity",
    "assertion": "expect(Object.is(api.getDevelopmentSessionStateContract.responseSchema, DevelopmentSessionLeaseSchema)).toBe(true);",
    "anchor": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: z.never(),\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "getDevelopmentSessionStateContract paramsSchema identity",
    "assertion": "expect(Object.is(api.getDevelopmentSessionStateContract.paramsSchema, api.DevelopmentSessionParamsSchema)).toBe(true);",
    "anchor": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: z.never(),\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "getDevelopmentSessionStateContract querySchema identity",
    "assertion": "expect(Object.is(api.getDevelopmentSessionStateContract.querySchema, api.DevelopmentSessionStateQuerySchema)).toBe(true);",
    "anchor": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: DevelopmentSessionStateQuerySchema,\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "replacement": "export const getDevelopmentSessionStateContract = {\n  method: 'GET' as const,\n  path: '/internal/connect/development-sessions/:sessionId/state' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  querySchema: z.never(),\n  responseSchema: DevelopmentSessionLeaseSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revokeDevelopmentSessionContract method",
    "assertion": "expect(api.revokeDevelopmentSessionContract.method === 'POST').toBe(true);",
    "anchor": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "replacement": "export const revokeDevelopmentSessionContract = {\n  method: 'DELETE' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revokeDevelopmentSessionContract path",
    "assertion": "expect(api.revokeDevelopmentSessionContract.path === '/internal/connect/development-sessions/:sessionId/revoke').toBe(true);",
    "anchor": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "replacement": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/wrong-route' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revokeDevelopmentSessionContract authType",
    "assertion": "expect(api.revokeDevelopmentSessionContract.authType === 'secret').toBe(true);",
    "anchor": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "replacement": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'none' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revokeDevelopmentSessionContract bodySchema identity",
    "assertion": "expect(Object.is(api.revokeDevelopmentSessionContract.bodySchema, CapabilityAgentScopeSchema)).toBe(true);",
    "anchor": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "replacement": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: z.never(),\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revokeDevelopmentSessionContract responseSchema identity",
    "assertion": "expect(Object.is(api.revokeDevelopmentSessionContract.responseSchema, api.DevelopmentSessionRevocationSchema)).toBe(true);",
    "anchor": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "replacement": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: z.never(),\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revokeDevelopmentSessionContract paramsSchema identity",
    "assertion": "expect(Object.is(api.revokeDevelopmentSessionContract.paramsSchema, api.DevelopmentSessionParamsSchema)).toBe(true);",
    "anchor": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: DevelopmentSessionParamsSchema,\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "replacement": "export const revokeDevelopmentSessionContract = {\n  method: 'POST' as const,\n  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,\n  authType: 'secret' as const,\n  paramsSchema: z.never(),\n  bodySchema: CapabilityAgentScopeSchema,\n  responseSchema: DevelopmentSessionRevocationSchema,\n",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "state query reuses authenticated scope shape",
    "assertion": "expect(Object.is(api.DevelopmentSessionStateQuerySchema.shape.scope, CapabilityAgentScopeSchema)).toBe(true);",
    "anchor": "  scope: CapabilityAgentScopeSchema,",
    "replacement": "  scope: z.never(),",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "publishes all four routes",
    "assertion": "expect([\"startDevelopmentSessionPairingContract\", \"consentDevelopmentSessionContract\", \"getDevelopmentSessionStateContract\", \"revokeDevelopmentSessionContract\"].every((name) => Object.hasOwn(api, name))).toBe(true);",
    "anchor": "export * from './internal-development-sessions.js';",
    "replacement": "",
    "file": "src/http/endpoints/index.ts"
  },
  {
    "title": "DevelopmentSessionPairingParamsSchema rejects empty id",
    "assertion": "expect(!api.DevelopmentSessionPairingParamsSchema.safeParse({ pairingId: '' }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionPairingParamsSchema = z.object({\n  pairingId: z.string().min(1),\n}).strict();",
    "replacement": "export const DevelopmentSessionPairingParamsSchema = z.object({\n  pairingId: z.string(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "DevelopmentSessionPairingParamsSchema rejects extra fields",
    "assertion": "expect(!api.DevelopmentSessionPairingParamsSchema.safeParse({ pairingId: 'id-1', extra: true }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionPairingParamsSchema = z.object({\n  pairingId: z.string().min(1),\n}).strict();",
    "replacement": "export const DevelopmentSessionPairingParamsSchema = z.object({\n  pairingId: z.string().min(1),\n}).strip();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "DevelopmentSessionParamsSchema rejects empty id",
    "assertion": "expect(!api.DevelopmentSessionParamsSchema.safeParse({ sessionId: '' }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionParamsSchema = z.object({\n  sessionId: z.string().min(1),\n}).strict();",
    "replacement": "export const DevelopmentSessionParamsSchema = z.object({\n  sessionId: z.string(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "DevelopmentSessionParamsSchema rejects extra fields",
    "assertion": "expect(!api.DevelopmentSessionParamsSchema.safeParse({ sessionId: 'id-1', extra: true }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionParamsSchema = z.object({\n  sessionId: z.string().min(1),\n}).strict();",
    "replacement": "export const DevelopmentSessionParamsSchema = z.object({\n  sessionId: z.string().min(1),\n}).strip();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "state query rejects extra fields",
    "assertion": "expect(!api.DevelopmentSessionStateQuerySchema.safeParse({ scope, extra: true }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionStateQuerySchema = z.object({\n  scope: CapabilityAgentScopeSchema,\n}).strict();",
    "replacement": "export const DevelopmentSessionStateQuerySchema = z.object({\n  scope: CapabilityAgentScopeSchema,\n}).strip();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "state query requires scope",
    "assertion": "expect(!api.DevelopmentSessionStateQuerySchema.safeParse({}).success).toBe(true);",
    "anchor": "export const DevelopmentSessionStateQuerySchema = z.object({\n  scope: CapabilityAgentScopeSchema,\n}).strict();",
    "replacement": "export const DevelopmentSessionStateQuerySchema = z.object({\n  scope: CapabilityAgentScopeSchema.optional(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revocation rejects empty session",
    "assertion": "expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, sessionId: '' }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.literal('revoked'),\n  revokedAt: z.string().datetime(),\n}).strict();",
    "replacement": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string(),\n  status: z.literal('revoked'),\n  revokedAt: z.string().datetime(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revocation rejects connected",
    "assertion": "expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, status: 'connected' }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.literal('revoked'),\n  revokedAt: z.string().datetime(),\n}).strict();",
    "replacement": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.enum(['revoked', 'connected']),\n  revokedAt: z.string().datetime(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revocation requires ISO timestamp",
    "assertion": "expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, revokedAt: 'yesterday' }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.literal('revoked'),\n  revokedAt: z.string().datetime(),\n}).strict();",
    "replacement": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.literal('revoked'),\n  revokedAt: z.string(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "revocation rejects extra fields",
    "assertion": "expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, extra: true }).success).toBe(true);",
    "anchor": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.literal('revoked'),\n  revokedAt: z.string().datetime(),\n}).strict();",
    "replacement": "export const DevelopmentSessionRevocationSchema = z.object({\n  sessionId: z.string().min(1),\n  status: z.literal('revoked'),\n  revokedAt: z.string().datetime(),\n}).strip();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "DevelopmentSessionPairingParamsSchema rejects missing or nonstring id",
    "assertion": "expect([{}, { pairingId: 42 }].every((value) => !api.DevelopmentSessionPairingParamsSchema.safeParse(value).success)).toBe(true);",
    "anchor": "export const DevelopmentSessionPairingParamsSchema = z.object({\n  pairingId: z.string().min(1),\n}).strict();",
    "replacement": "export const DevelopmentSessionPairingParamsSchema = z.object({\n  pairingId: z.any(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "DevelopmentSessionParamsSchema rejects missing or nonstring id",
    "assertion": "expect([{}, { sessionId: 42 }].every((value) => !api.DevelopmentSessionParamsSchema.safeParse(value).success)).toBe(true);",
    "anchor": "export const DevelopmentSessionParamsSchema = z.object({\n  sessionId: z.string().min(1),\n}).strict();",
    "replacement": "export const DevelopmentSessionParamsSchema = z.object({\n  sessionId: z.any(),\n}).strict();",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  },
  {
    "title": "accepts the complete local and cloud lifecycle",
    "assertion": "expect(api.revokeDevelopmentSessionContract.responseSchema.safeParse(revoked).success).toBe(true);",
    "anchor": "  status: z.literal('revoked'),",
    "replacement": "  status: z.literal('gone'),",
    "file": "src/http/endpoints/internal-development-sessions.ts"
  }
];

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const testPath = 'tests/http/endpoints/internal-development-sessions.test.ts';
const prefix = 'development session HTTP contracts ';
const failureMessage = 'AssertionError: expected false to be true // Object.is equality';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const liveFiles = new Map();
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'development-sessions-mutations-')));
// Each worker owns an isolated public copy so mutants never share a source tree.
const workerCount = Math.max(1, Math.min(3, availableParallelism() - 1, scenarios.length));
let caught = 0;
let phases = 0;
let readerChecks = 0;

function copyPublic(path, target) {
  const source = join(root, path);
  const stat = lstatSync(source);
  assert.ok(!stat.isSymbolicLink(), 'Public inputs must not traverse symlinks');
  if (stat.isDirectory()) {
    for (const entry of readdirSync(source)) {
      if (entry.startsWith('.') || /^(?:secrets?|node_modules|dist|coverage|vendor)$/i.test(entry)) continue;
      copyPublic(`${path}/${entry}`, target);
    }
    return;
  }
  assert.ok(stat.isFile());
  // src contains public contract definitions, including credential *schemas*, never credential data.
  if (path.startsWith('src/') && !path.endsWith('.ts')) return;
  mkdirSync(dirname(join(target, path)), { recursive: true });
  copyFileSync(source, join(target, path));
  liveFiles.set(path, hash(readFileSync(source)));
}

function uniqueIndex(content, anchor) {
  const index = content.indexOf(anchor);
  assert.ok(index >= 0 && content.indexOf(anchor, index + 1) === -1, 'Anchor must occur exactly once');
  return index;
}

function expectedFor(scenario, workspace) {
  const content = readFileSync(join(workspace, testPath), 'utf8');
  const index = uniqueIndex(content, scenario.assertion);
  const matcher = index + scenario.assertion.indexOf('.toBe') + 1;
  assert.ok(content.includes(`it('${scenario.title}',`), 'Selected named test must exist');
  return {
    file: join(workspace, testPath), title: scenario.title, fullName: prefix + scenario.title,
    line: content.slice(0, matcher).split('\n').length,
    column: matcher - content.lastIndexOf('\n', matcher),
  };
}

function validateReport(report, exit, expected, red) {
  assert.equal(exit, red ? 1 : 0, 'Unexpected process exit');
  assert.equal(report.success, !red);
  assert.equal(report.numPassedTests, red ? 0 : 1);
  assert.equal(report.numFailedTests, red ? 1 : 0);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1);
  const suite = report.testResults[0];
  assert.equal(suite.name, expected.file);
  assert.equal(suite.status, red ? 'failed' : 'passed');
  assert.equal(suite.message, '', 'Collection/runtime errors invalidate the proof');
  const active = suite.assertionResults.filter((test) => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test required');
  const test = active[0];
  assert.equal(test.title, expected.title);
  assert.equal(test.fullName, expected.fullName);
  assert.deepEqual(test.ancestorTitles, ['development session HTTP contracts']);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) {
    assert.deepEqual(test.failureMessages, []);
    return;
  }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, failureMessage);
  const firstApplicationFrame = stack.filter((line) => line.trim().startsWith('at '))
    .find((frame) => !frame.includes('/node_modules/') && !frame.includes('node:internal/')
      && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(firstApplicationFrame, `    at ${expected.file}:${expected.line}:${expected.column}`,
    'First application frame must identify the selected assertion');
}

function checkReader(green, red, expected) {
  const checks = [
    ['zero active', red, (r) => { for (const t of r.testResults[0].assertionResults) t.status = 'pending'; }],
    ['foreign title', red, (r) => { r.testResults[0].assertionResults.find((t) => t.status === 'failed').fullName += ' foreign'; }],
    ['foreign file', red, (r) => { r.testResults[0].name += '.foreign'; }],
    ['runtime error', red, (r) => { r.numRuntimeErrorTestSuites = 1; }],
    ['unhandled error', red, (r) => { r.unhandledErrors = ['synthetic runtime error']; }],
    ['collection error', red, (r) => { r.testResults[0].message = 'Cannot import module'; }],
    ['wrong assertion', red, (r) => { r.testResults[0].assertionResults.find((t) => t.status === 'failed').failureMessages = [`${failureMessage}\n    at ${expected.file}:1:1`]; }],
    ['false red exit', green, () => {}],
  ];
  for (const [name, original, alter] of checks) {
    const copy = structuredClone(original);
    alter(copy);
    assert.throws(() => validateReport(copy, 1, expected, true), undefined, name);
    readerChecks += 1;
  }
  return checks.length;
}

function vitest(workspace, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(workspace, 'node_modules/vitest/vitest.mjs'), ...args],
      { cwd: workspace, stdio: 'ignore' });
    child.on('error', reject);
    child.on('close', (status, signal) => resolve({ status, signal }));
  });
}

async function run(scenario, index, workspace, phase, red) {
  const expected = expectedFor(scenario, workspace);
  const escaped = expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reportPath = join(workspace, `report-${index}-${phase}.json`);
  const child = await vitest(workspace,
    ['run', testPath, '-t', `^${escaped}$`, '--maxWorkers=1', '--reporter=json', `--outputFile=${reportPath}`]);
  assert.equal(child.signal, null, 'A signal is not a test assertion');
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  validateReport(report, child.status, expected, red);
  phases += 1;
  return report;
}

async function mutate(scenario, index, workspace) {
  const file = join(workspace, scenario.file);
  const original = readFileSync(file, 'utf8');
  const at = uniqueIndex(original, scenario.anchor);
  const green = await run(scenario, index, workspace, 'baseline', false);
  let red;
  try {
    writeFileSync(file, original.slice(0, at) + scenario.replacement + original.slice(at + scenario.anchor.length));
    red = await run(scenario, index, workspace, 'mutant', true);
  } finally {
    writeFileSync(file, original);
    assert.equal(hash(readFileSync(file)), hash(original), 'Temporary source must be restored');
  }
  await run(scenario, index, workspace, 'restored', false);
  if (index === 0) readerTotal = checkReader(green, red, expectedFor(scenario, workspace));
  caught += 1;
}

let readerTotal = 0;
try {
  const workspaces = [];
  for (let worker = 0; worker < workerCount; worker += 1) {
    const workspace = join(directory, `worker-${worker}`);
    copyPublic('src', workspace);
    // Explicit new files are included even when not tracked by Git yet.
    for (const path of [testPath, 'tests/http/endpoints/internal-development-sessions.mutation.mjs',
      'tests/setup.ts', 'package.json', 'vitest.config.ts', 'tsconfig.json', 'tsconfig.eslint.json']) copyPublic(path, workspace);
    symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
    assert.equal(JSON.parse(readFileSync(join(workspace, 'node_modules/vitest/package.json'), 'utf8')).version, '3.2.4');
    workspaces.push(workspace);
  }
  await Promise.all(workspaces.map(async (workspace, worker) => {
    for (let index = worker; index < scenarios.length; index += workerCount) {
      await mutate(scenarios[index], index, workspace);
    }
  }));
  assert.equal(caught, scenarios.length);
  assert.equal(phases, 3 * scenarios.length);
  assert.equal(readerChecks, readerTotal);
} finally {
  for (const [path, before] of liveFiles) {
    assert.equal(hash(readFileSync(join(root, path))), before, `Live source changed: ${path}`);
  }
  console.log(`${caught}/${scenarios.length} mutants caught; ${phases}/${3 * scenarios.length} valid phases; reader checks ${readerChecks}/${readerTotal || 8}`);
  console.log(`Public temporary copies retained: ${directory} (${workerCount} workers)`);
}
