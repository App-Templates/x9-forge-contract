"""Reviewed B1/B7/lab guards: one serial run in a temporary shadow, compact assertion evidence."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import re
import runpy
import shutil
import signal
import subprocess
import sys
import tempfile
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / '.planning/phases/54-05-bridge-129'
legacy = runpy.run_path(str(ROOT / 'scripts/mutate-54-05.py'), run_name='review_definitions')
M = legacy['M']
P, B, H = legacy['P'], legacy['B'], legacy['H']
L = 'src/capability/lab/agent-config.ts'
T = 'src/capability/lab/tools.ts'
R = 'src/capability/ricerca/agent-config.ts'
S = 'src/capability/ricerca/spend.ts'

def edit(file, before, after):
    return dict(file=file, before=before, after=after)

def replace(identifier, file, before, after, extra=()):
    for mutation in M:
        if mutation['id'] == identifier:
            mutation['edits'] = [edit(file, before, after), *extra]
            return
    raise ValueError(identifier)

def add(identifier, file, before, after, extra=()):
    M.append(dict(id=identifier, edits=[edit(file, before, after), *extra]))

# Preserve all 133 original invariant IDs, updating anchors to reviewed schemas.
replace('B1-key', P, 'z.string().max(100).regex(/^[a-z][a-zA-Z0-9_.-]*$/)', 'z.string().max(100)')
for prefix, file in [('B1', P), ('B7', B)]:
    replace(prefix+'-labels', file, 'const TextSchema = z.string().trim().min(1).max(200);', 'const TextSchema = z.string().trim().max(200);')
replace('B1-value-type', P, 'z.union([z.number().finite(), z.string().max(8000), z.boolean(), ListValueSchema])', 'z.any()')
replace('B1-reference-required', P, '  reference: DescriptionSchema,', '  reference: DescriptionSchema.optional(),')
replace('B1-consumes-required', P, '  appliesWhen: CapabilityParameterApplicationSchema,\n  consumes: z.boolean(),', '  appliesWhen: CapabilityParameterApplicationSchema,\n  consumes: z.boolean().optional(),')
replace('B1-strict-string', P, 'platformDefault: z.string().max(8000).optional() }).strict()', 'platformDefault: z.string().max(8000).optional() })')
replace('B1-strict-enum', P, 'platformDefault: z.string().max(2000).optional() }).strict()', 'platformDefault: z.string().max(2000).optional() })')
replace('B1-string-bound-integer', P, 'minLength: z.number().int().nonnegative().max(8000).optional()', 'minLength: z.number().nonnegative().max(8000).optional()')
replace('B1-string-bound-positive', P, 'maxLength: z.number().int().nonnegative().max(8000).optional()', 'maxLength: z.number().int().max(8000).optional()')
replace('B1-option-count', P, 'z.array(CapabilityParameterOptionSchema).min(1).max(50)', 'z.array(CapabilityParameterOptionSchema).max(50)')
replace('B1-option-strict', P, 'z.object({ value: DescriptionSchema, label: TextSchema }).strict()', 'z.object({ value: DescriptionSchema, label: TextSchema })')
replace('B1-default-source', P, 'parameter.platformDefault === undefined || !sameValue(value, parameter.platformDefault)', 'parameter.platformDefault !== undefined && !sameValue(value, parameter.platformDefault)')
replace('B1-default-match', P, 'parameter.platformDefault === undefined || !sameValue(value, parameter.platformDefault)', 'parameter.platformDefault === undefined')
replace('B1-false-default-source', P, 'parameter.platformDefault === undefined || !sameValue(value, parameter.platformDefault)', '!parameter.platformDefault || !sameValue(value, parameter.platformDefault)')
replace('B1-capability', P, '  capability: z.string().trim().min(1).max(100),', '  capability: z.string().max(100),')
replace('B7-agent-id', B, 'agentId: CapabilityAgentIdSchema, capability: IdSchema', 'agentId: z.string(), capability: IdSchema')
replace('B7-capability-required', B, 'agentId: CapabilityAgentIdSchema, capability: IdSchema', 'agentId: CapabilityAgentIdSchema, capability: IdSchema.optional()')
replace('B7-source-strict', B, '  id: IdSchema,\n}).strict();', '  id: IdSchema,\n});')
replace('B7-kind-strict', B, '  key: CapabilityParameterKeySchema, label: TextSchema, description: DescriptionSchema,\n}).strict();', '  key: CapabilityParameterKeySchema, label: TextSchema, description: DescriptionSchema,\n});')
replace('B7-field-strict', B, '}).strict().superRefine((field, ctx)', '}).superRefine((field, ctx)')
replace('B7-output-declaration-strict', B, '  fields: z.array(CapabilityOutputFieldSchema).max(100),\n}).strict()', '  fields: z.array(CapabilityOutputFieldSchema).max(100),\n})')
replace('B7-feedback-kind', B, '  kind: CapabilityFeedbackKindSchema,', '  kind: z.string(),')
replace('B7-summary-required', B, '  summary: z.string().max(2000),', '  summary: z.string().max(2000).optional(),')
replace('B7-output-strict', B, "{ message: 'serialized content exceeds 64 KiB' }),\n}).strict();", "{ message: 'serialized content exceeds 64 KiB' }),\n});")
replace('B7-reviewer-required', B, '  reviewerId: IdSchema,', '  reviewerId: IdSchema.optional(),')
replace('B7-output-id-required', B, '  outputId: IdSchema,', '  outputId: IdSchema.optional(),')
replace('B7-feedback-strict', B, "kind: z.literal('rating'), rating: z.number().int().min(1).max(10) }).strict()", "kind: z.literal('rating'), rating: z.number().int().min(1).max(10) })")
replace('B7-output-time', B, '  summary: z.string().max(2000),\n  createdAt: z.iso.datetime(),', '  summary: z.string().max(2000),\n  createdAt: z.string(),')
replace('B7-feedback-time', B, '  comment: z.string().max(2000).optional(),\n  createdAt: z.iso.datetime(),', '  comment: z.string().max(2000).optional(),\n  createdAt: z.string(),')
for plural, schema in [('outputs','CapabilityOutputSchema'), ('feedback','CapabilityFeedbackSchema'), ('series','CapabilityTrendSeriesSchema')]:
    replace('B7-strict-'+plural, B, f'  ...scope, {plural}: z.array({schema}).max(CAPABILITY_PRESENTATION_PAGE_SIZE),\n}}).strict()', f'  ...scope, {plural}: z.array({schema}).max(CAPABILITY_PRESENTATION_PAGE_SIZE),\n}})')

# The reviewed caps are individual guards, including wire-only boundaries.
def drop_max(identifier, file, anchor, limit):
    add(identifier, file, anchor, anchor.replace('.max('+limit+')',''))
drop_max('B1-key-length', P, 'CapabilityParameterKeySchema = z.string().max(100).regex', '100')
drop_max('B1-list-element-length', P, 'const ListValueSchema = z.array(z.string().max(2000)).max(100);', '2000')
drop_max('B1-list-wire-count', P, 'const ListValueSchema = z.array(z.string().max(2000)).max(100);', '100')
drop_max('B1-value-string-length', P, 'z.union([z.number().finite(), z.string().max(8000), z.boolean(), ListValueSchema])', '8000')
for prefix, file in [('B1',P),('B7',B)]:
    drop_max(prefix+'-label-length', file, 'const TextSchema = z.string().trim().min(1).max(200);', '200')
    drop_max(prefix+'-description-length', file, 'const DescriptionSchema = z.string().trim().min(1).max(2000);', '2000')
drop_max('B1-string-default-length', P, 'platformDefault: z.string().max(8000).optional()', '8000')
for key in ['minLength','maxLength']:
    drop_max('B1-'+key+'-cap', P, key+': z.number().int().nonnegative().max(8000).optional()', '8000')
drop_max('B1-options-cap', P, 'const OptionsSchema = z.array(CapabilityParameterOptionSchema).min(1).max(50);', '50')
for key, schema in [('declared','CapabilityParameterSchema'), ('resolved','CapabilityAgentParameterSchema')]:
    drop_max('B1-'+key+'-cap', P, 'parameters: z.array('+schema+').max(100)', '100')
drop_max('B1-capability-length', P, 'capability: z.string().trim().min(1).max(100)', '100')
add('B1-description-required', P, 'const DescriptionSchema = z.string().trim().min(1).max(2000);', 'const DescriptionSchema = z.string().trim().max(2000);')
# Enum default length is also guaranteed by membership in bounded option values: remove both for this invariant.
add('B1-enum-default-length', P, 'platformDefault: z.string().max(2000).optional()', 'platformDefault: z.string().optional()', [edit(P, 'const DescriptionSchema = z.string().trim().min(1).max(2000);', 'const DescriptionSchema = z.string().trim().min(1);')])
add('B1-optional-required', P, '  optional: z.boolean(),', '  optional: z.boolean().optional(),')
add('B1-optional-type', P, '  optional: z.boolean(),', '  optional: z.any(),')
add('B1-optional-absence', P, "origin === 'agent_override' && parameter.optional && value === undefined", 'false')
add('B1-required-absence', P, "origin === 'agent_override' && parameter.optional && value === undefined", "origin === 'agent_override' && value === undefined")
add('B1-editor-role', P, "z.enum(['superadmin', 'owner'])", 'z.string()')
add('B1-editors-required', P, "editableBy: z.array(CapabilityParameterEditorRoleSchema).min(1).max(2)\n    .refine(roles => new Set(roles).size === roles.length, 'editor roles must be unique')", "editableBy: z.array(CapabilityParameterEditorRoleSchema).min(1).max(2)\n    .refine(roles => new Set(roles).size === roles.length, 'editor roles must be unique').optional()")
add('B1-editors-nonempty', P, 'z.array(CapabilityParameterEditorRoleSchema).min(1).max(2)', 'z.array(CapabilityParameterEditorRoleSchema).max(2)')
add('B1-editors-unique', P, 'new Set(roles).size === roles.length', 'true')
# Three roles necessarily duplicate the two-role enum; the count and uniqueness implement the same cap.
add('B1-editors-cap', P, 'z.array(CapabilityParameterEditorRoleSchema).min(1).max(2)', 'z.array(CapabilityParameterEditorRoleSchema).min(1)', [edit(P,'new Set(roles).size === roles.length','true')])
add('B1-list-strict', P, 'pattern: PatternSchema.optional(), platformDefault: ListValueSchema.optional() }).strict()', 'pattern: PatternSchema.optional(), platformDefault: ListValueSchema.optional() })')
for key in ['minItems','maxItems']:
    anchor=key+': z.number().int().nonnegative().max(100).optional()'
    drop_max('B1-'+key+'-cap', P, anchor, '100')
    add('B1-'+key+'-integer', P, anchor, anchor.replace('.int()',''))
    add('B1-'+key+'-nonnegative', P, anchor, anchor.replace('.nonnegative()',''))
add('B1-list-bounds-order', P, 'parameter.minItems > parameter.maxItems', 'false')
add('B1-list-value-type', P, 'return Array.isArray(value)\n', 'return !Array.isArray(value) || Array.isArray(value)\n')
add('B1-list-minimum', P, 'value.length >= parameter.minItems', 'true')
add('B1-list-maximum', P, 'value.length <= parameter.maxItems', 'true')
add('B1-list-pattern', P, 'matches(parameter.pattern, item)', 'true')
add('B1-list-membership', P, 'parameter.options === undefined || parameter.options.some(option => option.value === item)', 'true')
add('B1-string-pattern', P, 'matches(parameter.pattern, value)', 'true')
add('B1-pattern-nonempty', P, 'const PatternSchema = z.string().min(1).max(200)', 'const PatternSchema = z.string().max(200)')
drop_max('B1-pattern-length', P, 'const PatternSchema = z.string().min(1).max(200)', '200')
add('B1-pattern-syntax', P, "try { new RegExp(pattern); return true; } catch { return false; }", 'return true;')
add('B1-list-default-equality', P, 'left.length === right.length && left.every((item, index) => item === right[index])', 'true')

drop_max('B7-id-length', B, 'const IdSchema = z.string().trim().min(1).max(100);', '100')
add('B7-id-required', B, 'const IdSchema = z.string().trim().min(1).max(100);', 'const IdSchema = z.string().trim().max(100);')
drop_max('B7-kinds-cap', B, 'kinds: z.array(CapabilityOutputKindSchema).min(1).max(50)', '50')
drop_max('B7-fields-cap', B, 'fields: z.array(CapabilityOutputFieldSchema).max(100)', '100')
drop_max('B7-metrics-cap', B, 'trends: z.array(CapabilityTrendMetricSchema).max(100)', '100')
drop_max('B7-points-cap', B, 'points: z.array(CapabilityTrendPointSchema).max(AGENT_SPEND_MAX_DAYS)', 'AGENT_SPEND_MAX_DAYS')
for plural, schema in [('outputs','CapabilityOutputSchema'), ('feedback','CapabilityFeedbackSchema'), ('series','CapabilityTrendSeriesSchema')]:
    drop_max('B7-page-cap-'+plural, B, plural+': z.array('+schema+').max(CAPABILITY_PRESENTATION_PAGE_SIZE)', 'CAPABILITY_PRESENTATION_PAGE_SIZE')
drop_max('B7-summary-length', B, 'summary: z.string().max(2000)', '2000')
drop_max('B7-comment-length', B, 'comment: z.string().max(2000)', '2000')
add('B7-content-size', B, 'new TextEncoder().encode(JSON.stringify(content)).byteLength <= CAPABILITY_OUTPUT_CONTENT_MAX_BYTES', 'true')
add('B7-content-UTF8', B, 'new TextEncoder().encode(JSON.stringify(content)).byteLength', 'JSON.stringify(content).length')
add('B7-approval-decision', B, "z.enum(['approved', 'changes_requested'])", 'z.string()')
add('B7-approval-required', B, 'decision: CapabilityFeedbackDecisionSchema', 'decision: CapabilityFeedbackDecisionSchema.optional()')
add('B7-approval-strict', B, "kind: z.literal('approval'), decision: CapabilityFeedbackDecisionSchema }).strict()", "kind: z.literal('approval'), decision: CapabilityFeedbackDecisionSchema })")
add('B7-reviewer-name-required', B, 'reviewerName: z.string().trim().min(1).max(200)', 'reviewerName: z.string().trim().min(1).max(200).optional()')
add('B7-reviewer-name-nonempty', B, 'reviewerName: z.string().trim().min(1).max(200)', 'reviewerName: z.string().trim().max(200)')
drop_max('B7-reviewer-name-length', B, 'reviewerName: z.string().trim().min(1).max(200)', '200')
add('B7-attachments-declaration', B, '  attachments: z.boolean(),', '  attachments: z.boolean().optional(),')
add('B7-attachments-flag-type', B, '  attachments: z.boolean(),', '  attachments: z.any(),')
drop_max('B7-attachments-cap', B, 'attachments: z.array(WebUrlSchema).max(CAPABILITY_FEEDBACK_MAX_ATTACHMENTS)', 'CAPABILITY_FEEDBACK_MAX_ATTACHMENTS')
add('B7-attachments-url', B, 'attachments: z.array(WebUrlSchema)', 'attachments: z.array(z.string())')
add('B7-attachments-optional', B, 'attachments: z.array(WebUrlSchema).max(CAPABILITY_FEEDBACK_MAX_ATTACHMENTS).optional()', 'attachments: z.array(WebUrlSchema).max(CAPABILITY_FEEDBACK_MAX_ATTACHMENTS)')
# A third source duplicates the two-value enum; remove both checks for the declared cap.
add('B7-sources-cap', B, 'sources: z.array(CapabilityFeedbackSourceKindSchema).min(1).max(2)', 'sources: z.array(CapabilityFeedbackSourceKindSchema).min(1)', [edit(B,'new Set(feedback.sources).size === feedback.sources.length','true')])
for key in ['min','max']:
    add('B7-scale-'+key, B, '  '+key+': z.number().finite().optional(),', '  '+key+': z.any().optional(),')
add('B7-scale-type', B, "field.type !== 'number' && (field.min !== undefined || field.max !== undefined)", 'false')
add('B7-scale-order', B, 'field.min > field.max', 'false')

add('B1-minLength-nonnegative', P, 'minLength: z.number().int().nonnegative().max(8000).optional()', 'minLength: z.number().int().max(8000).optional()')
add('B1-maxLength-integer', P, 'maxLength: z.number().int().nonnegative().max(8000).optional()', 'maxLength: z.number().nonnegative().max(8000).optional()')
add('B1-list-wire-elements', P, 'const ListValueSchema = z.array(z.string().max(2000)).max(100);', 'const ListValueSchema = z.array(z.any()).max(100);')
for prefix, file in [('B1', P), ('B7', B)]:
    for schema, cap in [('TextSchema','200'),('DescriptionSchema','2000')]:
        anchor='const '+schema+' = z.string().trim().min(1).max('+cap+');'
        add(prefix+'-'+schema+'-trim', file, anchor, anchor.replace('.trim()',''))
add('B7-description-nonempty', B, 'const DescriptionSchema = z.string().trim().min(1).max(2000);', 'const DescriptionSchema = z.string().trim().max(2000);')
add('B7-id-trim', B, 'const IdSchema = z.string().trim().min(1).max(100);', 'const IdSchema = z.string().min(1).max(100);')
add('B7-reviewer-name-trim', B, 'reviewerName: z.string().trim().min(1).max(200)', 'reviewerName: z.string().min(1).max(200)')
add('B7-rating-kind-required', B, "kind: z.literal('rating'), rating:", "kind: z.literal('rating').optional(), rating:")
add('B7-approval-kind-required', B, "kind: z.literal('approval'), decision:", "kind: z.literal('approval').optional(), decision:")

# Lab deliberately corrects its still-unconsumed 1.28 contract, with shared ricerca validators.
add('LAB-usd-positive', R, 'CapabilityUsdSchema = z.number().positive().finite()', 'CapabilityUsdSchema = z.number().nonnegative().finite()')
add('LAB-usd-finite', R, 'CapabilityUsdSchema = z.number().positive().finite()', 'CapabilityUsdSchema = z.any()')
for limit, after in [('min','z.string().max(100)'), ('max','z.string().min(1)')]:
    add('LAB-model-'+limit, R, 'CapabilityModelIdSchema = z.string().min(1).max(100)', 'CapabilityModelIdSchema = '+after)
add('LAB-budget-order', L, 'b.perIngestMaxUsd <= b.dailyUsd', 'true')
add('LAB-budget-strict', L, '}).strict().refine(b =>', '}).refine(b =>')
for key in ['dailyUsd','perIngestMaxUsd']:
    # The comparison also rejects missing values. Removing both duplicate requirements isolates absence.
    add('LAB-budget-'+key+'-required', L, key+': CapabilityUsdSchema,', key+': CapabilityUsdSchema.optional(),',
        [edit(L,'b.perIngestMaxUsd <= b.dailyUsd', 'true')])
add('LAB-timezone-required', L, 'timezone: AgentTimeZoneSchema,', 'timezone: AgentTimeZoneSchema.optional(),')
add('LAB-timezone-valid', L, 'timezone: AgentTimeZoneSchema,', 'timezone: z.string(),')
add('LAB-models-strict', L, 'read: CapabilityModelIdSchema.optional(),\n}).strict()', 'read: CapabilityModelIdSchema.optional(),\n})')
add('LAB-digest-required', L, 'digest: CapabilityModelIdSchema,', 'digest: CapabilityModelIdSchema.optional(),')
add('LAB-read-optional', L, 'read: CapabilityModelIdSchema.optional(),', 'read: CapabilityModelIdSchema,')
for key, schema in [('models','LabModelsSchema'),('budget','LabBudgetSchema')]:
    add('LAB-config-'+key+'-required', L, key+': '+schema+',', key+': '+schema+'.optional(),')
add('LAB-spending-capability', S, "z.enum(['ricerca', 'lab'])", "z.enum(['ricerca'])")
add('LAB-spending-reject-unknown', S, "z.enum(['ricerca', 'lab'])", 'z.string()')
for key, value in [('authType', "'none'"), ('method', "'POST'"), ('path', "'/wrong'"), ('paramsSchema','z.object({})'), ('querySchema','z.object({})'), ('responseSchema','z.object({})')]:
    add('LAB-spend-'+key, H, 'labAgentSpendContract = { ...ricercaAgentSpendContract }', 'labAgentSpendContract = { ...ricercaAgentSpendContract, '+key+': '+value+' }')
add('LAB-tool-errors', T, "z.enum(['invalid_request', 'not_configured', 'not_found', 'not_ready'])", 'z.string()')
add('LAB-status-tool-name', T, "ingestStatus: 'lab_ingest_status'", "ingestStatus: 'wrong'")
add('LAB-ingest-uuid', T, 'LabIngestIdSchema = z.uuid()', 'LabIngestIdSchema = z.string()')
add('LAB-ingest-queued', T, "state: z.literal('queued')", 'state: ResearchStateSchema')
add('LAB-ingest-strict', T, "state: z.literal('queued'),\n}).strict()", "state: z.literal('queued'),\n})")
add('LAB-status-input-strict', T, 'z.object({ ingestId: LabIngestIdSchema }).strict()', 'z.object({ ingestId: LabIngestIdSchema })')
add('LAB-status-states', T, 'state: ResearchStateSchema,', 'state: z.string(),')
add('LAB-status-state-required', T, 'state: ResearchStateSchema,', 'state: ResearchStateSchema.optional(),')
add('LAB-status-strict', T, '}).strict().refine(result =>', '}).refine(result =>')
for key in ['sourcesStored','pagesTouched','claimsAdded']:
    for operation in ['int','nonnegative']:
        anchor=key+': z.number().int().nonnegative().optional()'
        add('LAB-count-'+key+'-'+operation, T, anchor, anchor.replace('.'+operation+'()',''))
    add('LAB-completed-'+key, T, 'result.'+key+' !== undefined', 'true')
    add('LAB-premature-'+key, T, 'result.'+key+' === undefined', 'true')
# New published symbols must resolve through each real module system.
for subpath, names in [
    ('parameters',['CapabilityParameterEditorRoleSchema']),
    ('presentation',['CapabilityOutputFieldTypeSchema','CapabilityFeedbackKindSchema','CapabilityFeedbackDecisionSchema']),
    ('ricerca',['CapabilityUsdSchema','CapabilityModelIdSchema']),
    ('lab',['LabBudgetSchema','LabModelsSchema','LabToolErrorSchema','LabIngestIdSchema','LabIngestStatusInputSchema','LabIngestStatusOutputSchema']),
]:
    file='dist/capability/'+subpath+('' if subpath in ['parameters','presentation'] else '/index')
    for name in names:
        for extension in ['.js','.cjs']:
            path=file+extension
            source=(ROOT/path).read_text()
            if extension=='.cjs':
                after=source+'\nmodule.exports = Object.fromEntries(Object.entries(module.exports).filter(([name]) => name !== '+json.dumps(name)+'));\n'
            else:
                # Rename only the ESM export name, preserving all local imports and declarations.
                anchor='export { '+name+' }'
                if anchor in source:
                    after=source.replace(anchor, 'export { '+name+' as Removed'+name+' }')
                elif 'export const '+name in source:
                    after=source.replace('export const '+name, 'const '+name)
                else:
                    lines=[line for line in source.splitlines() if line.startswith('export {') and re.search(r'\b'+name+r'\b',line)]
                    assert len(lines)==1, 'ESM export anchor: '+path+':'+name
                    after=source.replace(lines[0],re.sub(r'\b'+name+r'\b',name+' as Removed'+name,lines[0]))
            add('DIST-'+subpath+'-'+name+extension, path, source, after)

# Each remaining negative fixture is also broken where two independent layers reject it.
add('B7-unknown-rating-kind', B, "kind: z.literal('rating'), rating:", "kind: z.enum(['rating', 'other']), rating:")
add('B7-attachments-element-type', B, 'attachments: z.array(WebUrlSchema)', 'attachments: z.array(z.any())')
anchor='attachments: z.array(WebUrlSchema).max(CAPABILITY_FEEDBACK_MAX_ATTACHMENTS).optional()'
add('B7-attachments-container-type', B, anchor, "attachments: z.union([z.array(WebUrlSchema).max(CAPABILITY_FEEDBACK_MAX_ATTACHMENTS), z.unknown().refine(value => !Array.isArray(value))]).optional()")
add('B1-constrained-list-element-length', P, 'const ListValueSchema = z.array(z.string().max(2000)).max(100);', 'const ListValueSchema = z.array(z.string()).max(100);', [edit(P,'matches(parameter.pattern, item)','true')])
add('B1-unset-platform-default', P, 'value === undefined || !accepts(parameter, value)', 'value !== undefined && !accepts(parameter, value)', [edit(P,'parameter.platformDefault === undefined || !sameValue(value, parameter.platformDefault)','parameter.platformDefault !== undefined && !sameValue(value, parameter.platformDefault)')])
anchor="z.array(CapabilityParameterEditorRoleSchema).min(1).max(2)\n    .refine(roles => new Set(roles).size === roles.length, 'editor roles must be unique')"
add('B1-editors-array-type', P, anchor, "z.union(["+anchor+", z.unknown().refine(value => !Array.isArray(value))])")
for key in ['min','max']:
    add('B7-scale-'+key+'-optional', B, '  '+key+': z.number().finite().optional(),', '  '+key+': z.number().finite(),')
add('B7-unknown-type-with-scale', B, "z.enum(['text', 'number', 'boolean', 'json'])", 'z.string()', [edit(B,"field.type !== 'number' && (field.min !== undefined || field.max !== undefined)",'false')])
add('LAB-model-boundary-accepted', R, 'CapabilityModelIdSchema = z.string().min(1).max(100)', 'CapabilityModelIdSchema = z.string().min(1).max(99)')
add('LAB-ricerca-spend-preserved', S, "z.enum(['ricerca', 'lab'])", "z.enum(['lab'])")
add('LAB-ingest-id-required', T, "export const LabIngestOutputSchema = z.object({\n  ingestId: LabIngestIdSchema,", "export const LabIngestOutputSchema = z.object({\n  ingestId: LabIngestIdSchema.optional(),")
add('LAB-ingest-state-required', T, "state: z.literal('queued'),", "state: z.literal('queued').optional(),")

ALL = [*legacy['TESTS'], *sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests/capability').glob('review-*.test.ts')),
       *sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests/capability/lab').glob('review-*.test.ts'))]
B1 = [ALL[0], *[p for p in ALL if 'review-03-' in p or 'review-04-' in p or 'review-05-' in p or 'review-12-' in p]]
B7 = [ALL[1], 'tests/capability/review-12-isolated-boundaries.test.ts', *[p for p in ALL if any('review-'+n+'-' in p for n in ['01','02','03','07'])]]
LAB = [p for p in ALL if '/lab/review-' in p]
DIST = [ALL[2], ALL[3], 'tests/capability/review-11-public-exports.test.ts']

def hashes():
    paths=[ROOT/'package.json', *ROOT.joinpath('src').rglob('*'), *ROOT.joinpath('dist').rglob('*')]
    return {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()}

def compact(data, code):
    assertions=[a for r in data['testResults'] for a in r['assertionResults']]
    failed=[a for a in assertions if a['status']=='failed']
    return dict(exitCode=code, total=data['numTotalTests'], passed=data['numPassedTests'], failed=data['numFailedTests'],
        runtimeErrors=data.get('numRuntimeErrorTestSuites',0), tests={a['fullName']:a['status'] for a in assertions},
        assertionFailures=[a['fullName'] for a in failed if any('AssertionError' in m or ('__VITEST_RESOLVES__' in m and 'instead of resolving' in m) for m in a['failureMessages'])])

def run(shadow, raw, name, tests):
    report=raw/(name+'.json')
    cmd=['pnpm','-C',str(shadow),'exec','vitest','run','--maxWorkers=1','--testTimeout=60000',
         '--reporter=json','--outputFile='+str(report),*tests]
    with (raw/(name+'.log')).open('w') as log:
        p=subprocess.Popen(cmd,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
        try: code=p.wait(timeout=180)
        except subprocess.TimeoutExpired:
            os.killpg(p.pid,signal.SIGTERM)
            p.wait(timeout=10)
            raise RuntimeError('startup timeout; never counted as red: '+name)
    if not report.exists(): raise RuntimeError('missing assertion report: '+name)
    return compact(json.loads(report.read_text()),code)



def write_mutation_proof(path, proof):
    """Write one Markdown review report; all exact JSON stays in the temporary archive."""
    raw_path = Path(proof['rawEvidence']) / 'complete-proof.json'
    raw_text = json.dumps(proof, ensure_ascii=False, separators=(',', ':')) + '\n'
    raw_path.write_text(raw_text)
    rows = [
        '# FINAL-MUTATIONS · BRIDGE-129',
        '',
        'Giro unico: ' + str(proof['executed']) + '/' + str(proof['total']) + ' eseguite; '
        + str(proof['killed']) + '/' + str(proof['total']) + ' rilevate da asserzioni.',
        'Baseline: ' + str(proof.get('baselinePassed', '?')) + '/' + str(proof.get('baselineTotal', '?'))
        + '; ripristino: ' + str(proof.get('greenPassed', 'in corso')) + '/' + str(proof.get('greenTotal', '?')) + '.',
        'Sorgenti/dist originali invariati: ' + str(proof['sourceAndDistUnchanged'])
        + '; giro completo unico: ' + str(proof['singleCompleteRun'])
        + '; ripristino verde: ' + str(proof.get('greenAfter', False)) + '.',
        'Le 133/133 aggregate della prima consegna e il primo giro completo 286/286 sono soltanto storico.',
        '',
        'Runner riproducibile: scripts/mutate-54-05-review.py; nessun lotto selezionabile.',
        'Prova completa (edit, nomi e risultati): ' + str(raw_path),
        'SHA256 prova completa: ' + hashlib.sha256(raw_text.encode()).hexdigest(),
        'Report Vitest grezzi: ' + proof['rawEvidence'] + ' (archivio locale temporaneo, nessuno stack in Git).',
        'Prove durabili precedenti: git show 233ca43:.planning/phases/54-05-bridge-129/review/final-mutations.json',
        '',
        'Ogni riga riporta un assert fallito rappresentativo e il numero degli assert falliti in quel processo.',
        '',
        '| Mutazione | File | Assert falliti | Test rappresentativo |',
        '| --- | --- | --- | --- |',
    ]
    def cell(value):
        return value.replace('|', r'\|').replace('\n', ' ')
    for row in proof['mutations']:
        files = ', '.join(dict.fromkeys(change['file'] for change in row['edits']))
        sample = row['assertionFailures'][0] if row['assertionFailures'] else 'NESSUNA ASSERZIONE'
        rows.append('| ' + cell(row['id']) + ' | ' + cell(files) + ' | '
                    + str(len(row['assertionFailures'])) + ' | ' + cell(sample) + ' |')
    path.write_text('\n'.join(rows) + '\n')

def main():
    ids=[m['id'] for m in M]
    assert len(ids)==len(set(ids))
    # Read-only anchor validation is preparation, not a mutation run.
    for m in M:
        copies={}
        for c in m['edits']:
            source=copies.get(c['file'],(ROOT/c['file']).read_text())
            if source.count(c['before'])!=1: raise RuntimeError(m['id']+': anchor not unique: '+repr(c['before']))
            copies[c['file']]=source.replace(c['before'],c['after'])
    if '--check-anchors' in sys.argv:
        print('Anchors valid: '+str(len(M))); return 0
    assert not sys.argv[1:], 'Final run must include ALL mutations, never a selected union.'
    before=hashes()
    raw=Path(tempfile.mkdtemp(prefix='bridge129-final-mut-evidence-'))
    shadow=Path(tempfile.mkdtemp(prefix='bridge129-final-mut-shadow-'))
    for name in ['src','dist','tests']: shutil.copytree(ROOT/name,shadow/name)
    for name in ['package.json','vitest.config.ts']: shutil.copy2(ROOT/name,shadow/name)
    (shadow/'node_modules').symlink_to(ROOT/'node_modules',target_is_directory=True)
    EVIDENCE.mkdir(parents=True,exist_ok=True)
    started=datetime.datetime.now(ZoneInfo('Europe/Rome')).isoformat()
    baseline=run(shadow,raw,'baseline',ALL)
    assert baseline['exitCode']==0 and baseline['failed']==0 and baseline['runtimeErrors']==0
    (raw/'baseline-compact.json').write_text(json.dumps(baseline,ensure_ascii=False,indent=2)+'\n')
    records=[]
    for index, m in enumerate(M):
        originals={}
        try:
            for c in m['edits']:
                path=shadow/c['file']; source=path.read_text()
                assert source.count(c['before'])==1
                originals.setdefault(path,source); path.write_text(source.replace(c['before'],c['after']))
            tests=B1 if m['id'].startswith('B1-') else B7 if m['id'].startswith('B7-') else LAB if m['id'].startswith('LAB-') else DIST
            result=run(shadow,raw,str(index)+'-'+m['id'].replace('/','_'),tests)
            killed=result['exitCode']!=0 and bool(result['assertionFailures']) and result['runtimeErrors']==0
            records.append(dict(id=m['id'], killed=killed, assertionFailures=result['assertionFailures'],
                runtimeErrors=result['runtimeErrors'], edits=m['edits']))
            print(f"{index+1}/{len(M)} {m['id']} "+('RED assertion' if killed else 'SURVIVED/ERROR'),flush=True)
        finally:
            for path, source in originals.items(): path.write_text(source)
        proof=dict(started=started,rawEvidence=str(raw),shadow=str(shadow),baselinePassed=baseline['passed'],baselineTotal=baseline['total'],mutations=records,killed=sum(r['killed'] for r in records),
            total=len(M),executed=len(records),sourceAndDistUnchanged=hashes()==before,singleCompleteRun=False)
        write_mutation_proof(EVIDENCE/'FINAL-MUTATIONS.md', proof)
    green=run(shadow,raw,'green-after',ALL)
    proof.update(greenAfter=green['exitCode']==0 and green['failed']==0 and green['runtimeErrors']==0,
        greenPassed=green['passed'],greenTotal=green['total'],singleCompleteRun=len(records)==len(M),sourceAndDistUnchanged=hashes()==before)
    (raw/'green-compact.json').write_text(json.dumps(green,ensure_ascii=False,indent=2)+'\n')
    write_mutation_proof(EVIDENCE/'FINAL-MUTATIONS.md', proof)
    print(json.dumps({k:v for k,v in proof.items() if k!='mutations'}),flush=True)
    return 0 if proof['killed']==proof['total'] and proof['greenAfter'] and proof['sourceAndDistUnchanged'] else 1

if __name__=='__main__':
    raise SystemExit(main())
