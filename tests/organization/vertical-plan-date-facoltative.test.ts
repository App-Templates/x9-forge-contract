import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  VerticalPlanSchema,
  verticalPlanCanonicalJson,
  verticalPlanDecisionSubject,
} from '../../src/organization/vertical-plan.js';
import { VerticalPlanAttemptObservationSchema } from '../../src/organization/vertical-plan-observation.js';
import type * as SrcVerticalPlan from '../../src/organization/vertical-plan.js';

const require = createRequire(import.meta.url);
const commonJs: typeof SrcVerticalPlan = require('../../dist/organization/vertical-plan.cjs');

// Same dated plan as vertical-plan.test.ts; the hash pins its canonical bytes.
const datedPlan = () => ({
  "planId": "plan-0001",
  "version": 1,
  "digest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "tenantId": "tenant-1",
  "organizationId": "org-1",
  "clientId": "company-1",
  "projectId": "project-1",
  "buSlug": "vendite",
  "actionPlan": {
    "planId": "action-0001",
    "version": 2
  },
  "analysis": "Partiamo dai clienti già raggiunti.",
  "milestones": [
    {
      "number": 1,
      "expectedGoal": "Primi dieci contatti",
      "dueDate": "2026-11-01",
      "blockedBy": []
    },
    {
      "number": 2,
      "expectedGoal": "Primo cliente",
      "dueDate": "2026-11-15",
      "blockedBy": [
        1
      ]
    }
  ],
  "blockers": [
    {
      "what": "Elenco contatti",
      "unlocksMilestone": 1
    }
  ],
  "questions": [
    {
      "question": "Quale budget?",
      "unlocks": "Milestone 2"
    }
  ],
  "attachments": [
    {
      "role": "rd_dossier",
      "asset": {
        "assetId": "asset-rd",
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "name": "asset-rd.pdf",
        "mediaType": "application/pdf",
        "sizeBytes": 10,
        "origin": {
          "kind": "generated",
          "agentId": "agent-1"
        },
        "tenantId": "tenant-1",
        "companyId": "company-1",
        "projectId": "project-1",
        "createdAt": "2026-10-20T21:00:00+02:00"
      }
    },
    {
      "role": "executor",
      "asset": {
        "assetId": "asset-ex",
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "name": "asset-ex.pdf",
        "mediaType": "application/pdf",
        "sizeBytes": 10,
        "origin": {
          "kind": "session",
          "sessionId": "session-1"
        },
        "tenantId": "tenant-1",
        "companyId": "company-1",
        "projectId": "project-1",
        "createdAt": "2026-10-20T21:00:00+02:00"
      }
    },
    {
      "role": "reviewer",
      "asset": {
        "assetId": "asset-rv",
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "name": "asset-rv.pdf",
        "mediaType": "application/pdf",
        "sizeBytes": 10,
        "origin": {
          "kind": "session",
          "sessionId": "session-1"
        },
        "tenantId": "tenant-1",
        "companyId": "company-1",
        "projectId": "project-1",
        "createdAt": "2026-10-20T21:00:00+02:00",
        "buSlug": "vendite"
      }
    },
    {
      "role": "budget",
      "asset": {
        "assetId": "asset-bd",
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "name": "asset-bd.pdf",
        "mediaType": "application/pdf",
        "sizeBytes": 10,
        "origin": {
          "kind": "session",
          "sessionId": "session-1"
        },
        "tenantId": "tenant-1",
        "companyId": "company-1",
        "projectId": "project-1",
        "createdAt": "2026-10-20T21:00:00+02:00"
      }
    },
    {
      "role": "criteria",
      "asset": {
        "assetId": "asset-cr",
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "name": "asset-cr.pdf",
        "mediaType": "application/pdf",
        "sizeBytes": 10,
        "origin": {
          "kind": "session",
          "sessionId": "session-1"
        },
        "tenantId": "tenant-1",
        "companyId": "company-1",
        "projectId": "project-1",
        "createdAt": "2026-10-20T21:00:00+02:00"
      }
    }
  ]
});

function undatedPlan() {
  const plan = datedPlan();
  return {
    ...plan,
    milestones: plan.milestones.map(({ dueDate: _dueDate, ...milestone }) => milestone),
  };
}

describe('vertical plan optional milestone dates', () => {
  it('(a) accepts a plan without milestone dueDate', () => {
    const input = undatedPlan();
    const plan = VerticalPlanSchema.parse(input);
    expect(plan).toEqual(input);
    for (const milestone of plan.milestones) {
      expect(milestone).not.toHaveProperty('dueDate');
    }
    expect(verticalPlanCanonicalJson(plan)).not.toContain('"dueDate"');
  });

  it('(b) rejects invalid dates when provided', () => {
    for (const dueDate of ['2026-02-30', '2026-13-01', 'tomorrow', '', null]) {
      const input = undatedPlan();
      const result = VerticalPlanSchema.safeParse({
        ...input,
        milestones: input.milestones.map((milestone) => ({ ...milestone, dueDate })),
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['milestones', 0, 'dueDate']);
    }
  });

  it('(c) preserves the dated plan canonical text and sha256', () => {
    const input = datedPlan();
    const plan = VerticalPlanSchema.parse(input);
    expect(plan).toEqual(input);
    const canonical = verticalPlanCanonicalJson(plan);
    expect(canonical).toContain('"dueDate":"2026-11-01"');
    expect(createHash('sha256').update(canonical).digest('hex')).toBe('4f41da7681b49e8c7137c02f612819d44796801c9f00b2dce14cc1aa979fc0f7');
  });

  it('(d) accepts a sent observation containing an undated plan', () => {
    const plan = VerticalPlanSchema.parse(undatedPlan());
    const observation = {
      observationId: 'observation-1',
      scope: {
        tenantId: plan.tenantId,
        organizationId: plan.organizationId,
        clientId: plan.clientId,
        projectId: plan.projectId,
        buSlug: plan.buSlug,
        agent: { managementAgentId: 'agent-1', runtimeAgentId: 'agent-1', vaultAgentId: 7 },
      },
      subject: verticalPlanDecisionSubject(plan),
      events: [{
        kind: 'sent',
        eventId: 'event-sent-1',
        at: '2026-10-21T09:00:00+02:00',
        requestId: 'request-0001',
        plan,
        referent: { personRef: 'mario-rossi', entryVersion: 1 },
        to: 'mario@example.com',
        thread: { mailboxId: 'mailbox-1', providerThreadId: 'thread-1' },
        providerMessageId: 'msg-1',
      }],
    };
    const parsed = VerticalPlanAttemptObservationSchema.parse(observation);
    expect(parsed).toEqual(observation);
    expect(parsed.events[0]).toMatchObject({ kind: 'sent', plan: undatedPlan() });
  });

  it('(e) CommonJS accepts missing dates, rejects invalid dates and preserves canonical text', () => {
    const plan = commonJs.VerticalPlanSchema.parse(undatedPlan());
    expect(plan).toEqual(undatedPlan());
    const dated = datedPlan();
    const invalid = { ...dated, milestones: dated.milestones.map((milestone) => ({ ...milestone, dueDate: '2026-02-30' })) };
    expect(commonJs.VerticalPlanSchema.safeParse(invalid).success).toBe(false);
    expect(commonJs.verticalPlanCanonicalJson(commonJs.VerticalPlanSchema.parse(dated)))
      .toBe(verticalPlanCanonicalJson(VerticalPlanSchema.parse(dated)));
  });
});
