"""Sequential assertion mutations for shared versions and newly added strict boundaries."""
from pathlib import Path
import json
import subprocess
import sys
root = Path(__file__).resolve().parents[2]
version = root / 'src/model-router/models-version.ts'
pending = root / 'src/model-router/agent-model-configuration.ts'
target = root / 'src/model-router/models-target.ts'
endpoint = root / 'src/http/endpoints/internal-models-apply.ts'
original = {p: p.read_text() for p in [version, pending, target, endpoint]}
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
cases = [
 ('catalog-token', version, "return sha256(JSON.stringify({...content, entries, inventory}));", "return sha256(JSON.stringify({...content, entries, inventory, version: catalog.version}));", 'models-version', 'keeps catalog version'),
 ('configuration-sequence', version, 'return sha256(JSON.stringify(canonical({...content, selections: slots,', 'return sha256(JSON.stringify(canonical({...content, configVersion: configuration.configVersion, selections: slots,', 'models-version', 'keeps configuration content version'),
 ('pair-version', version, ".slice(0, 32);", ".slice(0, 31);", 'models-version', 'derives the exact bounded'),
 ('catalog-stamp', version, 'catalogVersion: ModelCatalogVersionSchema.parse(catalog.version)', 'catalogVersion: selection.settings.catalogVersion', 'models-version', 'stamps only the validated'),
 ('unchanged-zero-calls', pending, "slot.status === 'unchanged' && slot.calls !== undefined", 'false && slot.calls !== undefined', 'models-version', 'invalid call accounting'),
 ('slot-failure-reason', pending, "slot.reason !== undefined && slot.status !== 'failed'", 'false', 'models-version', 'failure reason on failed'),
 ('stack-target-strict', target, "z.object({scope: z.literal('stack')}).strict()", "z.object({scope: z.literal('stack')})", 'models-target', 'ambiguous or noncanonical target'),
 ('child-identity-unique', target, 'new Set(job.children.map(child => child.agentId)).size !== job.children.length', 'false', 'models-target', 'extends pending work'),
 ('heir-identity-unique', endpoint, "request.heirs && new Set(request.heirs.map(heir => typeof heir === 'string' ? heir : heir.agentId)).size !== request.heirs.length", 'false', 'models-target', 'preserves legacy heir IDs'),
 ('post-secret-header', endpoint, 'authHeader: INTERNAL_SECRET_HEADER,\n  bodySchema:', 'authHeader: undefined,\n  bodySchema:', 'models-target', 'one additive internal endpoint pair'),
 ('get-secret-header', endpoint, 'authHeader: INTERNAL_SECRET_HEADER,\n  paramsSchema:', 'authHeader: undefined,\n  paramsSchema:', 'models-target', 'one additive internal endpoint pair'),
 ('admission-outcome', endpoint, "result.ok !== (result.outcome === 'accepted')", 'false', 'models-target', 'distinguishes accepted queue'),
]
results=[]
def run(name, file, pattern, phase):
 result=subprocess.run(['pnpm','exec','vitest','run','--maxWorkers=1','--config','tests/model-router/cuore-vitest.config.ts',
   'tests/model-router/'+file+'.test.ts','-t',pattern],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 (out/(name+'-'+phase+'.log')).write_text(result.stdout)
 return result
try:
 for name,path,old,new,file,pattern in cases:
  assert original[path].count(old)==1, name
  path.write_text(original[path].replace(old,new,1)); red=run(name,file,pattern,'red'); path.write_text(original[path])
  assert red.returncode==1 and 'AssertionError' in red.stdout, name+': missing assertion RED'
  green=run(name,file,pattern,'green')
  assert green.returncode==0 and ' passed' in green.stdout, name+': restore not GREEN'
  results.append({'control':name,'assertionRed':True,'restoreGreen':True});print(name+': assertion RED / restore GREEN',flush=True)
finally:
 for path,content in original.items(): path.write_text(content)
 (out/'results.json').write_text(json.dumps({'total':len(cases),'results':results},indent=2)+'\n')
