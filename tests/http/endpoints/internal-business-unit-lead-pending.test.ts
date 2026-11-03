import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../../../src/auth/index.js';
import {
  INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH,
  internalBusinessUnitLeadBirthContract,
} from '../../../src/http/index.js';
import {
  BusinessUnitLeadBirthPendingSchema,
  BusinessUnitLeadBirthRequestSchema,
  BusinessUnitLeadBirthResultSchema,
  type BusinessUnitLeadBirthPending,
} from '../../../src/organization/index.js';

// Synthetic producer fixtures, not live HTTP captures. Forge SHA d1886855bac01eb9c87bc29ffa11e004a62dd5a7:
// services/factory/tests/business-unit-lead.routes.test.ts:391 (second failure), :429 (deadline).
// services/factory/src/routes/business-unit-lead.routes.ts:231-244 sends these bodies without a step.
const historicalBodies = [
  { ok: false, error: 'in_corso', reason: 'Passo 3 fallito' },
  { ok: false, error: 'in_corso', reason: 'in coda' },
] as const;

const running: BusinessUnitLeadBirthPending = {
  ok: false, error: 'in_corso', reason: 'in corso: Creazione agente',
};
// Future contract examples only: the Forge producer above does not yet include step in its HTTP body.
const futureBodies = [
  { ...running, step: 'create-agent' },
  { ...running, step: null },
];
const pendingBodies = [...historicalBodies, running, ...futureBodies];

const result = {
  ok: true,
  replayed: false,
  tenantId: 'tenant-1',
  companyId: 'company-1',
  businessUnitSlug: 'research',
  agentIdentity: {
    managementAgentId: 'company-1-research',
    runtimeAgentId: 'runtime-research-1',
    vaultAgentId: 17,
  },
};

describe('business unit lead birth HTTP 202 contract', () => {
  it('adds the pending schema while preserving the request, HTTP 200 schema and endpoint metadata', () => {
    expect(internalBusinessUnitLeadBirthContract).toEqual({
      method: 'POST',
      path: INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH,
      authType: 'token',
      authHeader: INTERNAL_TOKEN_HEADER,
      bodySchema: BusinessUnitLeadBirthRequestSchema,
      responseSchema: BusinessUnitLeadBirthResultSchema,
      pendingResponseSchema: BusinessUnitLeadBirthPendingSchema,
    });
    expect(internalBusinessUnitLeadBirthContract.bodySchema).toBe(BusinessUnitLeadBirthRequestSchema);
    expect(internalBusinessUnitLeadBirthContract.responseSchema).toBe(BusinessUnitLeadBirthResultSchema);
    expect(internalBusinessUnitLeadBirthContract.pendingResponseSchema).toBe(BusinessUnitLeadBirthPendingSchema);
  });

  it.each(historicalBodies)('preserves the exact historical pending body: $reason', (body) => {
    const parsed = BusinessUnitLeadBirthPendingSchema.parse(body);
    expect(parsed).toStrictEqual(body);
    expect(parsed).not.toHaveProperty('step');
  });

  it('preserves the synthetic running reason without deriving a step', () => {
    const parsed = BusinessUnitLeadBirthPendingSchema.parse(running);
    expect(parsed).toStrictEqual(running);
    expect(parsed).not.toHaveProperty('step');
  });

  it('preserves whitespace and the complete reason without trimming, truncating or translating', () => {
    const body = { ...running, reason: '\t  in corso: Creazione agente — attesa  \n' };
    expect(BusinessUnitLeadBirthPendingSchema.parse(body)).toStrictEqual(body);
  });

  it.each([...futureBodies, running])('preserves a public step, explicit null or absence: %j', (body) => {
    expect(BusinessUnitLeadBirthPendingSchema.parse(body)).toStrictEqual(body);
  });

  it.each([1, 500])('accepts the inclusive reason length boundary %i', (length) => {
    const body = { ...running, reason: 'r'.repeat(length) };
    expect(BusinessUnitLeadBirthPendingSchema.parse(body)).toStrictEqual(body);
  });

  it.each([1, 128])('accepts the inclusive step length boundary %i', (length) => {
    const body = { ...running, step: 's'.repeat(length) };
    expect(BusinessUnitLeadBirthPendingSchema.parse(body)).toStrictEqual(body);
  });

  it('rejects a reason longer than 500 characters without truncating it', () => {
    expect(BusinessUnitLeadBirthPendingSchema.safeParse({ ...running, reason: 'r'.repeat(501) }).success).toBe(false);
  });

  it('rejects a step longer than 128 characters without truncating it', () => {
    expect(BusinessUnitLeadBirthPendingSchema.safeParse({ ...running, step: 's'.repeat(129) }).success).toBe(false);
  });

  it.each(['', ' ', '\t\r\n', '\u00a0', null, undefined, 7, false, {}, []].map((reason) => ({ reason })))(
    'rejects an empty, whitespace-only or non-string reason: %j',
    ({ reason }) => {
      expect(BusinessUnitLeadBirthPendingSchema.safeParse({ ...running, reason }).success).toBe(false);
    },
  );

  it.each(['', ' ', '\t\r\n', '\u00a0', 7, false, {}, []].map((step) => ({ step })))(
    'rejects an empty, whitespace-only or non-string step: %j',
    ({ step }) => {
      expect(BusinessUnitLeadBirthPendingSchema.safeParse({ ...running, step }).success).toBe(false);
    },
  );

  it.each([
    { ok: true }, { ok: 'false' }, { ok: 0 }, { ok: null },
    { error: 'pending' }, { error: 'IN_CORSO' }, { error: false }, { error: null },
  ])('rejects incorrect pending discriminants: %j', (fields) => {
    expect(BusinessUnitLeadBirthPendingSchema.safeParse({ ...running, ...fields }).success).toBe(false);
  });

  it.each(['ok', 'error', 'reason'] as const)('requires the %s field', (field) => {
    const body: Record<string, unknown> = { ...running };
    delete body[field];
    expect(BusinessUnitLeadBirthPendingSchema.safeParse(body).success).toBe(false);
  });

  it.each([
    { technical: 'synthetic internal detail' },
    { jobId: 'job-1' },
    { agentIdentity: result.agentIdentity },
    { agentId: 'agent-1' },
    { tenantId: 'tenant-1' },
    { ownerId: 'owner-1' },
    { stack: 'synthetic stack trace' },
    { extra: true },
  ])('rejects unknown and technical fields instead of stripping them: %j', (fields) => {
    expect(BusinessUnitLeadBirthPendingSchema.safeParse({ ...running, ...fields }).success).toBe(false);
  });

  it.each(pendingBodies)('rejects an HTTP 202 body in the unchanged HTTP 200 schema: %j', (body) => {
    expect(internalBusinessUnitLeadBirthContract.responseSchema.safeParse(body).success).toBe(false);
  });

  it.each([false, true])('preserves the HTTP 200 receipt with replayed=%s and rejects it as pending', (replayed) => {
    const body = { ...result, replayed };
    expect(internalBusinessUnitLeadBirthContract.responseSchema.parse(body)).toStrictEqual(body);
    expect(internalBusinessUnitLeadBirthContract.pendingResponseSchema.safeParse(body).success).toBe(false);
  });

  // The gate must run pnpm build first. Native Node resolution exercises the public compiled package, not src/.
  it.each(['ESM', 'CJS'])('loads and validates the compiled public organization and http exports through %s', (format) => {
    const load = format === 'ESM' ? 'await import' : 'require';
    const program = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);
      const organization = ${load}('@x9-forge/contracts/organization');
      const http = ${load}('@x9-forge/contracts/http');
      const auth = ${load}('@x9-forge/contracts/auth');
      const contract = http.internalBusinessUnitLeadBirthContract;
      assert.equal(contract.method, 'POST');
      assert.equal(contract.path, ${JSON.stringify(INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH)});
      assert.equal(contract.authType, 'token');
      assert.equal(contract.authHeader, auth.INTERNAL_TOKEN_HEADER);
      const schemas = [organization.BusinessUnitLeadBirthPendingSchema, contract.pendingResponseSchema];
      for (const schema of schemas) {
        assert.equal(typeof schema?.parse, 'function');
        for (const body of ${JSON.stringify(pendingBodies)}) {
          assert.deepEqual(schema.parse(body), body);
        }
        const padded = { ok: false, error: 'in_corso', reason: '  in coda  ', step: '  public-step  ' };
        assert.deepEqual(schema.parse(padded), padded);
        assert.equal(schema.safeParse({ ...padded, reason: ' ' }).success, false);
        assert.equal(schema.safeParse({ ...padded, technical: 'internal detail' }).success, false);
      }
      for (const replayed of [false, true]) {
        const body = { ...${JSON.stringify(result)}, replayed };
        assert.deepEqual(organization.BusinessUnitLeadBirthResultSchema.parse(body), body);
        assert.deepEqual(contract.responseSchema.parse(body), body);
        for (const schema of schemas) assert.equal(schema.safeParse(body).success, false);
      }
      for (const body of ${JSON.stringify(pendingBodies)}) {
        assert.equal(contract.responseSchema.safeParse(body).success, false);
      }
      process.stdout.write('PASS');
    `;
    expect(execFileSync(process.execPath, ['--input-type=module', '--eval', program], {
      cwd: fileURLToPath(new URL('../../../', import.meta.url)),
      encoding: 'utf8',
    })).toBe('PASS');
  });
});
