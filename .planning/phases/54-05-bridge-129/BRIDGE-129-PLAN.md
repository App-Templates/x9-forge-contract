# Bridge 1.29.0 · B1 schema dei parametri + B7 uscite e feedback (X9 54-05) — piano per Codex B (completo, autonomo)

- **Repo:** x9-forge-contract-bridge (NON forge-v2). **Worktree:** `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-12-9`
  (vedi la riga «worktree» in MESSAGGI), branch `codex/bridge-129-params-outputs`, base `origin/main` = v1.28.0 (d8ef67f).
  Creato con x9-worktree: push disattivato, hook di perimetro. **Perimetro:** `perimetri/codex_bridge-129-params-outputs.txt`.
- **Fonti (leggile tutte, sono la legge):**
  - `/Users/admintemp/Downloads/Claude/agent-x9-phase54/.planning/phases/54-cap-ricerca-lab-food/54-CONTEXT.md` (decisioni D54,
    in particolare D54-11 «tutto per AGENTE») e la riga 54-05 di `/Users/admintemp/Downloads/Claude/agent-x9-phase54/.planning/ROADMAP.md`;
  - `/Users/admintemp/Downloads/Claude/forge-v2/.claude/worktrees/charming-tesla-ab9ccd/docs/design/PIANO-SVILUPPI.md` §B (B1, B7) e
    `HANDOFF-COSTRUZIONE.md` (D-decisioni);
  - lo stile dei contratti di v1.28 già su main: `src/capability/ricerca/**`, `src/capability/lab/**`,
    `src/http/endpoints/internal-capability-agent.ts` (schemi `.strict()`, `agentId` dal bridge, `authType`, smoke ESM/CJS,
    `zshy.exports` + `exports`).

## Cosa
- **B1 — schema dei parametri dichiarato dalla capability:** per ogni parametro: chiave, etichetta, tipo e vincoli, origine
  del valore (predefinito di piattaforma / scelto per agente / va scelto), stato (deciso o proposto), da quando vale, se
  consuma (spesa). Generico per ogni capability (non solo ricerca/lab).
- **B7 — uscite + feedback + andamento:** uscite della capability per agente, feedback con fonte (vista di progetto o app di
  dominio) e voto 1-10, andamento nel tempo. Generico.
- Endpoint contract per leggerli/scriverli come in v1.28 (per AGENTE, `authType: 'secret'`, 409 sulla versione vecchia se
  serve) — solo se le fonti li prevedono; altrimenti solo schemi, scritto nel SUMMARY.

## Task (test prima e visto rosso; un commit ciascuno; SUMMARY in `STATO.md`/CHANGELOG come per v1.28 + SUMMARY nel worktree)
1. Schemi B1 + test (validi e rifiutati: valori fuori vincolo, origine sconosciuta, campi in più).
2. Schemi B7 + test (voto fuori 1-10, feedback senza fonte, campi in più).
3. Endpoint contract (se previsti) + registrazione + smoke ESM/CJS + export.
4. Versione 1.29.0 in package.json, CHANGELOG «v1.29.0 — proposta in review», `pnpm build` con dist identico alla build
   pulita, `pnpm test`, typecheck, lint, check:pack. Solo aggiunte: nessun export rimosso o rinominato.
5. Mutazioni: uno script come `scripts/mutate-54-ricerca-lab.py`, una mutazione per ogni controllo nuovo, tutte prese.

## Regole
Niente push, merge, tag, `--no-verify`, `reset --hard`. Il rilascio lo fa la coordinatrice con R-23 dopo la revisione della
sessione Samira. Max 45 minuti o 3 tentativi per task. Dubbi bloccanti: scelta più prudente + «Scelte da confermare» nel
SUMMARY. Finito: CONSEGNATO + «PRONTO PER REVISIONE».
