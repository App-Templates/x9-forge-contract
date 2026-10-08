import subprocess,json,hashlib
from pathlib import Path
root=Path.cwd();proof=root/'.planning/phases/c5-canali-tel-web/proof';env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','NO_COLOR':'1'}
def run(name,cmd):
 r=subprocess.run(cmd,env=env,capture_output=True,text=True);(proof/(name+'.log')).write_text(r.stdout+r.stderr);return r
r=run('B0c4a-compiled-green',['node',str(proof/'invitation-smoke.mjs')]);print('green',r.returncode,r.stdout,flush=True);assert r.returncode==0
barrel=root/'src/capability/index.ts';original=barrel.read_bytes();export="export * from './agent-elevenlabs/web-invitations.js';";assert original.decode().count(export)==1;results=[]
try:
 barrel.write_text(original.decode().replace(export,''));r=run('B0c4a-mut-export-build',['pnpm','build']);assert r.returncode==0
 for mode in ['esm','cjs']:
  r=run('B0c4a-mut-export-'+mode,['node',str(proof/'invitation-smoke.mjs'),mode]);row={'format':mode,'exitCode':r.returncode,'functionalAssertion':'AssertionError' in r.stderr and 'public projectElevenLabsWebInvitationList' in r.stderr,'secondaryError':any(x in r.stderr for x in ['TypeError:','ReferenceError:','ERR_MODULE_NOT_FOUND'])};results.append(row);print(row,flush=True)
finally:barrel.write_bytes(original)
assert all(r['functionalAssertion'] and r['exitCode']!=0 and not r['secondaryError'] for r in results)
r=run('B0c4a-restored-build',['pnpm','build']);assert r.returncode==0
r=run('B0c4a-compiled-restored',['node',str(proof/'invitation-smoke.mjs')]);assert r.returncode==0;record={'total':2,'qualified':2,'results':results,'restored':barrel.read_bytes()==original,'sha256':hashlib.sha256(original).hexdigest(),'green':json.loads(r.stdout)};(proof/'B0c4a-COMPILED-MUTATIONS.json').write_text(json.dumps(record,indent=2)+'\n');print(record,flush=True)
for name,cmd in [('browser',['node','tests/cjs/c5-phone-web-smoke.mjs']),('history',['node',str(proof/'round-trip-smoke.mjs')]),('legacy',['node','tests/cjs/smoke.cjs'])]:
 r=run('B0c4a-restored-'+name,cmd);print(name,r.returncode,r.stdout[-100:],flush=True);assert r.returncode==0
