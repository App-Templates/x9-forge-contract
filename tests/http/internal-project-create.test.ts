import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../../src/auth/index.js';
import { InternalFactoryDeployRequestSchema } from '../../src/http/endpoints/internal-factory-deploy.js';
import {
  PROJECT_CREATE_STEPS,
  PROJECT_DIRECTOR_AGENT_ID_PREFIX,
  PROJECT_ID_MAX_LENGTH,
  ProjectCreateErrorResponseSchema,
  ProjectCreateRequestSchema,
  ProjectCreateResponseSchema,
  ProjectIdSchema,
  internalProjectCreateContract,
  projectDirectorAgentId,
} from '../../src/http/endpoints/internal-project-create.js';

const request = {
  requestId: 'req-cantina-facile-1',
  tenantId: '1',
  ownerId: '1',
  company: { companyId: 'good-choice', name: 'Good Choice' },
  project: { projectId: 'cantina-facile', name: 'Cantina Facile' },
  projectReferent: { name: 'Stefano Argiolas', email: 'committente@example.com' },
  requestedBy: { kind: 'owner' },
};

const identity = (id: string) => ({ managementAgentId: id, runtimeAgentId: id, vaultAgentId: 7 });
const UUID_A = '3f1c2b9e-5a4d-4e6f-8a1b-2c3d4e5f6a7b';
const UUID_B = '9a8b7c6d-1e2f-4a3b-9c4d-5e6f7a8b9c0d';

const ready = {
  state: 'ready',
  replayed: false,
  tenantId: '1',
  companyId: 'good-choice',
  projectId: 'cantina-facile',
  paperclipProjectId: UUID_A,
  director: { agentIdentity: identity('director-cantina-facile'), paperclipAgentId: UUID_B },
  contact: { mailboxKind: 'shared', address: 'director-good-choice@agentmail.to', subjectLabel: 'cantina-facile' },
};

const failure = { reason: 'Forge could not complete the step' };

describe('s6667 crea-progetto: a project create request names the project referent and has a project id of at most 21 characters so the Director agent id fits the Forge slug, the ready answer names the Director and how to write to it, with the subject label on the shared mailbox, and every failure is a fixed error with the step or the taken place named', () => {
  it('publishes the POST path with token authentication', () => {
    expect(internalProjectCreateContract.method).toBe('POST');
    expect(internalProjectCreateContract.path).toBe('/api/internal/factory/projects');
    expect(internalProjectCreateContract.authType).toBe('token');
    expect(internalProjectCreateContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(internalProjectCreateContract.bodySchema).toBe(ProjectCreateRequestSchema);
    expect(internalProjectCreateContract.responseSchema).toBe(ProjectCreateResponseSchema);
    expect(internalProjectCreateContract.errorSchema).toBe(ProjectCreateErrorResponseSchema);
  });

  describe('(a) request', () => {
    const id = (length: number) => 'a'.repeat(length);
    const withProject = (projectId: string) => ({ ...request, project: { ...request.project, projectId } });

    it('accepts the owner request for cantina-facile', () => {
      expect(ProjectCreateRequestSchema.safeParse(request).success).toBe(true);
    });
    it('s6715 accepts a project id of 21 characters and rejects 22', () => {
      expect(PROJECT_ID_MAX_LENGTH).toBe(21);
      expect(ProjectIdSchema.safeParse(id(21)).success).toBe(true);
      expect(ProjectIdSchema.safeParse(id(22)).success).toBe(false);
      expect(ProjectCreateRequestSchema.safeParse(withProject(id(21))).success).toBe(true);
      expect(ProjectCreateRequestSchema.safeParse(withProject(id(22))).success).toBe(false);
    });
    it('rejects project ids that are not Forge slugs', () => {
      expect(ProjectIdSchema.safeParse('orto-facile 2').success).toBe(false);
      expect(ProjectIdSchema.safeParse('Cantina').success).toBe(false);
      expect(ProjectIdSchema.safeParse('').success).toBe(false);
    });
    it('accepts an agent requester with the complete identity', () => {
      const agent = { kind: 'agent', agentIdentity: identity('capo-vendite') };
      expect(ProjectCreateRequestSchema.safeParse({ ...request, requestedBy: agent }).success).toBe(true);
      expect(ProjectCreateRequestSchema.safeParse({ ...request, requestedBy: { kind: 'agent' } }).success).toBe(false);
    });
    it('rejects an extra field', () => {
      expect(ProjectCreateRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
    });
    it('requires the referent with a valid email and nothing more', () => {
      const { projectReferent: _omitted, ...without } = request;
      expect(ProjectCreateRequestSchema.safeParse(without).success).toBe(false);
      expect(ProjectCreateRequestSchema.safeParse({
        ...request, projectReferent: { ...request.projectReferent, email: 'not-an-email' },
      }).success).toBe(false);
      expect(ProjectCreateRequestSchema.safeParse({
        ...request, projectReferent: { ...request.projectReferent, personRef: 'stefano' },
      }).success).toBe(false);
    });
  });

  describe('(b) Director agent id', () => {
    it('is director-<projectId>, the name of today\'s Director', () => {
      expect(projectDirectorAgentId('good-choice')).toBe('director-good-choice');
    });
    it('s6715 fits the 30-character Forge agent slug and throws for a 22-character project id', () => {
      expect(PROJECT_DIRECTOR_AGENT_ID_PREFIX.length + PROJECT_ID_MAX_LENGTH).toBe(30);
      const directorId = projectDirectorAgentId('a'.repeat(21));
      expect(directorId).toHaveLength(30);
      expect(InternalFactoryDeployRequestSchema.shape.slug.safeParse(directorId).success).toBe(true);
      expect(InternalFactoryDeployRequestSchema.shape.slug.safeParse('a'.repeat(31)).success).toBe(false);
      expect(() => projectDirectorAgentId('a'.repeat(22))).toThrow();
    });
  });

  describe('(c) response', () => {
    it('accepts ready on the shared mailbox with the subject label', () => {
      expect(ProjectCreateResponseSchema.safeParse(ready).success).toBe(true);
    });
    it('requires the subject label on the shared mailbox only', () => {
      const { subjectLabel: _omitted, ...bare } = ready.contact;
      expect(ProjectCreateResponseSchema.safeParse({ ...ready, contact: bare }).success).toBe(false);
      const own = { mailboxKind: 'own', address: 'director-cantina-facile@agentmail.to' };
      expect(ProjectCreateResponseSchema.safeParse({ ...ready, contact: own }).success).toBe(true);
      expect(ProjectCreateResponseSchema.safeParse({
        ...ready, contact: { ...own, subjectLabel: 'cantina-facile' },
      }).success).toBe(false);
    });
    it('rejects a label with square brackets and the mailbox kind none', () => {
      expect(ProjectCreateResponseSchema.safeParse({
        ...ready, contact: { ...ready.contact, subjectLabel: '[x]' },
      }).success).toBe(false);
      expect(ProjectCreateResponseSchema.safeParse({
        ...ready, contact: { mailboxKind: 'none' },
      }).success).toBe(false);
    });
    it('rejects the Director of another project', () => {
      expect(ProjectCreateResponseSchema.safeParse({
        ...ready, director: { ...ready.director, agentIdentity: identity('director-orto-facile') },
      }).success).toBe(false);
      expect(ProjectCreateResponseSchema.safeParse({
        ...ready,
        director: {
          ...ready.director,
          agentIdentity: { ...identity('director-cantina-facile'), runtimeAgentId: 'director-orto-facile' },
        },
      }).success).toBe(false);
    });
    it('accepts in_corso with a known step only', () => {
      expect(PROJECT_CREATE_STEPS).toContain('director_mailbox');
      expect(ProjectCreateResponseSchema.safeParse({ state: 'in_corso', step: 'director_mailbox' }).success).toBe(true);
      expect(ProjectCreateResponseSchema.safeParse({ state: 'in_corso', step: 'invented' }).success).toBe(false);
    });
    it('s6715 writes the project referent immediately after the project group', () => {
      expect(PROJECT_CREATE_STEPS).toEqual([
        'company_group',
        'project_group',
        'project_referent',
        'director_birth',
        'director_mailbox',
        'paperclip_enrollment',
        'director_profile',
      ]);
      expect(ProjectCreateResponseSchema.safeParse({ state: 'in_corso', step: 'project_referent' }).success).toBe(true);
      expect(ProjectCreateErrorResponseSchema.safeParse({
        error: 'birth_failed', step: 'project_referent', ...failure,
      }).success).toBe(true);
    });
  });

  describe('(d) errors', () => {
    const parse = (value: unknown) => ProjectCreateErrorResponseSchema.safeParse(value).success;
    it('requires the step for birth_failed and only there', () => {
      expect(parse({ error: 'birth_failed', ...failure })).toBe(false);
      expect(parse({ error: 'birth_failed', step: 'director_mailbox', ...failure })).toBe(true);
    });
    it('requires the taken places for project_taken and only there', () => {
      expect(parse({ error: 'project_taken', taken: ['director_mailbox_label'], ...failure })).toBe(true);
      expect(parse({ error: 'project_taken', ...failure })).toBe(false);
      expect(parse({ error: 'project_taken', taken: ['forge_agent', 'forge_agent'], ...failure })).toBe(false);
      expect(parse({ error: 'company_unknown', taken: ['forge_agent'], ...failure })).toBe(false);
    });
    it('rejects a step on other errors and an invented error', () => {
      expect(parse({ error: 'company_unknown', step: 'director_birth', ...failure })).toBe(false);
      expect(parse({ error: 'company_unknown', ...failure })).toBe(true);
      expect(parse({ error: 'boom', ...failure })).toBe(false);
    });
  });
});
