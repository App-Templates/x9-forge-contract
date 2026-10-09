# C5-MODELLI-CONSUMATORI-BRIDGE — PLAN

Codex F. Base e22e7a2d, worktree 156-1, branch codex/c5-modelli-consumatori-bridge. Mandato coordinatrice 20261009-080850, decisioni Stefano: Sì X9 da Forge; No, tutte insieme. Lotto massimo 45 minuti dalla presa in carico, tre tentativi per passo. Nessun consumer X9/Forge modificato qui; il 150-1 è passato a B.

## Esistente (R-35), con Vecchio Forge

Registro src/model-router/model-consumers.ts espone solo agent_chat e requisiti tools/stream/structuredOutput. Stato GET /internal/agents/:agentId/models/state mantiene saved/runtime/versioni distinti. Descriptor, settings tiered, identità, provenienza, writer e batch/rebuild esistono. Riutilizzarli, nessun endpoint/header alternativo.

Vecchio Forge: riferimento storico 4f3fc42bf26ef191642f7f8d0cc94153c1302fe0 censito nel memo D: web/src/pages/agent/Models.tsx:29–35/155–166 (quattro slot, scelta/reset/rilettura); web/src/pages/GlobalModels.tsx:45–60 (tre globali); web/src/lib/api.ts:286–308; services/vault/src/routes/vault.ts:521/549/575/617/639 (origine agente/globale/default). Le funzioni già presenti restano visibili; la provenienza moderna resta esplicita.

## Comportamento da mantenere

La registrazione non equivale a runtime installato o disponibile. Unknown/read-only restano dichiarati. Prima lettura Master osserva la configurazione effettiva senza chiamare provider o mutare router/contesto. SourceVersion osservata è opaca, diversa dalla desiredVersion iniziale allocata da Forge. Contesto privato resta X9. Identità, owner/tenant e ruolo Master obbligatori; CAS/freschezza/completo prima del salvataggio. Esistenti DTO moderni e agent_chat mantengono semantica. Modelli singoli/failover non inventano quattro tier; embedded dimensions e rebuild espliciti. Vision e web search richiedono feature distinte, non tools.

## Si riscrive?

No: estensione del registro e del reader di stato canonici. Stack change approvato da Stefano; qui solo contratto metadata. Nuove definizioni consumer con ID stabile, C01–C34, scope del percorso attuale, confine del cambio, forma tiered/single/failover e collegamenti attuali; nessun default provider/model. Sorgente legacy opzionale sullo stato, strict/allowlist, copertura completa oppure missing espliciti, versione/tempo e guardia di confronto. Priming/persistenza/CAS locale X9 spettano D, Store a B, servizio consumer a E, pagina a C.

## Fruibilità (R-34)

L'utente deve vedere tutte le scelte e cambiare il Master sincronizzando solo i figli collegati. Questo lotto definisce 34/34 dichiarazioni del censimento, non 34 installazioni né 34/57 funzioni chiuse. Il parser impedisce che una fonte parziale, scaduta o di altro ambito sembri sufficiente per il primo salvataggio. Nuovi handler/writer/installers e prova dal vivo sono lotti separati autorizzati; qui vivo 0/34.

## Corrispondenza

| Aspettativa/tavola o vecchia funzione | Elemento costruito | Prova |
|---|---|---|
| Quattro slot, scelta/reset/rilettura del vecchio Forge | settings tiered preservati, single/failover senza tier inventati | round trip e regressione |
| Tre globali e origine agente/globale/default del vecchio Forge | Master canonico + provenienza esplicita già esistente | reader scoped, nessuna origine dedotta |
| Primo salvataggio esatto dei modelli attuali | bootstrapSource sul reader state con versione osservata distinta da desired | complete/missing/authority/freshness/race tests |
| Immagini/ricerca/audio/vettori | requisiti vision/webSearch, dimensione e confini di cambio | negativo supporto mancante, registry exact |
| C01: Conversazione libera: Telegram e turni interni; tier standard/advanced/reasoning e fallback | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C02: Classificatore della complessità del turno | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C03: Estrazione di ricordi da turni chat e trascrizioni telefoniche; replay | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C04: Embedding della memoria: proiezione e richiamo semantico | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C05: Embedding RAG: documenti, upload, worker e query | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C06: Estrazione di affermazioni dai documenti RAG | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C07: Validazione delle affermazioni RAG, secondo passaggio | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C08: Sintesi RAG: stato del tema e relative analisi | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C09: Modello audio Live nelle telefonate | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C10: Modello testuale di delega della telefonata Live | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C11: Modello audio Live nel browser | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C12: Modello testuale di delega Live nel browser | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C13: Riepilogo della telefonata dopo la chiusura | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C14: LLM dell'agente conversazionale remoto ElevenLabs | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C15: TTS dell'agente conversazionale remoto ElevenLabs | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C16: Risposta vocale Telegram del core | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C17: Sintesi vocale dei messaggi pianificati | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C18: Audio briefing e digest inviati a Telegram | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C19: Trascrizione audio cap-stt, provider primario e fallback | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C20: Trascrizione in streaming degli occhiali | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C21: Sintesi vocale in streaming degli occhiali | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C22: Domande e riassunto di documenti testuali | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C23: Visione di immagini e pagine di documenti, cap-qa | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C24: Visione delle telecamere e verdetto sicurezza | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C25: Interpretazione delle regole di sicurezza | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C26: Riassunto delle notizie | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C27: Interpretazione delle regole delle notizie | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C28: Interpretazione delle regole Netatmo | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C29: Interpretazione delle regole briefing | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C30: Ricerca web ragionata | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C31: Strutturazione dei risultati della ricerca | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C32: Conversazione della pipeline mindfulness Python | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C33: TTS della pipeline mindfulness Python | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |
| C34: STT della pipeline mindfulness Python | consumer registrato e inventario esplicito | ID/requirements/scope e round trip |

## Passi e prove

1. PLAN prima del codice; install frozen/prefer-offline. Rosso semantico nuovi test prima, baseline vecchio registro.
2. Registro completo + metadata e requisiti; reader source legacy additivo; esportazioni pubbliche. Primo SHA comunicato presto a coordinatrice e B/C/D/E con limiti chiari.
3. Una mutazione semantica per ogni guardia nuova, restore hash e fresh green. Full native maxWorkers1 prima di build; types/lint/build/check:dts/check:pack e smoke ESM/CJS sui veri entrypoint. Nessun filtro/esclusione nuovo o modifica di configurazione.
4. Audit perimetro; commit atomici normali e SUMMARY incrementale/rilettura PLAN+SUMMARY. Nessun push/merge/tag/deploy. Dist solo perimetro autorizzato: richiesta per root/cjs smoke se necessario, nessun aggiramento.

## Esito da distinguere

Implementato contratto; testato locale con conteggi/denominatori e prove. Verificato dal vivo: zero. Rilascio e integrazione a coordinatrice dopo revisione indipendente.

## Raccordi autorizzati 08:22 e completezza concordata

Coordinatrice082252 autorizza src/agent/agent-management.ts/tests/agent e il trasporto servizi in internal-models-batch. modelBootstrap opzionale{expectedSourceVersion,expectedAbsent:true} nel normale apply-config; la precondizione parte dell'idempotenza. Source completa copre tutte34dichiarazioni tramite selections/missingSlots/excludedSlots osservati. Esclusioni non-installed/non-applicable con ragione e stessa generation; un modello attivo ignoto resta missing. Zero provider-call in reader, zero context export.

Servizi: ModelConsumerInstallRequest/RuntimeState/InstallReceipt, scope owner/tenant/runtime, identità3ID, slot/version/request/source-generation e readback. POST state/install canonici con header esistente e slot params/body concordi. Registrazione sceglie servizio fidato, mai URL del browser. Rebuild riusa ModelEmbeddingRebuild e active precedente fino a completamento; receipt pending/failed noninstalled. JSON Schema esporta solo la shape: crossfield/refinement/CAS/freschezza richiedono validation del producer canonico (anche perPython), non dichiarati coperti dal solo JSON Schema. Nuovo helper runtime matching condiviso non4tier; settings equivalence preserva mode/requisiti/dimensione/catalog.

## Delta Master privato (09/10 08:46, autorizzazione084357)

Esistente (con Vecchio Forge): apply-config porta desiredVersion e CAS primoStore; i normali agenti ricevono configurazione dal contextFactory, il Masterprivato non la riceve. Comportamento da mantenere: nessuna scrittura nel contestoFactory del Master, stesso endpoint/idempotenza, vecchi comandi validi, niente replay con scelta diversa. Si riscrive? No: modelConfiguration opzionale riusa AgentModelsConfiguration canonica. configVersion uguale desiredVersion; scope/identità/provenance esistenti; fontegenerazione opaca distinta dalla numericaprovenance. Generation precondition additiva in attesa raccordo coordinatrice0846. Fruibilità R34: questo chiude trasporto delle modifiche successive, writer/provider/live rimangono D/B. Corrispondenza: modifica sceltaMaster→config presente nel comando→writerprivato→readback; test red prima, guardie mutate, full nativo prima build, CJS/ESM aggiornati. Lotto separato fino09:31 massimo45min, source2710704 congelato disponibile ai consumer e verificaA.
