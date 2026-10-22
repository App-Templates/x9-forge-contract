import { describe, expect, it } from 'vitest';
import * as organization from '../../src/organization/index.js';
import * as root from '../../src/index.js';
import * as runContext from '../../src/organization/run-context.js';
import * as runOutcome from '../../src/organization/run-outcome.js';
import * as operations from '../../src/organization/operations.js';
import * as decisionResponse from '../../src/organization/decision-response.js';
import * as outcomeIntake from '../../src/organization/outcome-intake.js';
import * as publicationRef from '../../src/organization/publication-ref.js';
import * as publicationRecordLink from '../../src/organization/publication-record-link.js';
import * as experiment from '../../src/organization/experiment.js';
import * as companyMemory from '../../src/organization/company-memory.js';
import * as scenario from '../../src/organization/scenario.js';
import * as runReceipt from '../../src/organization/run-receipt.js';
import * as experience from '../../src/organization/experience.js';
import * as simulationWorld from '../../src/organization/simulation-world.js';
import * as simulationExpectation from '../../src/organization/simulation-expectation.js';
import * as simulationEvaluation from '../../src/organization/simulation-evaluation.js';
import * as knowledgePublication from '../../src/organization/knowledge-publication.js';
import * as participantBinding from '../../src/organization/participant-binding.js';
import * as toolCallCorrelation from '../../src/organization/tool-call-correlation.js';
import * as publicationOperations from '../../src/organization/publication-operations.js';
import * as publicationLookup from '../../src/organization/publication-lookup.js';
import * as recall from '../../src/organization/recall.js';
import * as businessUnitLead from '../../src/organization/business-unit-lead.js';
import * as decisionRequest from '../../src/organization/decision-request.js';
import * as asset from '../../src/organization/asset.js';
import * as sharedMailbox from '../../src/organization/shared-mailbox.js';
import * as businessUnitType from '../../src/organization/business-unit-type.js';
import * as agentRole from '../../src/organization/agent-role.js';
import * as actionPlan from '../../src/organization/action-plan.js';

const allSymbols = {
  ...runContext,
  ...businessUnitType,
  ...runOutcome,
  ...operations,
  ...decisionResponse,
  ...outcomeIntake,
  ...publicationRef,
  ...publicationRecordLink,
  ...experiment,
  ...companyMemory,
  ...scenario,
  ...runReceipt,
  ...experience,
  ...simulationWorld,
  ...simulationExpectation,
  ...simulationEvaluation,
  ...knowledgePublication,
  ...participantBinding,
  ...toolCallCorrelation,
  ...publicationOperations,
  ...publicationLookup,
  ...recall,
  ...businessUnitLead,
  ...decisionRequest,
  ...asset,
  ...sharedMailbox,
  ...agentRole,
  ...actionPlan,
};

describe('organization subpath', () => {
  it('exports the canonical schemas and every organization runtime symbol', () => {
    expect(organization.OrganizationRunContextSchema).toBe(runContext.OrganizationRunContextSchema);
    expect(organization.RunAttemptSchema).toBe(runOutcome.RunAttemptSchema);
    expect(organization.RunOutcomeSchema).toBe(runOutcome.RunOutcomeSchema);
    expect(organization.OrganizationOperationSchema).toBe(operations.OrganizationOperationSchema);
    expect(organization.DecisionResponseSchema).toBe(decisionResponse.DecisionResponseSchema);
    expect(organization.OutcomeIntakeSchema).toBe(outcomeIntake.OutcomeIntakeSchema);
    expect(organization.PublicationRefSchema).toBe(publicationRef.PublicationRefSchema);
    expect(organization.ExperimentSchema).toBe(experiment.ExperimentSchema);
    expect(organization.CompanyMemoryScopeSchema).toBe(companyMemory.CompanyMemoryScopeSchema);
    expect(organization.ScenarioVersionSchema).toBe(scenario.ScenarioVersionSchema);
    expect(organization.ScenarioVersionRefSchema).toBe(scenario.ScenarioVersionRefSchema);
    expect(organization.ScenarioCorpusSchema).toBe(scenario.ScenarioCorpusSchema);
    expect(organization.RunReceiptSchema).toBe(runReceipt.RunReceiptSchema);
    expect(organization.OrganizationExperienceEventSchema).toBe(experience.OrganizationExperienceEventSchema);
    expect(organization.SimulationWorldSchema).toBe(simulationWorld.SimulationWorldSchema);
    expect(organization.SimulationExpectationSetSchema).toBe(
      simulationExpectation.SimulationExpectationSetSchema,
    );
    expect(organization.KnowledgePublicationSchema).toBe(knowledgePublication.KnowledgePublicationSchema);
    expect(organization.EvaluationVerdictSchema).toBe(simulationEvaluation.EvaluationVerdictSchema);
    expect(organization.SimulationEvaluationItemSchema).toBe(simulationEvaluation.SimulationEvaluationItemSchema);
    expect(organization.SimulationBoundarySchema).toBe(simulationEvaluation.SimulationBoundarySchema);
    expect(organization.SimulationEvaluationSchema).toBe(simulationEvaluation.SimulationEvaluationSchema);
    expect(organization.summarizeEvaluationItems).toBe(simulationEvaluation.summarizeEvaluationItems);
    expect(organization.ParticipantBindingSchema).toBe(participantBinding.ParticipantBindingSchema);
    expect(organization.OrganizationToolCallContextSchema).toBe(toolCallCorrelation.OrganizationToolCallContextSchema);
    expect(organization.PublishMaterialRequestSchema).toBe(publicationOperations.PublishMaterialRequestSchema);
    expect(organization.ListPublicationsRequestSchema).toBe(publicationLookup.ListPublicationsRequestSchema);
    expect(organization.decisionOutcomeFromEmailReply).toBe(decisionRequest.decisionOutcomeFromEmailReply);
    expect(Object.keys(organization).sort()).toEqual(Object.keys(allSymbols).sort());
  });

  it('preserves the original run context literal without changing its shape', () => {
    const context = {
      schemaVersion: 1,
      runId: 'run-1',
      organizationId: 'org-1',
      ownerId: 'owner-1',
      identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
      issuer: 'x9',
      issuedAt: '2026-10-14T10:00:00.000Z',
      expiresAt: '2026-10-14T11:00:00.000Z',
    };

    expect(organization.OrganizationRunContextSchema.parse(context)).toEqual(context);
  });

  it('keeps every organization runtime symbol out of the package root', () => {
    for (const name of Object.keys(allSymbols)) {
      expect(root).not.toHaveProperty(name);
    }
  });
});
