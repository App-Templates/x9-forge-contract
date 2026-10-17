const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const {resolve}=require('node:path');
const requireConsumer=createRequire(resolve(__dirname,'../meditation62/package.json'));
const fixture=require('../meditation62/consumer-fixtures.json');
let checked=0;
for (const [subpath,names] of Object.entries(fixture.exports)) {
 const specifier='@x9-forge/contracts/'+subpath;
 assert.ok(requireConsumer.resolve(specifier).includes('/tests/meditation62/node_modules/@x9-forge/contracts/'));
 const module=requireConsumer(specifier);
 for(const name of names){assert.ok(module[name]!==undefined,name);checked++;}
}
const C=requireConsumer('@x9-forge/contracts/capability');
assert.deepEqual(C.CoachSessionOpeningRefSchema.parse(fixture.opening),fixture.opening);
assert.equal(C.CoachSessionOpeningRefSchema.safeParse({...fixture.opening,program:{...fixture.program,scope:{...fixture.program.scope,agentId:'foreign'}}}).success,false);
console.log(JSON.stringify({format:'cjs',exports:checked,behavior:2,source:'installed-tarball'}));
