from pathlib import Path
import subprocess,json,hashlib
root=Path.cwd();p=root/'.planning/phases/c5-canali-tel-web/proof';env={'HOME':'/Users/admintemp','PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin','NO_COLOR':'1'}
def run(name,command):
 r=subprocess.run(command,env=env,capture_output=True,text=True);(p/(name+'.log')).write_text(r.stdout+r.stderr);return r
r=run('B0c2b-public-green', ['node','tests/cjs/c5-phone-web-smoke.mjs']);print('green',r.returncode,r.stdout,flush=True);assert r.returncode==0
barrel=root/'src/capability/index.ts';orig=barrel.read_bytes();checks=[]
try:
 barrel.write_text(orig.decode().replace("export * from './agent-elevenlabs/web-browser.js';",''));r=run('B0c2b-mut-export-build',['pnpm','build']);assert r.returncode==0
 for mode in ['esm','cjs']:
  r=run('B0c2b-mut-export-'+mode,['node','tests/cjs/c5-phone-web-smoke.mjs',mode]);checks.append({'format':mode,'exitCode':r.returncode,'functionalAssertion':'AssertionError' in r.stderr and 'public browser projection' in r.stderr,'secondaryError':any(x in r.stderr for x in ['TypeError:','ReferenceError:','ERR_MODULE_NOT_FOUND'])});print(checks[-1],flush=True)
finally: barrel.write_bytes(orig)
assert all(a['exitCode']!=0 and a['functionalAssertion'] and not a['secondaryError'] for a in checks)
r=run('B0c2b-restored-build',['pnpm','build']);assert r.returncode==0
r=run('B0c2b-restored-green',['node','tests/cjs/c5-phone-web-smoke.mjs']);print('restored',r.returncode,r.stdout,flush=True);assert r.returncode==0
(p/'B0c2b-COMPILED-MUTATIONS.json').write_text(json.dumps({'total':2,'qualified':2,'checks':checks,'restored':barrel.read_bytes()==orig,'sha256':hashlib.sha256(orig).hexdigest(),'green':json.loads(r.stdout)},indent=2)+'\n')
