"""Prepare an isolated consumer from our own packed release, without install scripts."""
import json,pathlib,shutil,tarfile,tempfile,sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
archive=pathlib.Path(sys.argv[1]);fixture=pathlib.Path(tempfile.mkdtemp(prefix='d55-consumer-',dir='/private/tmp'))
with tarfile.open(archive) as tar:
 members=tar.getmembers();assert all(m.name.startswith('package/') for m in members)
 tar.extractall(fixture,filter='data')
base=fixture/'node_modules/@x9-forge';base.mkdir(parents=True)
(base/'contracts').symlink_to(fixture/'package',target_is_directory=True)
(fixture/'node_modules/zod').symlink_to(ROOT/'node_modules/zod',target_is_directory=True)
(fixture/'package.json').write_text('{"type":"module","private":true}\n')
phase=ROOT/'.planning/phases/55-cap-paperclip-release'
for name in ['probe-packed.mjs','consumer.mts','consumer.cts']:shutil.copyfile(phase/name,fixture/name)
(fixture/'tsconfig.node16.json').write_text(json.dumps({'compilerOptions':{'noEmit':True,'target':'ES2022','module':'Node16','moduleResolution':'Node16','strict':True,'skipLibCheck':True,'ignoreDeprecations':'6.0','types':[]},'include':['consumer.mts','consumer.cts']}))
(fixture/'tsconfig.bundler.json').write_text(json.dumps({'compilerOptions':{'noEmit':True,'target':'ES2022','module':'ESNext','moduleResolution':'Bundler','strict':True,'skipLibCheck':True,'ignoreDeprecations':'6.0','types':[]},'include':['consumer.mts']}))
report={'archive':str(archive),'fixture':str(fixture),'archiveEntries':len(members),'version':json.loads((fixture/'package/package.json').read_text())['version'],'limits':'Private unpacked npm archive with canonical peer Zod, no registry install or scripts.'}
(phase/'PACKED-CONSUMER.json').write_text(json.dumps(report,indent=2)+'\n');print(str(fixture))
