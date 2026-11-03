import hashlib, json, os, pathlib, subprocess
repo=pathlib.Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1')
out=pathlib.Path(__file__).resolve().parent
env={'PATH':'/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/opt/homebrew/bin:/usr/bin:/bin','HOME':os.environ['HOME']}
def run(label):
    p=subprocess.run(['node','tests/cjs/c5-models-consumers-smoke.mjs'],cwd=repo,env=env,text=True,capture_output=True)
    (out/(label+'.log')).write_text(p.stdout+p.stderr)
    return p
results=[]
for extension in ['js','cjs']:
    path=repo/('dist/model-router/model-consumer-execution.'+extension)
    original=path.read_bytes()
    needle=b'request.data.expectedSourceVersion === source.data.sourceVersion'
    assert original.count(needle)==1
    try:
        path.write_bytes(original.replace(needle,b'true'))
        red=run('COMPILED-'+extension.upper()+'-RED')
        assert red.returncode!=0 and 'AssertionError' in red.stderr and 'true !== false' in red.stderr, red.stderr
    finally:
        path.write_bytes(original)
    restored=path.read_bytes()==original
    green=run('COMPILED-'+extension.upper()+'-RESTORED')
    assert restored and green.returncode==0
    results.append({'surface':extension,'redExit':red.returncode,'semantic':'AssertionError true !== false','sha256':hashlib.sha256(original).hexdigest(),'restored':restored,'fresh':json.loads(green.stdout)})
(out/'COMPILED-FAULT.json').write_text(json.dumps({'faults':results,'qualified':len(results),'total':2},indent=2)+'\n')
print(json.dumps({'qualified':len(results),'total':2,'restored':2,'freshChecks':104}))
