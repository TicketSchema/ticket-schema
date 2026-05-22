import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { onRequestPost } from '../functions/api/validate.js';

const validDoc = JSON.parse(
  await readFile(new URL('../examples/v0.1/retail-receipt-mx.json', import.meta.url), 'utf8')
);

async function callApi(body) {
  const request = new Request('https://ticketschema.org/api/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return onRequestPost({ request });
}

test('POST /api/validate returns valid true', async () => {
  const response = await callApi(validDoc);
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.equal(json.valid, true);
  assert.equal(json.schema, validDoc.$schema);
});

test('POST /api/validate returns 422 for invalid document', async () => {
  const invalid = { ...validDoc };
  delete invalid.ticketSchemaVersion;

  const response = await callApi(invalid);
  const json = await response.json();

  assert.equal(response.status, 422);
  assert.equal(json.valid, false);
});
