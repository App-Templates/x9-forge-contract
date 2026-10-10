import hashlib,json,subprocess
from pathlib import Path
root=Path.cwd(); proof=root/'.planning/phases/c5-canali-tel-web/proof'; path=root/'src/agent/agent-channel-history.ts';original=path.read_bytes();text=original.decode();env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','NO_COLOR':'1'}
mutations=[]
def add(name,before,after):
 assert text.count(before)==1,(name,'anchor');mutations.append((name,before,after))
for marker in ['trip-history','trip-parse','trip-kind','trip-binding','trip-owner','trip-participant','trip-operation','trip-inbound','trip-stages','trip-applied','trip-loaded','trip-fresh']:
 lines=text.splitlines();index=next(i for i,line in enumerate(lines) if '// guard:'+marker in line);start=index
 while 'if (' not in lines[start]:start-=1
 before='\n'.join(lines[start:index+1]);condition=before[:before.rindex('return false;')];after=before.replace(condition,'  if ('+('true' if marker=='trip-parse' else 'false')+') ')
 add(marker,before,after)
add('trip-generation','return JSON.stringify(facts(frozen)) === JSON.stringify(facts(actual));','return true;')
add('trip-strict',"replyDeliveredAt: time,\n}).strict();", "replyDeliveredAt: time,\n}).passthrough();")
for stage in ['receivedAt','turnCompletedAt','replyDeliveredAt']:
 add('trip-required-'+stage,stage+': time,',stage+': time.optional(),')
results=[]
try:
 for name,before,after in mutations:
  path.write_text(text.replace(before,after));report=proof/('trip-mutation-'+name+'.json');r=subprocess.run(['pnpm','exec','vitest','run','tests/agent/c5-channel-history.test.ts','--maxWorkers=1','--reporter=json','--outputFile='+str(report)],env=env,capture_output=True,text=True);(proof/('trip-mutation-'+name+'.log')).write_text(r.stdout+r.stderr)
  d=json.loads(report.read_text());failed=[a for f in d['testResults'] for a in f['assertionResults'] if a['status']=='failed'];functional=[a for a in failed if any('AssertionError' in m for m in a['failureMessages'])];other=[a for a in failed if a not in functional];qualified=r.returncode!=0 and bool(functional) and not other
  results.append({'name':name,'exitCode':r.returncode,'tests':d['numTotalTests'],'functionalFailures':len(functional),'otherFailures':len(other),'qualified':qualified});print(name,qualified,len(functional),len(other),flush=True);path.write_bytes(original)
finally:
 path.write_bytes(original);record={'total':len(mutations),'qualified':sum(x['qualified'] for x in results),'results':results,'restored':path.read_bytes()==original,'sha256':hashlib.sha256(original).hexdigest()};(proof/'ROUND-TRIP-MUTATIONS.json').write_text(json.dumps(record,indent=2)+'\n')
assert record['qualified']==record['total']
