from pathlib import Path
import subprocess,json,hashlib,os
R=Path(__file__).resolve().parents[3];P=R/'src/agent/agent-runtime-state.ts';H=Path('/private/tmp/b139-p2-source');H.mkdir(exist_ok=True);ENV=dict(os.environ,PATH='/Users/admintemp/.nvm/versions/node/v24.14.1/bin:'+os.environ['PATH']);original=P.read_bytes();text=original.decode();pattern=r'/^[A-Za-z0-9_]+bot$/i'
recipes=[('min','.min(5)',''),('max','.max(32)',''),('alphabet',pattern,r'/^.+bot$/i'),('suffix',pattern,r'/^[A-Za-z0-9_]+$/i'),('case',pattern,r'/^[A-Za-z0-9_]+bot$/'),('line-boundary',pattern,r'/^[A-Za-z0-9_]+bot$/im'),('field-guard','z.string().min(5).max(32).regex('+pattern+').optional()','z.string().optional()'),('legacy-absent','regex('+pattern+').optional()','regex('+pattern+')')];results=[]
def run(label):
    report=H/(label+'.json');cmd=['pnpm','exec','vitest','run','tests/agent/bridge139-telegram-username.test.ts','tests/agent/bridge139-inventory-metadata.test.ts','--maxWorkers=1','--testTimeout=60000','--reporter=json','--outputFile='+str(report)]
    with (H/(label+'.log')).open('w') as out:p=subprocess.run(cmd,cwd=R,env=ENV,stdout=out,stderr=subprocess.STDOUT,timeout=120)
    d=json.loads(report.read_text());failed=[a for f in d['testResults'] for a in f['assertionResults'] if a['status']=='failed'];return {'exit':p.returncode,'passed':d['numPassedTests'],'total':d['numTotalTests'],'failed':d['numFailedTests'],'assertion':any('AssertionError' in m for a in failed for m in a['failureMessages'])}
for name,old,new in recipes:
    assert old in text,name
    try:
        P.write_text(text.replace(old,new,1));mutant=hashlib.sha256(P.read_bytes()).hexdigest();red=run(name+'-red');assert red['exit']!=0 and red['failed']>0 and red['assertion'],(name,red)
    finally:P.write_bytes(original)
    green=run(name+'-restore');assert green['exit']==0 and P.read_bytes()==original,(name,green)
    results.append({'name':name,'old':old,'new':new,'red':red,'green':green,'mutant_sha256':mutant,'restored_sha256':hashlib.sha256(original).hexdigest()});(R/'.planning/phases/bridge-139/P2-SOURCE-MUTATIONS.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps({'name':name,'red':red['failed'],'green':[green['passed'],green['total']]}),flush=True)
