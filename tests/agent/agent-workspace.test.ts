import { ZodError } from 'zod';
import { AgentVoiceConfigSchema } from '../../src/capability/voice/index.js';
import { PLATFORM_INTERNAL_CREDENTIAL_KEYS } from '../../src/vault/platform-internal-credentials.js';
import { describe, expect, it } from 'vitest';
import {
  AGENT_WORKSPACE_HUMAN_FILES, AGENT_WORKSPACE_TOOLS_FILE, AGENT_WORKSPACE_LIMITS,
  AgentWorkspaceDescriptorSchema, AgentWorkspaceHumanFileSchema, AgentWorkspaceToolsSchema,
  AgentScopePolicySchema, AgentWorkspaceSkillSchema, AgentContextWithWorkspaceSchema, AgentContextWithWorkspaceWriteSchema,
  AgentWorkspaceRollbackValidationSchema, parseAgentWorkspaceRollbackRequest, appliedWorkspaceVersion, agentWorkspaceSkillPath,
} from '../../src/agent/index.js';

const hash = 'a'.repeat(64), date = '2026-10-07T00:00:00Z';
function file(name = 'IDENTITY.md') {
  return { name, load: 'always', versions: { desired: 2, applied: 1, failed: null }, history: [
    { version: 1, origin: { kind: 'agent' }, hash, bytes: 100, updatedAt: date },
    { version: 2, origin: { kind: 'agent' }, hash, bytes: 110, updatedAt: '2026-10-07T01:00:00Z' },
  ] };
}
function workspace() {
  return { agentId: 'agent-1', ownerId: 'owner-1', tenantId: 'tenant-1', version: 7,
    files: ['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'USER.md'].map(name => file(name)),
    tools: { name: 'TOOLS.md', origin: 'generated', editable: false, load: 'always', version: 7, hash, bytes: 200, updatedAt: date },
    registry: { capabilities: [{ name: 'cap-calendar', enabled: true, host: 'calendar', port: 3001, version: '1.0.0' }] },
    skills: [{ capability: 'cap-calendar', description: 'Calendar operations', procedure: { path: 'skills/cap-calendar/SKILL.md',
      load: 'on-demand', editable: false, version: 7, hash, bytes: 500 } }],
  };
}
function context() {
  return { agentId: 'agent-1', ownerId: 'owner-1', tenantId: 'tenant-1', credentials: {},
    llmConfig: { provider: 'openai', model: 'fixture' }, telegramAllowFrom: [], telegramBotToken: '',
    workspacePath: '/fixture/workspace', registryPath: '/fixture/registry.json', displayName: 'Fixture' };
}
function change(raw: unknown, path: readonly (string | number)[], value: unknown): void {
  let row = raw as Record<string | number, unknown>;
  for (const part of path.slice(0, -1)) row = row[part] as Record<string | number, unknown>;
  row[path.at(-1)!] = value;
}

describe('D-A9 shared workspace descriptor', () => {
  it('publishes the existing four human names and generated TOOLS exactly', () => {
    expect(AGENT_WORKSPACE_HUMAN_FILES).toEqual(['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'USER.md']);
    expect(AGENT_WORKSPACE_TOOLS_FILE).toBe('TOOLS.md');
  });
  it('publishes byte limits independently of the old L1 token budget', () => {
    expect(AGENT_WORKSPACE_LIMITS).toEqual({ humanFileBytes: 16384, toolsBytes: 65536, skillDescriptionBytes: 512,
      skillProcedureBytes: 32768, historyEntries: 100, skills: 128 });
  });
  it('accepts the complete descriptor with saved and applied file revisions separated', () => {
    const w = workspace(); expect(AgentWorkspaceDescriptorSchema.parse(w)).toEqual(w);
  });
  it('retains master origin then a local override without discarding history', () => {
    const w = workspace(); change(w, ['files', 1, 'history', 0, 'origin'], { kind: 'master', source: { agentId: 'master', ownerId: 'master-owner' }, version: 8 });
    expect(AgentWorkspaceDescriptorSchema.parse(w).files[1]?.history).toEqual(w.files[1]?.history);
  });
  it('allows a public template for SOUL and an owner-scoped template for USER', () => {
    const w = workspace(); change(w, ['files', 1, 'history', 0, 'origin'], { kind: 'template', templateId: 'standard', ownerId: null, version: 1 });
    change(w, ['files', 3, 'history', 0, 'origin'], { kind: 'template', templateId: 'private', ownerId: 'owner-1', version: 2 });
    expect(AgentWorkspaceDescriptorSchema.safeParse(w).success).toBe(true);
  });
  it('accepts a workspace without capabilities, with no progressive skills', () => {
    const w = workspace(); w.registry.capabilities = []; w.skills = [];
    expect(AgentWorkspaceDescriptorSchema.safeParse(w).success).toBe(true);
  });
  it('accepts disabled registry entries without exposing their procedures', () => {
    const w = workspace(); w.registry.capabilities[0]!.enabled = false; w.skills = [];
    expect(AgentWorkspaceDescriptorSchema.safeParse(w).success).toBe(true);
  });
  it('accepts a canonical pending failed revision while retaining the older applied file', () => {
    const f = file(); change(f, ['versions', 'failed'], { version: 2, reason: { code: 'load-failed' } });
    expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(true);
  });
  it('accepts the human file byte boundary', () => {
    const f = file(); f.history[0]!.bytes = 16384; expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(true);
  });
  it('accepts the generated TOOLS byte boundary', () => {
    const t = workspace().tools; t.bytes = 65536; expect(AgentWorkspaceToolsSchema.safeParse(t).success).toBe(true);
  });
  it('accepts a 512-byte Unicode description and a 32768-byte procedure reference', () => {
    const s = workspace().skills[0]!; s.description = '😀'.repeat(128); s.procedure.bytes = 32768;
    expect(AgentWorkspaceSkillSchema.safeParse(s).success).toBe(true);
  });
  const invalid = [
    ['noncanonical file name', ['files', 0, 'name'], 'AGENTS.md'],
    ['missing human file', ['files'], workspace().files.slice(0, 3)],
    ['duplicate human file', ['files', 1, 'name'], 'IDENTITY.md'],
    ['human on-demand loading', ['files', 0, 'load'], 'on-demand'],
    ['applied ahead of saved', ['files', 0, 'versions', 'applied'], 3],
    ['saved revision not latest', ['files', 0, 'versions', 'desired'], 3],
    ['duplicate history version', ['files', 0, 'history', 1, 'version'], 1],
    ['backwards history version', ['files', 0, 'history', 0, 'version'], 3],
    ['backwards history date', ['files', 0, 'history', 1, 'updatedAt'], '2026-10-06T00:00:00Z'],
    ['empty history', ['files', 0, 'history'], []],
    ['invalid content hash', ['files', 0, 'history', 0, 'hash'], '../private'],
    ['invalid date', ['files', 0, 'history', 0, 'updatedAt'], 'yesterday'],
    ['human bytes exceeded', ['files', 0, 'history', 0, 'bytes'], 16385],
    ['fractional file bytes', ['files', 0, 'history', 0, 'bytes'], 2.5],
    ['negative file bytes', ['files', 0, 'history', 0, 'bytes'], -1],
    ['unknown origin', ['files', 0, 'history', 0, 'origin'], { kind: 'override' }],
    ['Master USER from another owner', ['files', 3, 'history', 0, 'origin'], { kind: 'master', source: { agentId: 'master', ownerId: 'owner-other' }, version: 1 }],
    ['public USER template', ['files', 3, 'history', 0, 'origin'], { kind: 'template', templateId: 'public', ownerId: null, version: 1 }],
    ['TOOLS override', ['tools', 'origin'], 'override'],
    ['TOOLS editable', ['tools', 'editable'], true],
    ['TOOLS name drift', ['tools', 'name'], 'OTHER.md'],
    ['TOOLS loaded on demand', ['tools', 'load'], 'on-demand'],
    ['origin arbitrary content', ['files', 0, 'history', 0, 'origin', 'content'], 'not metadata'],
    ['revision arbitrary content', ['files', 0, 'history', 0, 'content'], 'not metadata'],
    ['human arbitrary content', ['files', 0, 'content'], 'not metadata'],
    ['TOOLS arbitrary content', ['tools', 'content'], 'not metadata'],
    ['skill arbitrary content', ['skills', 0, 'content'], 'not metadata'],
    ['master origin arbitrary content', ['files', 1, 'history', 0, 'origin'], {kind:'master',source:{agentId:'master',ownerId:'owner-1'},version:1,content:'not metadata'}],
    ['template origin arbitrary content', ['files', 1, 'history', 0, 'origin'], {kind:'template',templateId:'standard',ownerId:null,version:1,content:'not metadata'}],
    ['TOOLS fractional bytes', ['tools','bytes'], 2.5],
    ['TOOLS negative bytes', ['tools','bytes'], -1],
    ['procedure fractional bytes', ['skills',0,'procedure','bytes'], 2.5],
    ['procedure negative bytes', ['skills',0,'procedure','bytes'], -1],
    ['TOOLS bytes exceeded', ['tools', 'bytes'], 65537],
    ['TOOLS version mismatch', ['tools', 'version'], 8],
    ['duplicate registry name', ['registry', 'capabilities'], [workspace().registry.capabilities[0], workspace().registry.capabilities[0]]],
    ['skill disabled', ['registry', 'capabilities', 0, 'enabled'], false],
    ['skill unknown', ['skills', 0, 'capability'], 'cap-other'],
    ['duplicate skill', ['skills'], [workspace().skills[0], workspace().skills[0]]],
    ['enabled skill missing', ['skills'], []],
    ['empty short description', ['skills', 0, 'description'], '  '],
    ['Unicode short description exceeded', ['skills', 0, 'description'], '😀'.repeat(129)],
    ['procedure bytes exceeded', ['skills', 0, 'procedure', 'bytes'], 32769],
    ['procedure loaded eagerly', ['skills', 0, 'procedure', 'load'], 'always'],
    ['procedure editable', ['skills', 0, 'procedure', 'editable'], true],
    ['procedure version mismatch', ['skills', 0, 'procedure', 'version'], 8],
    ['procedure cross capability', ['skills', 0, 'procedure', 'path'], 'skills/cap-other/SKILL.md'],
    ['procedure traversal', ['skills', 0, 'procedure', 'path'], '../USER.md'],
    ['procedure arbitrary content', ['skills', 0, 'procedure', 'content'], 'not a reference'],
    ['workspace arbitrary content', ['content'], 'not metadata'],
  ] as const;
  it.each(invalid)('rejects %s', (_name, path, value) => {
    const w = workspace(); change(w, path, value);
    expect(AgentWorkspaceDescriptorSchema.safeParse(w).success).toBe(false);
  });
  it('rejects duplicate history before the latest without another version violation',()=>{const f=file();f.history.splice(1,0,{...f.history[0]!});expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(false);});
  it('rejects backwards history while saved and applied references both exist',()=>{const f=file();f.history=[{...f.history[0]!,version:2},{...f.history[0]!,version:1},{...f.history[1]!,version:3}];f.versions.desired=3;expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(false);});
  it('rejects a fifth human file even if all four canonical names are present',()=>{const w=workspace();w.files.push(file());expect(AgentWorkspaceDescriptorSchema.safeParse(w).success).toBe(false);});
  it('locates an empty history at the history field',()=>{const f=file();f.history=[];const result=AgentWorkspaceHumanFileSchema.safeParse(f);expect(result.success).toBe(false);if(!result.success)expect(result.error.issues.some(issue=>issue.path.join('.')==='history')).toBe(true);});
  it('locates a disabled skill at its capability rather than only the set',()=>{const w=workspace();w.registry.capabilities[0]!.enabled=false;const result=AgentWorkspaceDescriptorSchema.safeParse(w);expect(result.success).toBe(false);if(!result.success)expect(result.error.issues.some(issue=>issue.path.join('.')==='skills.0.capability')).toBe(true);});
  it('rejects an applied revision absent from otherwise ordered history', () => {
    const f = file(); f.history[0]!.version = 2; f.history[1]!.version = 4; f.versions = { desired: 4, applied: 3, failed: null };
    expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(false);
  });
  it('rejects a failed revision absent from ordered history', () => {
    const f = file(); f.history[1]!.version = 4; change(f, ['versions'], { desired: 4, applied: 1, failed: { version: 3, reason: { code: 'load-failed' } } });
    expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(false);
  });
  it('rejects more than 100 history revisions', () => {
    const f = file(); f.history = Array.from({ length: 101 }, (_, i) => ({ ...f.history[0]!, version: i + 1 })); f.versions.desired = 101;
    expect(AgentWorkspaceHumanFileSchema.safeParse(f).success).toBe(false);
  });
  it('rejects more than 128 valid enabled progressive skills', () => {
    const w = workspace(); w.skills = Array.from({ length: 129 }, (_, i) => ({ ...w.skills[0]!, capability: `cap-${i}`, procedure: { ...w.skills[0]!.procedure, path: `skills/cap-${i}/SKILL.md` } }));
    w.registry.capabilities = w.skills.map(s => ({ name: s.capability, enabled: true, host: 'fixture', port: 3001, version: '1.0.0' }));
    expect(AgentWorkspaceDescriptorSchema.safeParse(w).success).toBe(false);
  });
});

describe('workspace rollback is explicit and bound to authoritative history', () => {
  it('selects the previous revision without mutating desired/applied state', () => {
    const w = workspace(), before = structuredClone(w), request = { file: 'SOUL.md', expectedVersion: 2, targetVersion: 1 };
    expect(parseAgentWorkspaceRollbackRequest(request, w)).toEqual(request); expect(w).toEqual(before);
  });
  it('rejects CAS mismatch', () => expect(() => parseAgentWorkspaceRollbackRequest({ file: 'SOUL.md', expectedVersion: 3, targetVersion: 1 }, workspace())).toThrow(ZodError));
  it('rejects the current revision as a rollback target', () => expect(() => parseAgentWorkspaceRollbackRequest({ file: 'SOUL.md', expectedVersion: 2, targetVersion: 2 }, workspace())).toThrow(ZodError));
  it('rejects a nonexistent earlier revision', () => {
    const w = workspace(); w.files[1]!.history = w.files[1]!.history.slice(1); change(w, ['files', 1, 'versions', 'applied'], null);
    expect(() => parseAgentWorkspaceRollbackRequest({ file: 'SOUL.md', expectedVersion: 2, targetVersion: 1 }, w)).toThrow(ZodError);
  });
  it('rejects rollback of generated TOOLS', () => expect(() => parseAgentWorkspaceRollbackRequest({ file: 'TOOLS.md', expectedVersion: 2, targetVersion: 1 }, workspace())).toThrow(ZodError));
  it('rejects extra fields on the authoritative validation wrapper',()=>expect(AgentWorkspaceRollbackValidationSchema.safeParse({workspace:workspace(),request:{file:'SOUL.md',expectedVersion:2,targetVersion:1},force:true}).success).toBe(false));
  it('rejects extra force fields', () => expect(() => parseAgentWorkspaceRollbackRequest({ file: 'SOUL.md', expectedVersion: 2, targetVersion: 1, force: true }, workspace())).toThrow(ZodError));
});

describe('additive applied workspace context', () => {
  for (const [name, schema] of [['reader', AgentContextWithWorkspaceSchema], ['writer', AgentContextWithWorkspaceWriteSchema]] as const) {
    for(const hasWorkspace of [false,true]){it(`${name} preserves 1.34 voice and policy with workspace ${hasWorkspace}`,()=>{const scopePolicy=AgentScopePolicySchema.parse({version:11,defaultWebSearch:true,scopeLimited:false,defaults:{read:'allow',write:'ask'},rules:[]});const voiceConfiguration=AgentVoiceConfigSchema.parse({agentId:'agent-1',versions:{desired:4,applied:4,failed:null},desired:{mode:'text-only'},applied:{mode:'text-only'}});const raw={...context(),scopePolicy,voiceConfiguration,...(hasWorkspace?{workspace:workspace()}: {})};expect(schema.safeParse(raw).success).toBe(true);const parsed=schema.parse(raw);expect(parsed).toEqual(raw);expect(appliedWorkspaceVersion(parsed)).toBe(hasWorkspace?7:null);});}
    it(`${name} preserves legacy 1.33 absence unchanged`, () => {expect(schema.safeParse(context()).success).toBe(true);expect(schema.parse(context())).toEqual(context());});
    it(`${name} keeps a valid workspace`, () => expect(schema.parse({ ...context(), workspace: workspace() }).workspace).toEqual(workspace()));
    for (const field of ['agentId', 'ownerId', 'tenantId'] as const) {
      it(`${name} rejects different workspace ${field}`, () => {
        const w = workspace(); w[field] = 'other'; expect(schema.safeParse({ ...context(), workspace: w }).success).toBe(false);
      });
    }
    it(`${name} rejects null workspace`, () => expect(schema.safeParse({ ...context(), workspace: null }).success).toBe(false));
    it(`${name} retains platform credential write protection`, () => {
      const c = { ...context(), credentials: { [PLATFORM_INTERNAL_CREDENTIAL_KEYS[0]]: 'synthetic' } };
      expect(schema.safeParse(c).success).toBe(name === 'reader');
    });
  }
  it('reports null when workspace was never applied, independent of configVersion', () => expect(appliedWorkspaceVersion(AgentContextWithWorkspaceSchema.parse({ ...context(), configVersion: 99 }))).toBeNull());
  it('reports the applied bundle version rather than a file saved version', () => expect(appliedWorkspaceVersion(AgentContextWithWorkspaceSchema.parse({ ...context(), workspace: workspace() }))).toBe(7));
  it('derives the canonical procedure path', () => expect(agentWorkspaceSkillPath('cap-calendar')).toBe('skills/cap-calendar/SKILL.md'));
  it.each(['../USER.md', '..', '.', 'cap/other', 'cap\\other', '%2e%2e', 'cap:name'])('rejects unsafe capability path segment %s', value => expect(() => agentWorkspaceSkillPath(value)).toThrow(ZodError));
  it('rejects capability traversal before deriving a procedure path', () => expect(() => agentWorkspaceSkillPath('../USER.md')).toThrow(ZodError));
});
