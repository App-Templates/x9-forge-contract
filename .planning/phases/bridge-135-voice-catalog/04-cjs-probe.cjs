const assert = require('node:assert/strict');
const http = require('@x9-forge/contracts/http');
const voice = require('@x9-forge/contracts/voice');
const auth = require('@x9-forge/contracts/auth');
const c = http.internalVoiceCatalogContract;
const value = {version:'synthetic-version',providers:[{provider:'synthetic_voice',label:'Synthetic',protocols:['sip'],transports:['phone'],models:[{id:'synthetic-model',label:'Synthetic'}],voices:{kind:'id',pattern:'^[a-z]+$'}}]};
const results=[];
for(const [name,check] of [
 ['exported-canonical-schema',()=>{assert.ok(c);assert.equal(c.responseSchema,voice.VoiceProviderCatalogSchema);} ],
 ['read-only-method',()=>assert.equal(c?.method,'GET')],
 ['canonical-path',()=>assert.equal(c?.path,'/internal/voice/catalog')],
 ['secret-authentication',()=>assert.equal(c?.authType,'secret')],
 ['canonical-header',()=>assert.equal(c?.authHeader,auth.INTERNAL_SECRET_HEADER)],
 ['no-request-body',()=>{assert.ok(c);assert.equal(c.bodySchema,undefined);} ],
 ['valid-versioned-response',()=>{const parsed=c?.responseSchema.safeParse(value);assert.equal(parsed?.success,true);assert.deepEqual(parsed.data,value);} ],
 ['invalid-and-private-response',()=>{assert.equal(c?.responseSchema.safeParse({providers:[]}).success,false);const parsed=c?.responseSchema.safeParse({...value,synthetic_private_marker:'do-not-forward'});assert.equal(parsed?.success,true);assert.deepEqual(parsed.data,value);} ],
]){try{check();results.push({name,passed:true});}catch(error){results.push({name,passed:false,errorName:error.name,message:error.message});}}
console.log(JSON.stringify({total:results.length,passed:results.filter(v=>v.passed).length,results}));process.exitCode=results.every(v=>v.passed)?0:1;
