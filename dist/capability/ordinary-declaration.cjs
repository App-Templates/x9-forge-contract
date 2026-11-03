"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityOrdinaryDeclarationSchema = void 0;
exports.checkOrdinaryDeclarationCompatibility = checkOrdinaryDeclarationCompatibility;
exports.capabilityOrdinaryDeclarationOf = capabilityOrdinaryDeclarationOf;
const zod_1 = require("zod");
const parameters_js_1 = require("./parameters.cjs");
const ordinary_configuration_js_1 = require("./ordinary-configuration.cjs");
/** One complete declaration for ordinary-v2, including typed structured settings. B1 stays unchanged. */
exports.CapabilityOrdinaryDeclarationSchema = zod_1.z.object({
    ...parameters_js_1.CapabilityParametersDeclarationSchema.shape,
    parameters: zod_1.z.array(ordinary_configuration_js_1.CapabilityOrdinaryDefinitionSchema).max(100),
}).strict().superRefine((declaration, ctx) => {
    if (new Set(declaration.parameters.map(item => item.key)).size !== declaration.parameters.length) {
        ctx.addIssue({ code: 'custom', path: ['parameters'], message: 'Ordinary declaration keys must be unique' });
    }
});
function checkOrdinaryDeclarationCompatibility(input, ctx) {
    if (!input.parameters || !input.ordinaryParameters)
        return;
    for (const legacy of input.parameters.parameters) {
        const current = input.ordinaryParameters.parameters.find(item => item.key === legacy.key);
        if (!current || !(0, ordinary_configuration_js_1.sameOrdinaryData)(current, legacy)) {
            ctx.addIssue({ code: 'custom', path: ['ordinaryParameters'], message: 'The complete ordinary declaration must retain every B1 definition unchanged' });
        }
    }
}
const fields = zod_1.z.object({
    parameters: parameters_js_1.CapabilityParametersDeclarationSchema.optional(),
    ordinaryParameters: exports.CapabilityOrdinaryDeclarationSchema.optional(),
}).passthrough().superRefine(checkOrdinaryDeclarationCompatibility);
/** Null means not declared; an explicitly empty parameter array means a known parameter-free capability. */
function capabilityOrdinaryDeclarationOf(input) {
    const parsed = fields.parse(input);
    return parsed.ordinaryParameters ?? parsed.parameters ?? null;
}
//# sourceMappingURL=ordinary-declaration.js.map