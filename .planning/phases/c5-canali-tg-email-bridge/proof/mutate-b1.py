# Run one native Vitest command at a time; restore the exact source after every mutant.
from pathlib import Path
import hashlib, json, subprocess, time
ROOT = Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-147-1')
PROOF = ROOT / '.planning/phases/c5-canali-tg-email-bridge/proof'
SOURCE = ROOT / 'src/agent/agent-channel-resource-operation.ts'
original = SOURCE.read_bytes()
sha = hashlib.sha256(original).hexdigest()
argv = ['env', '-i', 'PATH=/Users/admintemp/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin:/usr/sbin:/sbin', 'HOME=/Users/admintemp', 'CI=1', 'pnpm', '-C', str(ROOT), 'exec', 'vitest', 'run', 'tests/agent/c5-channel-resource.test.ts', '--maxWorkers=1', '--no-file-parallelism', '--no-cache', '--testTimeout=60000']
rows = []
try:
    for number, (label, before, after) in enumerate(json.loads((PROOF / 'B1-mutations.json').read_text()), 1):
        source = original.decode()
        if source.count(before) != 1:
            raise ValueError(f'Ambiguous mutation {label}: {source.count(before)}')
        SOURCE.write_text(source.replace(before, after))
        log = PROOF / f'B1-mutant-{number:02}.txt'
        with log.open('w') as output:
            result = subprocess.run(argv, stdout=output, stderr=subprocess.STDOUT, timeout=60)
        text = log.read_text()
        semantic = result.returncode != 0 and ('AssertionError' in text or 'expected' in text) and 'Test Files' in text and 'Tests' in text and 'failed' in text and 'Unhandled Error' not in text and 'Failed to load' not in text
        rows.append({'id': number, 'label': label, 'exit': result.returncode, 'semanticRed': semantic, 'log': log.name})
        SOURCE.write_bytes(original)
        if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != sha:
            raise ValueError('Source restore failed')
        print(f'{number}/{34} {label}: '+('RED' if semantic else 'SURVIVED/INVALID'), flush=True)
finally:
    SOURCE.write_bytes(original)
    (PROOF / 'B1-mutation-results.json').write_text(json.dumps({'sourceSha256': sha, 'restoredSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'rows': rows}, indent=2)+'\n')
