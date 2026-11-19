import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_GATEWAY_METADATA_KEYS,
  PaperclipTwinDeclarationsSchema,
  X9_MCP_FORWARDED_KEYS,
  X9_MCP_KEY_HEADER,
  X9_MCP_KEY_PREFIX,
  X9_MCP_PATH,
  X9_MCP_REQUIRED_KEYS,
  PaperclipGatewayCallerSchema,
  paperclipGatewayHeader,
  readPaperclipGatewayCaller,
} from '../../../src/capability/paperclip/mcp-gateway-caller.js';
import { PAPERCLIP_RUN_ID_HEADER } from '../../../src/capability/paperclip-protocollo/percorsi.js';

const company = '3f1c2a64-8d0e-4b7a-9c11-5a2e6f7b8d01';
const agent = '7b1f3c52-0a4e-4d0b-9f55-2b1c7d9e8a10';
const run = 'c0a8e7d2-61f4-4e2b-8a3d-9b4c5d6e7f80';
const issue = '1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
const project = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

const four = {
  'x-paperclip-company-id': company,
  'x-paperclip-agent-id': agent,
  'x-paperclip-run-id': run,
  'x-paperclip-issue-id': issue,
};

const twinA = '11111111-1111-4111-8111-111111111111';
const leadA = '22222222-2222-4222-8222-222222222222';
const twinB = '33333333-3333-4333-8333-333333333333';
const leadB = '44444444-4444-4444-8444-444444444444';

describe('s8500', () => {
  it('s8500_intestazioni', () => {
    expect(PAPERCLIP_GATEWAY_METADATA_KEYS).toEqual([
      'company_id', 'agent_id', 'issue_id', 'project_id', 'run_id', 'gateway_session_id', 'correlation_id',
    ]);
    expect(PAPERCLIP_GATEWAY_METADATA_KEYS.map(paperclipGatewayHeader)).toEqual([
      'x-paperclip-company-id', 'x-paperclip-agent-id', 'x-paperclip-issue-id', 'x-paperclip-project-id',
      'x-paperclip-run-id', 'x-paperclip-gateway-session-id', 'x-paperclip-correlation-id',
    ]);
    expect(paperclipGatewayHeader('run_id')).toBe(PAPERCLIP_RUN_ID_HEADER.toLowerCase());
    expect(X9_MCP_FORWARDED_KEYS).not.toContain('correlation_id');
    expect([...X9_MCP_FORWARDED_KEYS].sort()).toEqual(
      ['company_id', 'agent_id', 'issue_id', 'run_id', 'project_id', 'gateway_session_id'].sort(),
    );
  });

  it('s8500_caller_giusto', () => {
    expect(readPaperclipGatewayCaller(four)).toEqual({
      ok: true,
      caller: { companyId: company, agentId: agent, runId: run, issueId: issue },
    });
    const full = readPaperclipGatewayCaller({
      ...four,
      'x-paperclip-project-id': project,
      'x-paperclip-gateway-session-id': 'sess-1',
      authorization: 'Bearer secret',
      'x-paperclip-correlation-id': 'not-a-guid',
      'x-other': 'x',
    });
    expect(full).toEqual({
      ok: true,
      caller: { companyId: company, agentId: agent, runId: run, issueId: issue, projectId: project, gatewaySessionId: 'sess-1' },
    });
    expect(PaperclipGatewayCallerSchema.safeParse({ ...(full as { caller: object }).caller, extra: 1 }).success).toBe(false);
  });

  it('s8500_mancante', () => {
    for (const key of ['company_id', 'agent_id', 'run_id', 'issue_id'] as const) {
      const header = paperclipGatewayHeader(key);
      const { [header]: _removed, ...without } = four as Record<string, string>;
      expect(readPaperclipGatewayCaller(without)).toEqual({ ok: false, code: 'caller_header_missing', header });
      expect(readPaperclipGatewayCaller({ ...four, [header]: '' })).toEqual({ ok: false, code: 'caller_header_missing', header });
      expect(readPaperclipGatewayCaller({ ...four, [header]: undefined })).toEqual({ ok: false, code: 'caller_header_missing', header });
    }
    expect(readPaperclipGatewayCaller({})).toMatchObject({ ok: false, code: 'caller_header_missing' });
  });

  it('s8500_invalido', () => {
    expect(readPaperclipGatewayCaller({ ...four, 'x-paperclip-agent-id': 'GOO-214' })).toEqual({
      ok: false, code: 'caller_header_invalid', header: 'x-paperclip-agent-id',
    });
    expect(readPaperclipGatewayCaller({ ...four, 'x-paperclip-run-id': [run, run] })).toEqual({
      ok: false, code: 'caller_header_invalid', header: 'x-paperclip-run-id',
    });
    expect(readPaperclipGatewayCaller({ ...four, 'x-paperclip-project-id': 'nope' })).toEqual({
      ok: false, code: 'caller_header_invalid', header: 'x-paperclip-project-id',
    });
    expect(readPaperclipGatewayCaller({ ...four, 'x-paperclip-gateway-session-id': 'x'.repeat(201) })).toEqual({
      ok: false, code: 'caller_header_invalid', header: 'x-paperclip-gateway-session-id',
    });
  });

  it('s8500_chiave', () => {
    expect(X9_MCP_KEY_HEADER).toBe('authorization');
    expect(X9_MCP_KEY_PREFIX).toBe('Bearer ');
    expect(X9_MCP_PATH).toBe('/mcp/x9-tools');
    expect(X9_MCP_REQUIRED_KEYS).toEqual(['company_id', 'agent_id', 'run_id', 'issue_id']);
  });

  it('s8500_gemelli', () => {
    const parse = (v: string) => PaperclipTwinDeclarationsSchema.safeParse(v);
    const empty = parse('');
    expect(empty.success && empty.data.size).toBe(0);
    const one = parse(`${twinA}=${leadA}`);
    expect(one.success && [...one.data.entries()]).toEqual([[twinA, leadA]]);
    const two = parse(` ${twinA} = ${leadA} , ,${twinB}=${leadB},`);
    expect(two.success && two.data.get(twinB)).toBe(leadB);
    expect(two.success && two.data.size).toBe(2);

    expect(parse(`GOO-214=${leadA}`).success).toBe(false);
    expect(parse(`${twinA}=${twinA}`).success).toBe(false);
    expect(parse(`${twinA}=${leadA},${twinA}=${leadB}`).success).toBe(false);
    expect(parse(`${twinA}=${leadA},${twinB}=${leadA}`).success).toBe(false);
    expect(parse(`${twinA}=${leadA},${leadA}=${leadB}`).success).toBe(false);
    expect(parse(`${twinA}=${leadA},${twinB}=${twinA}`).success).toBe(false);
    expect(parse(`${twinA}=${leadA}=${leadB}`).success).toBe(false);
    expect(parse(`${twinA}`).success).toBe(false);
    expect(parse(`${twinA}=${leadA},`.repeat(120)).success).toBe(false);
  });
});
