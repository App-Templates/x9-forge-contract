from pathlib import Path
import tempfile,shutil,json,subprocess
root=Path(__file__).resolve().parents[3]
trial=Path(tempfile.mkdtemp(prefix='d-paperclip-compat-',dir='/private/tmp'))
(trial/'tests/compat').mkdir(parents=True)
for name in ['src','node_modules']:(trial/name).symlink_to(root/name,target_is_directory=True)
for name in ['vitest.config.ts']:shutil.copyfile(root/name,trial/name)
shutil.copyfile(root/'tests/setup.ts',trial/'tests/setup.ts')
for name in ['bridge-130-compat.test.ts','bridge-130-exports.json']:shutil.copyfile(root/'tests/compat'/name,trial/'tests/compat'/name)
pkg=json.loads((root/'package.json').read_text());del pkg['zshy']['exports']['./auth'];(trial/'package.json').write_text(json.dumps(pkg))
cmd=['/usr/local/bin/node',str(root/'node_modules/vitest/vitest.mjs'),'run','tests/compat/bridge-130-compat.test.ts','-t','covers every 1.30 subpath','--maxWorkers=1']
r=subprocess.run(cmd,cwd=trial,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(trial/'removed-export.log').write_text(r.stdout)
assert r.returncode!=0 and 'AssertionError' in r.stdout and 'Failed Suites' not in r.stdout
shutil.copyfile(root/'package.json',trial/'package.json');r=subprocess.run(cmd,cwd=trial,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(trial/'restored.log').write_text(r.stdout);assert r.returncode==0
(root/'.planning/phases/filiera-cap-paperclip/COMPAT-QUALIFICATION.json').write_text(json.dumps(dict(snapshot=str(trial),removedExistingExport='./auth',assertionRed=True,restored=True),indent=2)+'\n')
print('compat existing export removed: assertion red 1/1; restored 1/1')
