# CANALI-C1-B — checkpoint

08/10 00:45 · B1 preso, scadenza01:30. Base5034eef5, branchcodex/canali-c1-b, albero iniziale pulito; perimetro letto. Nessun AGENTS.md nel repo. Versione1.41 invariata. Piano approvato via posta004234. Test prima del codice, seguiti da mutazioni semantiche e ripristino. Nessun prodotto implementato/testato/live nel checkpoint iniziale.

## B1 — policy/configurazione, 00:56

Implementato: policy Telegram/email esplicite, binding canonico strict, lista vuota chiusa, fonte Rubrica metadata-only scoped/versionata e validità temporale, helper admission; campo access facoltativo dentro la configurazione canonica. Vecchi context privi di access conservati, politica esplicita invalida rifiutata; versione desiderata distinta dalla policy effettiva precedente.

Rosso iniziale:52/56casi falliti con AssertionError per schema/helper mancanti o nuovo campo rifiutato. Poi63/63casi verdi,0skip. Primo giro49/50:chat-type sopravviveva perché il segno dell'id mascherava il controllo enum; esito preservato in policy-first-campaign.json. Aggiunto witness con tipo channel e id negativo; secondo giro **50/50**mutazioni semantiche in UN giro completo, ogni mutante seguito da ripristino63/63 e SHA identici. Prova policy-mutation-proof.json, runner mutate.py/casi policy-mutations.json, lograw privati /private/tmp/codex-b-canali-c1-b-mutations/policy.

Regressione contratti agente **1093/1093**casi, nessun fallimento/skip; typecheck e lint mirato exit0. Non sommare la regressione alle63nuove prove giàincluse. Build completo e suite totale solo alla chiusuraB3. Tutti i conteggi da JSON runner; nessun provider/live eseguito.

Scelte da confermare: Rubrica completa oggi è un contratto per il producer futuro, non sorgente implementata. Membership esatta/normalizzata, partial/unavailable non autorizzano nessuno. Lo snapshot riuserà attestation/config via composizione nel nuovo requests.ts (nessun edit fuori perimetro). Build nativa in copia privata approvata posta005304; dist/versione/package restano alla coordinatrice.
