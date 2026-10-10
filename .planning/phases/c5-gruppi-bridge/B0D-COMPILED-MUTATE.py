from pathlib import Path
import subprocess,json,hashlib,sys
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(exist_ok=True,parents=True)
cjs='dist/agent/agent-deletion.cjs';dts='dist/agent/agent-deletion.d.cts'
original={p:(root/p).read_text() for p in [cjs,dts]}
node='/Users/admintemp/.nvm/versions/node/v24.21.0/bin/node'
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.21.0/bin:/usr/bin:/bin'}
typecommand=[node,'node_modules/typescript/bin/tsc','--ignoreConfig','--noEmit','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2023','--strict','--skipLibCheck','--ignoreDeprecations','6.0','tests/cjs/agent-deletion-types.cts']
cases=[
('compiled-request-correlation',cjs,'response.data.requestId === request.data.requestId','true','cjs'),
('compiled-address-correlation',cjs,'addressed.data === expected.managementAgentId','true','cjs'),
('public-outcome-type',dts,'export type AgentDeletionResult = z.infer<typeof AgentDeletionResultSchema>;','export type AgentDeletionResult = Omit<z.infer<typeof AgentDeletionResultSchema>, "outcome"> & {outcome: string};','types'),
('public-shared-scope-type',dts,'export type AgentDeletionPiece = z.infer<typeof AgentDeletionPieceSchema>;','export type AgentDeletionPiece = z.infer<typeof AgentDeletionPieceSchema> | {step: "shared-container";outcome:"completed"};','types'),
('public-failure-reason-type',dts,'export type AgentDeletionPiece = z.infer<typeof AgentDeletionPieceSchema>;','export type AgentDeletionPiece = z.infer<typeof AgentDeletionPieceSchema> | {step: "runtime";outcome:"failed"};','types')]
report={'hashes':{p:hashlib.sha256(v.encode()).hexdigest() for p,v in original.items()},'mutations':[]}
def run(name,kind):
 cmd=[node,'tests/cjs/agent-deletion-smoke.cjs'] if kind=='cjs' else typecommand
 result=subprocess.run(cmd,cwd=root,env=env,capture_output=True,text=True,timeout=60)
 text=result.stdout+result.stderr;(out/(name+'.log')).write_text(text)
 qualified=result.returncode!=0 and ('AssertionError' in text if kind=='cjs' else 'TS2578' in text)
 return {'name':name,'kind':kind,'exit':result.returncode,'qualified':qualified,'log':name+'.log'}
try:
 report['baseline']=[run('baseline-'+kind,kind) for kind in ['cjs','types']]
 if any(r['exit'] for r in report['baseline']):raise RuntimeError('compiled baseline not green')
 for name,p,old,new,kind in cases:
  if old not in original[p]:raise RuntimeError('missing anchor '+name)
  try:
   (root/p).write_text(original[p].replace(old,new,1))
   report['mutations'].append(run(name,kind));print(report['mutations'][-1],flush=True)
  finally:(root/p).write_text(original[p])
 report['restored']=[run('restored-'+kind,kind) for kind in ['cjs','types']]
finally:
 for p,s in original.items():(root/p).write_text(s)
 report['restoredExact']=all((root/p).read_bytes()==s.encode() for p,s in original.items())
 (out/'mutations.json').write_text(json.dumps(report,indent=2)+'\n')
