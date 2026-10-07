# MODELLI — M0/M1a/M1b

Base ripresa E: cc51d9f86a45f4f9b675a509c042abdd275c2697 su release 1.39.0 93e8c4d38aba92ba51ed44b7ce31bd799df32cbe, rebase predisposto dalla coordinatrice il 07/10 alle 18:01 preservando M0. Worktree 84-1, branch codex/modelli-m1. Mandato: piani/MODELLI-PLAN.md, assegnazione15:06 e ripresa16:27; perimetro codex_modelli-m1.txt.

Decisioni: context esplicito/versionato autorevole; legacy solo se assente, nessuna migrazione. Modello e budget appartengono alla capacità. Decisione Stefano 18:10: la pagina Modelli è l'unico editor per ogni agente/funzione; le Capacità mostrano i modelli con un link. M1b deve offrire overview e anteprima/salvataggio batch versionato riusando slot, writer e management canonici (concordato con Codex D). Solo contratti, nessun supporto Luna/Qwen o accesso provider dichiarato. Riusare schema/configVersion/identità/command management canonici, senza riscrivere header e wire nei consumer.

- M0 (avvio16:28, <=45min/3tentativi): fonti pubbliche Git aggiornate Forge/X9,7slot/7consumer/4ingressi; confronto basiR3/R4/R7 e referenza pubblica storica. Matrice metadata con hash e sonde coerenza consumer mancante.
- M1a (avvio dopo M0, <=45min/3tentativi): catalogo per funzione con protocollo e compatibilità attestati, fonte/accesso/freschezza, adapter registrato server e nessun URL/credenziale. Descriptor di capacità con pin completo tutti tier+fallback identico; automatico conserva routing. Test prima, mutazione specifica ogni nuova guardia, compatibilità legacy.
- M1b (avvio dopo M1a, <=45min/3tentativi): aggregate agente desiderato/applicato/failed, CAS, riscontro identity/version/requestId/replay, selezione realmente usata per funzione/tier e contesto versionato. Riuso management esistente; nessun200globale come prova, null/timeout/mismatch restano sconosciuti.
- Qualità di entrambi: source/ESM/CJS/CTS da archivio realmente installato, build/checkpack/type/lint nativi, input esatti/perimetro/protetti, restore SHA e verde dopo mutazioni. Limite superato o terzo tentativo: SALTATO con causa e richiesta separata di lotto residuo; niente falsa consegna completa.

Versione, CHANGELOG, rootmanifest e dist del worktree non si cambiano; build/pack privati con configurazioni originali. Nessun push, deploy, provider reale o modifica di altri worktree. Dopo ogni commit leggere PLAN+SUMMARY e aggiornare battito. Revisore indipendente prima del rilascio della coordinatrice.

Ripresa E 18:00: M1a residuo 43 minuti dopo pausa D. Catalogo e selezione verificati entro il limite; M1b inizia dopo il commit M1a, massimo 45 minuti/3 tentativi. Versione/CHANGELOG/dist rimangono alla coordinatrice e a un rilascio revisionato.
