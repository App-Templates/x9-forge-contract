---
phase: 35-capabilities-c
status: implemented-contracts
---
# Contratti Capabilities
Ordinary-v2 unifica valori primitivi/structured, provenienza Master, CAS, stato per chiave e snapshot next_apply.
Manifest/registry conservano ordinaryParameters, metadati B1 e credentialRequirements A07 senza valori.
Lifecycle e autorità minima legano scope, identità, requestId e digest; start/stop/restart mantengono il bundle, Apply distingue configurazione caricata ed esecuzione osservata.
Modulo Python generato dal contratto/IR canonico: RAG e lifecycle senza settings; configurazione structured Python esplicitamente non supportata.
Pacchetto privato locale 1.46.0-capabilities-c.2 preparato per X9 SDK/Core/servizi e Forge factory/web; nessuna release.
## Prove
Vitest con --config vitest.capabilities-c.config.ts sui 12 file toccati: 345/345 test PASS; raccordo operativo e A07: 85/85 mirati PASS.
pnpm typecheck; eslint dei file toccati: PASS. RED iniziale metadata 4/7, poi 7/7 GREEN.
Mutazioni sicurezza/permessi intercettate e ripristinate: ordinary/lifecycle 8/8, codec 6/6, autorità 1/1, metadata 1/1, Python 9/9; autorità operativa 3/3.
pnpm build: PASS, dichiarazioni portabili 418/418. node tests/cjs/smoke.cjs: PASS (legacy e nuovi export ESM/CJS).
python3 -B tests/python/test_generated_capabilities.py dist/python/x9_forge_contracts_capabilities.py: 15/15 PASS.
npm_config_cache=/private/tmp/capabilities-c-npm-cache pnpm check:pack: PASS; warning già esistente sul types CJS del root.
Scope tenant/proprietario conservato nei contratti context/spend/turn; nuove chiamate interne News/Calendario/Lab, senza esposizione al modello.
Raccordo c.2: 298/298 test mirati PASS (inclusi export compilati e HTTP locale); 3/3 mutazioni sicurezza RED, ripristinate GREEN.
Lab dichiara solo il lettore modello digest effettivamente presente (C35); il consumer deve ancora applicarlo.
## Fruibilità (R-34)
Il consumer può leggere la metadata completa, configurare ogni campo dichiarato e distinguere saved/effective/applied.
È una prova locale dei contratti: l'effetto reale sull'agente e il percorso del pannello devono ancora essere collegati e provati in X9/Forge.
La funzione completa e la review indipendente restano aperte; nessun deploy, push o merge.
Misura bridge, righe aggiunte nella fase: prodotto 1451, test 1005, documenti 42; esclusi dist generati.
