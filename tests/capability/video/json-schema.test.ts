import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VideoEngineJobSchema,
  VideoEngineJobResponseSchema,
} from '../../../src/capability/video/index.js';

const root = new URL('../../../', import.meta.url);
const { version } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

describe('published video JSON schemas', () => {
  it.each([
    ['engine-job', VideoEngineJobSchema],
    ['engine-job-response', VideoEngineJobResponseSchema],
  ] as const)('%s.schema.json matches the current contract and package version', (name, schema) => {
    const filename = `schemas/capability/video/${name}.schema.json`;
    const expected = {
      ...z.toJSONSchema(schema, { target: 'draft-2020-12' }),
      $id: `x9-forge/contracts/capability/video/${name}`,
      'x-contracts-version': version,
    };

    expect(readFileSync(new URL(filename, root), 'utf8'), filename)
      .toBe(`${JSON.stringify(expected, null, 2)}\n`);
  });
});
