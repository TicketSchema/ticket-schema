import { validateTicketDocument } from '../../../web/validator.mjs';
import { escapeHtml, renderTicketPage } from '../../../web/render.mjs';

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

async function readDocument(request) {
  const body = await request.json();
  return body?.document || body;
}

function errorPage(message, status) {
  return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ticket Schema Render Error</title></head><body><pre>${escapeHtml(message)}</pre></body></html>`, {
    status,
    headers: htmlHeaders,
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: htmlHeaders });
}

export async function onRequestPost({ request }) {
  let document;
  try {
    document = await readDocument(request);
  } catch {
    return errorPage('invalid JSON', 400);
  }

  const result = validateTicketDocument(document);
  if (!result.valid) {
    return errorPage(JSON.stringify(result.errors, null, 2), 422);
  }

  return new Response(renderTicketPage(document), { status: 200, headers: htmlHeaders });
}
