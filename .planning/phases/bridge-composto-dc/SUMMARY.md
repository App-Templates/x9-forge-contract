# Bridge composto D+C — consegna locale
Base d6523a5, ramo codex/bridge-composto-dc-f; mandato coordinatrice 11/10 16:16.
Importati in ordine C2843ccb e D1cd0447 (delta dopo febede1), senza sostituire Web/Knowledge.
Receipt/start/readback D erano già identici a febede1 nella base; nessun duplicato importato.
Dist e catalogo Python rigenerati esclusivamente con `pnpm build`.
Pacchetto: outputs/bridge-composto-dc/x9-forge-contracts-1.46.0.tgz nella chat Codex F.
Versione 1.46.0 invariata; package.json, lockfile e CHANGELOG invariati; nessun pin, push, c.3 o pubblicazione.

## Prove rifatte
Ambiente pulito env -i, Node24; Vitest maxWorkers=1 e fileParallelism=false.
`vitest run --config <chat>/work/bridge-composto-dc.config.mjs --testTimeout=60000`: 6087/6087, 222/222 file.
`node tests/cjs/smoke.cjs`: verde, incluse 36/36 sonde base, 38/38 entrypoint, 316/316 composizione Chiavi/Modelli.
`pnpm build`: verde, dichiarazioni portabili 488/488; `tsc --noEmit`: verde; ESLint 6/6 file TS toccati.
`pnpm check:pack`: verde; warning preesistente root types CJS, nessuna modifica agli export package.
Archivio estratto: 1954/1954 file dist identici byte per byte alla build.
`node <chat>/work/bridge-composto-dc-probe.mjs <pacchetto>`: 30/30 controlli ESM/CJS C+D.
`python3 -B tests/python/test_generated_capabilities.py <pacchetto>/dist/python/x9_forge_contracts_capabilities.py`: 15/15.
Caso Python configurazione vuota/lifecycle/GET/receipt ripreso dal test C sul pacchetto: 1/1 esecuzione verde.
Mutazioni sicurezza: C legame configurazione-authority e D grant immutabile, 2/2 rilevate su sorgente e 2/2 sul pacchetto.
Ripristino: 2/2 test sorgente verdi; pacchetto 30/30 ESM/CJS e 1/1 caso Python nuovamente verdi.

## Fruibilità alla consegna (R-34)
Artefatto locale importabile dai consumer, con contratti C e D insieme e Web/Knowledge conservati.
Verificato su dati sintetici in forma di produzione; adozione consumer, provider e percorso vivo non verificati qui.
Misura delta: prodotto +164/-18, test +214/-1, documenti PLAN+SUMMARY 44 righe; compilati esclusi.
