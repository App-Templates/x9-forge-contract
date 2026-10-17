# Callback causal boundary — D request 20261011-195610
## Esistente (R-35)
Native session records server admission in binding.boundAt and conversation attachment in attachedAt.
Receipt validation currently compares event time with attachment, permanently rejecting an earlier authentic event.
## Change and evidence
Compare occurredAt with the original binding.boundAt; preserve receivedAt and exact conversation correlation.
Test the same event before claim and on retry after claim, pre-admission events and future clocks.
Observe baseline failure, one causal-boundary mutation, restored tests, build and final package checks.
Deliver a separate commit and archive; no consumer, provider, version, push or deploy changes.
## Fruibilità (R-34)
The consumer can validate an authentic retried event after its original conversation is claimed.
Only schema/helper behavior is checked locally; consumer signature/inbox/503 behavior remains D's responsibility.
