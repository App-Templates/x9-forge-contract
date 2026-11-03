# Callback causal boundary — local delivery
Request D 20261011-195610; branch codex/bridge-native-ordinary-f, follows the ordinary native codec.
Changed only the event lower bound from conversation.attachedAt to original binding.boundAt.
Receipt ordering, original mapping/conversation correlation and freshness helper remain unchanged.
Callback product delta: +1/-1 line; tests +28/-0 (three cases); removed two trailing blank lines in codec leaves.

## Validation
Baseline: 2/7 failed with assertion mismatches, 5/7 passed; targeted final 23/23 passed.
Causal-boundary and received-time mutations: 2/2 caught, each 1/1 selected assertion red.
Build and generator passed; portable declarations 498/498, types passed, lint 2/2 files passed.
Final suite: 6105/6105 tests, 223/223 files, 68.06s; CJS smoke passed.
Packed archive: 50/50 ESM/CJS probes, Python 15/15, attw passed, dist parity 1994/1994.
No version bump, consumer changes, push, publication or deployment.

## Fruibilità alla consegna (R-34)
The ordinary codec and callback fix are included together in the second installable archive.
An authentic event between admission and claim validates on retry after the original claim is available.
Tests use existing synthetic production-shaped opening/mapping fixtures, never real provider credentials.
Signature verification, consumer retry/503 behavior and live operation remain D's responsibility.
Final independent review pending; R20 perimeter authorized by coordinator 20:06; final range diff check passed.
Ultimo aggiornamento: 20:08 — ready for separate local callback commit after 6e3f15d.
