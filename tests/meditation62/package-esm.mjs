import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const fixture=JSON.parse(readFileSync(new URL('./consumer-fixtures.json',import.meta.url),'utf8'));
let checked=0;
for (const [subpath,names] of Object.entries(fixture.exports)) {
 const specifier='@x9-forge/contracts/'+subpath;
 assert.ok(import.meta.resolve(specifier).includes('/tests/meditation62/node_modules/@x9-forge/contracts/'));
 const module=await import(specifier);
 for(const name of names){assert.ok(module[name]!==undefined,name);checked++;}
}
const C=await import('@x9-forge/contracts/capability');
assert.deepEqual(C.CoachProgramVersionRefSchema.parse(fixture.program),fixture.program);
assert.deepEqual(C.CoachSessionOpeningRefSchema.parse(fixture.opening),fixture.opening);
assert.equal(C.CoachSessionOpeningRefSchema.safeParse({...fixture.opening,program:{...fixture.program,scope:{...fixture.program.scope,agentId:'foreign'}}}).success,false);
assert.equal(C.ElevenLabsWebPolicySchema.parse({scope:fixture.program.scope,version:1,access:'owner',paused:false,enabled:false}).enabled,false);
console.log(JSON.stringify({format:'esm',exports:checked,behavior:4,source:'installed-tarball'}));
