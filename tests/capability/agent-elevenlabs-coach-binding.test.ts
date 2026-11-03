import { expect, it } from 'vitest';
import { ElevenLabsCoachSessionBindingSchema as Binding, ElevenLabsCoachConversationBindingSchema as Conversation, ElevenLabsCoachExecutionAttachmentSchema as Attachment, isElevenLabsCoachConversationForSession as conversationFor, isElevenLabsCoachExecutionForSession as executionFor } from '../../src/capability/index.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const binding = f.ElevenLabsCoachSessionBinding, conversation = f.ElevenLabsCoachConversationBinding, attachment = f.ElevenLabsCoachExecutionAttachment;
it('binds admission before guide-start and execution separately afterward', () => {
  expect(Binding.safeParse(binding).success).toBe(true); expect(Conversation.safeParse(conversation).success).toBe(true); expect(Attachment.safeParse(attachment).success).toBe(true);
  expect(conversationFor(conversation, binding)).toBe(true); expect(executionFor(attachment, binding, attachment.executionSnapshot)).toBe(true);
});
it.each(['userId', 'ownerId', 'agentId'])('keeps original %s', key => expect(conversationFor(conversation, { ...binding, opening: { ...binding.opening, scope: { ...binding.opening.scope, [key]: 'foreign' } } })).toBe(false));
it('refuses changed provider mapping and execution timeline', () => {
  expect(conversationFor(conversation, { ...binding, mapping: { ...binding.mapping, appliedConfigVersion: 9 } })).toBe(false);
  expect(conversationFor(conversation, { ...binding, mapping: { ...binding.mapping, providerAgentId: 'other' } })).toBe(false);
  expect(executionFor(attachment, binding, { ...attachment.executionSnapshot, totalSeconds: attachment.executionSnapshot.totalSeconds + 1 })).toBe(false);
  expect(Attachment.safeParse({ ...attachment, attachedAt: '2000-01-01T00:00:00Z' }).success).toBe(false);
});
