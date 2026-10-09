"""Exercise the generated module as a real Python importer, without copied schemas."""
import copy
import importlib.util
import sys
import unittest

MODULE_PATH = sys.argv.pop(1) if len(sys.argv) > 1 and sys.argv[1].endswith('.py') else None


class GeneratedContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not MODULE_PATH:
            raise RuntimeError('Run with the generated Python module path; never silently skip')
        spec = importlib.util.spec_from_file_location('generated_capability_contracts', MODULE_PATH)
        cls.contracts = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.contracts)

    def setUp(self):
        self.scope = dict(tenantId='tenant-a', ownerId='owner-a', agentId='agent-a')
        self.snapshot = dict(scope=self.scope, capability='rag', version=7, values={'query.topK': 5})
        self.call = dict(callId='call-1', tool='rag_query', input={}, agentId='agent-a',
                         sessionId='session-1', tenantId='tenant-a', ownerId='owner-a',
                         ordinaryConfiguration=self.snapshot)

    def test_import_and_preserve_outer_scope_and_ordinary_values(self):
        actual = self.contracts.validate_contract('ordinaryToolCall', self.call, authority=self.snapshot)
        self.assertEqual(actual, self.call)

    def test_missing_authority_and_missing_snapshot_fail_closed(self):
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('ordinaryToolCall', self.call)
        value = dict(self.call)
        value.pop('ordinaryConfiguration')
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('ordinaryToolCall', value, authority=self.snapshot)

    def test_wrong_scope_version_capability_keyset_or_value(self):
        changes = [dict(version=8), dict(capability='news'), dict(values={}),
                   dict(values={'query.topK': 6}), dict(scope=dict(self.scope, ownerId='foreign'))]
        for change in changes:
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.contracts.validate_contract('ordinaryToolCall', self.call, authority=dict(self.snapshot, **change))
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('ordinaryToolCall', dict(self.call, ownerId='foreign'), authority=self.snapshot)

    def test_no_integer_boolean_coercion(self):
        for version in (True, 1.5, '7'):
            with self.subTest(version=version), self.assertRaises(ValueError):
                bad = dict(self.snapshot, version=version)
                self.contracts.validate_contract('ordinaryToolCall', dict(self.call, ordinaryConfiguration=bad), authority=bad)

    def test_real_rag_query_schema_default_and_bounds(self):
        query = dict(corpus_id='00000000-0000-4000-8000-000000000001', query='Find evidence')
        self.assertEqual(self.contracts.validate_contract('ragQueryRequest', query)['top_k'], 5)
        for top_k in (True, 0, 21, '5'):
            with self.subTest(top_k=top_k), self.assertRaises(ValueError):
                self.contracts.validate_contract('ragQueryRequest', dict(query, top_k=top_k))

    def test_unsupported_contract_and_ir_fail_closed(self):
        for name in ('configuration',):
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.contracts.validate_contract(name, {})
        original = copy.deepcopy(self.contracts.CATALOG)
        try:
            self.contracts.CATALOG['contracts']['ordinaryToolCall']['rules'].append({'op': 'unknown'})
            with self.assertRaises(ValueError):
                self.contracts.validate_contract('ordinaryToolCall', self.call, authority=self.snapshot)
        finally:
            self.contracts.CATALOG = original

    def test_schema_keyword_and_hash_tampering_fail_closed(self):
        original = copy.deepcopy(self.contracts.CATALOG)
        try:
            self.contracts.CATALOG['contracts']['ordinaryToolCall']['schema']['unknownKeyword'] = True
            with self.assertRaises(ValueError):
                self.contracts.validate_contract('ordinaryToolCall', self.call, authority=self.snapshot)
        finally:
            self.contracts.CATALOG = original
        with self.assertRaises(ValueError):
            self.contracts.verify_catalog_hash('0' * 64)

    def test_authority_lookup_binding_without_invented_rag_settings(self):
        identity = dict(managementAgentId='managed-a', runtimeAgentId='agent-a')
        query = dict(view='ordinary-authority', tenantId='tenant-a', ownerId='owner-a', runtimeAgentId='agent-a',
                     capability='rag', requestId='request-1', bundleVersion='7', bundleSha256='a' * 64)
        response = dict(scope=self.scope, identity=identity, capability='rag', requestId='request-1',
                        bundle=dict(appliedVersion=7, sha256='a' * 64), membership='enabled', configuration=None)
        context = dict(lookup=query, identity=identity)
        self.assertEqual(self.contracts.validate_contract('authorityQuery', query)['bundleVersion'], 7)
        route = self.contracts.portable_transport('authority', {'agentId': 'managed-a'}, query=query)
        self.assertEqual(route['method'], 'GET')
        self.assertIn('bundleVersion=7', route['path'])
        self.assertEqual(self.contracts.validate_contract('authorityResponse', response, authority=context), response)
        for change in (dict(ownerId='foreign'), dict(bundleVersion=8), dict(bundleSha256='b' * 64), dict(requestId='request-2')):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.contracts.validate_contract('authorityResponse', response, authority=dict(context, lookup=dict(query, **change)))
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('authorityResponse', response)
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('authorityResponse', dict(response, configuration={}), authority=context)
        for membership in ('disabled', 'removed'):
            value = dict(response, membership=membership)
            self.assertEqual(self.contracts.validate_contract('authorityResponse', value, authority=context)['membership'], membership)

    def test_json_numbers_compare_without_bool_confusion(self):
        authority = dict(self.snapshot, values={'query.topK': 5.0})
        self.assertEqual(self.contracts.validate_contract('ordinaryToolCall', self.call, authority=authority), self.call)

    def test_rag_call_without_settings_uses_real_membership_authority(self):
        identity = dict(managementAgentId='managed-a', runtimeAgentId='agent-a')
        lookup = dict(view='ordinary-authority', tenantId='tenant-a', ownerId='owner-a', runtimeAgentId='agent-a',
                      capability='rag', requestId='request-1', bundleVersion=7, bundleSha256='a' * 64)
        response = dict(scope=self.scope, identity=identity, capability='rag', requestId='request-1',
                        bundle=dict(appliedVersion=7, sha256='a' * 64), membership='enabled', configuration=None)
        context = dict(lookup=lookup, identity=identity, response=response)
        call = dict(self.call)
        call.pop('ordinaryConfiguration')
        self.assertEqual(self.contracts.validate_contract('ragToolCall', call, authority=context), call)
        for change in (dict(membership='disabled'), dict(membership='removed'), dict(capability='news')):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.contracts.validate_contract('ragToolCall', call, authority=dict(context, response=dict(response, **change)))
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('ragToolCall', call)
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('ragToolCall', self.call, authority=context)
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('ragToolCall', dict(call, ownerId='foreign'), authority=context)

    def lifecycle(self):
        identity = dict(managementAgentId='managed-a', runtimeAgentId='agent-a')
        bundle = dict(appliedVersion=7, sha256='a' * 64)
        request = dict(format='ordinary-lifecycle-v1', requestId='request-1', scope=self.scope,
                       identity=identity, capability='rag', phase='prepare',
                       transition={'from': None, 'to': bundle}, targetMembership='enabled')
        state = dict(scope=self.scope, capability='rag', desired=None, runtimeState='unloaded',
                     applied=None, failed=None, effectiveParameters=[])
        receipt = dict(request=request, operationId='operation-1', fence=1, status='complete', outcome='ok',
                       replayed=False, ordinaryState=state, membershipEffective='unknown', observedAt=None)
        transaction = dict(request=request, state='prepared', operationId='operation-1', fence=1,
                           receipts=[receipt], previousState=state, previousMembership='removed')
        authority = dict(scope=self.scope, identity=identity, capability='rag', requestId='request-1', bundle=bundle,
                         membership='enabled', configuration=None, current=None, transaction=None)
        return request, authority, transaction, receipt

    def test_lifecycle_prepare_replay_order_and_immutable_fence(self):
        request, authority, transaction, receipt = self.lifecycle()
        self.assertIsNone(self.contracts.validate_lifecycle_request(request, authority=authority)['replay'])
        for change in (dict(scope=dict(self.scope, ownerId='foreign')), dict(requestId='request-2'), dict(capability='news')):
            with self.subTest(authority=change), self.assertRaises(ValueError):
                self.contracts.validate_lifecycle_request(request, authority=dict(authority, **change))
        retained = dict(authority, transaction=transaction)
        replay = self.contracts.validate_lifecycle_request(request, authority=retained)['replay']
        self.assertTrue(replay['replayed'])
        suspend = dict(request, phase='suspend')
        self.assertIsNone(self.contracts.validate_lifecycle_request(suspend, authority=retained)['replay'])
        old = dict(appliedVersion=6, sha256='b' * 64)
        with self.assertRaises(ValueError):
            self.contracts.validate_lifecycle_request(dict(suspend, transition={'from': old, 'to': authority['bundle']}),
                                                      authority=dict(retained, current=old))
        for change in (dict(requestId='request-2'), dict(scope=dict(self.scope, ownerId='foreign')),
                       dict(configuration={}), dict(phase='activate')):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.contracts.validate_lifecycle_request(dict(request, **change), authority=retained)
        for changed_tx in (dict(transaction, state='pending'), dict(transaction, state='ambiguous'),
                           dict(transaction, receipts=[dict(receipt, fence=2)]),
                           dict(transaction, receipts=[dict(receipt, status='pending', outcome='in-progress')])):
            with self.subTest(transaction=changed_tx), self.assertRaises(ValueError):
                self.contracts.validate_lifecycle_request(suspend, authority=dict(authority, transaction=changed_tx))
        for state in ('pending', 'ambiguous'):
            with self.subTest(replay_state=state), self.assertRaises(ValueError):
                self.contracts.validate_lifecycle_request(request, authority=dict(authority, transaction=dict(transaction, state=state)))

    def test_lifecycle_activate_and_rollback_fence_newer_bundle(self):
        request, authority, transaction, receipt = self.lifecycle()
        activate = dict(request, phase='activate')
        self.assertIsNone(self.contracts.validate_lifecycle_request(activate, authority=dict(authority, transaction=dict(transaction, state='suspended')))['replay'])
        rollback = dict(request, phase='rollback')
        activated = dict(authority, current=authority['bundle'], transaction=dict(transaction, state='activated'))
        self.assertIsNone(self.contracts.validate_lifecycle_request(rollback, authority=activated)['replay'])
        with self.assertRaises(ValueError):
            self.contracts.validate_lifecycle_request(rollback, authority=dict(activated, current=dict(appliedVersion=8, sha256='b' * 64)))

    def test_lifecycle_receipt_requires_consumer_membership_evidence(self):
        request, authority, transaction, receipt = self.lifecycle()
        binding = dict(request=request, transaction=transaction)
        self.assertEqual(self.contracts.validate_contract('lifecycleReceipt', receipt, authority=binding), receipt)
        activate = dict(request, phase='activate')
        confirmed = dict(receipt, request=activate, membershipEffective='enabled', observedAt='2026-10-09T00:00:00Z')
        activation_binding = dict(request=activate, transaction=transaction)
        self.assertEqual(self.contracts.validate_contract('lifecycleReceipt', confirmed, authority=activation_binding), confirmed)
        for change in (dict(observedAt=None), dict(fence=2), dict(membershipEffective='unknown')):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.contracts.validate_contract('lifecycleReceipt', dict(confirmed, **change), authority=activation_binding)
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('lifecycleReceipt', dict(receipt, membershipEffective='enabled', observedAt='2026-10-09T00:00:00Z'), authority=binding)


    def test_operational_commands_keep_bundle_and_bind_authenticated_intent(self):
        request, authority, transaction, receipt = self.lifecycle()
        operation = dict(action='stop', execution='stopped')
        bundle = authority['bundle']
        request = dict(request, operation=operation, transition={'from': bundle, 'to': bundle})
        authority = dict(authority, operation=operation, current=bundle)
        self.assertEqual(self.contracts.validate_lifecycle_request(request, authority=authority)['request'], request)
        for change in (dict(operation=None), dict(operation=dict(action='start', execution='running'))):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.contracts.validate_lifecycle_request(request, authority=dict(authority, **change))
        changed = dict(bundle, appliedVersion=8)
        with self.assertRaises(ValueError):
            self.contracts.validate_lifecycle_request(dict(request, transition={'from': bundle, 'to': changed}), authority=dict(authority, bundle=changed))
        with self.assertRaises(ValueError):
            self.contracts.validate_lifecycle_request(dict(request, operation=dict(action='stop', execution='running')), authority=authority)

    def test_operational_receipt_requires_observed_execution_and_restores_previous(self):
        request, authority, transaction, receipt = self.lifecycle()
        request = dict(request, phase='activate', operation=dict(action='apply-config', execution='stopped'), transition={'from': dict(appliedVersion=6, sha256='b' * 64), 'to': authority['bundle']})
        state = dict(receipt['ordinaryState'], runtimeState='loaded')
        transaction = dict(transaction, request=dict(request, phase='prepare'), previousState=state, previousMembership='enabled', previousExecution='running')
        receipt = dict(receipt, request=request, ordinaryState=state, membershipEffective='enabled', executionEffective='stopped', observedAt='2026-10-10T00:00:00Z')
        context = dict(request=request, transaction=transaction)
        self.assertEqual(self.contracts.validate_contract('lifecycleReceipt', receipt, authority=context), receipt)
        for execution in ('running', None):
            with self.subTest(execution=execution), self.assertRaises(ValueError):
                self.contracts.validate_contract('lifecycleReceipt', dict(receipt, executionEffective=execution), authority=context)
        rollback = dict(request, phase='rollback')
        result = dict(receipt, request=rollback, membershipEffective='enabled', executionEffective='running')
        self.assertEqual(self.contracts.validate_contract('lifecycleReceipt', result, authority=dict(context, request=rollback)), result)
        with self.assertRaises(ValueError):
            self.contracts.validate_contract('lifecycleReceipt', dict(result, executionEffective='stopped'), authority=dict(context, request=rollback))

if __name__ == '__main__':
    unittest.main()
