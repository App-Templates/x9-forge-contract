import { expect } from 'vitest';
import type { z } from 'zod';
import * as capability from '../../src/capability/index.js';
export function schema(name: string): z.ZodType {
  const exports = capability as unknown as Record<string, z.ZodType>;
  expect(exports[name], name).toBeDefined();
  return exports[name]!;
}
export const parameter = { key: 'budget.dailyUsd', label: 'Budget', description: 'Massimo al giorno',
  type: 'number', status: 'decided', optional: false, reference: 'D54-11', appliesWhen: 'immediate', consumes: true };
export const feedback = { id: 'feedback-1', agentId: 'samira', capability: 'food', outputId: 'recipe-1',
  source: { kind: 'project_view', id: 'food-view' }, reviewerId: 'reviewer-1', reviewerName: 'Stefano',
  createdAt: '2026-10-06T09:00:00Z' };
export const output = { id: 'recipe-1', agentId: 'samira', capability: 'food', kind: 'recipe',
  title: 'Ricetta', summary: 'Una ricetta', createdAt: '2026-10-06T08:00:00Z', content: {} };
export const metric = { key: 'score', label: 'Voto', unit: 'punti' };
