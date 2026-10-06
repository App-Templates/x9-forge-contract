# QUALITÀ FINALE · 56-01

Build effettuata in copia temporanea, nessun build su dist originale.
Archivio completo: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4
Originali package.json / CHANGELOG.md / pnpm-lock.yaml / dist invariati: 1011/1011 SHA256.
Prove di pubblicazione locali: export rimosso nella sola copia → AssertionError in ESM e CJS; ripristinato → 2/2 formati verdi.
Tipi dei consumer ESM/CJS compilati dalla copia. Nessuna credenziale o rete.
CJS storico originale: [cjs-smoke] summary: 31 passed, 0 failed (of 31 probes)
CJS copia aggiornata: [cjs-smoke] summary: 31 passed, 0 failed (of 31 probes)

| Controllo | Exit | Assert rosso |
| --- | --- | --- |
| copy-build | 0 | False |
| esm-export-red | 1 | True |
| esm-export-green | 0 | False |
| cjs-export-red | 1 | True |
| cjs-export-green | 0 | False |
| declaration-consumers | 0 | False |
| original-cjs | 0 | False |
| copy-cjs | 0 | False |
| full-lint | 0 | False |

Comandi esatti:

- copy-build: pnpm -C /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build build
- esm-export-red: node /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/confirmation-probe.mjs
- esm-export-green: node /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/confirmation-probe.mjs
- cjs-export-red: node /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/confirmation-probe.cjs
- cjs-export-green: node /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/confirmation-probe.cjs
- declaration-consumers: pnpm -C /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build exec tsc --ignoreConfig --noEmit --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --ignoreDeprecations 6.0 /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/consumer.mts /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/consumer.cts
- original-cjs: node /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1/tests/cjs/smoke.cjs
- copy-cjs: node /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-quality-ihehn9q4/build/tests/cjs/smoke.cjs
- full-lint: pnpm -C /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1 lint

Ora: 2026-10-06T15:31:49.731571+02:00
