import { validateTicketDocument } from '../../web/validator.mjs';
import { renderTicketFragment } from '../../web/render.mjs';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: jsonHeaders });
}

async function readDocument(request) {
  const body = await request.json();
  return body?.document || body;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export async function onRequestPost({ request }) {
  let document;
  try {
    document = await readDocument(request);
  } catch {
    return json({ valid: false, errors: [{ path: '/', keyword: 'parse', message: 'invalid JSON' }] }, 400);
  }

  const result = validateTicketDocument(document);
  if (!result.valid) {
    return json(result, 422);
  }

  return json({ ...result, html: renderTicketFragment(document) });
}
