import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { validateTicketDocument } from '../web/validator.mjs';

const validDoc = JSON.parse(
  await readFile(new URL('../examples/v0.1/retail-receipt-mx.json', import.meta.url), 'utf8')
);

test('web validator accepts valid Ticket Schema document', () => {
  const result = validateTicketDocument(validDoc);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('web validator rejects invalid Ticket Schema document', () => {
  const invalid = { ...validDoc };
  delete invalid.ticketSchemaVersion;

  const result = validateTicketDocument(invalid);

  assert.equal(result.valid, false);
  assert.match(JSON.stringify(result.errors), /ticketSchemaVersion/);
});

test('web validator rejects unknown schemas', () => {
  const invalid = { ...validDoc, $schema: 'https://example.com/nope.json' };
  const result = validateTicketDocument(invalid);

  assert.equal(result.valid, false);
  assert.equal(result.errors[0].keyword, 'unknownSchema');
});
