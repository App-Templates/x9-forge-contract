import { describe, expect, it } from 'vitest';
import {
  ProjectDirectorDecisionSchema,
  projectDirector,
  type ProjectDirectorInput,
} from '../../src/organization/project-director.js';
import type {
  ParticipantBinding,
  ParticipantBindingReceipt,
} from '../../src/organization/participant-binding.js';
import type { AgentRole } from '../../src/organization/agent-role.js';

type Item = { binding: ParticipantBinding; receipt: ParticipantBindingReceipt };

const T = '1';
const O = '1';
const ORG = 'good-choice';
const DIRECTOR_PID = '0b6f3a52-1c1e-4d0a-9a53-6a1f2b7c9e01';
const CANTINA_PID = '5d2c7e90-3b44-4f6a-8e17-2c9d0a4b6f02';

function seat(opts: {
  slug: string;
  vault: number;
  participantId: string;
  role?: AgentRole;
  projects: string[];
  personRef?: string;
  organizationId?: string;
  tenantId?: string;
  withdrawn?: boolean;
}): Item {
  const agentIdentity = {
    managementAgentId: opts.slug,
    runtimeAgentId: opts.slug,
    vaultAgentId: opts.vault,
  };
  const tenantId = opts.tenantId ?? T;
  return {
    binding: {
      tenantId,
      ownerId: O,
      agentIdentity,
      participantId: opts.participantId,
      personRef: opts.personRef ?? 'stefano',
      roles: ['lead'],
      ...(opts.role ? { agentRole: opts.role } : {}),
      recipients: [
        { kind: 'organization', id: opts.organizationId ?? ORG },
        ...opts.projects.map((id) => ({ kind: 'project' as const, id })),
      ],
      appliedVersion: 3,
      appliedAt: '2026-11-01T10:00:00.000Z',
    },
    receipt: {
      key: {
        tenantId,
        ownerId: O,
        agentIdentity,
        organizationId: opts.organizationId ?? ORG,
        personRef: opts.personRef ?? 'stefano',
      },
      appliedVersion: 3,
      digest: 'd'.repeat(64),
      appliedAt: '2026-11-01T10:00:00.000Z',
      ...(opts.withdrawn ? { withdrawnAt: '2026-11-05T10:00:00.000Z' } : {}),
    },
  };
}

const director = () =>
  seat({ slug: 'director-good-choice', vault: 11, participantId: DIRECTOR_PID, role: 'director', projects: ['good-choice', 'orto-facile'] });
const rdLab = () => seat({ slug: 'rd-lab', vault: 12, participantId: 'p-lab', role: 'lab', projects: [] });
const capoDesign = () =>
  seat({ slug: 'capo-design', vault: 13, participantId: 'p-capo-design', role: 'capo-bu', projects: ['good-choice'] });
const buDati = () =>
  seat({ slug: 'bu-dati-good-choice', vault: 14, participantId: 'p-bu-dati', projects: ['good-choice'] });
const cantina = () =>
  seat({ slug: 'director-cantina-facile', vault: 15, participantId: CANTINA_PID, role: 'director', projects: ['cantina-facile'] });

const base = [director(), rdLab(), capoDesign(), buDati()];

function run(project: ProjectDirectorInput['project'], bindings: Item[] = base) {
  const decision = projectDirector({ tenantId: T, ownerId: O, organizationId: ORG, project, bindings });
  return ProjectDirectorDecisionSchema.parse(decision);
}
const mem = (projectId: string) => ({ source: 'memory_project' as const, projectId });
const pc = (projectId: string, leadAgentId: string | null) => ({
  source: 'paperclip_project' as const,
  projectId,
  leadAgentId,
});
const idOf = (slug: string, vault: number) => ({ managementAgentId: slug, runtimeAgentId: slug, vaultAgentId: vault });

describe('s6666 director-del-progetto: today', () => {
  it('resolves the single Director for good-choice and orto-facile from memory', () => {
    for (const p of ['good-choice', 'orto-facile']) {
      expect(run(mem(p))).toEqual({
        resolved: true,
        source: 'memory_project',
        agentIdentity: idOf('director-good-choice', 11),
        participantId: DIRECTOR_PID,
      });
    }
  });
  it('resolves the lead of a Paperclip project that is the Director', () => {
    expect(run(pc('orto-facile', DIRECTOR_PID))).toEqual({
      resolved: true,
      source: 'paperclip_project',
      agentIdentity: idOf('director-good-choice', 11),
      participantId: DIRECTOR_PID,
    });
  });
});

describe('s6666 director-del-progetto: two Directors', () => {
  const two = [...base, cantina()];
  it('each Director resolves for its own project only', () => {
    expect(run(mem('cantina-facile'), two)).toMatchObject({ resolved: true, agentIdentity: idOf('director-cantina-facile', 15) });
    expect(run(pc('cantina-facile', CANTINA_PID), two)).toMatchObject({ resolved: true, participantId: CANTINA_PID });
    expect(run(mem('good-choice'), two)).toMatchObject({ resolved: true, agentIdentity: idOf('director-good-choice', 11) });
    expect(run(pc('good-choice', DIRECTOR_PID), two)).toMatchObject({ resolved: true, participantId: DIRECTOR_PID });
  });
  it('a Director is not the lead of a project it is not bound to', () => {
    expect(run(pc('cantina-facile', DIRECTOR_PID), two)).toMatchObject({ resolved: false, refusal: 'lead_not_bound' });
  });
});

describe('s6666 director-del-progetto: refusals', () => {
  it('project without Director', () => {
    expect(run(mem('progetto-ignoto'))).toMatchObject({ resolved: false, refusal: 'project_without_director' });
    expect(run(pc('good-choice', null))).toMatchObject({ resolved: false, refusal: 'project_without_director' });
  });
  it('lead without the role of Director', () => {
    expect(run(pc('good-choice', 'p-capo-design'))).toMatchObject({ resolved: false, refusal: 'lead_not_director' });
    expect(run(pc('good-choice', 'p-bu-dati'))).toMatchObject({ resolved: false, refusal: 'lead_not_director' });
  });
  it('lead not bound', () => {
    expect(run(pc('good-choice', 'uuid-sconosciuto'))).toMatchObject({ resolved: false, refusal: 'lead_not_bound' });
    const withdrawn = seat({ slug: 'director-good-choice', vault: 11, participantId: DIRECTOR_PID, role: 'director', projects: ['good-choice'], withdrawn: true });
    expect(run(pc('good-choice', DIRECTOR_PID), [withdrawn, rdLab()])).toMatchObject({ resolved: false, refusal: 'lead_not_bound' });
    expect(run(mem('good-choice'), [withdrawn])).toMatchObject({ resolved: false, refusal: 'project_without_director' });
    const orgOnly = seat({ slug: 'director-good-choice', vault: 11, participantId: DIRECTOR_PID, role: 'director', projects: [] });
    expect(run(pc('good-choice', DIRECTOR_PID), [orgOnly])).toMatchObject({ resolved: false, refusal: 'lead_not_bound' });
  });
  it('two Directors on the same project are ambiguous from both entries', () => {
    const second = seat({ slug: 'director-cantina-facile', vault: 15, participantId: CANTINA_PID, role: 'director', projects: ['good-choice'] });
    const list = [...base, second];
    expect(run(mem('good-choice'), list)).toMatchObject({ resolved: false, refusal: 'project_director_ambiguous' });
    expect(run(pc('good-choice', DIRECTOR_PID), list)).toMatchObject({ resolved: false, refusal: 'project_director_ambiguous' });
  });
  it('two agents with the participant id of the lead are ambiguous', () => {
    const twin = seat({ slug: 'director-gemello', vault: 16, participantId: DIRECTOR_PID, role: 'director', projects: ['good-choice'] });
    expect(run(pc('good-choice', DIRECTOR_PID), [...base, twin])).toMatchObject({ resolved: false, refusal: 'project_director_ambiguous' });
  });
});

describe('s6666 director-del-progetto: same agent, other scopes', () => {
  it('the same Director with two live bindings resolves once', () => {
    const again = seat({ slug: 'director-good-choice', vault: 11, participantId: DIRECTOR_PID, role: 'director', projects: ['good-choice'], personRef: 'altra-persona' });
    const list = [...base, again];
    expect(run(mem('good-choice'), list)).toMatchObject({ resolved: true, participantId: DIRECTOR_PID });
    expect(run(pc('good-choice', DIRECTOR_PID), list)).toMatchObject({ resolved: true, participantId: DIRECTOR_PID });
  });
  it('bindings of another organization or tenant are ignored', () => {
    const otherOrg = seat({ slug: 'director-altrove', vault: 17, participantId: 'p-x', role: 'director', projects: ['good-choice'], organizationId: 'altra' });
    const otherTenant = seat({ slug: 'director-altro-tenant', vault: 18, participantId: 'p-y', role: 'director', projects: ['good-choice'], tenantId: '2' });
    const list = [...base, otherOrg, otherTenant];
    expect(run(mem('good-choice'), list)).toMatchObject({ resolved: true, agentIdentity: idOf('director-good-choice', 11) });
    expect(run(pc('good-choice', 'p-x'), list)).toMatchObject({ resolved: false, refusal: 'lead_not_bound' });
  });
});
