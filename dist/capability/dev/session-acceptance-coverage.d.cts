import { z } from 'zod';
import type { DevSessionAcceptanceInput } from "./session-acceptance.cjs";
export declare const DEV_SESSION_COVERAGE_IDENTITY: readonly ["ingresso", "navigazione", "risultato"];
/** Coverage follows requested inputs, not the email's preview quota. */
export declare function devSessionCoverageSlots(input: DevSessionAcceptanceInput): string[];
export declare const DevSessionCoverageImageSchema: z.ZodObject<{
    path: z.ZodString;
    sha256: z.ZodString;
    covers: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
/** Extra declarations cannot satisfy a different requested slot. */
export declare function devSessionCoverageMissing(slots: readonly string[], images: readonly z.infer<typeof DevSessionCoverageImageSchema>[]): string[];
//# sourceMappingURL=session-acceptance-coverage.d.ts.map