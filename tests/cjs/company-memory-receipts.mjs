/*
 * Synthetic executable contract sequence, using only public compiled exports.
 * Adoption points documented by tasks 173–176, still pending in X9:
 * - 170: correlate experience receipts in organization-experience-delivery before acknowledgement.
 * - 245: correlate knowledge publish/withdraw receipts before advancing reconciliation.
 * - 250: correlate material publication in organization/publication-service before advancing it.
 * - 254: correlate resolve responses before exposing text in memory_resolve_published.
 * Those repositories must wire the helpers and verify real data independently.
 * No HTTP success is simulated; ESM/CJS checks do not attest a service or live data.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

assert.ok(process.argv.slice(2).every(arg => arg === '--self-test'), 'Only --self-test is supported');
const selfTest = process.argv.includes('--self-test');
const root = fileURLToPath(new URL('../../', import.meta.url));

// Serialized into each fresh child; no source imports or parent module cache.
function exercise(assert, organization, http, selfTest, format) {
  const helpers = {
    isExperienceReceiptForEvent: organization.isExperienceReceiptForEvent,
    isKnowledgePublishReceiptForRequest: http.isKnowledgePublishReceiptForRequest,
    isKnowledgeWithdrawReceiptForRequest: http.isKnowledgeWithdrawReceiptForRequest,
    isPublishMaterialResponseForRequest: organization.isPublishMaterialResponseForRequest,
    isResolveMaterialResponseForRequest: organization.isResolveMaterialResponseForRequest,
  };
  for (const [name, helper] of Object.entries(helpers)) {
    assert.equal(typeof helper, 'function', `Public helper missing: ${name}`);
  }

  function scenario(active) {
    let passed = 0;
    const total = 28; // Behavioral assertions only; schema preconditions are not counted.
    const equal = (actual, expected, label) => {
      assert.equal(actual, expected, label);
      passed++;
    };
    const valid = (schema, payload, label) => {
      assert.equal(schema.safeParse(payload).success, true, `schema:${label}`);
      return payload;
    };
    const correlate = (name, receipt, request, expected, label) => {
      equal(active[name](receipt, request), expected, `correlation:${name}:${label}`);
    };
    const context = organization.OrganizationRunContextSchema.parse({
      schemaVersion: 1,
      runId: 'synthetic-run',
      organizationId: 'synthetic-org',
      ownerId: 'synthetic-owner',
      identity: { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime' },
      issuer: 'x9',
      issuedAt: '2026-10-15T10:00:00.000Z',
      expiresAt: '2026-10-15T11:00:00.000Z',
    });
    const digest = 'a'.repeat(64);
    const foreignDigest = 'b'.repeat(64);
    const text = 'Synthetic run completed: the refund procedure was confirmed.';
    const event = http.InternalMemoryExperienceRequestSchema.parse({
      tenantId: 'synthetic-tenant', organizationId: context.organizationId,
      recordId: 'synthetic-experience', version: 1, digest,
      occurredAt: context.issuedAt, visibility: 'private_to_producer', kind: 'run_outcome',
      runId: context.runId, attemptId: 'synthetic-attempt',
      outcome: {
        runId: context.runId, attemptId: 'synthetic-attempt', status: 'succeeded',
        evidence: [], consumption: [], recordedAt: context.issuedAt,
      },
    });
    const experienceReceipt = {
      recordId: event.recordId, version: event.version, digest: event.digest, disposition: 'stored',
    };
    for (const disposition of ['stored', 'duplicate']) {
      const receipt = valid(http.InternalMemoryExperienceResponseSchema,
        { ...experienceReceipt, disposition }, `experience ${disposition}`);
      correlate('isExperienceReceiptForEvent', receipt, event, true, disposition);
    }
    for (const change of [{ recordId: 'foreign-experience' }, { version: 2 }, { digest: foreignDigest }]) {
      const receipt = valid(http.InternalMemoryExperienceResponseSchema,
        { ...experienceReceipt, ...change }, 'foreign experience receipt');
      correlate('isExperienceReceiptForEvent', receipt, event, false, Object.keys(change)[0]);
    }

    const knowledge = organization.KnowledgePublicationSchema.parse({
      ref: {
        context, sourceScope: 'team', slug: 'synthetic-refund-procedure', version: 2, digest,
        recipient: { kind: 'organization', id: context.organizationId },
      },
      kind: 'procedure', status: 'current', validFrom: context.issuedAt,
      evidence: [{ kind: 'experience', id: event.recordId, digest: event.digest }],
    });
    const publish = http.InternalMemoryKnowledgePublishRequestSchema.parse({ context, publication: knowledge });
    const withdraw = http.InternalMemoryKnowledgeWithdrawRequestSchema.parse({
      context, ref: knowledge.ref, reason: 'Synthetic procedure superseded',
    });
    const knowledgeReceipt = {
      slug: knowledge.ref.slug, version: knowledge.ref.version, digest: knowledge.ref.digest,
      disposition: 'stored',
    };
    for (const [name, request] of [
      ['isKnowledgePublishReceiptForRequest', publish],
      ['isKnowledgeWithdrawReceiptForRequest', withdraw],
    ]) {
      for (const disposition of ['stored', 'duplicate']) {
        const receipt = valid(http.InternalMemoryKnowledgeReceiptSchema,
          { ...knowledgeReceipt, disposition }, `knowledge ${disposition}`);
        correlate(name, receipt, request, true, disposition);
      }
      for (const change of [{ slug: 'foreign-knowledge' }, { version: 3 }, { digest: foreignDigest }]) {
        const receipt = valid(http.InternalMemoryKnowledgeReceiptSchema,
          { ...knowledgeReceipt, ...change }, 'foreign knowledge receipt');
        correlate(name, receipt, request, false, Object.keys(change)[0]);
      }
    }

    const material = organization.PublishMaterialRequestSchema.parse({
      context, sourceScope: knowledge.ref.sourceScope, slug: knowledge.ref.slug,
      recipient: knowledge.ref.recipient, digest: knowledge.ref.digest,
      contentRef: 'synthetic-report-content',
    });
    const { contentRef: _contentRef, ...materialFields } = material;
    const publication = valid(organization.PublishMaterialResponseSchema,
      { status: 'published', ref: { ...materialFields, version: 7 } }, 'material publication');
    correlate('isPublishMaterialResponseForRequest', publication, material, true, 'assigned version');
    equal(publication.ref.version, 7, 'Material version is assigned as 7');
    for (const change of [
      { slug: 'foreign-material' },
      { recipient: { ...material.recipient, id: 'foreign-org' } },
      { recipient: { ...material.recipient, kind: 'group' } },
      { digest: foreignDigest },
    ]) {
      const receipt = valid(organization.PublishMaterialResponseSchema,
        { ...publication, ref: { ...publication.ref, ...change } }, 'foreign material receipt');
      correlate('isPublishMaterialResponseForRequest', receipt, material, false, JSON.stringify(change));
    }

    const resolve = organization.ResolveMaterialRequestSchema.parse({ context, ref: publication.ref });
    const resolved = valid(http.internalPublicationResolveContract.responseSchema, {
      status: 'ok', ref: publication.ref, digest: publication.ref.digest,
      content: { mediaType: 'text/plain', text }, contentDigest: digest,
    }, 'resolved report');
    correlate('isResolveMaterialResponseForRequest', resolved, resolve, true, 'report');
    equal(resolved.content.text, text, 'Resolved text equals the synthetic report');
    assert.deepEqual(resolved.ref, resolve.ref, 'Resolved reference equals the exact requested reference');
    passed++;
    for (const response of [
      { ...resolved, ref: { ...resolved.ref, version: 8 } },
      { ...resolved, ref: { ...resolved.ref, digest: foreignDigest } },
      { ...resolved, digest: foreignDigest },
      { status: 'revoked', message: 'Synthetic publication revoked' },
    ]) {
      valid(organization.ResolveMaterialResponseSchema, response, 'foreign or revoked resolve');
      correlate('isResolveMaterialResponseForRequest', response, resolve, false, JSON.stringify(response));
    }
    assert.equal(passed, total, 'Every written behavioral assertion must execute');
    return { passed, total };
  }

  if (selfTest) {
    let detected = 0;
    const total = 5;
    for (const name of Object.keys(helpers)) {
      let failure;
      try {
        scenario({ ...helpers, [name]: () => true });
      } catch (error) {
        failure = error;
      }
      assert.ok(failure instanceof assert.AssertionError, `Mutation ${name} must cause an assertion failure`);
      assert.equal(failure.code, 'ERR_ASSERTION', `Mutation ${name} must not fail at loading`);
      assert.ok(failure.message.startsWith(`correlation:${name}:`),
        `Mutation ${name} must fail its own correlation assertion: ${failure.message}`);
      assert.equal(failure.actual, true);
      assert.equal(failure.expected, false);
      detected++;
    }
    assert.equal(detected, total, 'All five helper bypasses must be detected');
    console.log(`${format} self-test ${detected}/${total} correlation mutations detected`);
  }
  const { passed, total } = scenario(helpers);
  console.log(`${format} ${passed}/${total} synthetic behavioral assertions`);
}

for (const format of ['import', 'require']) {
  const load = format === 'import'
    ? `import assert from 'node:assert/strict';
       import * as organization from '@x9-forge/contracts/organization';
       import * as http from '@x9-forge/contracts/http';`
    : `const assert = require('node:assert/strict');
       const organization = require('@x9-forge/contracts/organization');
       const http = require('@x9-forge/contracts/http');`;
  const source = `${load}\n(${exercise.toString()})(assert, organization, http, ${selfTest}, ${JSON.stringify(format)});`;
  const args = [...(format === 'import' ? ['--input-type=module'] : ['--input-type=commonjs']), '-e', source];
  const child = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0,
    `${format} compiled contracts failed (${child.error?.message ?? child.signal ?? 'child exit'}):\n${child.stderr}`);
  process.stdout.write(child.stdout);
}
