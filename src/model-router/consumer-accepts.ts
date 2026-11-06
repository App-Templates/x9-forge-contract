import { modelSettingsSelections } from './capability-model-settings.js';
import { sameModelDescriptor } from './model-catalog.js';
import { ModelChoiceSchema, toCapabilityModelSettings } from './model-choice.js';
import type { ModelChoice } from './model-choice.js';
import { findModelConsumerDefinition, modelConsumerAcceptsAdapter } from './model-consumers.js';
import type { ModelConsumerDefinition } from './model-consumers.js';

export type ConsumerAcceptIssue = 'unknown-slot' | 'invalid-choice' | 'capability-mismatch' | 'function-mismatch' | 'routing-mismatch' | 'adapter-not-allowed' | 'embedding-dimensions-missing';

function choiceSelections(choice: ModelChoice, definition: ModelConsumerDefinition) {
  // Conversion metadata only: compatibility does not attest or consult a catalog.
  return modelSettingsSelections(toCapabilityModelSettings(choice, {
    catalogVersion: 'local-compatibility', requirements: definition.requirements,
  }));
}

/** Local execution compatibility only; no catalog, credentials, clock or network. */
export function consumerAccepts(slotId: unknown, choice: unknown): ConsumerAcceptIssue[] {
  const definition = findModelConsumerDefinition(slotId);
  if (!definition) return ['unknown-slot'];
  const parsed = ModelChoiceSchema.safeParse(choice);
  if (!parsed.success) return ['invalid-choice'];
  const selected = parsed.data;
  const issues: ConsumerAcceptIssue[] = [];
  if (selected.capability !== definition.capability) issues.push('capability-mismatch');
  if (selected.function !== definition.function) issues.push('function-mismatch');
  const routingMatches = definition.routing === 'tiered'
    ? selected.mode === 'automatic' || selected.mode === 'pin'
    : selected.mode === definition.routing;
  if (!routingMatches) issues.push('routing-mismatch');
  if (choiceSelections(selected, definition).some(({ descriptor }) => !modelConsumerAcceptsAdapter(slotId, descriptor.adapterId))) {
    issues.push('adapter-not-allowed');
  }
  if (definition.function === 'embedding' && selected.mode === 'single' && selected.embeddingDimensions === undefined) {
    issues.push('embedding-dimensions-missing');
  }
  return issues;
}

/** Conflicting registered members of a shared selection; invalid choices are checked separately. */
export function linkedChoiceConflicts(choices: Record<string, unknown>): string[] {
  const groups = new Map<string, Array<{ slotId: string; selections: ReturnType<typeof choiceSelections> }>>();
  for (const [slotId, choice] of Object.entries(choices)) {
    const definition = findModelConsumerDefinition(slotId);
    if (!definition?.linkedSelectionGroup) continue;
    const parsed = ModelChoiceSchema.safeParse(choice);
    if (!parsed.success) continue;
    const group = groups.get(definition.linkedSelectionGroup) ?? [];
    group.push({ slotId, selections: choiceSelections(parsed.data, definition) });
    groups.set(definition.linkedSelectionGroup, group);
  }
  const conflicts = new Set<string>();
  for (const group of groups.values()) {
    const first = group[0];
    if (!first) continue;
    if (group.some(({ selections }) => selections.length !== first.selections.length
      || selections.some((selection, index) => selection.tier !== first.selections[index]?.tier
        || !sameModelDescriptor(selection.descriptor, first.selections[index]!.descriptor)))) {
      for (const { slotId } of group) conflicts.add(slotId);
    }
  }
  return [...conflicts].sort();
}
