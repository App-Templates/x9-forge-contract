import {
  AgentContextWithWorkspaceSchema, AgentWorkspaceDescriptorSchema,
  AgentWorkspaceHumanFileNameSchema, AgentWorkspaceSkillSchema,
  appliedWorkspaceVersion, parseAgentWorkspaceRollbackRequest,
  type AgentContextWithWorkspace, type AgentWorkspaceDescriptor,
  type AgentWorkspaceRollbackRequest,
} from '@x9-forge/contracts/agent';
const raw: unknown = {};
const context: AgentContextWithWorkspace = AgentContextWithWorkspaceSchema.parse(raw);
const workspace: AgentWorkspaceDescriptor = AgentWorkspaceDescriptorSchema.parse(raw);
const version: number | null = appliedWorkspaceVersion(context);
const request: AgentWorkspaceRollbackRequest = parseAgentWorkspaceRollbackRequest(raw, workspace);
const name: 'IDENTITY.md' | 'SOUL.md' | 'POLICIES.md' | 'USER.md' = AgentWorkspaceHumanFileNameSchema.parse(raw);
const procedure: string = AgentWorkspaceSkillSchema.parse(raw).procedure.path;
void [version,request,name,procedure];
