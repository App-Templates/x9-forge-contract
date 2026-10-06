import { expect } from 'vitest';
import type { z } from 'zod';
import * as lab from '../../../src/capability/lab/index.js';
import * as ricerca from '../../../src/capability/ricerca/index.js';
import * as http from '../../../src/http/index.js';
export const modules = { lab, ricerca, http };
export function schema(name: string, module: keyof typeof modules = 'lab'): z.ZodType {
  const exports = modules[module] as unknown as Record<string, z.ZodType>;
  expect(exports[name], name).toBeDefined();
  return exports[name]!;
}
export const labAgent = { agentId: 'samira', version: 1, domain: 'cucina',
  conventions: 'Ogni affermazione cita una fonte.', pageKinds: ['tecnica'], linkKinds: ['collegato_a'],
  models: { digest: 'model-digest' }, budget: { dailyUsd: 10, perIngestMaxUsd: 2, timezone: 'Europe/Rome' } };
export const ingestId = '11111111-1111-4111-8111-111111111111';
