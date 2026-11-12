import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH,
  PROJECT_DIRECTOR_ENROLLMENT_ERRORS,
  PROJECT_DIRECTOR_ENROLLMENT_STEPS,
  ProjectDirectorEnrollmentErrorResponseSchema,
  ProjectDirectorEnrollmentRequestSchema,
  ProjectDirectorEnrollmentResponseSchema,
  internalProjectDirectorEnrollmentContract,
} from '../../src/http/endpoints/internal-project-director-enrollment.js';

const identity = (id: string) => ({ managementAgentId: id, runtimeAgentId: id, vaultAgentId: 7 });
const UUID_A = '3f1c2b9e-5a4d-4e6f-8a1b-2c3d4e5f6a7b';
const UUID_B = '9a8b7c6d-1e2f-4a3b-9c4d-5e6f7a8b9c0d';

const request = {
  tenantId: '1',
  ownerId: '1',
  companyId: 'good-choice',
  requestId: 'req-cantina-facile-1',
  project: { projectId: 'cantina-facile', name: 'Cantina Facile' },
  director: { agentIdentity: identity('director-cantina-facile') },
};

describe('s6668 iscrivi-director: Forge asks cap-paperclip to enroll the Director born for a project with the project shape of the create contract and the Director named after the project, the answer is enrolled with both Paperclip ids or in progress with the step named, and every failure is one of seven fixed errors', () => {
  it('accepts the request and refuses a Director not named after the project', () => {
    expect(ProjectDirectorEnrollmentRequestSchema.safeParse(request).success).toBe(true);
    const wrongName = { ...request, director: { agentIdentity: identity('director-good-choice') } };
    expect(ProjectDirectorEnrollmentRequestSchema.safeParse(wrongName).success).toBe(false);
    const wrongRuntime = {
      ...request,
      director: { agentIdentity: { ...identity('director-cantina-facile'), runtimeAgentId: 'director-other' } },
    };
    expect(ProjectDirectorEnrollmentRequestSchema.safeParse(wrongRuntime).success).toBe(false);
  });

  it('refuses a project id of 56 characters and a mailbox field', () => {
    const longId = 'a'.repeat(56);
    const long = {
      ...request,
      project: { projectId: longId, name: 'Long' },
      director: { agentIdentity: identity(`director-${longId}`) },
    };
    expect(ProjectDirectorEnrollmentRequestSchema.safeParse(long).success).toBe(false);
    const withContact = { ...request, contact: { mailboxKind: 'own' } };
    expect(ProjectDirectorEnrollmentRequestSchema.safeParse(withContact).success).toBe(false);
  });

  it('answers enrolled with both ids, never without one or with a step', () => {
    const enrolled = { state: 'enrolled', paperclipAgentId: UUID_A, paperclipProjectId: UUID_B };
    expect(ProjectDirectorEnrollmentResponseSchema.safeParse(enrolled).success).toBe(true);
    expect(
      ProjectDirectorEnrollmentResponseSchema.safeParse({ state: 'enrolled', paperclipAgentId: UUID_A }).success,
    ).toBe(false);
    expect(ProjectDirectorEnrollmentResponseSchema.safeParse({ ...enrolled, step: 'seat' }).success).toBe(false);
  });

  it('answers in_corso with a known step only', () => {
    expect(ProjectDirectorEnrollmentResponseSchema.safeParse({ state: 'in_corso', step: 'seat' }).success).toBe(true);
    expect(ProjectDirectorEnrollmentResponseSchema.safeParse({ state: 'in_corso' }).success).toBe(false);
    expect(ProjectDirectorEnrollmentResponseSchema.safeParse({ state: 'in_corso', step: 'coffee' }).success).toBe(
      false,
    );
    for (const step of PROJECT_DIRECTOR_ENROLLMENT_STEPS) {
      expect(ProjectDirectorEnrollmentResponseSchema.safeParse({ state: 'in_corso', step }).success).toBe(true);
    }
  });

  it('s6716 ordine-iscrizione: the project Director enrollment steps are listed in the order cap-paperclip does them, Paperclip agent, Paperclip project, binding, seat and agent key last, because the key is written by the seat round and needs the seat already registered', () => {
    expect(PROJECT_DIRECTOR_ENROLLMENT_STEPS).toEqual([
      'paperclip_agent',
      'paperclip_project',
      'binding',
      'seat',
      'agent_key',
    ]);
    expect(
      ProjectDirectorEnrollmentResponseSchema.safeParse({ state: 'in_corso', step: 'agent_key' }).success,
    ).toBe(true);
  });

  it('knows seven fixed errors and no other', () => {
    expect(PROJECT_DIRECTOR_ENROLLMENT_ERRORS).toHaveLength(7);
    for (const error of PROJECT_DIRECTOR_ENROLLMENT_ERRORS) {
      expect(ProjectDirectorEnrollmentErrorResponseSchema.safeParse({ error }).success).toBe(true);
    }
    expect(ProjectDirectorEnrollmentErrorResponseSchema.safeParse({ error: 'boom' }).success).toBe(false);
  });

  it('publishes the POST path with secret authentication', () => {
    const contract = internalProjectDirectorEnrollmentContract;
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe(INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH);
    expect(contract.path).toBe('/internal/paperclip/project-director-enrollment');
    expect(contract.authType).toBe('secret');
    expect(contract.bodySchema).toBe(ProjectDirectorEnrollmentRequestSchema);
  });
});
