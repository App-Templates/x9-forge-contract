---
phase: 35-capabilities-c
plan: "01"
type: execute
autonomous: true
---
# Capabilities: contratto e trasporto effettivo
## Esistente (R-35)
Base bridge A24. Riusa B1, scope canonico, workspace/registry, Apply, requestId e GET/PUT per agente.
I riferimenti dettagliati sono i documenti bridge e structured nella fase35 del worktree Forge; valgono come ricerca, non come ulteriori piani.
## Esecuzione
1. Ordinary-v2: parametri/provenienza Master/CAS/state/effective, GET/PUT espliciti, tool call next_apply e workspace additivi.
2. Lifecycle remoto: prepare/suspend/activate/rollback legati al candidato verificato e ricevute/fence server; autorità autenticata della sola capability trattenuta da CoreApply, hash canonico condiviso.
3. Setting structured con codec dei veri consumer, unica revisione per cap insieme ai primitivi; Python derivato solo per confini effettivamente usati, nessun mirror manuale.
4. Export compilati, build/package locale per X9 e Forge, prova compatibilità ESM/CJS. Versione privata locale, nessun push/tag/release.
Test nuovi prima del codice, mirati+typecheck durante sviluppo, mutazioni sicurezza/permessi, suite completa e review indipendente a fine funzione. Nessun ulteriore plan-check o accordo exact-diff; avvisi ai proprietari dei file condivisi. SUMMARY massimo30righe.
## Fruibilità (R-34)
Il bridge abilita elenco/configurazione/membership di tutte le cap applicabili senza chiamare modello o Vault.
Saved, effective per chiave e applied intero restano separati; mixed non è applied.
La prova utente con dati in forma produzione si completa in X9 e Forge; il contratto isolato non completa il requisito.
