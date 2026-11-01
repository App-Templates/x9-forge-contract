import { z } from 'zod';
/**
 * Birth signal of an agent that is born WITH its models (R&D heirs: Lab, Ricerca, BU of the `ricerca-lab` profile).
 *
 * The owner of the birth is Forge: the deploy job that is at its `reload-agent-core` step says "this is the first
 * publication of the models of configuration version N" and agent-core publishes them with closed admission. A restored
 * context, a restart or a retry after the confirmation carries no signal, so it can never be mistaken for a birth.
 */
export declare const AgentBirthDeployJobIdSchema: z.ZodString;
export declare const AgentBirthSignalSchema: z.ZodObject<{
    deployJobId: z.ZodString;
    configVersion: z.ZodNumber;
}, z.core.$strict>;
export type AgentBirthSignal = z.infer<typeof AgentBirthSignalSchema>;
/**
 * What agent-core answers once the birth models are published and confirmed: the request that published them and the
 * configuration version it published. A reload of a birth without this receipt is not a concluded birth.
 */
export declare const AgentBirthModelsReceiptSchema: z.ZodObject<{
    requestId: z.ZodString;
    configVersion: z.ZodNumber;
}, z.core.$strict>;
export type AgentBirthModelsReceipt = z.infer<typeof AgentBirthModelsReceiptSchema>;
//# sourceMappingURL=agent-birth.d.ts.map