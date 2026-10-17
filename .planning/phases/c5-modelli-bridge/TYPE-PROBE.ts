import { createAgentModelsConfigurationWithProvenance, type AgentModelsConfigurationWithProvenanceInput, type AgentContextWithModelProvenance } from "@x9-forge/contracts/model-router";
declare const input: AgentModelsConfigurationWithProvenanceInput;
createAgentModelsConfigurationWithProvenance(input);
// @ts-expect-error Provenance is mandatory at the modern writer boundary.
createAgentModelsConfigurationWithProvenance({ schemaVersion: 1, identity: input.identity, configVersion: 1, selections: input.selections });
// @ts-expect-error All three target identifiers must be declared.
createAgentModelsConfigurationWithProvenance({ ...input, identity: { managementAgentId: "m", runtimeAgentId: "r" } });
// @ts-expect-error Scope requires an explicit tenant.
createAgentModelsConfigurationWithProvenance({ ...input, provenance: { ...input.provenance, scope: { agentId: "r", ownerId: "owner" } } });
// @ts-expect-error Linked models need an explicit source.
createAgentModelsConfigurationWithProvenance({ ...input, provenance: { ...input.provenance, bindings: [{ slotId: "agent_chat", origin: "master" }] } });
// @ts-expect-error Custom models cannot claim a source.
createAgentModelsConfigurationWithProvenance({ ...input, provenance: { ...input.provenance, bindings: [{ slotId: "agent_chat", origin: "custom", source: { identity: input.identity, sourceVersion: 1 } }] } });
declare const heir: AgentContextWithModelProvenance;
if (heir.role === "erede") { const parent: string = heir.masterAgentId; void parent; }
