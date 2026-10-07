from pathlib import Path
import subprocess,os,signal,json,sys,time
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-63-1');p=r/'.planning/phases/bridge-134'
name=sys.argv[1];cmd=sys.argv[2:];start=time.time();limit=180
with(p/(name+'.txt')).open('w')as log:
 child=subprocess.Popen(cmd,cwd=r,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
 timeout=False
 try:code=child.wait(timeout=limit)
 except subprocess.TimeoutExpired:
  timeout=True;os.killpg(child.pid,signal.SIGTERM)
  try:code=child.wait(timeout=5)
  except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);code=child.wait()
(p/(name+'-exit.json')).write_text(json.dumps({'command':cmd,'exit':code,'timeout':timeout,'elapsedSeconds':time.time()-start},indent=2)+'\n')
print(name,'exit',code,'timeout',timeout)
f=p/(name+'.json')
if f.exists():
 d=json.loads(f.read_text());print({k:d.get(k) for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests']});print([(t['fullName'],[m[:130]for m in t['failureMessages']])for f in d['testResults']for t in f['assertionResults']if t['status']=='failed'])
raise SystemExit(code)
