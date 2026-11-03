# L1 fase1 — bridge1.48.0, contratto pronto per pin/vendor

Base4935bfa, worktree197-1/ramo codex/cuore-bridge-148; mandato§3/§3b e ampliamento perimetro232742.
R-35: riusati catalogo/config canonici, PendingWork, motivi management, riga overview e secret header esistenti; nessuna porta precedente cambiata.

- Quattro funzioni pure sincrone e portabili: catalog/config contentVersion, modelsVersion, withCatalogVersion; config conserva identità/provenienza e ignora solo sequence/token indicati.
- Cinque motivi additivi; pending con unchanged,reason,calls,modelsVersion opzionali,0/0 per unchanged dichiarati.
- Righe legacy preservate; apply/heirs/card opzionali e strict. heirs.count=null rimane distinto da0.
- ModelsTargetSchema stack|agent; POST internalModelsApplyContract ammette accepted/error, GET internalModelsApplyJobContract + modelsApplyJobPath legge PendingWork+target+children. Identità esecutore invariata.
- package1.48.0 e changelog; nessun consumer/pin/vendor modificato da B.

Prove: install frozen riuscito;5/5file e195/195test PASS (46nuovi+149esistenti), worker1; snapshot pubblico temporaneo: fingerprint64hex af963e00… coincide esattamente. Nessun dato di produzione copiato nel repo.
Comando: `MODELS_CAPTURE=/private/tmp/prod-models-repro-1310/live-now.json pnpm exec vitest run --maxWorkers=1 tests/model-router/{models-version,models-target,agent-models-pending,models-batch,models-batch-http}.test.ts`.
`pnpm exec tsc --noEmit` e lint dei5file nuovi PASS; diff-check PASS.
Fase2 ancora da eseguire: casi fitti/mutazioni per4funzioni e controlli nuovi, build/public-format, audit R-14 indipendente E; nessun credito anticipato.

## Fruibilità alla consegna (R-34)
Interfacce utilizzabili per costruire L2–L6; il bridge da solo non salva/applica né crea code. La coordinatrice allinea pin/vendor; percorso completo e rilascio dipendono dal banco integrato. Nessun push/deploy/live.
Misura fase1:149 righe prodotto aggiunte,148 righe test,37 righe documenti.
