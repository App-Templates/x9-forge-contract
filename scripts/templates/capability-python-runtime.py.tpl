"""Generated canonical bridge subset. Do not maintain domain schemas in this runtime."""
import base64
import copy
import hashlib
import json
import math
import re
from datetime import datetime, date
from urllib.parse import urlparse, urlencode, quote

CATALOG = json.loads(base64.b64decode('__CATALOG_BASE64__'))
CATALOG_SHA256 = '__CATALOG_SHA256__'
_MISSING = object()
_KEYWORDS = {'$schema', '$defs', '$ref', 'type', 'properties', 'required', 'additionalProperties',
             'propertyNames', 'items', 'minItems', 'maxItems', 'minLength', 'maxLength', 'pattern',
             'format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
             'anyOf', 'oneOf', 'allOf', 'not', 'const', 'enum', 'default', 'description', 'title'}


def verify_catalog_hash(expected=CATALOG_SHA256):
    raw = json.dumps(CATALOG, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode('utf-8')
    if hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError('Portable catalog integrity mismatch')


def _schema_supported(schema, depth=0):
    if depth > 100 or not isinstance(schema, (dict, bool)):
        raise ValueError('Unsupported portable schema')
    if isinstance(schema, bool):
        return
    if set(schema) - _KEYWORDS:
        raise ValueError('Unsupported JSON Schema keyword')
    if '$ref' in schema and not schema['$ref'].startswith('#/'):
        raise ValueError('Remote JSON Schema reference forbidden')
    if 'pattern' in schema:
        # A JS-only pattern needs a canonical portable codec, never a permissive fallback.
        try:
            re.compile(schema['pattern'])
        except re.error as exc:
            raise ValueError('Unsupported portable pattern') from exc
    if schema.get('format') not in (None, 'uuid', 'date-time', 'date', 'uri', 'url'):
        raise ValueError('Unsupported portable format')
    for key in ('$defs', 'properties'):
        for child in schema.get(key, {}).values():
            _schema_supported(child, depth + 1)
    for key in ('items', 'additionalProperties', 'propertyNames', 'not'):
        if key in schema:
            _schema_supported(schema[key], depth + 1)
    for key in ('anyOf', 'oneOf', 'allOf'):
        for child in schema.get(key, []):
            _schema_supported(child, depth + 1)


def _equal(left, right):
    if isinstance(left, bool) or isinstance(right, bool):
        return type(left) is type(right) and left == right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return left == right
    if isinstance(left, dict) and isinstance(right, dict):
        return left.keys() == right.keys() and all(_equal(left[key], right[key]) for key in left)
    if isinstance(left, list) and isinstance(right, list):
        return len(left) == len(right) and all(_equal(a, b) for a, b in zip(left, right))
    return type(left) is type(right) and left == right


def _json_value(value, depth=0):
    if depth > 100:
        raise ValueError('JSON value exceeds bounded recursion')
    if value is None or type(value) in (bool, int, str):
        return
    if type(value) is float and math.isfinite(value):
        return
    if isinstance(value, list):
        for item in value:
            _json_value(item, depth + 1)
        return
    if isinstance(value, dict) and all(isinstance(key, str) for key in value):
        for item in value.values():
            _json_value(item, depth + 1)
        return
    raise ValueError('Expected finite JSON data')


def _validate(schema, value, root, depth=0):
    if depth > 100:
        raise ValueError('Portable value exceeds bounded recursion')
    if schema is False:
        raise ValueError('Value forbidden by schema')
    if schema is True:
        return copy.deepcopy(value)
    if 'not' in schema:
        try:
            _validate(schema['not'], value, root, depth + 1)
        except ValueError:
            pass
        else:
            raise ValueError('Value forbidden by negative schema')
    if '$ref' in schema:
        target = root
        for key in schema['$ref'][2:].split('/'):
            target = target[key.replace('~1', '/').replace('~0', '~')]
        return _validate(target, value, root, depth + 1)
    if 'anyOf' in schema or 'oneOf' in schema:
        valid = []
        for child in schema.get('anyOf', schema.get('oneOf', [])):
            try:
                valid.append(_validate(child, value, root, depth + 1))
            except ValueError:
                pass
        if not valid or ('oneOf' in schema and len(valid) != 1):
            raise ValueError('Value does not match schema union')
        value = valid[0]
    for child in schema.get('allOf', []):
        value = _validate(child, value, root, depth + 1)
    kind = schema.get('type')
    if isinstance(kind, list):
        return _validate({'anyOf': [dict(schema, type=item) for item in kind]}, value, root, depth + 1)
    if kind == 'null' and value is not None:
        raise ValueError('Expected null')
    if kind == 'boolean' and type(value) is not bool:
        raise ValueError('Expected boolean')
    if kind in ('number', 'integer'):
        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) or (kind == 'integer' and value != int(value)):
            raise ValueError('Expected finite number without coercion')
        for key, passes in [('minimum', lambda bound: value >= bound), ('maximum', lambda bound: value <= bound),
                            ('exclusiveMinimum', lambda bound: value > bound), ('exclusiveMaximum', lambda bound: value < bound)]:
            if key in schema and not passes(schema[key]):
                raise ValueError('Number outside bounds')
        if 'multipleOf' in schema and value % schema['multipleOf'] != 0:
            raise ValueError('Number is not a multiple')
    if kind == 'string':
        if not isinstance(value, str):
            raise ValueError('Expected string')
        length = len(value.encode('utf-16-le', errors='surrogatepass')) // 2
        if length < schema.get('minLength', 0) or length > schema.get('maxLength', math.inf):
            raise ValueError('String length outside bounds')
        if 'pattern' in schema and re.search(schema['pattern'], value) is None:
            raise ValueError('String pattern mismatch')
        fmt = schema.get('format')
        try:
            if fmt == 'uuid' and not re.fullmatch(r'[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}', value):
                raise ValueError('Invalid UUID')
            if fmt == 'date-time':
                datetime.fromisoformat(value.replace('Z', '+00:00'))
            if fmt == 'date':
                date.fromisoformat(value)
            if fmt in ('uri', 'url') and not urlparse(value).scheme:
                raise ValueError('Invalid URL')
            if fmt == 'time':
                raise ValueError('Time format needs a qualified canonical codec')
        except (ValueError, OverflowError) as exc:
            raise ValueError('String format mismatch') from exc
    if kind == 'array':
        if not isinstance(value, list) or len(value) < schema.get('minItems', 0) or len(value) > schema.get('maxItems', math.inf):
            raise ValueError('Array shape or length mismatch')
        value = [_validate(schema.get('items', True), item, root, depth + 1) for item in value]
    if kind == 'object':
        if not isinstance(value, dict) or any(not isinstance(key, str) for key in value):
            raise ValueError('Expected JSON object')
        properties = schema.get('properties', {})
        value = copy.deepcopy(value)
        for key, child in properties.items():
            if key not in value and 'default' in child:
                value[key] = copy.deepcopy(child['default'])
        if any(key not in value for key in schema.get('required', [])):
            raise ValueError('Required field missing')
        for key in value:
            if 'propertyNames' in schema:
                _validate(schema['propertyNames'], key, root, depth + 1)
            child = properties.get(key, schema.get('additionalProperties', True))
            value[key] = _validate(child, value[key], root, depth + 1)
    if 'const' in schema and not _equal(value, schema['const']):
        raise ValueError('Constant mismatch')
    if 'enum' in schema and not any(_equal(value, item) for item in schema['enum']):
        raise ValueError('Enum mismatch')
    return value


def _at(value, path):
    if path == '':
        return value
    for key in path.split('.'):
        if not isinstance(value, dict) or key not in value:
            return _MISSING
        value = value[key]
    return value


def _internal(name, value):
    schema = CATALOG['contracts'][name]['schema']
    _schema_supported(schema)
    return _validate(schema, value, schema)


def _request_binding(request, omitted):
    return {key: value for key, value in request.items() if key not in omitted}


def _receipt_semantics(receipt):
    policy = CATALOG['contracts']['lifecycleReceipt']['rules'][0]
    request, state = receipt['request'], receipt['ordinaryState']
    for left, right in policy['targetBindings']:
        if not _equal(_at(receipt, left), _at(receipt, right)):
            raise ValueError('Lifecycle receipt target mismatch')
    if not _equal(_at(receipt, policy['runtimeBinding'][0]), _at(receipt, policy['runtimeBinding'][1])):
        raise ValueError('Lifecycle runtime identity mismatch')
    if (receipt['status'] == 'pending') != (receipt['outcome'] == 'in-progress'):
        raise ValueError('Lifecycle pending effect is ambiguous')
    if receipt['membershipEffective'] != 'unknown' and receipt['observedAt'] is None:
        raise ValueError('Membership requires consumer evidence')
    if request['phase'] in policy['preparationPhases'] and (receipt['membershipEffective'] != 'unknown' or receipt['observedAt'] is not None):
        raise ValueError('Preparation cannot attest candidate membership')
    if request['phase'] == 'activate' and receipt['outcome'] == 'ok' and receipt['status'] == 'complete':
        if receipt['membershipEffective'] != request['targetMembership'] or receipt['observedAt'] is None:
            raise ValueError('Activation requires confirmed target membership')
    if request.get('operation'):
        expected = request['operation']['execution'] if request['targetMembership'] == 'enabled' else 'stopped'
        if request['phase'] in policy['preparationPhases']:
            if receipt.get('executionEffective') != 'unknown':
                raise ValueError('Preparation cannot attest execution')
        elif request['phase'] == 'activate' and receipt['status'] == 'complete' and receipt['outcome'] == 'ok' and (receipt.get('executionEffective') != expected or receipt['observedAt'] is None):
            raise ValueError('Activation requires actual execution evidence')
    if receipt['membershipEffective'] in policy['inactiveMemberships'] and state['runtimeState'] != 'unloaded':
        raise ValueError('Inactive membership cannot attest loaded runtime')


def _lifecycle_request(request, authority, rule):
    authority = _internal('lifecycleAuthority', authority)
    if not _equal(_at(request, rule['runtimeBinding'][0]), _at(request, rule['runtimeBinding'][1])):
        raise ValueError('Lifecycle runtime identity mismatch')
    for left, right in rule['authorityBindings']:
        if not _equal(_at(request, left), _at(authority, right)):
            raise ValueError('Lifecycle authority binding mismatch')
    transition, transaction = request['transition'], authority['transaction']
    operation = request.get('operation')
    if operation and operation['action'] in rule['sameBundleActions']:
        if not _equal(transition['from'], transition['to']):
            raise ValueError('Runtime command cannot change the loaded bundle')
    elif not (operation and operation['action'] in rule['reloadActions'] and _equal(transition['from'], transition['to'])) and transition['from'] is not None and transition['to']['appliedVersion'] <= transition['from']['appliedVersion']:
        raise ValueError('Lifecycle candidate must advance')
    if transaction is not None:
        retained = _request_binding(transaction['request'], rule['ignoredBindingFields'])
        if not _equal(retained, _request_binding(request, rule['ignoredBindingFields'])) or any(not _equal(_at(transaction, left), _at(request, right)) for left, right in rule['previousStateBindings']):
            raise ValueError('Lifecycle immutable transaction mismatch')
        phases = set()
        for receipt in transaction['receipts']:
            _receipt_semantics(receipt)
            phase = receipt['request']['phase']
            if phase in phases or not _equal(_request_binding(receipt['request'], rule['ignoredBindingFields']), retained) or any(not _equal(_at(receipt, field), _at(transaction, field)) for field in rule['receiptFenceFields']):
                raise ValueError('Lifecycle receipt fence or binding mismatch')
            phases.add(phase)
        if transaction['state'] in rule['ambiguousStates'] or any(receipt['status'] == 'pending' for receipt in transaction['receipts']):
            raise ValueError('Reconcile ambiguous consumer before effects or retry')
        replay = next((receipt for receipt in transaction['receipts'] if receipt['request']['phase'] == request['phase']), None)
        if replay is not None:
            return dict(replay, replayed=True)
    if request['phase'] == 'prepare':
        if transaction is not None or not _equal(authority['current'], transition['from']):
            raise ValueError('Lifecycle prepare slot/from conflict')
    else:
        if transaction is None or transaction['state'] not in rule['phaseOrder'][request['phase']]:
            raise ValueError('Lifecycle phase order conflict')
        expected = transition['to'] if transaction['state'] == 'activated' else transition['from']
        if not _equal(authority['current'], expected):
            raise ValueError('Lifecycle effective bundle changed')
    return None


def _lifecycle_receipt(receipt, authority):
    _receipt_semantics(receipt)
    if not isinstance(authority, dict) or set(authority) != {'request', 'transaction'}:
        raise ValueError('Lifecycle receipt transaction authority required')
    request = _internal('lifecycleRequest', authority['request'])
    transaction = _internal('lifecycleTransaction', authority['transaction'])
    runtime = CATALOG['contracts']['lifecycleRequest']['rules'][0]['runtimeBinding']
    if not _equal(_at(transaction['request'], runtime[0]), _at(transaction['request'], runtime[1])):
        raise ValueError('Retained lifecycle runtime identity mismatch')
    for retained in transaction['receipts']:
        _receipt_semantics(retained)
    policy = CATALOG['contracts']['lifecycleReceipt']['rules'][0]
    if not _equal(receipt['request'], request) or any(not _equal(_at(receipt, field), _at(transaction, field)) for field in policy['fenceFields']):
        raise ValueError('Lifecycle receipt binding/fence mismatch')
    if receipt['outcome'] != 'ok' or receipt['status'] != 'complete':
        return
    if request['phase'] in policy['preparationPhases'] and not _equal(receipt['ordinaryState'], transaction['previousState']):
        raise ValueError('Preparation cannot attest candidate state')
    if request['phase'] == 'rollback':
        if request.get('operation') and (receipt.get('executionEffective') != transaction.get('previousExecution', 'unknown') or receipt['observedAt'] is None):
            raise ValueError('Rollback execution not confirmed')
        if receipt['membershipEffective'] != transaction['previousMembership'] or receipt['observedAt'] is None:
            raise ValueError('Rollback membership not confirmed')
        if request['transition']['from'] is None and receipt['ordinaryState']['runtimeState'] != 'unloaded':
            raise ValueError('First activation rollback must restore absence')


def _rules(value, rules, authority):
    for rule in rules:
        if rule['op'] == 'max_properties':
            target = _at(value, rule['path'])
            if not isinstance(target, dict) or len(target) > rule['max']:
                raise ValueError('Ordinary key count mismatch')
        elif rule['op'] == 'equal_paths':
            left, right = _at(value, rule['left']), _at(value, rule['right'])
            if left is _MISSING or right is _MISSING or not _equal(left, right):
                raise ValueError('Ordinary scope mismatch')
        elif rule['op'] == 'authority_equal':
            if authority is None:
                raise ValueError('Authenticated loaded authority is required')
            schema = CATALOG['contracts']['ordinarySnapshot']['schema']
            checked = _validate(schema, authority, schema)
            target = _at(value, rule['path'])
            if target is _MISSING or not _equal(target, checked):
                raise ValueError('Ordinary authority/version/keyset/value mismatch')
        elif rule['op'] == 'normalize_integer':
            target = _at(value, rule['path'])
            if isinstance(target, str):
                if not re.fullmatch(r'[1-9][0-9]*', target):
                    raise ValueError('Expected canonical positive integer')
                target = int(target)
            checked = _validate(rule['schema'], target, rule['schema'])
            container = value
            parts = rule['path'].split('.')
            for part in parts[:-1]:
                container = container[part]
            container[parts[-1]] = checked
        elif rule['op'] == 'authority_lookup':
            if not isinstance(authority, dict) or set(authority) != {'lookup', 'identity'}:
                raise ValueError('Authenticated lookup and expected identity are required')
            checked = dict(lookup=validate_contract('authorityQuery', authority['lookup']),
                           identity=_validate(rule['identitySchema'], authority['identity'], rule['identitySchema']))
            for binding in rule['bindings']:
                actual, expected = _at(value, binding['path']), _at(checked, binding['authorityPath'])
                if actual is _MISSING or expected is _MISSING or not _equal(actual, expected):
                    raise ValueError('Authority reply does not match retained lookup')
        elif rule['op'] == 'membership_call':
            if not isinstance(authority, dict) or set(authority) != {'lookup', 'identity', 'response'}:
                raise ValueError('Authenticated membership lookup is required')
            response = validate_contract('authorityResponse', authority['response'], authority=dict(lookup=authority['lookup'], identity=authority['identity']))
            if response['membership'] != 'enabled' or response['capability'] != rule['capability'] or 'ordinaryConfiguration' in value:
                raise ValueError('RAG membership/configuration mismatch')
            if any(value[key] != response['scope'][key] for key in ('tenantId', 'ownerId', 'agentId')):
                raise ValueError('RAG call scope mismatch')
        elif rule['op'] == 'lifecycle_request':
            _lifecycle_request(value, authority, rule)
        elif rule['op'] == 'lifecycle_receipt':
            _lifecycle_receipt(value, authority)
        else:
            raise ValueError('Unsupported portable semantic rule')


def validate_contract(name, value, *, authority=None):
    verify_catalog_hash()
    _json_value(value)
    if authority is not None:
        _json_value(authority)
    contract = CATALOG['contracts'].get(name)
    if not contract or not contract['supported'] or contract['gates'] or contract['schema'] is None:
        raise ValueError('Contract is outside the qualified portable subset')
    _schema_supported(contract['schema'])
    parsed = _validate(contract['schema'], value, contract['schema'])
    _rules(parsed, contract['rules'], authority)
    return parsed


def validate_lifecycle_request(value, *, authority):
    """Use this decision, including replay, before invoking a durable consumer effect."""
    parsed = validate_contract('lifecycleRequest', value, authority=authority)
    rule = CATALOG['contracts']['lifecycleRequest']['rules'][0]
    return dict(request=parsed, replay=_lifecycle_request(parsed, authority, rule))


def portable_transport(name, params, *, query=None):
    """Resolve only canonical relative paths; callers supply configured origins/authentication."""
    verify_catalog_hash()
    contract = CATALOG['transports'].get(name)
    if contract is None:
        raise ValueError('Unknown portable transport')
    schema = contract['paramsSchema']
    _schema_supported(schema)
    checked = _validate(schema, params, schema)
    path = contract['path']
    for key, value in checked.items():
        path = path.replace(':' + key, quote(value, safe=''))
    if ':' in path:
        raise ValueError('Missing canonical route parameter')
    if 'queryContract' in contract:
        checked_query = validate_contract(contract['queryContract'], query)
        path += '?' + urlencode(checked_query)
    elif query is not None:
        raise ValueError('Unexpected transport query')
    return dict(method=contract['method'], path=path, authHeader=contract['authHeader'])


verify_catalog_hash()
for _contract in CATALOG['contracts'].values():
    if _contract['supported']:
        _schema_supported(_contract['schema'])
        for _rule in _contract['rules']:
            if _rule['op'] not in {'max_properties', 'equal_paths', 'authority_equal', 'normalize_integer', 'authority_lookup', 'membership_call', 'lifecycle_request', 'lifecycle_receipt'}:
                raise ValueError('Unsupported portable semantic rule')
            for _schema_key in ('schema', 'identitySchema'):
                if _schema_key in _rule:
                    _schema_supported(_rule[_schema_key])
