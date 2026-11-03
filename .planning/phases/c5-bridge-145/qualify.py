from pathlib import Path
import subprocess,json,hashlib
root=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-140-1')
out=Path.cwd()/'work/c5-bridge-145/raw'
node='/Users/admintemp/.nvm/versions/node/v24.14.1/bin/node'
env={'HOME':'/Users/admintemp','PATH':str(Path(node).parent)+':/usr/bin:/bin:/usr/sbin:/sbin'}
a='src/agent/agent-channel-resource-operation.ts';h='src/http/endpoints/forge-agent-channel-resource.ts'
cases=[
('B-intent',a,'return JSON.stringify(intent.data) === JSON.stringify(result.data.intent);','return true;'),
('B-tenant',h,'scope.tenantId === access.data.tenantId','true'),
('B-route-binding',h,'sameAgentChannelAccessBinding({ scope: actual.scope, identity: actual.identity }, trustedBinding)','true'),
('B-observation',a,'Date.parse(config.observedAt) < Date.parse(result.startedAt)','false'),
('B-rotation',a,"intent.command.action === 'rotate-token' && !sameResource(config.resource, intent.previousResource)",'false'),
('B-shared-response',h,'responseSchema: AgentChannelResourceResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,\n} as const;\nexport function','responseSchema: AgentChannelResourceIntentSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,\n} as const;\nexport function'),
('B-session',h,"authentication: 'forge-session' as const","authentication: 'secret' as const"),
('B-public-api','src/agent/index.ts',"export * from './agent-channel-resource-operation.js';",''),
]
original={p:(root/p).read_bytes() for _,p,_,_ in cases}
report={'baseline':None,'mutations':[]}
def run(name,cmd):
 with (out/(name+'.txt')).open('w') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=120)
 return r.returncode
try:
 report['baseline']=run('B-INDEPENDENT-FINAL-BASELINE',[node,'tests/cjs/c5-resource-independent.mjs'])
 assert report['baseline']==0
 for name,p,old,new in cases:
  s=original[p].decode();assert old in s,name
  (root/p).write_text(s.replace(old,new,1))
  try:
   build=run(name+'-BUILD',['pnpm','build'])
   assert build==0,(name,'build failed')
   code=run(name+'-RED',[node,'tests/cjs/c5-resource-independent.mjs'])
   raw=(out/(name+'-RED.txt')).read_text()
   row={'name':name,'build':build,'exit':code,'qualified':code!=0 and 'AssertionError' in raw,'redLog':name+'-RED.txt'}
   report['mutations'].append(row);print(json.dumps(row),flush=True)
   assert row['qualified'],row
  finally:(root/p).write_bytes(original[p])
finally:
 for p,s in original.items():(root/p).write_bytes(s)
 report['restoredExact']=all((root/p).read_bytes()==s for p,s in original.items())
 report['sourceHashes']={p:hashlib.sha256(s).hexdigest() for p,s in original.items()}
 report['restoredBuild']=run('MUTATIONS-RESTORED-BUILD',['pnpm','build'])
 report['restoredGreen']=run('B-INDEPENDENT-RESTORED',[node,'tests/cjs/c5-resource-independent.mjs'])
 (out/'B-independent-qualification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'qualified':sum(v['qualified'] for v in report['mutations']),'candidates':len(cases),'restored':report['restoredExact'],'green':report['restoredGreen']}),flush=True)
