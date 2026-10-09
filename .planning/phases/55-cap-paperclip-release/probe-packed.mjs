import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
const require=createRequire(import.meta.url);
const pkg=JSON.parse(readFileSync(new URL('./node_modules/@x9-forge/contracts/package.json',import.meta.url),'utf8'));
assert.equal(pkg.version,'1.45.0');
const esm=await import('@x9-forge/contracts/capability/paperclip');
const cjs=require('@x9-forge/contracts/capability/paperclip');
const barrel=await import('@x9-forge/contracts/capability');
const names=['PaperclipMaterialEventTypeSchema','PaperclipMaterialEventSchema','PaperclipRoutingConfigSchema','PaperclipResolvedRouteSchema','PaperclipHandoffSchema','PaperclipHandoffReceiptSchema','PaperclipDecisionRecordSchema','PAPERCLIP_TOOLS','PaperclipIssueStatusSchema','PaperclipQueueInputSchema','PaperclipIssueInputSchema','PaperclipTakeInputSchema','PaperclipAssignInputSchema','PaperclipIssueViewSchema','PaperclipQueueOutputSchema','PaperclipMutationOutputSchema','PaperclipAgentBindingSchema','PaperclipCommunicationRecordSchema','PaperclipReplyRecordSchema','PaperclipManualConfirmationSchema','PaperclipDecisionViewSchema'];
let passed=0;
for(const mod of [esm,cjs,barrel])for(const name of names){assert.ok(mod[name],name);if(name!=='PAPERCLIP_TOOLS')assert.equal(typeof mod[name].safeParse,'function',name);else assert.equal(Object.keys(mod[name]).length,4);passed++;}
assert.equal(esm.PaperclipQueueInputSchema.safeParse({}).success,true);
assert.equal(cjs.PaperclipQueueInputSchema.safeParse({}).success,true);
for(const value of Object.values(pkg.exports))for(const field of ['types','import','require'])assert.ok(existsSync(new URL('./node_modules/@x9-forge/contracts/'+value[field],import.meta.url)),field);
console.log(JSON.stringify({releaseVersion:pkg.version,exportChecksPassed:passed,exportChecksTotal:names.length*3,formats:['ESM subpath','CJS subpath','ESM capability barrel'],packageSubpaths:Object.keys(pkg.exports).length,queueSchemasUsable:true,limits:'Actual unpacked local release archive; no consumer deployment/provider operations.'}));
