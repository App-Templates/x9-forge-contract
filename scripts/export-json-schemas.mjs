import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import {
  VideoEngineJobSchema,
  VideoEngineJobResponseSchema,
} from '../dist/capability/video/index.js';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const directory = new URL('schemas/capability/video/', root);

await mkdir(directory, { recursive: true });

for (const [name, schema] of [
  ['engine-job', VideoEngineJobSchema],
  ['engine-job-response', VideoEngineJobResponseSchema],
]) {
  const jsonSchema = {
    ...z.toJSONSchema(schema, { target: 'draft-2020-12' }),
    $id: `x9-forge/contracts/capability/video/${name}`,
    'x-contracts-version': version,
  };

  await writeFile(new URL(`${name}.schema.json`, directory), `${JSON.stringify(jsonSchema, null, 2)}\n`);
}
