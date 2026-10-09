from pathlib import Path
import subprocess, sys, json
root = '/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1'
proof = Path('/private/tmp/codex-a-chiavi-completamento/proofs/34-02')
proof.mkdir(parents=True, exist_ok=True)
name, *cmd = sys.argv[1:]
result = subprocess.run(cmd, cwd=root, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
(proof / (name + '.log')).write_bytes(result.stdout)
(proof / (name + '.json')).write_text(json.dumps({'command':cmd,'cwd':root,'exit_code':result.returncode}, indent=2)+'\n')
print(name, 'exit', result.returncode)
print(result.stdout.decode(errors='replace')[-3200:])
sys.exit(result.returncode)
