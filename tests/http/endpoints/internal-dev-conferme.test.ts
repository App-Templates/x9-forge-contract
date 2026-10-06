import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as http from '../../../src/http/index.js';
import * as endpoints from '../../../src/http/endpoints/index.js';

function cases<T>(values: readonly T[]): [T][] { return values.map(value => [value]); }

const exports = http as unknown as Record<string, unknown>;
const request = { sessionId: 'web-0123abcd' };
const confirmation = {
  richiesta: 1,
  titolo: 'Aggiorna la pagina',
  comando: 'APPROVATO',
  link: 'https://confirmations.example.test/dev/conferma',
};

function schema(name: string): z.ZodType {
  const value = exports[name];
  expect(value, name + ' must be exported by the HTTP subpath').toBeDefined();
  return value as z.ZodType;
}
function contract() {
  const value = exports.internalDevConfermeContract;
  expect(value, 'the HTTP contract must be exported').toBeDefined();
  return value as {
    method: string; path: string; authType: string;
    bodySchema: z.ZodType; responseSchema: z.ZodType;
  };
}
const parseRequest = (value: unknown) => schema('InternalDevConfermeRequestSchema').safeParse(value);
const parseResponse = (value: unknown) => schema('InternalDevConfermeResponseSchema').safeParse(value);
const responseWith = (field: string, value: unknown) => ({ conferme: [{ ...confirmation, [field]: value }] });

describe('internal dev pending confirmations contract', () => {
  it('declares the exact internal path', () => {
    expect(contract().path).toBe('/internal/dev/conferme-in-attesa');
  });
  it('uses POST for a one-time delivery request', () => {
    expect(contract().method).toBe('POST');
  });
  it('requires existing internal secret authentication', () => {
    expect(contract().authType).toBe('secret');
  });
  it('exposes the request through the standard bodySchema', () => {
    expect(contract().bodySchema).toBe(schema('InternalDevConfermeRequestSchema'));
    expect(contract().bodySchema.parse(request)).toEqual(request);
  });
  it('exposes the response schema on the contract', () => {
    expect(contract().responseSchema).toBe(schema('InternalDevConfermeResponseSchema'));
    expect(contract().responseSchema.parse({ conferme: [confirmation] })).toEqual({ conferme: [confirmation] });
  });
  it.each(cases(['InternalDevConfermeRequestSchema', 'InternalDevConfermeResponseSchema', 'internalDevConfermeContract', 'DevSignedCommandSchema']))(
    'exports the same %s through HTTP and its endpoints barrel', name => {
      expect(exports[name]).toBeDefined();
      expect((endpoints as unknown as Record<string, unknown>)[name]).toBe(exports[name]);
    },
  );
});

it('uses the public signed-command schema directly in each confirmation', () => {
  const response = schema('InternalDevConfermeResponseSchema') as z.ZodObject<{ conferme: z.ZodArray<z.ZodObject<{ comando: z.ZodType }>> }>;
  expect(response.shape?.conferme?.element?.shape?.comando).toBe(schema('DevSignedCommandSchema'));
});

it('fixes the exact public signed-command options', () => {
  const DevSignedCommandSchema = schema('DevSignedCommandSchema') as typeof http.DevSignedCommandSchema;
  expect(DevSignedCommandSchema.options).toEqual(['APPROVATO', 'SCARTATO', 'RIPRENDI']);
});

describe('pending confirmation request', () => {
  it('preserves a web session identifier', () => {
    expect(parseRequest(request).success).toBe(true);
    expect(schema('InternalDevConfermeRequestSchema').parse(request)).toEqual(request);
  });
  it('accepts the specified nonempty string without inventing a session format', () => {
    expect(parseRequest({ sessionId: 'a' }).success).toBe(true);
  });
  it.each(cases([undefined, null, 1, true, [], {}, 'web-0123abcd']))('rejects a non-object request %#', value => {
    expect(parseRequest(value).success).toBe(false);
  });
  it('requires sessionId', () => {
    expect(parseRequest({}).success).toBe(false);
  });
  it('rejects an empty sessionId', () => {
    expect(parseRequest({ sessionId: '' }).success).toBe(false);
  });
  it.each(cases([undefined, null, 1, true, [], {}]))('rejects a non-string sessionId %#', value => {
    expect(parseRequest({ sessionId: value }).success).toBe(false);
  });
  it('rejects unknown request fields', () => {
    expect(parseRequest({ ...request, extra: true }).success).toBe(false);
  });
});

describe('pending confirmation response', () => {
  it.each(cases(['APPROVATO', 'SCARTATO', 'RIPRENDI']))('accepts command %s', comando => {
    const value = responseWith('comando', comando);
    expect(parseResponse(value).success).toBe(true);
    expect(schema('InternalDevConfermeResponseSchema').parse(value)).toEqual(value);
  });
  it('accepts an empty queue', () => {
    expect(parseResponse({ conferme: [] }).success).toBe(true);
    expect(schema('InternalDevConfermeResponseSchema').parse({ conferme: [] })).toEqual({ conferme: [] });
  });
  it('preserves multiple confirmations in delivery order', () => {
    const value = { conferme: [confirmation, { ...confirmation, richiesta: 2, comando: 'RIPRENDI' }] };
    expect(parseResponse(value).success).toBe(true);
    expect(schema('InternalDevConfermeResponseSchema').parse(value)).toEqual(value);
  });
  it('accepts an empty title as specified by the string contract', () => {
    expect(parseResponse(responseWith('titolo', '')).success).toBe(true);
  });
  it.each(cases([undefined, null, 1, true, [], {}, 'conferme']))('rejects a non-object response %#', value => {
    expect(parseResponse(value).success).toBe(false);
  });
  it('requires the conferme collection', () => {
    expect(parseResponse({}).success).toBe(false);
  });
  it.each(cases([undefined, null, 1, true, {}, 'conferme']))('rejects a non-array collection %#', conferme => {
    expect(parseResponse({ conferme }).success).toBe(false);
  });
  it.each(cases([null, 1, true, [], 'conferma']))('rejects a non-object confirmation %#', value => {
    expect(parseResponse({ conferme: [value] }).success).toBe(false);
  });
  it.each(cases(['richiesta', 'titolo', 'comando', 'link']))('requires confirmation field %s', key => {
    const item = { ...confirmation } as Record<string, unknown>;
    delete item[key];
    expect(parseResponse({ conferme: [item] }).success).toBe(false);
  });
  it.each(cases([undefined, null, '1', true, [], {}, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]))(
    'rejects a non-finite numeric request number %#', value => {
      expect(parseResponse(responseWith('richiesta', value)).success).toBe(false);
    },
  );
  it.each(cases([0, -1, -12]))('requires a positive request number %#', value => {
    expect(parseResponse(responseWith('richiesta', value)).success).toBe(false);
  });
  it.each(cases([0.5, 1.5]))('requires an integer request number %#', value => {
    expect(parseResponse(responseWith('richiesta', value)).success).toBe(false);
  });
  it.each(cases([undefined, null, 1, true, [], {}]))('requires a string title %#', value => {
    expect(parseResponse(responseWith('titolo', value)).success).toBe(false);
  });
  it.each(cases([undefined, null, 1, true, [], {}, '', 'approvato', 'APPROVA', 'SCARTA', 'RIPRENDI ']))(
    'rejects an unknown or non-string command %#', value => {
      expect(parseResponse(responseWith('comando', value)).success).toBe(false);
    },
  );
  it.each(cases([undefined, null, 1, true, [], {}, '', 'not-a-url', '/dev/conferma']))(
    'requires an absolute URL %#', value => {
      expect(parseResponse(responseWith('link', value)).success).toBe(false);
    },
  );
  it.each(cases(['http://confirmations.example.test/dev/conferma', 'ftp://confirmations.example.test/dev/conferma', 'httpsx://confirmations.example.test/dev/conferma']))(
    'requires HTTPS %#', value => {
      expect(parseResponse(responseWith('link', value)).success).toBe(false);
    },
  );
  it.each(cases(['https://', 'https://a b']))('rejects an invalid HTTPS URL %s', link => {
    expect(parseResponse(responseWith('link', link)).success).toBe(false);
  });
  it('rejects unknown confirmation fields', () => {
    expect(parseResponse({ conferme: [{ ...confirmation, extra: true }] }).success).toBe(false);
  });
  it('rejects unknown response fields', () => {
    expect(parseResponse({ conferme: [], extra: true }).success).toBe(false);
  });
});
