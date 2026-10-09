import { z } from 'zod';
import { CapabilityParametersDeclarationSchema } from "./parameters.js";
import { CapabilityOrdinaryDefinitionSchema, sameOrdinaryData } from "./ordinary-configuration.js";
/** One complete declaration for ordinary-v2, including typed structured settings. B1 stays unchanged. */
export const CapabilityOrdinaryDeclarationSchema = z.object({
    ...CapabilityParametersDeclarationSchema.shape,
    parameters: z.array(CapabilityOrdinaryDefinitionSchema).max(100),
}).strict().superRefine((declaration, ctx) => {
    if (new Set(declaration.parameters.map(item => item.key)).size !== declaration.parameters.length) {
        ctx.addIssue({ code: 'custom', path: ['parameters'], message: 'Ordinary declaration keys must be unique' });
    }
});
export function checkOrdinaryDeclarationCompatibility(input, ctx) {
    if (!input.parameters || !input.ordinaryParameters)
        return;
    for (const legacy of input.parameters.parameters) {
        const current = input.ordinaryParameters.parameters.find(item => item.key === legacy.key);
        if (!current || !sameOrdinaryData(current, legacy)) {
            ctx.addIssue({ code: 'custom', path: ['ordinaryParameters'], message: 'The complete ordinary declaration must retain every B1 definition unchanged' });
        }
    }
}
const fields = z.object({
    parameters: CapabilityParametersDeclarationSchema.optional(),
    ordinaryParameters: CapabilityOrdinaryDeclarationSchema.optional(),
}).passthrough().superRefine(checkOrdinaryDeclarationCompatibility);
/** Null means not declared; an explicitly empty parameter array means a known parameter-free capability. */
export function capabilityOrdinaryDeclarationOf(input) {
    const parsed = fields.parse(input);
    return parsed.ordinaryParameters ?? parsed.parameters ?? null;
}
//# sourceMappingURL=ordinary-declaration.js.map