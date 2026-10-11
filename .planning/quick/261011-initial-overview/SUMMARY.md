# Initial model overview — shared contract
Canonical plan: forge-v2-bacheca/piani/HOTFIX-MODELLI-RIGHE-1110-PLAN.md.
Adds origin initial and optional nullable initial settings; old row payloads remain valid.
Initial rows require a selection, no saved/applied/version/default/inheritance evidence.
Capability/function binding also applies to the initial selection; producer enforces Master eligibility.
Version remains 1.47.0; no pin, publication, push, merge or deploy.
Validation: 5622/5622 Vitest, build/dts 402/402 portable files, typecheck exit 0.
New cases: 12/12; baseline 1/112 failed on the missing representation.
Mutation removing initial evidence checks: 6/112 failed; restored focused 112/112.
Existing CJS smoke exit 0, including 14 surfaces/356 assertions for model composition.
Local artifact: /private/tmp/codex-a-rows/x9-forge-contracts-1.47.0.tgz.
## Fruibilità alla consegna (R-34)
Contract supports current choices without falsely labeling them saved/applied.
X9 producer and Forge consumer plus independent F review and coordinated live release remain required.
