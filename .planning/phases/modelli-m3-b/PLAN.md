# MODELLI-M3-B — consumer canonico del ragionamento

Codex D ·08/10 02:04→02:34, massimo30min o3tentativi. Base0eccaaa3f2c70cde293d80c053707bfa421bd874,bridge1.42.0;113-1codex/modelli-m3-b,solo perimetro assegnato. Dipendenze installate dalla coordinatrice. Nessun cambio versione/package/lock/dist nel worktree autore; build/pack in copia privata.

## Risultato e compatibilità

Costante AGENT_CHAT_MODEL_SLOT_ID nel modulo agent-model-configuration esistente; ModelSlotIdSchema resta generico e invariato per non rompere le selezioni già valide. Altri ID mem0_* sono solo wildcard nel commento: elenco preciso richiesto alla coordinatrice, nessun consumer memoria finto. Nuovo model-consumers.ts esporta schema e tipo di metadata consumer (slotId/capability/function/requirements), registry schema bounded/univoco, costante capability agent-core e consumer reasoning con tools=true,stream=false,structuredOutput=false. Letture registro detached e lookup esatto per slot, unknown/invalid restituisce undefined. Registro descrive un requisito del consumer, non supporto/accesso di un modello, installazione o applied. Nessun provider,modello,chiave,prezzo o stato personale/default incorporato.

## R-31 e prove

Registro server unico e neutro rispetto ad agente/owner/tenant; i consumer X9/M5 lo importano e lo legano alle loro identità autorevoli, senza dedurre uno scope dalla costante. La sola voce connessa richiesta è ragionamento; assenza dello slot sconosciuto non diventa fallback. Modelli memoria/embedding/audio restano fuori M3 e unsupported fino a consumer qualificato M4. Streamingfalse significa che il consumer conserva il fallbackcomplete esistente, non supporto tokenstream del modello.

Test prima del codice con API Reflect sull'entrypoint pubblico: valori esatti delle costanti e requirements; strict unknown/top-level/nested; sintassi slot/capability/function; campi required; uniqueness/bound/empty; lookup exact senza family inference; clone di registry e lookup; immutabilità consumer costante; tutti gli export accessibili anche da root. Ogni nuovo controllo qualificato con mutazione semantica AssertionError, hash ripristinato e verde dopo ogni caso. Errori import/runtime/timeout non accreditati. Test preservano i contratti preesistenti e non fanno dipendere fixtures legacy dal nuovo consumer. Full Vitest worker1, typecheck/lint, ESM/CJS/dts e pack privati; smoke ESM/CJS nuove esportazioni. Audit perimetro/protetti/sorgenti/base/package invarianti.

Dopo ogni commit prodotto: PLAN/SUMMARY aggiornati,committati,riletti. Consegna congelata per revisione nonautore;rilascio1.43 solo coordinatrice. M3X9 importa poi quel rilascio e il fixM2,non vendor manuale. Nessun server/browser/provider/.env/secrets/harness/push/merge/deploy.
