# Initial model overview — shared contract
Canonical plan: forge-v2-bacheca/piani/HOTFIX-MODELLI-RIGHE-1110-PLAN.md, coordinator correction 20:35.
Adds origin initial and optional nullable initial settings; old row payloads remain valid.
Initial rows require readonly, a selection, and no saved/applied/version/default/inheritance evidence.
Capability/function binding applies to the initial selection. CAS0 was reverted; expectedVersion remains positive.
Version remains 1.47.0; no pin, publication, push, merge or deploy.
Validation: 5623/5623 Vitest across183/183 files; focused113/113; types exit0; build402/402 portable dts.
Readonly baseline:1/113 failed before the new guard; CAS0 requests and previews rejected.
Prior evidence-guard mutation:6/112 failed; capability/function mutation:2/119 failed; restored.
Existing CJS smoke exit0, including14 surfaces/356 assertions for model composition.
Local artifact: /private/tmp/codex-a-rows/x9-forge-contracts-1.47.0-initial-readonly.tgz.
## Fruibilità alla consegna (R-34)
Contract represents current choices without claiming persistence; initial rows cannot be edited.
First save uses the existing Apply drawer, then Models can edit saved configurations.
X9 producer and Forge consumer, independent F review and coordinated live release remain required.
Manual correction measure: product1added/1removed; tests10added/3removed; SUMMARY16lines; generated dist excluded.
