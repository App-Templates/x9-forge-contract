import { describe, expect, it } from 'vitest';
import * as dev from '../../../src/capability/dev/index.js';
import * as capability from '../../../src/capability/index.js';
import * as signedCommand from '../../../src/capability/dev/signed-command.js';
import * as configState from '../../../src/capability/dev/config-state.js';
import * as productionJob from '../../../src/capability/dev/production-job.js';
import * as genericJob from '../../../src/capability/dev/generic-job.js';
import * as genericChannel from '../../../src/capability/dev/generic-channel.js';
import * as productionResult from '../../../src/capability/dev/production-result.js';
import * as productionArtifactContent from '../../../src/capability/dev/production-artifact-content.js';
import * as productionProgress from '../../../src/capability/dev/production-progress.js';
import * as productionConfigMatch from '../../../src/capability/dev/production-config-match.js';
import * as sessionAssignment from '../../../src/capability/dev/session-assignment.js';
import * as sessionAcceptance from '../../../src/capability/dev/session-acceptance.js';
import * as sessionAcceptanceCatalog from '../../../src/capability/dev/session-acceptance-catalog.js';
import * as sessionAcceptanceTemplates from '../../../src/capability/dev/session-acceptance-templates.js';
import * as sessionAcceptanceCoverage from '../../../src/capability/dev/session-acceptance-coverage.js';
import * as sessionAcceptancePaperclip from '../../../src/capability/dev/session-acceptance-paperclip.js';
import * as sessionAttestation from '../../../src/capability/dev/session-attestation.js';
import * as sessionAcceptanceMandate from '../../../src/capability/dev/session-acceptance-mandate.js';
import * as sessionMaterialLink from '../../../src/capability/dev/session-material-link.js';
import * as sessionOutcome from '../../../src/capability/dev/session-outcome.js';

const allSymbols = { ...signedCommand, ...configState, ...productionJob, ...genericJob, ...genericChannel, ...productionResult, ...productionArtifactContent, ...productionConfigMatch, ...productionProgress, ...sessionAssignment, ...sessionAcceptance, ...sessionAcceptanceCatalog, ...sessionAcceptanceTemplates, ...sessionAcceptanceCoverage, ...sessionAcceptancePaperclip, ...sessionAttestation, ...sessionAcceptanceMandate, ...sessionMaterialLink, ...sessionOutcome };

describe('capability/dev subpath', () => {
  it('re-exports every symbol of signed-command, config-state, production-job, production-result, production-artifact-content, production-config-match and production-progress', () => {
    expect(dev.DevSignedCommandV2Schema).toBe(signedCommand.DevSignedCommandV2Schema);
    expect(dev.DEV_SIGNED_COMMAND_V2_DOMAIN).toBe(signedCommand.DEV_SIGNED_COMMAND_V2_DOMAIN);
    expect(dev.canonicalizeDevSignedCommandV2).toBe(signedCommand.canonicalizeDevSignedCommandV2);
    expect(dev.canonicalizeDevProductionReport).toBe(productionJob.canonicalizeDevProductionReport);
    expect(dev.isDevProductionJobForConfig).toBe(productionConfigMatch.isDevProductionJobForConfig);
    expect(dev.DevProductionProgressSchema).toBe(productionProgress.DevProductionProgressSchema);
    expect(dev.isDevProductionProgressForJob).toBe(productionProgress.isDevProductionProgressForJob);
    expect(dev.DevBindingSchema).toBe(configState.DevBindingSchema);
    expect(dev.DevAgentConfigSchema).toBe(configState.DevAgentConfigSchema);
    expect(dev.DevAgentStatusSchema).toBe(configState.DevAgentStatusSchema);
    expect(dev.DevAgentStateSchema).toBe(configState.DevAgentStateSchema);
    expect(dev.DevAgentConfigStateSchema).toBe(configState.DevAgentConfigStateSchema);
    for (const name of Object.keys(productionJob) as (keyof typeof productionJob)[]) {
      expect(dev[name]).toBe(productionJob[name]);
    }
    for (const name of Object.keys(productionResult) as (keyof typeof productionResult)[]) {
      expect(dev[name]).toBe(productionResult[name]);
    }
    for (const name of Object.keys(sessionAssignment) as (keyof typeof sessionAssignment)[]) {
      expect(dev[name]).toBe(sessionAssignment[name]);
    }
    for (const name of Object.keys(sessionAcceptance) as (keyof typeof sessionAcceptance)[]) {
      expect(dev[name]).toBe(sessionAcceptance[name]);
    }
    for (const name of Object.keys(sessionAcceptanceCatalog) as (keyof typeof sessionAcceptanceCatalog)[]) {
      expect(dev[name]).toBe(sessionAcceptanceCatalog[name]);
    }
    for (const name of Object.keys(sessionAcceptanceTemplates) as (keyof typeof sessionAcceptanceTemplates)[]) {
      expect(dev[name]).toBe(sessionAcceptanceTemplates[name]);
    }
    for (const name of Object.keys(sessionAcceptanceCoverage) as (keyof typeof sessionAcceptanceCoverage)[]) {
      expect(dev[name]).toBe(sessionAcceptanceCoverage[name]);
    }
    for (const name of Object.keys(sessionAcceptancePaperclip) as (keyof typeof sessionAcceptancePaperclip)[]) {
      expect(dev[name]).toBe(sessionAcceptancePaperclip[name]);
    }
    for (const name of Object.keys(sessionAttestation) as (keyof typeof sessionAttestation)[]) {
      expect(dev[name]).toBe(sessionAttestation[name]);
    }
    for (const name of Object.keys(sessionAcceptanceMandate) as (keyof typeof sessionAcceptanceMandate)[]) {
      expect(dev[name]).toBe(sessionAcceptanceMandate[name]);
    }
    for (const name of Object.keys(sessionMaterialLink) as (keyof typeof sessionMaterialLink)[]) {
      expect(dev[name]).toBe(sessionMaterialLink[name]);
    }
    for (const name of Object.keys(sessionOutcome) as (keyof typeof sessionOutcome)[]) {
      expect(dev[name]).toBe(sessionOutcome[name]);
    }
    expect(Object.keys(dev).sort()).toEqual(Object.keys(allSymbols).sort());
  });

  it('exposes the expected set of keys (mutation guard: a dropped re-export fails)', () => {
    expect(Object.keys(dev).sort()).toEqual(
      [
        'DEV_SIGNED_COMMAND_V2_DOMAIN',
        'DEV_GENERIC_JOB_TOOLS',
        'DEV_GENERIC_EXECUTORS',
        'DEV_GENERIC_INPUT_MAX_BYTES',
        'DEV_GENERIC_OUTPUT_MAX_BYTES',
        'DevGenericToolSchema',
        'DevGenericExecutorSchema',
        'DevGenericInputSchema',
        'DevGenericOutputSchema',
        'DevGenericJobSchema',
        'DevGenericJobResultSchema',
        'devGenericResultMatchesJob',
        'DevGenericClaimRequestSchema',
        'DevGenericLeaseSchema',
        'DevGenericClaimResponseSchema',
        'DevGenericHeartbeatRequestSchema',
        'DevGenericHeartbeatResponseSchema',
        'DevGenericCompleteRequestSchema',
        'DevGenericCompleteResponseSchema',
        'selectDevGenericClaim',
        'DevAgentConfigSchema',
        'DevAgentConfigStateSchema',
        'DevAgentStateSchema',
        'DevAgentStatusSchema',
        'DevBindingSchema',
        'DevSignedCommandV2Schema',
        'DevProductionKindSchema',
        'DevProductionJobSchema',
        'DevProductionArtifactSchema',
        'DevProductionArtifactChunkSchema',
        'DevProductionResultSchema',
        'DevProductionProgressSchema',
        'isDevProductionProgressForJob',
        'isDevProductionResultForJob',
        'isDevProductionJobForConfig',
        'isDevProductionArtifactChunkForArtifact',
        'isDevProductionJobModelsUsable',
        'devProductionApprovalBindings',
        'devProductionExecutionMode',
        'canonicalizeDevSignedCommandV2',
        'canonicalizeDevProductionReport',
        'DEV_SESSION_AUTONOMOUS_LABEL',
        'DEV_SESSION_EXECUTOR_LABEL_PREFIX',
        'DEV_SESSION_SERVER_EXECUTOR_LABEL',
        'DEV_SESSION_BRANCH_PREFIX',
        'DEV_SESSION_DELIVERED_FILES_LABEL',
        'DEV_SESSION_COMMIT_LABEL',
        'DEV_SESSION_MAX_FILES',
        'DEV_SESSION_MAX_MATERIALS',
        'DEV_SESSION_BLOCK_MARKER',
        'DEV_SESSION_DELIVERABLE_KEY_PROBLEMS',
        'DEV_SESSION_DELIVERY_PACKAGE_MODES',
        'devSessionDeliverableKeyProblem',
        'mandateDeliverableKeys',
        'DEV_SESSION_OUTCOME_BLOCK_MARKER',
        'DEV_SESSION_OUTCOME_STATES',
        'DEV_SESSION_OUTCOME_REASONS',
        'DevSessionOutcomeSchema',
        'devSessionOutcomeCanonicalJson',
        'renderDevSessionOutcomeBlock',
        'parseDevSessionOutcomeBlock',
        'DEV_SESSION_ANSWER_BLOCK_MARKER',
        'DEV_SESSION_ANSWER_KINDS',
        'DevSessionGitRefSchema',
        'DevSessionAnswerSchema',
        'devSessionAnswerCanonicalJson',
        'renderDevSessionAnswerBlock',
        'parseDevSessionAnswerBlock',
        'DevSessionKindSchema',
        'DevSessionRepoSchema',
        'DevSessionGitHubLinkSchema',
        'DevSessionMaterialSchema',
        'DevSessionAssignmentSchema',
        'DevSessionBaseSchema',
        'DEV_SESSION_ACCEPTANCE_MAX_CRITERIA',
        'DEV_SESSION_CRITERION_TEXT_MAX',
        'DEV_SESSION_ATTESTORS',
        'DEV_SESSION_CRITERION_ORIGINS',
        'DEV_SESSION_INPUT_DATA',
        'DEV_SESSION_INPUT_STATES',
        'DEV_SESSION_INPUT_FORMATS',
        'DEV_SESSION_INPUT_VISUAL_SOURCES',
        'DevSessionAttestorSchema',
        'DevSessionCriterionOriginSchema',
        'DevSessionCriterionSchema',
        'DevSessionAcceptanceInputSchema',
        'DevSessionAcceptanceSchema',
        'DEV_SESSION_ACCEPTANCE_NEEDS',
        'DEV_SESSION_ACCEPTANCE_CATALOG',
        'DEV_SESSION_TEMPLATE_IDS',
        'DevSessionTemplateIdSchema',
        'DEV_SESSION_TEMPLATE_MATERIALS',
        'DEV_SESSION_TEMPLATES',
        'devSessionTemplateSupportsEngine',
        'DEV_SESSION_REQUIREMENT_ORIGINS',
        'DEV_SESSION_REQUIREMENT_PROBLEMS',
        'devSessionRequirements',
        'DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS',
        'devSessionAcceptanceTemplateProblem',
        'DEV_SESSION_COVERAGE_IDENTITY',
        'DevSessionCoverageImageSchema',
        'devSessionCoverageSlots',
        'devSessionCoverageMissing',
        'devSessionAcceptanceCriteriaTexts',
        'devSessionAcceptanceReference',
        'DEV_SESSION_ATTESTATION_FILE',
        'DEV_SESSION_ATTESTATION_STATUSES',
        'DEV_SESSION_PROOF_ORIGINS',
        'DEV_SESSION_RESPONSIBLES',
        'DEV_SESSION_ATTESTATION_MAX_ENTRIES',
        'DEV_SESSION_VERDICT_PROBLEMS',
        'DevSessionAttestationEntrySchema',
        'DevSessionAttestationSchema',
        'DevSessionManifestAttestationSchema',
        'devSessionAcceptanceVerdict',
        'DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS',
        'devSessionMandateCriteria',
        'devSessionMandateAcceptanceProblem',
        'DevSessionCommitSchema',
        'DevSessionDeliveredFileSchema',
        'DevSessionDeliverySchema',
        'DevSessionResultFileSchema',
        'DevSessionResultSchema',
        'devSessionBranch',
        'devSessionId',
        'devSessionAssignmentCanonicalJson',
        'renderDevSessionBlock',
        'parseDevSessionBlock',
        'renderDevSessionDelivery',
        'parseDevSessionDelivery',
        'DEV_SESSION_MATERIAL_PATH',
        'DevSessionMaterialKeySchema',
        'DevSessionMaterialLinkSchema',
        'devSessionMaterialKey',
        'devSessionMaterialSignedMessage',
        'renderDevSessionMaterialLinks',
        'parseDevSessionMaterialLinks',
      ].sort(),
    );
  });

  it('keeps every dev symbol out of the capability index', () => {
    for (const name of Object.keys(allSymbols)) {
      expect(capability).not.toHaveProperty(name);
    }
  });
});
