from pathlib import Path
import json, subprocess, hashlib, os, time, signal, traceback

root = Path(__file__).resolve().parent
namespace = {'__file__': str(root/'run-mutations-complete.py')}
exec((root/'run-mutations-complete.py').read_text().split('originals = ')[0], namespace)
specs = namespace['specs']; tests = namespace['tests']
http = 'src/http/endpoints/internal-channel-attestation.ts'
tests[http] = tests[namespace['A']]
for label, old, new in [
    ('attestation internal authentication', "authType: 'secret'", "authType: 'none'"),
    ('attestation POST transport', "method: 'POST'", "method: 'GET'"),
    ('attestation canonical route', "path: '/internal/channels/attest'", "path: '/internal/channels/wrong'"),
    ('attestation request schema binding', 'bodySchema: AgentChannelAttestationRequestSchema', 'bodySchema: AgentChannelAttestationSchema'),
    ('attestation response schema binding', 'responseSchema: AgentChannelAttestationSchema', 'responseSchema: AgentChannelAttestationRequestSchema'),
]:
    specs.append({'file': http, 'control': label, 'old': old, 'new': new})
out = root/'evidence'/'mutation-watch-final'
out.mkdir(parents=True, exist_ok=True)
report = out/'watch-report.json'
originals = {file: (root/file).read_bytes() for file in tests}
for spec in specs:
    assert originals[spec['file']].decode().count(spec['old'])==1, (spec['control'], 'source mismatch')
env = {k:v for k,v in os.environ.items() if not k.startswith(('SENTRY_', 'VITE_'))}
cmd = ['node', str(root/'node_modules/vitest/vitest.mjs'), *sorted(set(tests.values())), '--watch', '--maxWorkers=1', '--testTimeout=60000', '--reporter=json', '--outputFile='+str(report)]
results = {'candidate': json.loads((root/'provenance.json').read_text())['candidate'], 'started': time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()), 'planned': len(specs), 'command': cmd, 'mutations': []}

def generation():
    return report.stat().st_mtime_ns if report.exists() else 0

def wait_report(previous, label):
    deadline = time.monotonic()+150
    while time.monotonic()<deadline:
        if process.poll() is not None:
            raise RuntimeError('Watch session exited before report: '+str(process.returncode))
        if report.exists() and generation()>previous:
            try:
                data = json.loads(report.read_text())
            except json.JSONDecodeError:
                time.sleep(.1); continue
            failures = [a for f in data['testResults'] for a in f['assertionResults'] if a['status']=='failed']
            target = out/(label+'.json'); target.write_text(json.dumps(data,indent=2)+'\n')
            return {'passed': data['numPassedTests'], 'total': data['numTotalTests'], 'failed': data['numFailedTests'], 'suiteFailures': data['numFailedTestSuites'], 'report': str(target), 'failures': [{'test':a['fullName'], 'messages':a.get('failureMessages',[])} for a in failures]}
        time.sleep(.15)
    raise TimeoutError('No fresh watch report for '+label+'; not credited')

log = (out/'session.txt').open('w')
process = subprocess.Popen(cmd, cwd=root, env=env, stdin=subprocess.PIPE, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
try:
    results['baseline'] = wait_report(0,'baseline')
    assert results['baseline']['total']==118 and results['baseline']['passed']==118
    print('BASELINE118/118 one-worker watch',flush=True)
    for index,spec in enumerate(specs,1):
        path = root/spec['file']; original = originals[spec['file']]
        previous = generation()
        path.write_text(original.decode().replace(spec['old'],spec['new']))
        try:
            red = wait_report(previous,f'{index:03d}-red')
        finally:
            previous = generation(); path.write_bytes(original)
        assert path.read_bytes()==original
        green = wait_report(previous,f'{index:03d}-restored')
        assertion_only = bool(red['failures']) and all(bool(f['messages']) and all('AssertionError:' in message and 'TypeError:' not in message and 'ReferenceError:' not in message and 'timed out' not in message for message in f['messages']) for f in red['failures'])
        killed = assertion_only and red['failed']>0 and green['failed']==0 and green['suiteFailures']==0 and green['passed']==green['total']
        row = {**spec, 'red':red, 'restored':{k:v for k,v in green.items() if k!='failures'}, 'shaRestored':hashlib.sha256(original).hexdigest(), 'assertionOnly':assertion_only, 'killed':killed}
        results['mutations'].append(row)
        (out/'summary.json').write_text(json.dumps(results,indent=2)+'\n')
        if index%5==0 or not killed: print(index,len(specs),spec['control'],'KILLED' if killed else 'NOT CREDITED',flush=True)
        if not killed: print(json.dumps(row),flush=True);raise RuntimeError('Mutant not credited: '+spec['control'])
    previous=generation()
    for test in set(tests.values()):
        path=root/test;path.write_bytes(path.read_bytes())
    results['final']=wait_report(previous,'final')
    assert results['final']['total']==118 and results['final']['passed']==118 and results['final']['suiteFailures']==0
    results['killed']=sum(x['killed'] for x in results['mutations'])
    assert results['killed']==len(specs)
    results['restoredInputs']={file:hashlib.sha256((root/file).read_bytes()).hexdigest() for file in originals}
    (out/'summary.json').write_text(json.dumps(results,indent=2)+'\n')
    print('FINAL',results['killed'],len(specs),'assertion-only, restored; baseline/final118/118',flush=True)
except BaseException as error:
    results['interrupted']={'type':type(error).__name__,'message':str(error),'finished':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    (out/'summary.json').write_text(json.dumps(results,indent=2)+'\n')
    raise
finally:
    for file,data in originals.items(): (root/file).write_bytes(data)
    if process.poll() is None:
        os.killpg(process.pid,signal.SIGTERM)
        try: process.wait(timeout=15)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid,signal.SIGKILL);process.wait(timeout=15)
    log.close()
