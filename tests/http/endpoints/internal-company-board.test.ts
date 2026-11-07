import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  internalCompanyBoardCompaniesContract as companies,
  internalCompanyBoardOverviewContract as overview,
  internalCompanyBoardProjectContract as project,
  internalDevProjectSessionsContract as sessions,
  internalMemoryCompanyBoardProjectsContract as projects,
  internalMemoryCompanyBoardSourcesContract as sources,
  internalPaperclipCompanyBoardContract as paperclip,
} from '../../../src/http/endpoints/internal-company-board.js';
import { CompanyBoardSchema, CompanyListSchema, CompanyOverviewSchema } from '../../../src/organization/company-board.js';

const all = [sources, paperclip, projects, sessions, companies, overview, project];
const base = { tenantId: 't1', organizationId: 'org1' };
const valid = {
  sources: { ...base, clientId: 'client-1', projectId: 'p1' },
  paperclip: { organizationId: 'org1', projectId: 'p1', detail: 'true', ownerId: 'owner-1' },
  projects: base,
  sessions: { ...base, projectId: 'p1' },
  companies: { tenantId: 't1', ownerIds: 'o1,o2' },
  overview: { tenantId: 't1', ownerId: 'o1', directorAgentId: 'dir-1' },
  project: { tenantId: 't1', ownerId: 'o1', directorAgentId: 'dir-1', projectId: 'p1' },
};
const byName = { sources, paperclip, projects, sessions, companies, overview, project };
const at = '2026-11-07T10:00:00Z';
const uuid = '11111111-1111-4111-8111-111111111111';

function agent(status = 'active') {
  return { paperclipAgentId: uuid, buSlug: 'ricerca', role: 'lead', status, pauseReason: null, pausedAt: null, pausedByOwner: null, projectCount: 1, recentRuns: [] };
}
function paperclipResponse(status = 'active') {
  return { agents: [agent(status)], issues: [], projects: [{ projectId: 'p1' }], truncated: false, ownerPerson: 'non_nota' };
}
function sessionResponse(extra: Record<string, unknown> = {}) {
  return { units: [{ buSlug: 'dev', sessions: [{ id: 's1', state: 'in-lavorazione', openedAt: at, updatedAt: at, closedAt: null, computerName: null, title: null, ...extra }] }], unreadable: 0 };
}

describe('company board read contracts', () => {
  it('(a) accepts every valid query', () => {
    for (const [name, contract] of Object.entries(byName)) {
      expect(contract.querySchema.safeParse(valid[name as keyof typeof valid]).success, name).toBe(true);
    }
    expect(companies.querySchema.parse(valid.companies).ownerIds).toEqual(['o1', 'o2']);
    expect(paperclip.querySchema.safeParse({ organizationId: 'org1' }).success).toBe(true);
  });

  it('(a) every contract is a GET with the internal secret', () => {
    for (const contract of all) {
      expect(contract.method).toBe('GET');
      expect(contract.authType).toBe('secret');
    }
  });

  it('(b) rejects an extra field in every query', () => {
    for (const [name, contract] of Object.entries(byName)) {
      expect(contract.querySchema.safeParse({ ...valid[name as keyof typeof valid], extra: 'x' }).success, name).toBe(false);
    }
  });

  it('(c) rejects a missing ownerId on overview and project', () => {
    for (const contract of [overview, project]) {
      const { ownerId: _omit, ...rest } = { ...valid.project };
      expect(contract.querySchema.safeParse(rest).success).toBe(false);
    }
  });

  it('(c) rejects empty ownerIds or more than 50', () => {
    expect(companies.querySchema.safeParse({ tenantId: 't1', ownerIds: '' }).success).toBe(false);
    const fifty = Array.from({ length: 50 }, (_, i) => `o${i}`).join(',');
    expect(companies.querySchema.safeParse({ tenantId: 't1', ownerIds: fifty }).success).toBe(true);
    expect(companies.querySchema.safeParse({ tenantId: 't1', ownerIds: `${fifty},o50` }).success).toBe(false);
  });

  it('(d) rejects a Paperclip status outside the native list', () => {
    expect(paperclip.responseSchema.safeParse(paperclipResponse()).success).toBe(true);
    expect(paperclip.responseSchema.safeParse(paperclipResponse('sleeping')).success).toBe(false);
    const issue = { issueId: 'i1', identifier: 'X-1', title: 't', status: 'waiting', parentId: null, assigneeAgentId: null, blockedBy: [], approvalMark: null, updatedAt: at, startedAt: null, completedAt: null, lastComment: null };
    expect(paperclip.responseSchema.safeParse({ ...paperclipResponse(), issues: [issue] }).success).toBe(false);
    expect(paperclip.responseSchema.safeParse({ ...paperclipResponse(), issues: [{ ...issue, status: 'blocked' }] }).success).toBe(true);
  });

  it('(h) an issue may carry its project, null, or nothing', () => {
    const issue = { issueId: 'i1', identifier: 'X-1', title: 't', status: 'todo', parentId: null, assigneeAgentId: null, blockedBy: [], approvalMark: null, updatedAt: at, startedAt: null, completedAt: null, lastComment: null };
    for (const extra of [{ projectId: 'Sito' }, { projectId: null }, {}]) {
      expect(paperclip.responseSchema.safeParse({ ...paperclipResponse(), issues: [{ ...issue, ...extra }] }).success, JSON.stringify(extra)).toBe(true);
    }
  });

  it('(i) rejects an empty or 101-character issue projectId', () => {
    const issue = { issueId: 'i1', identifier: 'X-1', title: 't', status: 'todo', parentId: null, assigneeAgentId: null, blockedBy: [], approvalMark: null, updatedAt: at, startedAt: null, completedAt: null, lastComment: null };
    for (const projectId of ['', 'a'.repeat(101)]) {
      expect(paperclip.responseSchema.safeParse({ ...paperclipResponse(), issues: [{ ...issue, projectId }] }).success).toBe(false);
    }
    expect(paperclip.responseSchema.safeParse({ ...paperclipResponse(), issues: [{ ...issue, projectId: 'a'.repeat(100) }] }).success).toBe(true);
  });

  it('(e) sessions response is strict: an assignment field is rejected', () => {
    expect(sessions.responseSchema.safeParse(sessionResponse()).success).toBe(true);
    expect(sessions.responseSchema.safeParse(sessionResponse({ incarico: 'testo' })).success).toBe(false);
    expect(sessions.responseSchema.safeParse({ ...sessionResponse(), incarico: 'x' }).success).toBe(false);
  });

  it('(f) composed responses are the schemas of the board', () => {
    expect(companies.responseSchema).toBe(CompanyListSchema);
    expect(overview.responseSchema).toBe(CompanyOverviewSchema);
    expect(project.responseSchema).toBe(CompanyBoardSchema);
  });

  it('(g) the contracts load from the CommonJS dist', () => {
    const cjs = createRequire(import.meta.url)('../../../dist/http/endpoints/internal-company-board.cjs');
    for (const name of ['internalMemoryCompanyBoardSourcesContract', 'internalPaperclipCompanyBoardContract', 'internalMemoryCompanyBoardProjectsContract', 'internalDevProjectSessionsContract', 'internalCompanyBoardCompaniesContract', 'internalCompanyBoardOverviewContract', 'internalCompanyBoardProjectContract']) {
      expect(cjs[name].method, name).toBe('GET');
    }
  });
});
