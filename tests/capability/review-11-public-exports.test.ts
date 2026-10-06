import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { labAgent, ingestId } from './lab/review-fixtures.js';
const cases = [
  ['parameters', { CapabilityParameterEditorRoleSchema: 'owner' }],
  ['presentation', {
    CapabilityOutputFieldTypeSchema: 'number',
    CapabilityOutputFieldSchema: { key: 'score', label: 'Voto', type: 'number', min: 1, max: 10 },
    CapabilityFeedbackKindSchema: 'approval', CapabilityFeedbackDecisionSchema: 'approved',
  }],
  ['lab', {
    LabAgentConfigSchema: labAgent,
    LabBudgetSchema: labAgent.budget, LabModelsSchema: labAgent.models, LabToolErrorSchema: 'not_ready', LabIngestIdSchema: ingestId,
    LabIngestOutputSchema: { ingestId, state: 'queued' },
    LabIngestStatusInputSchema: { ingestId },
    LabIngestStatusOutputSchema: { ingestId, state: 'completed', sourcesStored: 0, pagesTouched: 0, claimsAdded: 0 },
  }],
  ['ricerca', { CapabilityUsdSchema: 1, CapabilityModelIdSchema: 'model-digest' }],
] as const;
const require = createRequire(import.meta.url);
describe('reviewed 1.29 distribution consumed through public exports', () => {
  for (const system of ['ESM', 'CJS']) {
    for (const [subpath, values] of cases) {
      it(system + ' preserves reviewed ' + subpath + ' payloads', async () => {
        const specifier = '@x9-forge/contracts/capability/' + subpath;
        const module = (system === 'ESM' ? await import(specifier) : require(specifier)) as Record<string, z.ZodType>;
        for (const [name, value] of Object.entries(values)) {
          expect(module[name], name).toBeDefined();
          expect(module[name]!.safeParse(value), name).toMatchObject({ success: true, data: value });
        }
      });
    }
    it(system + ' exports the lab spend route and queued tool names', async () => {
      const http = (system === 'ESM' ? await import('@x9-forge/contracts/http') : require('@x9-forge/contracts/http')) as Record<string, unknown>;
      expect(http.labAgentSpendContract).toMatchObject({ method: 'GET', path: '/internal/capability/agents/:agentId/spend', authType: 'secret' });
      const lab = (system === 'ESM' ? await import('@x9-forge/contracts/capability/lab') : require('@x9-forge/contracts/capability/lab')) as Record<string, unknown>;
      expect(lab.LAB_TOOLS).toMatchObject({ ingest: 'lab_ingest', ingestStatus: 'lab_ingest_status' });
    });
  }
});
