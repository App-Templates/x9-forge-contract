"""Mutate only the Phase 56 endpoint, serially in a disposable copy."""
from pathlib import Path
import datetime,hashlib,json,os,shutil,signal,subprocess,sys,tempfile
from zoneinfo import ZoneInfo

ROOT=Path(__file__).resolve().parents[3]
PHASE=ROOT/'.planning/phases/56-conferma-x9-web'
SOURCE='src/http/endpoints/internal-dev-conferme.ts'
BARREL='src/http/endpoints/index.ts'
TEST='tests/http/endpoints/internal-dev-conferme.test.ts'
REQUEST="""z.object({
  sessionId: z.string().min(1),
}).strict()"""
ITEM="""z.object({
    richiesta: z.number().int().positive(),
    titolo: z.string(),
    comando: DevSignedCommandSchema,
    link: z.url({ protocol: /^https$/ }),
  }).strict()"""
RESPONSE="""z.object({
  conferme: z.array("""+ITEM+"""),
}).strict()"""
M=[]
def add(identifier,before,after,file=SOURCE):
    M.append(dict(id=identifier,file=file,before=before,after=after))
add('CF-01-path',"path: '/internal/dev/conferme-in-attesa'","path: '/internal/dev/wrong'")
add('CF-02-method',"method: 'POST'","method: 'GET'")
add('CF-03-auth',"authType: 'secret'","authType: 'none'")
add('CF-04-body-schema','bodySchema: InternalDevConfermeRequestSchema','bodySchema: z.any()')
add('CF-05-response-schema','responseSchema: InternalDevConfermeResponseSchema','responseSchema: z.any()')
add('CF-06-public-export',"export * from './internal-dev-conferme.js';",'',BARREL)
add('CF-07-request-object',REQUEST,'z.any()')
add('CF-08-session-type','sessionId: z.string().min(1),','sessionId: z.any(),')
add('CF-09-session-required','sessionId: z.string().min(1),','sessionId: z.string().min(1).optional(),')
add('CF-10-session-minimum','sessionId: z.string().min(1),','sessionId: z.string(),')
add('CF-11-request-strict',REQUEST,REQUEST.replace('.strict()',''))
add('CF-12-response-object',RESPONSE,'z.any()')
add('CF-13-collection-required','conferme: z.array('+ITEM+'),','conferme: z.array('+ITEM+').optional(),')
add('CF-14-collection-type','conferme: z.array('+ITEM+'),','conferme: z.any(),')
add('CF-15-item-object',ITEM,'z.any()')
fields={
    'richiesta':'z.number().int().positive()',
    'titolo':'z.string()',
    'comando':'DevSignedCommandSchema',
    'link':'z.url({ protocol: /^https$/ })',
}
for index,(name,schema) in enumerate(fields.items(),16):
    add('CF-'+str(index)+'-'+name+'-required',name+': '+schema+',',name+': '+schema+'.optional(),')
add('CF-20-request-number-type','richiesta: z.number().int().positive(),','richiesta: z.any(),')
add('CF-21-request-number-integer','richiesta: z.number().int().positive(),','richiesta: z.number().positive(),')
add('CF-22-request-number-positive','richiesta: z.number().int().positive(),','richiesta: z.number().int(),')
add('CF-23-title-type','titolo: z.string(),','titolo: z.any(),')
add('CF-24-command-values',"z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI'])",'z.string()')
add('CF-25-command-type',"z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI'])",'z.any()')
add('CF-26-url-type',fields['link'],'z.any()')
add('CF-27-url-validity',fields['link'],'z.string()')
add('CF-28-https-only',fields['link'],'z.url()')
add('CF-29-item-strict',ITEM,ITEM.replace('.strict()',''))
add('CF-30-response-strict',RESPONSE,RESPONSE[:-len('.strict()')])
add('CF-31-retry-command-preserved',"z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI'])","z.enum(['APPROVATO', 'SCARTATO'])")
add('CF-32-empty-title-preserved','titolo: z.string(),','titolo: z.string().min(1),')
add('CF-33-empty-queue-preserved','conferme: z.array('+ITEM+'),','conferme: z.array('+ITEM+').min(1),')
add('CF-34-session-boundary-preserved','sessionId: z.string().min(1),','sessionId: z.string().min(2),')

add('CF-35-public-command-linkage','comando: DevSignedCommandSchema,',"comando: z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI']),")

add('CF-36-command-options',"z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI'])","z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI', 'ANNULLA'])")

def hashes():
    paths=[ROOT/SOURCE,ROOT/BARREL,ROOT/TEST,ROOT/'package.json',ROOT/'CHANGELOG.md',ROOT/'pnpm-lock.yaml',
           *ROOT.joinpath('dist').rglob('*')]
    return {str(path.relative_to(ROOT)):hashlib.sha256(path.read_bytes()).hexdigest() for path in paths if path.is_file()}

def run(shadow,raw,label):
    report=raw/(label+'.json')
    command=['pnpm','-C',str(shadow),'exec','vitest','run','--maxWorkers=1','--testTimeout=60000',
             '--reporter=json','--outputFile='+str(report),TEST]
    with (raw/(label+'.log')).open('w') as out:
        process=subprocess.Popen(command,stdout=out,stderr=subprocess.STDOUT,start_new_session=True)
        try: code=process.wait(timeout=180)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid,signal.SIGTERM);process.wait(timeout=10)
            raise RuntimeError('Timeout is never counted as a kill.')
    data=json.loads(report.read_text())
    failed=[a for file in data['testResults'] for a in file['assertionResults'] if a['status']=='failed']
    assertions=[a['fullName'] for a in failed if any('AssertionError' in message for message in a['failureMessages'])]
    return dict(exitCode=code,passed=data['numPassedTests'],total=data['numTotalTests'],failed=data['numFailedTests'],
                runtimeErrors=sum(bool(file.get('message')) for file in data['testResults']) + data.get('numRuntimeErrorTestSuites',0),assertionFailures=assertions)

def render(proof):
    rows=['# FINAL-MUTATIONS · 56-01','',
          str(proof['killed'])+'/'+str(proof['total'])+' mutazioni rilevate con asserzioni; un solo worker, solo il test della nuova rotta.',
          'Baseline '+str(proof['baseline']['passed'])+'/'+str(proof['baseline']['total'])
          +'; ripristino '+str(proof.get('green',{}).get('passed','in corso'))+'/'+str(proof.get('green',{}).get('total','?'))+'.',
          'Giro unico completo: '+str(proof['executed']==proof['total'])+'; originali invariati: '+str(proof['originalsUnchanged'])+'.',
          "JSON/log completi solo nell'archivio temporaneo: "+proof['rawEvidence'],
          'Edits esatti e controlli riproducibili nel runner tests/http/endpoints/mutate-internal-dev-conferme.py.',
          '',
          '| Mutazione | File | Assert falliti | Esempio |','| --- | --- | --- | --- |']
    for row in proof['mutations']:
        failures=row['result']['assertionFailures']
        sample=failures[0] if failures else 'NESSUNA ASSERZIONE'
        rows.append('| '+row['id']+' | '+row['file']+' | '+str(len(failures))+' | '+sample.replace('|',r'\|')+' |')
    (PHASE/'FINAL-MUTATIONS.md').write_text('\n'.join(rows)+'\n')

def main():
    assert len({row['id'] for row in M})==len(M)
    for row in M:
        assert (ROOT/row['file']).read_text().count(row['before'])==1,row['id']+' anchor is not unique'
    if '--check-anchors' in sys.argv:
        print('Unique anchors:',len(M));return 0
    assert not sys.argv[1:], 'Only a complete serial run is allowed.'
    before=hashes()
    raw=Path(tempfile.mkdtemp(prefix='bridge56-mutation-raw-'))
    shadow=Path(tempfile.mkdtemp(prefix='bridge56-mutation-shadow-'))
    shutil.copytree(ROOT/'src',shadow/'src')
    for file in [TEST,'tests/setup.ts','vitest.config.ts','package.json']:
        dest=shadow/file;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/file,dest)
    (shadow/'node_modules').symlink_to(ROOT/'node_modules',target_is_directory=True)
    baseline=run(shadow,raw,'baseline')
    assert baseline['exitCode']==0 and baseline['failed']==0 and baseline['runtimeErrors']==0
    proof=dict(total=len(M),executed=0,killed=0,rawEvidence=str(raw),shadow=str(shadow),baseline=baseline,mutations=[],originalsUnchanged=True)
    for row in M:
        file=shadow/row['file'];original=file.read_text()
        try:
            file.write_text(original.replace(row['before'],row['after']))
            result=run(shadow,raw,row['id'])
            killed=result['exitCode']!=0 and result['assertionFailures'] and result['runtimeErrors']==0 and result['total']==baseline['total']
            proof['mutations'].append(dict(**row,result=result,killed=bool(killed)))
            proof['executed']+=1;proof['killed']+=int(bool(killed))
            proof['originalsUnchanged']=hashes()==before
            render(proof)
            print(str(proof['executed'])+'/'+str(proof['total'])+' '+row['id']+' '+('RED assertion' if killed else 'SURVIVED/ERROR'),flush=True)
        finally:
            file.write_text(original)
    proof['green']=run(shadow,raw,'green')
    proof['originalsUnchanged']=hashes()==before
    render(proof)
    (raw/'complete-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
    print({key:value for key,value in proof.items() if key not in ['mutations','baseline','green']},flush=True)
    print('Final green',proof['green'],flush=True)
    return 0 if proof['killed']==proof['total'] and proof['originalsUnchanged'] and proof['green']['exitCode']==0 else 1

if __name__=='__main__':
    raise SystemExit(main())
