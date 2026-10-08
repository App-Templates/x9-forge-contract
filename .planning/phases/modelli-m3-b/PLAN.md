# MODELLI-M3-B — consumer canonico del ragionamento

Codex D ·08/10 02:04→02:34, massimo30min o3tentativi. Base0eccaaa3f2c70cde293d80c053707bfa421bd874,bridge1.42.0;113-1codex/modelli-m3-b,solo perimetro assegnato. Dipendenze installate dalla coordinatrice. Nessun cambio versione/package/lock/dist nel worktree autore; build/pack in copia privata.

## Risultato e compatibilità

Costante AGENT_CHAT_MODEL_SLOT_ID nel modulo agent-model-configuration esistente; ModelSlotIdSchema resta generico e invariato per non rompere le selezioni già valide. Decisione coordinatrice 02:06: pubblicare soltanto agent_chat; i consumer memoria saranno definiti in M4, senza inventare ID. Nuovo model-consumers.ts esporta schema e tipo di metadata consumer (slotId/capability/function/requirements), registry schema bounded/univoco, costante capability agent-core e consumer reasoning con tools=true,stream=false,structuredOutput=false. Letture registro detached e lookup esatto per slot, unknown/invalid restituisce undefined. Registro descrive un requisito del consumer, non supporto/accesso di un modello, installazione o applied. Nessun provider,modello,chiave,prezzo o stato personale/default incorporato.

## R-31 e prove

Registro server unico e neutro rispetto ad agente/owner/tenant; i consumer X9/M5 lo importano e lo legano alle loro identità autorevoli, senza dedurre uno scope dalla costante. La sola voce connessa richiesta è ragionamento; assenza dello slot sconosciuto non diventa fallback. Modelli memoria/embedding/audio restano fuori M3 e unsupported fino a consumer qualificato M4. Streamingfalse significa che il consumer conserva il fallbackcomplete esistente, non supporto tokenstream del modello.

Test prima del codice con API Reflect sull'entrypoint pubblico: valori esatti delle costanti e requirements; strict unknown/top-level/nested; sintassi slot/capability/function; campi required; uniqueness/bound/empty; lookup exact senza family inference; clone di registry e lookup; immutabilità consumer costante; tutti gli export accessibili anche da root. Ogni nuovo controllo qualificato con mutazione semantica AssertionError, hash ripristinato e verde dopo ogni caso. Errori import/runtime/timeout non accreditati. Test preservano i contratti preesistenti e non fanno dipendere fixtures legacy dal nuovo consumer. Full Vitest worker1, typecheck/lint, ESM/CJS/dts e pack privati; smoke ESM/CJS nuove esportazioni. Audit perimetro/protetti/sorgenti/base/package invarianti.

Dopo ogni commit prodotto: PLAN/SUMMARY aggiornati,committati,riletti. Consegna congelata per revisione nonautore;rilascio1.43 solo coordinatrice. M3X9 importa poi quel rilascio e il fixM2,non vendor manuale. Nessun server/browser/provider/.env/secrets/harness/push/merge/deploy.

## Chiusura 08/10 02:22

Prodotto d854eadbae2dbb01476b7531ef8cfa37720c9882. Implementato il solo consumer canonico agent_chat / agent-core / reasoning, requisiti tools=true, stream=false, structuredOutput=false; schema generico per metadata futuri senza registrarli implicitamente. Schema slot legacy invariato. Pubblici root e subpath, lookup esatto, copie detached, costante immutabile. Nessuna nuova versione: 1.43 e pin X9 competono alla coordinatrice dopo revisione.

Prima del codice: 41/41 AssertionError fra 42 casi, uno legacy già verde. Mirati 102/102 (42 nuovi +60 configurazione esistente). La prima campagna è esclusa: il mutante registry-nonempty ha scoperto una fixture it.each che distribuiva l'array invece di passarlo intero. Corretta la sola nuova fixture B07; campagna finale intera 24/24 AssertionError, 42/42 dopo ciascun ripristino, 3/3 SHA sorgenti ripristinati. Nessun import/runtime/timeout accreditato.

Full finale 3227/3227, 138/138 file, zero falliti/pending/todo/errori non gestiti. Qualità 7/7: tipi, lint, build ESM/CJS, smoke CJS preesistenti, smoke consumer, pack, tipi del nuovo test. Dichiarazioni portabili 334/334; smoke consumer 48/48 sulle quattro superfici root/subpath ESM/CJS. Due rimozioni separate degli export compilati causano 2/2 AssertionError, con 48/48 dopo ciascun ripristino e SHA artifact identici. Warning preesistente del profilo pack sul types root conservato; nessun manifest cambiato. Primo comando tipi test fuori repo fallito per risoluzione typeRoots, escluso e corretto nel solo config privato.

Audit finale dopo stage: perimetro 11/11 file (5 applicativi), protetti 3074/3074, test preesistenti 251/251, input qualificati 5/5; zero cancellazioni, package e lock invariati. Guardie audit rotte intenzionalmente 4/4 AssertionError. Prove durable FINAL-PROOF.json, ricette MUTATIONS.json/mutate.py/audit.py. Log originali e checkout qualificato in /private/tmp/d-modelli-m3-b-20261008. Worktree congelato alla consegna; verifica nonautore richiesta. Nessuna osservazione live/provider né attestazione installed/applied.
