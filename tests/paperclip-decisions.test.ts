import { readFileSync } from 'node:fs';
import { it, expect } from 'vitest';
import {
  PaperclipCommunicationRecordSchema as Communication, PaperclipReplyRecordSchema as Reply,
  PaperclipManualConfirmationSchema as Confirmation, PaperclipDecisionViewSchema as View,
} from '../src/capability/paperclip/index.js';
const golden = JSON.parse(readFileSync(new URL('./fixtures/paperclip-decisions-golden.json', import.meta.url), 'utf8')) as {
  cases: Array<{ name: string; steps: Array<{ method: string; args: unknown[]; kwargs: Record<string,unknown>; result?: unknown; errorType?: string }> }> };
const cases = golden.cases.map(item => ({ name: item.name, records: item.steps.flatMap(step => {
  if (step.errorType || step.result === undefined) return [];
  const records: Array<{ schema: typeof Communication | typeof Reply | typeof Confirmation | typeof View; value: unknown }> = [];
  if (step.method === 'import_communication') records.push({ schema: Communication, value: step.args[0] });
  if (step.method === 'receive') records.push({ schema: Reply, value: step.args[0] });
  if (step.method === 'confirm') {
    const value = Object.fromEntries(Object.entries(step.kwargs).map(([key,value]) => [key.replace(/_([a-z])/g, (_match,letter:string) => letter.toUpperCase()), value]));
    records.push({ schema: Confirmation, value });
  }
  if (step.result && typeof step.result === 'object' && 'replyId' in step.result) records.push({ schema: View, value: step.result });
  return records;
}) })).filter(item => item.records.length > 0);
it.each(cases)('accepts frozen E1 public records: $name', item => {
  expect(item.records.length).toBeGreaterThan(0);
  for (const record of item.records) expect(record.schema.safeParse(record.value).success).toBe(true);
});
const communication = { schemaVersion:1,communicationId:'c1',eventId:'e1',unitId:'u1',incrementId:'i1',eventType:'decision_required',materialVersion:'v1',decisionId:'d1',recipientRef:'human1',recipientAddress:'human@example.test',status:'sent',providerMessageId:'m1',createdAt:'2026-10-09T10:00:00Z',sentAt:'2026-10-09T10:01:00Z' };
const reply = { replyId:'r1',source:'email',sourceEvidence:'provider:read/r1',receivedAt:'2026-10-09T10:02:00Z',text:'Human reply',from:'Human Name <human@example.test>',inReplyTo:'<m1>' };
const confirmation = { communicationId:'c1',materialVersion:'v1',referentId:'human1',outcome:'approved',operatorId:'human-operator',humanEvidence:'Explicit human confirmation' };
const invalid = [
 ['sent without provider ID',Communication,{...communication,providerMessageId:null}],
 ['sent without timestamp',Communication,{...communication,sentAt:null}],
 ['recipient address',Communication,{...communication,recipientAddress:'@example.test'}],
 ['communication status',Communication,{...communication,status:'delivered'}],
 ['reserved reply link',Reply,{...reply,manualLink:{operatorId:'injected'}}],
 ['email missing sender',Reply,{...reply,from:undefined}],
 ['email header injection',Reply,{...reply,from:'human@example.test\r\nInjected: yes'}],
 ['unsupported reply source',Reply,{...reply,source:'model'}],
 ['manual evidence',Confirmation,{...confirmation,humanEvidence:' '}],
 ['manual changes',Confirmation,{...confirmation,outcome:'changes_requested',changes:' '}],
 ['manual authorization injection',Confirmation,{...confirmation,authorization:'model_guess'}],
] as const;
it.each(invalid)('refuses $0',(_name,schema,value)=>expect(schema.safeParse(value).success).toBe(false));
it('preserves RFC sender display names and defaults only explicit empty changes',()=>{
 expect(Reply.safeParse(reply).success).toBe(true); expect(Reply.parse(reply)).toEqual(reply);
 expect(Confirmation.safeParse(confirmation).success).toBe(true); expect(Confirmation.parse(confirmation).changes).toBe('');
});
