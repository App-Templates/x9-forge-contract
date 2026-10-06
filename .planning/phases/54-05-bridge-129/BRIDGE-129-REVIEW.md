# BRIDGE-129 · correzioni della revisione

Base 846311c. ASSEGNATO in bacheca, stesso worktree e perimetro.

Fonte: risposta completa di revisione-bridge-129-20261006, sessione Samira.

REVISE (revisione 846311c, sessione Samira + revisore indipendente read-only; R-14 PASS, additività verso 1.28 OK, dist ESM/CJS OK, test campionati veri). Sette correzioni, PRIMA del rilascio perché aggiunte dopo sarebbero breaking:
1) presentation.ts:39,64-74 — manca il giudizio approva/chiedi modifiche (VISTA-PROGETTO §2/§6, 4 progetti su 5): esportare CapabilityFeedbackKindSchema = z.enum(['rating','approval']) nella dichiarazione; il record diventa z.discriminatedUnion('kind', [{kind:'rating', rating: int 1-10}, {kind:'approval', decision: z.enum(['approved','changes_requested'])}]).
2) presentation.ts:64-74 — il record di feedback non ha chi l'ha dato né la foto (VISTA §3/§6/§7): reviewerName limitato; attachments opzionale limitato che riusa WebUrlSchema (ricerca/research.ts) + flag attachments:boolean nella CapabilityFeedbackDeclarationSchema.
3) Nessun .max() (in 1.28 tutto è limitato; stringere dopo è breaking per chi produce): parameters.ts 5,6,11,25/35,102,113; presentation.ts 7,29,30,46,57,60,72,84,92,99,106. Limiti stile 1.28: etichette 200, descrizioni/commenti 2000, id 100, regex della chiave con lunghezza; opzioni ≤50, parametri ≤100, points ≤ AGENT_SPEND_MAX_DAYS, collezioni ≤ una pagina dichiarata; content con refine JSON.stringify ≤ 64 KB.
4) parameters.ts:6,27-37 — B1 non sa descrivere le config per agente che esistono già in 1.28 (lab pageKinds/linkKinds liste di slug, domain con pattern; ricerca models.digest/read facoltativi): aggiungere variante string_list (minItems/maxItems, options e pattern dell'elemento facoltativi), pattern facoltativo su string, e optional:boolean (valore assente ammesso). Il pannello di cap-lab deve potersi costruire in modo generico (FORGE-REDESIGN §7.3).
5) parameters.ts:12-24 — manca chi può cambiarlo: editableBy obbligatorio, array di z.enum(['superadmin','owner']) esportato con nome (oggi solo superadmin, owner dopo: HANDOFF D8/D10).
6) parameters.ts:4,109 — solo JSDoc: key = percorso puntato nel corpo della config per agente di quella capability, version = la versione di quella config; il salvataggio passa dal PUT /internal/capability/agents/:agentId/config esistente (capAgentConfigPath). Nessuna rotta nuova.
7) presentation.ts:21 — esportare CapabilityOutputFieldTypeSchema; per i campi number dichiarare la scala (min/max facoltativi) perché il voto del critico 1-10 si confronta col voto umano (VISTA §7).
Non bloccanti, ma da sistemare: la modifica allo script test di package.json (--maxWorkers=2 --testTimeout) in un commit a parte (R-03); i ~20.000 righe di JSON grezzo delle mutazioni in .planning/phases/54-05-bridge-129/ sostituiti da un riepilogo; import di z per primo in capability-manifest.ts e capability-registry-entry.ts; il SUMMARY dica che 133/133 è la somma di due giri e riporti un giro finale unico. Rilascio senza rotte OK dopo 1,3,4,5. Riguardo a correzioni fatte: scrivete qui e mandatemi un messaggio diretto, ricontrollo subito.

## Estensione autorizzata dalla bacheca

Lab: models.digest e budget dailyUsd/perIngestMaxUsd/timezone obbligatori; spesa lab e labAgentSpendContract; LabToolErrorSchema; ingest queued/status. La risposta completa bridge-129-lab-campi-20261006 autorizza la sola eccezione non additiva per lab non ancora consumato. Nessun consumer o rilascio in questo ramo.

## Passi

R1 tipi di feedback; R2 nome e allegati; R3 limiti; R4 liste/pattern/optional; R5 editabilità; R6 JSDoc config/versione; R7 scale. Un commit per correzione, prove rosse prima e verdi dopo. Poi tre estensioni lab, import z per primo, isolamento script test in commit separati, riepiloghi delle prove, qualità e giro finale unico di mutazioni. Massimo 45 minuti o 3 tentativi per passo; nessun push/merge/tag/deploy.

## Checkpoint di pausa

PAUSA SUBITO 13:45: R1–R4 concluse in acdae4e, nessun test in corso, attendere «ripartite». Estensione lab aggiornata dalle decisioni 13:35/13:40: seguire la risposta bridge-129-lab-campi-20261006, models/budget obbligatori e ingest asincrono con nuovo status tool. La non additività di lab è autorizzata esplicitamente e deve comparire nel CHANGELOG.

## Esito del giro corretto

R1–R7, estensione lab e tre punti non bloccanti implementati in commit separati indicati nel SUMMARY.
1436/1436 + CJS 36/36, 469/469 casi nuovi visti rossi, giro unico finale 299/299; qualità e dist pulita verificate.
PRONTO PER REVISIONE. La coordinatrice inoltra il nuovo commit alla sessione Samira prima del rilascio.
