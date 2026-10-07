# MODELLI — M0/M1a/M1b

Base: c8eed47a0d3beab544795f62f4733b022eafab1c, fix BRIDGE-139 incorporato con fast-forward autorizzato il 07/10 alle 16:22. Worktree 84-1, branch codex/modelli-m1. Mandato: piani/MODELLI-PLAN.md, assegnazione15:06 e ripresa16:27; perimetro codex_modelli-m1.txt.

Decisioni: context esplicito/versionato autorevole; legacy solo se assente, nessuna migrazione. Modello e budget appartengono alla capacità (legge16:05). Solo contratti, nessun supporto Luna/Qwen o accesso provider dichiarato. Riusare schema/configVersion/identità/command management canonici, senza riscrivere header e wire nei consumer.

- M0 (avvio16:28, <=45min/3tentativi): fonti pubbliche Git aggiornate Forge/X9,7slot/7consumer/4ingressi; confronto basiR3/R4/R7 e referenza pubblica storica. Matrice metadata con hash e sonde coerenza consumer mancante.
- M1a (avvio dopo M0, <=45min/3tentativi): catalogo per funzione con protocollo e compatibilità attestati, fonte/accesso/freschezza, adapter registrato server e nessun URL/credenziale. Descriptor di capacità con pin completo tutti tier+fallback identico; automatico conserva routing. Test prima, mutazione specifica ogni nuova guardia, compatibilità legacy.
- M1b (avvio dopo M1a, <=45min/3tentativi): aggregate agente desiderato/applicato/failed, CAS, riscontro identity/version/requestId/replay, selezione realmente usata per funzione/tier e contesto versionato. Riuso management esistente; nessun200globale come prova, null/timeout/mismatch restano sconosciuti.
- Qualità di entrambi: source/ESM/CJS/CTS da archivio realmente installato, build/checkpack/type/lint nativi, input esatti/perimetro/protetti, restore SHA e verde dopo mutazioni. Limite superato o terzo tentativo: SALTATO con causa e richiesta separata di lotto residuo; niente falsa consegna completa.

Versione, CHANGELOG, rootmanifest e dist del worktree non si cambiano; build/pack privati con configurazioni originali. Nessun push, deploy, provider reale o modifica di altri worktree. Dopo ogni commit leggere PLAN+SUMMARY e aggiornare battito. Revisore indipendente prima del rilascio della coordinatrice.
