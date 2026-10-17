import pathlib,hashlib,subprocess,json,os
r=pathlib.Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1');w=pathlib.Path(__file__).resolve().parent
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/opt/homebrew/bin:/usr/bin:/bin','HOME':os.environ['HOME']}
report=[]
for extension in ['js','cjs']:
 for name,stem,needle in [('replay','dist/agent/agent-management','a.modelExpectedSourceVersion === b.modelExpectedSourceVersion'),('source','dist/model-router/agent-model-configuration','command.data.modelExpectedSourceVersion === source.data.sourceVersion')]:
  path=r/(stem+'.'+extension);original=path.read_bytes();target=needle.encode();assert original.count(target)==1
  try:
   path.write_bytes(original.replace(target,b'true'))
   red=subprocess.run(['node','tests/cjs/c5-models-consumers-smoke.mjs'],cwd=r,env=env,capture_output=True,text=True)
   (w/('DELTA-COMPILED-'+extension+'-'+name+'-RED.log')).write_text(red.stdout+red.stderr)
   assert red.returncode!=0 and 'AssertionError' in red.stderr and 'true !== false' in red.stderr,red.stderr
  finally:path.write_bytes(original)
  green=subprocess.run(['node','tests/cjs/c5-models-consumers-smoke.mjs'],cwd=r,env=env,capture_output=True,text=True)
  (w/('DELTA-COMPILED-'+extension+'-'+name+'-RESTORE.log')).write_text(green.stdout+green.stderr)
  assert green.returncode==0 and path.read_bytes()==original
  result=json.loads(green.stdout);assert result['passed']==result['total']==158
  report.append({'surface':extension,'guard':name,'semantic':'AssertionError true !== false','redExit':red.returncode,'hashRestored':True,'sha256':hashlib.sha256(original).hexdigest(),'fresh':result})
  print(f'{extension}/{name}: semantic red, restored 158/158',flush=True)
for extension in ['js','cjs']:
 path=r/('dist/model-router/agent-model-configuration.'+extension);original=path.read_bytes();marker=b'function isAgentModelSourceObservationCurrent(';start=original.index(marker);needle=b'time >= Date.parse(source.validUntil)';index=original.index(needle,start)
 try:
  path.write_bytes(original[:index]+b'false'+original[index+len(needle):])
  red=subprocess.run(['node','tests/cjs/c5-models-consumers-smoke.mjs'],cwd=r,env=env,capture_output=True,text=True)
  (w/('DELTA-COMPILED-'+extension+'-expiry-RED.log')).write_text(red.stdout+red.stderr)
  assert red.returncode!=0 and 'AssertionError' in red.stderr and 'true !== false' in red.stderr,red.stderr
 finally:path.write_bytes(original)
 green=subprocess.run(['node','tests/cjs/c5-models-consumers-smoke.mjs'],cwd=r,env=env,capture_output=True,text=True)
 (w/('DELTA-COMPILED-'+extension+'-expiry-RESTORE.log')).write_text(green.stdout+green.stderr)
 assert green.returncode==0 and path.read_bytes()==original
 result=json.loads(green.stdout);assert result['passed']==result['total']==158
 report.append({'surface':extension,'guard':'expiry','semantic':'AssertionError true !== false','redExit':red.returncode,'hashRestored':True,'sha256':hashlib.sha256(original).hexdigest(),'fresh':result})
 print(f'{extension}/expiry: semantic red, restored 158/158',flush=True)
(w/'DELTA-COMPILED-FAULT.json').write_text(json.dumps({'qualified':6,'total':6,'faults':report},indent=2)+'\n')
