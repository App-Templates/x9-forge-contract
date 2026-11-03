"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelChainSchema = exports.MODEL_CHAIN_ADAPTER_IDS = exports.LAB_ANTHROPIC_MESSAGES_ADAPTER_ID = exports.LAB_DIGEST_RELAY_CHAIN_ID = exports.ModelChainStepSchema = exports.ModelChainIdSchema = exports.ModelChainEffortSchema = exports.MODEL_CHAIN_EFFORTS = exports.ModelChainStepRoleSchema = exports.MODEL_CHAIN_STEP_ROLES = void 0;
exports.modelChainAcceptsAdapter = modelChainAcceptsAdapter;
// Catena di modelli a passaggi fissi: bozza, critica di un altro modello, chiusura. Nessun id di modello qui.
const zod_1 = require("zod");
const model_catalog_js_1 = require("./model-catalog.cjs");
exports.MODEL_CHAIN_STEP_ROLES = ['draft', 'critique', 'close'];
exports.ModelChainStepRoleSchema = zod_1.z.enum(exports.MODEL_CHAIN_STEP_ROLES);
exports.MODEL_CHAIN_EFFORTS = ['low', 'medium', 'high'];
exports.ModelChainEffortSchema = zod_1.z.enum(exports.MODEL_CHAIN_EFFORTS);
exports.ModelChainIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
exports.ModelChainStepSchema = zod_1.z.object({
    role: exports.ModelChainStepRoleSchema,
    descriptor: model_catalog_js_1.ModelDescriptorSchema,
    effort: exports.ModelChainEffortSchema,
}).strict();
exports.LAB_DIGEST_RELAY_CHAIN_ID = 'lab_digest_relay';
exports.LAB_ANTHROPIC_MESSAGES_ADAPTER_ID = 'lab-anthropic-messages';
/** The only adapters a chain accepts, when it is not "any supported adapter". */
exports.MODEL_CHAIN_ADAPTER_IDS = Object.freeze({
    [exports.LAB_DIGEST_RELAY_CHAIN_ID]: Object.freeze(['lab-openai-responses', exports.LAB_ANTHROPIC_MESSAGES_ADAPTER_ID]),
});
/** true when the chain has no adapter restriction, or the adapter is one of its allowed ones. */
function modelChainAcceptsAdapter(chainId, adapterId) {
    if (typeof chainId !== 'string' || !Object.hasOwn(exports.MODEL_CHAIN_ADAPTER_IDS, chainId))
        return true;
    return typeof adapterId === 'string' && exports.MODEL_CHAIN_ADAPTER_IDS[chainId].includes(adapterId);
}
exports.ModelChainSchema = zod_1.z.object({
    chainId: exports.ModelChainIdSchema,
    steps: zod_1.z.array(exports.ModelChainStepSchema).length(3),
}).strict().superRefine((chain, ctx) => {
    const [draft, critique, close] = chain.steps;
    if (!exports.MODEL_CHAIN_STEP_ROLES.every((role, index) => chain.steps[index]?.role === role)) {
        ctx.addIssue({ code: 'custom', path: ['steps'], message: 'Steps must be draft, critique, close in this order' });
        return;
    }
    if ((0, model_catalog_js_1.sameModelDescriptor)(critique.descriptor, draft.descriptor) || (0, model_catalog_js_1.sameModelDescriptor)(critique.descriptor, close.descriptor)) {
        ctx.addIssue({ code: 'custom', path: ['steps', 1, 'descriptor'], message: 'The critique must come from a different model than the draft and the close' });
    }
    chain.steps.forEach((step, index) => {
        if (!modelChainAcceptsAdapter(chain.chainId, step.descriptor.adapterId)) {
            ctx.addIssue({ code: 'custom', path: ['steps', index, 'descriptor', 'adapterId'], message: 'Adapter not allowed for this chain' });
        }
    });
});
//# sourceMappingURL=model-chain.js.map