import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { onRequestPost as renderJson } from '../functions/api/render.js';
import { onRequestPost as renderHtml } from '../functions/api/render/html.js';

const validDoc = JSON.parse(
  await readFile(new URL('../examples/v0.1/retail-receipt-mx.json', import.meta.url), 'utf8')
);

async function callApi(handler, path, body) {
  const request = new Request(`https://ticketschema.org${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handler({ request });
}

test('POST /api/render returns JSON with rendered HTML', async () => {
  const response = await callApi(renderJson, '/api/render', { document: validDoc });
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(json.valid, true);
  assert.equal(json.schema, validDoc.$schema);
  assert.match(json.html, /ticket-schema-render/);
  assert.match(json.html, /Abarrotes Lupita/);
});

test('POST /api/render/html returns direct text/html render', async () => {
  const response = await callApi(renderHtml, '/api/render/html', { document: validDoc });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /ticket-schema-render/);
  assert.match(html, /Abarrotes Lupita/);
});

test('POST /api/render rejects invalid documents', async () => {
  const invalid = { ...validDoc };
  delete invalid.ticketSchemaVersion;

  const response = await callApi(renderJson, '/api/render', { document: invalid });
  const json = await response.json();

  assert.equal(response.status, 422);
  assert.equal(json.valid, false);
  assert.equal(json.html, undefined);
});
