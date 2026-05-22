import { validateTicketDocument } from '../../web/validator.mjs';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: jsonHeaders });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export async function onRequestPost({ request }) {
  let document;
  try {
    document = await request.json();
  } catch {
    return json({ valid: false, errors: [{ path: '/', keyword: 'parse', message: 'invalid JSON' }] }, 400);
  }

  const result = validateTicketDocument(document);
  return json(result, result.valid ? 200 : 422);
}
